/**
 * Knowledge Base Text Chunker
 * Splits content into ~150 to 300 words preserving sentence boundaries.
 * Prepends [Title: {title}] to every chunk for optimal semantic contextualization.
 */

export interface RawChunk {
  chunkIndex: number;
  text: string;
}

export function chunkKnowledgeText(
  title: string,
  content: string,
  minWords = 150,
  maxWords = 300
): RawChunk[] {
  const cleanContent = (content || "").trim();
  if (!cleanContent) return [];

  // Split into sentences using regex matching punctuation + space
  const sentences = cleanContent
    .split(/(?<=[.?!।\n])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (sentences.length === 0) {
    return [
      {
        chunkIndex: 0,
        text: `[Title: ${title}]\n${cleanContent}`,
      },
    ];
  }

  const chunks: RawChunk[] = [];
  let currentWords: string[] = [];
  let chunkIndex = 0;

  for (const sentence of sentences) {
    const sentenceWords = sentence.split(/\s+/).filter(Boolean);

    // If adding this sentence exceeds maxWords and we already have minWords, flush chunk
    if (
      currentWords.length + sentenceWords.length > maxWords &&
      currentWords.length >= minWords
    ) {
      chunks.push({
        chunkIndex,
        text: `[Title: ${title}]\n${currentWords.join(" ")}`,
      });
      chunkIndex++;
      currentWords = [];
    }

    currentWords.push(...sentenceWords);
  }

  // Flush remaining words
  if (currentWords.length > 0) {
    chunks.push({
      chunkIndex,
      text: `[Title: ${title}]\n${currentWords.join(" ")}`,
    });
  }

  return chunks;
}
