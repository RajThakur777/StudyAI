import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import ChatHistory from "../models/ChatHistory.js";

import * as geminiService from "../utils/geminiService.js";

import { generateEmbedding } from "../utils/embeddingService.js";
import { searchRelevantChunks } from "../utils/vectorSearch.js";


/* ============================================================
   GENERATE FLASHCARDS
============================================================ */

export const generateFlashcards = async (req, res, next) => {
  try {

    const { documentId, count = 10 } = req.body;

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "ready"
    });

    if (!document) {
      return res.status(404).json({
        success:false,
        error:"Document not found"
      });
    }

    const cards = await geminiService.generateFlashcards(
      document.extractedText,
      parseInt(count)
    );

    const flashcardsSet = await Flashcard.create({
      userId:req.user._id,
      documentId:document._id,
      cards:cards.map(card=>({
        question:card.question,
        answer:card.answer,
        difficulty:card.difficulty,
        reviewCount:0,
        isStarred:false
      }))
    });

    res.status(201).json({
      success:true,
      data:flashcardsSet
    });

  } catch(error){
    next(error);
  }
};


/* ============================================================
   GENERATE QUIZ
============================================================ */

export const generateQuiz = async (req,res,next)=>{

  try{

    const { documentId, numQuestions=5, title } = req.body;

    const document = await Document.findOne({
      _id:documentId,
      userId:req.user._id,
      status:"ready"
    });

    if(!document){
      return res.status(404).json({
        success:false,
        error:"Document not found"
      });
    }

    const questions = await geminiService.generateQuiz(
      document.extractedText,
      parseInt(numQuestions)
    );

    const quiz = await Quiz.create({
      userId:req.user._id,
      documentId:document._id,
      title:title || `${document.title} Quiz`,
      questions,
      totalQuestions:questions.length,
      userAnswers:[],
      score:0
    });

    res.status(201).json({
      success:true,
      data:quiz
    });

  }catch(error){
    next(error);
  }

};


/* ============================================================
   GENERATE SUMMARY
============================================================ */

export const generateSummary = async (req,res,next)=>{

  try{

    const { documentId } = req.body;

    const document = await Document.findOne({
      _id:documentId,
      userId:req.user._id,
      status:"ready"
    });

    if(!document){
      return res.status(404).json({
        success:false,
        error:"Document not found"
      });
    }

    const summary = await geminiService.generateSummary(
      document.extractedText
    );

    res.status(200).json({
      success:true,
      data:{
        documentId:document._id,
        title:document.title,
        summary
      }
    });

  }catch(error){
    next(error);
  }

};


/* ============================================================
   CHAT WITH DOCUMENT (RAG IMPLEMENTATION)
============================================================ */

export const chat = async (req,res,next)=>{

  try{

    const { documentId, question } = req.body;

    if(!documentId || !question){
      return res.status(400).json({
        success:false,
        error:"Please provide documentId and question"
      });
    }

    const document = await Document.findOne({
      _id:documentId,
      userId:req.user._id,
      status:"ready"
    });

    if(!document){
      return res.status(404).json({
        success:false,
        error:"Document not found"
      });
    }

    /* =============================
       RAG Retrieval Step
    ============================= */

    const queryEmbedding = await generateEmbedding(question);

    const relevantChunks = await searchRelevantChunks(
      document._id,
      queryEmbedding
    );

    const chunkIndices = relevantChunks.map(c => c.chunkIndex);

    /* =============================
       Chat History
    ============================= */

    let chatHistory = await ChatHistory.findOne({
      userId:req.user._id,
      documentId:document._id
    });

    if(!chatHistory){
      chatHistory = await ChatHistory.create({
        userId:req.user._id,
        documentId:document._id,
        messages:[]
      });
    }

    /* =============================
       Generate LLM Response
    ============================= */

    const answer = await geminiService.chatWithContext(
      question,
      relevantChunks
    );

    chatHistory.messages.push(
      {
        role:"user",
        content:question,
        timestamp:new Date(),
        relevantChunks:[]
      },
      {
        role:"assistant",
        content:answer,
        timestamp:new Date(),
        relevantChunks:chunkIndices
      }
    );

    await chatHistory.save();

    res.status(200).json({
      success:true,
      data:{
        question,
        answer,
        relevantChunks:chunkIndices,
        chatHistoryId:chatHistory._id
      }
    });

  }catch(error){
    next(error);
  }

};


/* ============================================================
   EXPLAIN CONCEPT (RAG)
============================================================ */

export const explainConcept = async (req,res,next)=>{

  try{

    const { documentId, concept } = req.body;

    const document = await Document.findOne({
      _id:documentId,
      userId:req.user._id,
      status:"ready"
    });

    if(!document){
      return res.status(404).json({
        success:false,
        error:"Document not found"
      });
    }

    const queryEmbedding = await generateEmbedding(concept);

    const relevantChunks = await searchRelevantChunks(
      document._id,
      queryEmbedding
    );

    const context = relevantChunks
      .map(c => c.content)
      .join("\n\n");

    const explanation = await geminiService.explainConcept(
      concept,
      context
    );

    res.status(200).json({
      success:true,
      data:{
        concept,
        explanation,
        relevantChunks:relevantChunks.map(c => c.chunkIndex)
      }
    });

  }catch(error){
    next(error);
  }

};


/* ============================================================
   GET CHAT HISTORY
============================================================ */

export const getChatHistory = async (req,res,next)=>{

  try{

    const { documentId } = req.params;

    const chatHistory = await ChatHistory.findOne({
      userId:req.user._id,
      documentId
    }).select("messages");

    if(!chatHistory){
      return res.status(200).json({
        success:true,
        data:[]
      });
    }

    res.status(200).json({
      success:true,
      data:chatHistory.messages
    });

  }catch(error){
    next(error);
  }

};