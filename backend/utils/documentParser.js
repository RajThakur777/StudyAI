import fs from "fs/promises";
import path from "path";
import mammoth from "mammoth";
import officeParser from "officeparser";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

/* ============================================================
   PDF TEXT EXTRACTION
============================================================ */

export const extractTextFromPDF = async (filePath) => {
  try {
    const buffer = await fs.readFile(filePath);
    const data = await pdf(buffer);

    return {
      text: data.text,
      numPages: data.numpages || 0
    };

  } catch (error) {
    console.error("PDF parsing error:", error);
    throw new Error("Failed to extract text from PDF");
  }
};


/* ============================================================
   WORD DOCUMENT TEXT EXTRACTION
============================================================ */

export const extractTextFromDOCX = async (filePath) => {
  try {
    const result = await mammoth.extractRawText({ path: filePath });

    return {
      text: result.value,
      numPages: 0
    };

  } catch (error) {
    console.error("DOCX parsing error:", error);
    throw new Error("Failed to extract text from DOCX");
  }
};


/* ============================================================
   POWERPOINT TEXT EXTRACTION
============================================================ */

export const extractTextFromPPTX = async (filePath) => {
  try {
    const text = await officeParser.parseOffice(filePath);

    return {
      text,
      numPages: 0
    };

  } catch (error) {
    console.error("PPTX parsing error:", error);
    throw new Error("Failed to extract text from PPTX");
  }
};


/* ============================================================
   TEXT FILE EXTRACTION
============================================================ */

export const extractTextFromTXT = async (filePath) => {
  try {
    const text = await fs.readFile(filePath, "utf8");

    return {
      text,
      numPages: 0
    };

  } catch (error) {
    console.error("TXT parsing error:", error);
    throw new Error("Failed to extract text from TXT");
  }
};


/* ============================================================
   UNIVERSAL DOCUMENT PARSER
============================================================ */

export const extractTextFromDocument = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();

  switch (ext) {
    case ".pdf":
      return extractTextFromPDF(filePath);

    case ".docx":
      return extractTextFromDOCX(filePath);

    case ".pptx":
      return extractTextFromPPTX(filePath);

    case ".txt":
      return extractTextFromTXT(filePath);

    default:
      throw new Error("Unsupported document format");
  }
};