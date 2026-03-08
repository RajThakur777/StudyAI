/**
 * Split document text into chunks for RAG processing
 * Each chunk contains ~500 words with overlap
 */

export const chunkText = (text, chunkSize = 500, overlap = 50) => {

  if (!text || text.trim().length === 0) {
    return []
  }

  // Clean text
  const cleanedText = text
    .replace(/\r\n/g,"\n")
    .replace(/\s+/g," ")
    .replace(/\n /g,"\n")
    .replace(/ \n/g,"\n")
    .trim()

  // Split by paragraphs
  const paragraphs = cleanedText
    .split(/\n+/)
    .filter(p => p.trim().length > 0)

  const chunks = []

  let currentChunk = []
  let currentWordCount = 0
  let chunkIndex = 0

  for(const paragraph of paragraphs){

    const words = paragraph.trim().split(/\s+/)
    const wordCount = words.length

    // If paragraph too large
    if(wordCount > chunkSize){

      if(currentChunk.length > 0){

        chunks.push({
          content: currentChunk.join("\n\n"),
          chunkIndex: chunkIndex++,
          pageNumber: 0
        })

        currentChunk=[]
        currentWordCount=0
      }

      for(let i=0;i<words.length;i+=(chunkSize-overlap)){

        const slice = words.slice(i,i+chunkSize)

        chunks.push({
          content: slice.join(" "),
          chunkIndex: chunkIndex++,
          pageNumber: 0
        })

        if(i+chunkSize>=words.length) break
      }

      continue
    }

    if(currentWordCount+wordCount>chunkSize && currentChunk.length>0){

      chunks.push({
        content: currentChunk.join("\n\n"),
        chunkIndex: chunkIndex++,
        pageNumber: 0
      })

      const prevText=currentChunk.join(" ")
      const prevWords=prevText.split(/\s+/)

      const overlapText=prevWords
        .slice(-Math.min(overlap,prevWords.length))
        .join(" ")

      currentChunk=[overlapText,paragraph.trim()]
      currentWordCount=
        overlapText.split(/\s+/).length+wordCount

    }
    else{

      currentChunk.push(paragraph.trim())
      currentWordCount+=wordCount

    }

  }

  if(currentChunk.length>0){

    chunks.push({
      content: currentChunk.join("\n\n"),
      chunkIndex: chunkIndex,
      pageNumber: 0
    })

  }

  return chunks
}