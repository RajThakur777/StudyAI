import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";

import { extractTextFromDocument } from "../utils/documentParser.js";
import { chunkText } from "../utils/textChunker.js";
import { generateEmbedding } from "../utils/embeddingService.js";

import fs from "fs/promises";
import mongoose from "mongoose";

/* ============================================================
   PROCESS DOCUMENT (RAG PIPELINE)
============================================================ */
const processDocument = async (documentId, filePath) => {

  try {

    // Extract text from document
    const { text } = await extractTextFromDocument(filePath);

    if (!text || text.trim().length === 0) {
      throw new Error("No text extracted from document");
    }

    // Chunk the document
    const chunks = chunkText(text, 500, 50);

    const enrichedChunks = [];

    // Generate embeddings for each chunk
    for (const chunk of chunks) {

      const embedding = await generateEmbedding(chunk.content);

      enrichedChunks.push({
        content: chunk.content,
        chunkIndex: chunk.chunkIndex,
        pageNumber: chunk.pageNumber,
        embedding
      });

    }

    // Save processed document
    await Document.findByIdAndUpdate(documentId, {
      extractedText: text,
      chunks: enrichedChunks,
      status: "ready"
    });

  } catch (error) {

    console.error("Document processing error:", error);

    await Document.findByIdAndUpdate(documentId, {
      status: "failed"
    });

  }

};


/* ============================================================
   UPLOAD DOCUMENT
============================================================ */
export const uploadDocument = async (req, res, next) => {

  try {

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Please upload a document file"
      });
    }

    const { title } = req.body;

    if (!title) {

      await fs.unlink(req.file.path);

      return res.status(400).json({
        success: false,
        error: "Please provide a document title"
      });

    }

    const baseUrl = `http://localhost:${process.env.PORT || 8000}`;
    const fileUrl = `${baseUrl}/uploads/documents/${req.file.filename}`;

    // Create document entry
    const document = await Document.create({
      userId: req.user._id,
      title,
      fileName: req.file.originalname,
      filePath: fileUrl,
      fileSize: req.file.size,
      status: "processing"
    });

    // Process document in background
    processDocument(document._id, req.file.path).catch((err) => {
      console.error("Document processing failed:", err);
    });

    res.status(201).json({
      success: true,
      data: document,
      message: "Document uploaded successfully. Processing started."
    });

  } catch (error) {

    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    next(error);

  }

};


/* ============================================================
   GET USER DOCUMENTS
============================================================ */
export const getDocuments = async (req, res, next) => {

  try {

    const documents = await Document.aggregate([

      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user._id)
        }
      },

      {
        $lookup: {
          from: "flashcards",
          localField: "_id",
          foreignField: "documentId",
          as: "flashcardSets"
        }
      },

      {
        $lookup: {
          from: "quizzes",
          localField: "_id",
          foreignField: "documentId",
          as: "quizzes"
        }
      },

      {
        $addFields: {
          flashcardCount: { $size: "$flashcardSets" },
          quizCount: { $size: "$quizzes" }
        }
      },

      {
        $project: {
          extractedText: 0,
          chunks: 0,
          flashcardSets: 0,
          quizzes: 0
        }
      },

      {
        $sort: { uploadDate: -1 }
      }

    ]);

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents
    });

  } catch (error) {
    next(error);
  }

};


/* ============================================================
   GET SINGLE DOCUMENT
============================================================ */
export const getDocument = async (req, res, next) => {

  try {

    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found"
      });
    }

    const flashcardCount = await Flashcard.countDocuments({
      documentId: document._id,
      userId: req.user._id
    });

    const quizCount = await Quiz.countDocuments({
      documentId: document._id,
      userId: req.user._id
    });

    document.lastAccessed = Date.now();
    await document.save();

    const documentData = document.toObject();
    documentData.flashcardCount = flashcardCount;
    documentData.quizCount = quizCount;

    res.status(200).json({
      success: true,
      data: documentData
    });

  } catch (error) {
    next(error);
  }

};


/* ============================================================
   DELETE DOCUMENT
============================================================ */
export const deleteDocument = async (req, res, next) => {

  try {

    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found"
      });
    }

    await fs.unlink(document.filePath).catch(() => {});

    await document.deleteOne();

    res.status(200).json({
      success: true,
      message: "Document deleted successfully"
    });

  } catch (error) {
    next(error);
  }

};