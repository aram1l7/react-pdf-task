import * as pdfjsLib from "pdfjs-dist";
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export async function extractTextFromPDF(pdfUrl: string) {
  const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
  let fullText = ""; 
  let pageTextChunks: { page: number; text: string; rects: any[] }[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    let chunks = textContent.items.map((item: any) => ({
      str: item.str,
      transform: item.transform, 
      width: item.width,
      height: item.height,
    }));

    let reconstructedText = chunks.map(chunk => chunk.str).join(" "); 
    fullText += reconstructedText + "\n";

    pageTextChunks.push({ page: pageNum, text: reconstructedText, rects: chunks });
  }

  return { fullText, pageTextChunks };
}

export function findTextMatches(
  fullText: string,
  searchPhrase: string
): number[] {
  let indices: number[] = [];
  let searchRegex = new RegExp(searchPhrase.replace(/\s+/g, "\\s+"), "gi"); 
  let match;

  while ((match = searchRegex.exec(fullText)) !== null) {
    indices.push(match.index);
  }

  return indices;
}

export function getTextHighlightRects(
  pageTextChunks: { page: number; text: string; rects: any[] }[],
  searchPhrase: string
) {
  let highlights: any[] = [];

  pageTextChunks.forEach(({ page, text, rects }) => {
    let matchIndices = findTextMatches(text, searchPhrase);

    matchIndices.forEach(matchIndex => {
      let currentIndex = 0;

      for (let chunk of rects) {
        if (currentIndex + chunk.str.length > matchIndex) {
          highlights.push({
            pageIndex: page - 1,
            rect: chunk.transform.slice(4, 6).concat([chunk.width, chunk.height]),
          });
          break;
        }
        currentIndex += chunk.str.length;
      }
    });
  });

  return highlights;
}

