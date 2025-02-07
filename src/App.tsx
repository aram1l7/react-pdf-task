import React from "react";
import PDFHighlighter from "./components/PDFHighlighter";
function App() {
  return (
    <PDFHighlighter
      pdfUrl={new URL(
        "/wa-cigna-dental-preventive-policy.pdf",
        window.location.origin
      ).toString()}
    />
  );
}

export default App;
