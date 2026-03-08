import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.error("FATAL ERROR: GEMINI_API_KEY is missing");
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const MODEL = "gemini-2.5-flash-lite";

/* ============================================================
   GENERATE SUMMARY
============================================================ */

export const generateSummary = async (text) => {

  const prompt = `
Summarize the following document clearly.

Focus on:
• Key concepts
• Important ideas
• Important conclusions

Document:
${text.substring(0,20000)}
`;

  try {

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config:{
        temperature:0.3
      }
    });

    return response.text;

  } catch(error){

    console.error("Gemini summary error:",error);
    throw new Error("Summary generation failed");

  }

};


/* ============================================================
   GENERATE QUIZ
============================================================ */

export const generateQuiz = async (text,numQuestions=5)=>{

const prompt = `
Generate ${numQuestions} MCQ questions from the following text.

Format strictly:

Q: question
01: option
02: option
03: option
04: option
C: correct option
E: explanation
D: difficulty (easy|medium|hard)

Separate questions using ----

Text:
${text.substring(0,15000)}
`;

try{

const response = await ai.models.generateContent({
 model:MODEL,
 contents:prompt,
 config:{temperature:0.4}
});

const generated = response.text;

const questions=[];
const blocks=generated.split("----").filter(q=>q.trim());

for(const block of blocks){

 const lines=block.trim().split("\n");

 let question="";
 let options=[];
 let correctAnswer="";
 let explanation="";
 let difficulty="medium";

 for(const line of lines){

  const trimmed=line.trim();

  if(trimmed.startsWith("Q:"))
   question=trimmed.substring(2).trim();

  else if(trimmed.match(/^0\d:/))
   options.push(trimmed.substring(3).trim());

  else if(trimmed.startsWith("C:"))
   correctAnswer=trimmed.substring(2).trim();

  else if(trimmed.startsWith("E:"))
   explanation=trimmed.substring(2).trim();

  else if(trimmed.startsWith("D:")){
   const diff=trimmed.substring(2).trim().toLowerCase();
   if(["easy","medium","hard"].includes(diff))
    difficulty=diff;
  }

 }

 if(question && options.length===4 && correctAnswer){

  questions.push({
   question,
   options,
   correctAnswer,
   explanation,
   difficulty
  });

 }

}

return questions.slice(0,numQuestions);

}catch(error){

 console.error("Quiz generation error:",error);
 throw new Error("Quiz generation failed");

}

};


/* ============================================================
   GENERATE FLASHCARDS
============================================================ */

export const generateFlashcards = async(text,count=10)=>{

const prompt=`
Generate ${count} educational flashcards.

Format:

Q: question
A: answer
D: difficulty (easy|medium|hard)

Separate flashcards using ----

Text:
${text.substring(0,15000)}
`;

try{

const response = await ai.models.generateContent({
 model:MODEL,
 contents:prompt,
 config:{temperature:0.4}
});

const generated=response.text;

const flashcards=[];
const cards=generated.split("----").filter(c=>c.trim());

for(const card of cards){

 const lines=card.trim().split("\n");

 let question="";
 let answer="";
 let difficulty="medium";

 for(const line of lines){

  const trimmed=line.trim();

  if(trimmed.startsWith("Q:"))
   question=trimmed.substring(2).trim();

  else if(trimmed.startsWith("A:"))
   answer=trimmed.substring(2).trim();

  else if(trimmed.startsWith("D:")){
   const diff=trimmed.substring(2).trim().toLowerCase();
   if(["easy","medium","hard"].includes(diff))
    difficulty=diff;
  }

 }

 if(question && answer){

  flashcards.push({
   question,
   answer,
   difficulty
  });

 }

}

return flashcards.slice(0,count);

}catch(error){

 console.error("Flashcard generation error:",error);
 throw new Error("Flashcard generation failed");

}

};


/* ============================================================
   EXPLAIN CONCEPT
============================================================ */

export const explainConcept = async(concept,context)=>{

const prompt=`
Explain the concept "${concept}" clearly using the context.

If context does not contain the concept say:
"The concept is not present in the document."

Context:
${context.substring(0,12000)}
`;

try{

const response = await ai.models.generateContent({
 model:MODEL,
 contents:prompt,
 config:{temperature:0.3}
});

return response.text;

}catch(error){

 console.error("Concept explanation error:",error);
 throw new Error("Concept explanation failed");

}

};


/* ============================================================
   CHAT WITH CONTEXT (RAG)
============================================================ */

export const chatWithContext = async(question,chunks)=>{

if(!chunks || chunks.length===0){
 return "No relevant context found in the document.";
}

const context = chunks
.map((c,i)=>`[Chunk ${i+1}]\n${c.content}`)
.join("\n\n");


const prompt=`
You are a document assistant.

Use ONLY the context below to answer the question.

If the answer is not present in the context say:
"The answer is not present in the document."

Context:
${context.substring(0,12000)}

Question:
${question}

Answer clearly.
`;

try{

const response = await ai.models.generateContent({
 model:MODEL,
 contents:prompt,
 config:{
  temperature:0.3
 }
});

return response.text;

}catch(error){

 console.error("Chat error:",error);
 throw new Error("Chat generation failed");

}

};