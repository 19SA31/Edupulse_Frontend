import React, { useState } from "react";
import { X } from "lucide-react";
import { DocumentViewerProps } from "../../interfaces/courseInterface";

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documents,
  onClose,
}) => {
  const [currentDoc, setCurrentDoc] = useState<number>(0);

  if (!documents || documents.length === 0) {
    return null;
  }

  const handleDocumentChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0 && value < documents.length) {
      setCurrentDoc(value);
    }
  };

  const currentDocument = documents[currentDoc];
  if (!currentDocument) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl h-5/6 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">
          </h3>
          <div className="flex items-center space-x-2">
            {documents.length > 1 && (
              <select
                value={currentDoc}
                onChange={handleDocumentChange}
                className="px-3 py-1 border rounded"
              >
                {documents.map((doc, index) => (
                  <option key={doc._id || index} value={index}>
                    Document {index + 1}:{" "}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              type="button"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="flex-1 p-4">
          <iframe
            src={currentDocument.signedUrl}
            className="w-full h-full border rounded"
            title={`Document Viewer - ${ "Document"}`}
          />
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
