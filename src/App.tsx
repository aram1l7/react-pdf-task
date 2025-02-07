import React from "react";
import PDFHighlighter from "./components/PDFHighlighter";
import pdf from "./assets/wa-cigna-dental-preventive-policy.pdf";
function App() {
  return (
    <PDFHighlighter
      pdfUrl={pdf}
    />
  );
}

export default App;
