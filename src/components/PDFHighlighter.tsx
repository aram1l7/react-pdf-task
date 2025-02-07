import { Document, Page, pdfjs } from "react-pdf";
import { useState, useEffect, useRef } from "react";
import React from "react";
import { extractTextFromPDF, getTextHighlightRects } from "../utils/utils";
import "./highlighter.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

type Reference = {
  content: string;
};

const references: Reference[] = [
  {
    content:
      "Cigna Dental Preventive Plan If You Wish To Cancel Or If You Have Questions If You are not satisfied, for any reason, with the terms of this Policy You may return it to Us within 10 days of receipt. We will then cancel Your coverage as of the original Effective Date and promptly refund any premium You have paid. This Policy will then be null and void. If You wish to correspond with Us for this or any other reason, write: Cigna Cigna Individual Services P. O. Box 30365 Tampa, FL 33630 1-877-484-5967",
  },
  {
    content:
      "EXCLUSIONS AND LIMITATIONS: WHAT IS NOT COVERED BY THIS POLICY........................................ 11",
  },
  {
    content:
      "Notice Regarding Provider Directories and Provider Networks If Your Plan utilizes a network of Providers, you will automatically and without charge, receive a separate listing of Participating Providers. You may also have access to a list of Providers who participate in the network by visiting www.cigna.com; mycigna.com. Your Participating Provider network consists of a group of local dental practitioners, of varied specialties as well as general practice, who are employed by or contracted with Cigna HealthCare or Cigna Dental Health. Notice Regarding Standard of Care Under state law, Cigna is required to adhere to the accepted standards of care in the administration of health benefits. Failure to adhere to the accepted standards of care may subject Cigna to liability for damages. PLEASE READ THE FOLLOWING IMPORTANT NOTICE",
  },
];

const PDFHighlighter = ({ pdfUrl }) => {
  const [highlights, setHighlights] = useState([]);
  const [searchText, setSearchText] = useState(references[0].content);
  const [numPages, setNumPages] = useState(1);
  const pageRefs = useRef<HTMLDivElement[]>([]);

  const highlightRef = useRef(null);
  highlightRef.current = highlights;

  useEffect(() => {
    async function loadAndSearch() {
      const { pageTextChunks } = await extractTextFromPDF(pdfUrl);
      const matches = getTextHighlightRects(pageTextChunks, searchText);
      setHighlights(matches);
      scrollToHighlight(matches[0]);
      applyHighlightClass(searchText, matches[0]);
    }

    loadAndSearch();
  }, [pdfUrl, searchText]);

  async function handleLoadSuccess(pdf) {
    setNumPages(pdf.numPages);
  }

  const applyHighlightClass = (highlightText, currentPage) => {
    const pageRef = pageRefs.current[currentPage.pageIndex];
    if (!pageRef) return;

    document.querySelectorAll(".highlighted").forEach((span) => {
      span.classList.remove("highlighted");
    });

    const spans = pageRef.querySelectorAll("span");
    let highlightWords = highlightText.split(/\s+/);

    let matchIndex = 0;
    spans.forEach((span) => {
      const words = span.textContent.trim().split(/\s+/);

      words.forEach((word) => {
        if (
          highlightWords[matchIndex] &&
          word.includes(highlightWords[matchIndex])
        ) {
          span.classList.add("highlighted");
          matchIndex++;
        }
      });

      if (matchIndex >= highlightWords.length) return;
    });
  };

  const scrollToHighlight = (highlight) => {
    const { pageIndex, rect } = highlight;

    const pageElement = pageRefs.current[pageIndex];
    if (!pageElement) return;

    pageElement.scrollIntoView({ behavior: "smooth", block: "center" });

    setTimeout(() => {
      const pageContainer = pageElement.parentElement;
      if (!pageContainer) return;

      const [, y] = rect;
      pageContainer.scrollTop += y - 100;
    }, 300);
  };

  return (
    <div className="container">
      <div className="reference-container">
        {references.map((ref, index) => (
          <button
            onClick={() => {
              setSearchText(ref.content);
            }}
            key={index}
            className={`reference-button ${
              ref.content === searchText ? "active" : ""
            }`}
          >
            {ref.content}
          </button>
        ))}
      </div>
      <div className="pdf-container">
        <Document onLoadSuccess={handleLoadSuccess} file={pdfUrl}>
          {Array.from(new Array(numPages)).map((_, i) => (
            <>
              <Page
                renderTextLayer
                key={i}
                inputRef={(ref) => {
                  if (ref) pageRefs.current[i] = ref;
                }}
                pageNumber={i + 1}
              />
            </>
          ))}
        </Document>
      </div>
    </div>
  );
};

export default PDFHighlighter;
