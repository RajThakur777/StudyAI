import mongoose from "mongoose";
import Document from "../models/Document.js";

/**
 * Perform vector similarity search on document chunks
 */
export const searchRelevantChunks = async (documentId, queryEmbedding) => {
  try {
    const results = await Document.aggregate([
      {
        $vectorSearch: {
          index: "chunkVectorIndex",
          path: "chunks.embedding",
          queryVector: queryEmbedding,
          numCandidates: 100,
          limit: 5
        }
      },

      {
        $match: {
          _id: new mongoose.Types.ObjectId(documentId)
        }
      },

      {
        $unwind: "$chunks"
      },

      {
        $project: {
          content: "$chunks.content",
          chunkIndex: "$chunks.chunkIndex",
          score: { $meta: "vectorSearchScore" }
        }
      }
    ]);

    return results;

  } catch (error) {
    console.error("Vector search error:", error);
    throw new Error("Vector search failed");
  }
};