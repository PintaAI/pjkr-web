import React from "react";

interface PdfViewerProps {
  src: string;
  filename?: string;
  className?: string;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ 
  src, 
  filename, 
  className = ""
}) => {
  const handleViewPdf = () => {
    window.open(src, "_blank");
  };

  const handleDownloadPdf = () => {
    const link = document.createElement("a");
    link.href = src;
    link.download = filename || "document.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`pdf-viewer ${className}`}>
      <div className="pdf-header">
        <div className="pdf-info">
          <span className="pdf-icon">📄</span>
          <span className="pdf-filename">{filename || "PDF Document"}</span>
          <button 
            onClick={handleViewPdf}
            className="pdf-action-btn pdf-view"
            title="Open PDF in new tab"
          >
            View
          </button>
          <button 
            onClick={handleDownloadPdf}
            className="pdf-action-btn pdf-download"
            title="Download PDF"
          >
            Download
          </button>
        </div>
      </div>
      <div className="pdf-content">
        <iframe
          src={`${src}#toolbar=0`}
          className="pdf-iframe"
          title={filename || "PDF Document"}
          style={{
            width: "100%",
            height: "600px",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
          }}
        />
      </div>
    </div>
  );
};