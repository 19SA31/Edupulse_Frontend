import { useState, useEffect } from "react";

interface Document {
  id: string;
  type: 'avatar' | 'degree' | 'aadharFront' | 'aadharBack';
  url: string;
  fileName: string;
  uploadedAt: string;
}

interface DocumentViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: Document[];
  initialDocumentIndex?: number;
}

const DocumentViewModal: React.FC<DocumentViewModalProps> = ({
  isOpen,
  onClose,
  documents,
  initialDocumentIndex = 0,
}) => {
  const [currentDocumentIndex, setCurrentDocumentIndex] = useState(initialDocumentIndex);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentDocumentIndex(initialDocumentIndex);
      setLoading(true);
      setError(false);
    }
  }, [isOpen, initialDocumentIndex]);

  useEffect(() => {
    if (isOpen && documents.length > 0) {
      setLoading(true);
      setError(false);
    }
  }, [currentDocumentIndex, isOpen, documents]);

  if (!isOpen || !documents || documents.length === 0) return null;

  const currentDocument = documents[currentDocumentIndex];

  const handleImageLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleImageError = () => {
    setLoading(false);
    setError(true);
  };

  const goToPrevious = () => {
    setCurrentDocumentIndex((prev) => 
      prev > 0 ? prev - 1 : documents.length - 1
    );
  };

  const goToNext = () => {
    setCurrentDocumentIndex((prev) => 
      prev < documents.length - 1 ? prev + 1 : 0
    );
  };

  const goToDocument = (index: number) => {
    setCurrentDocumentIndex(index);
  };

  const getFileExtension = (fileName: string) => {
    return fileName.split('.').pop()?.toLowerCase() || '';
  };

  const isImage = (fileName: string) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    return imageExtensions.includes(getFileExtension(fileName));
  };

  const isPdf = (fileName: string) => {
    return getFileExtension(fileName) === 'pdf';
  };

  const getDocumentTypeIcon = (type: string) => {
    const icons = {
      avatar: "👤",
      degree: "🎓",
      aadharFront: "🆔",
      aadharBack: "🆔"
    };
    return icons[type as keyof typeof icons] || "📄";
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels = {
      avatar: "Tutor Photo",
      degree: "Degree Certificate",
      aadharFront: "Aadhar Card - Front Side",
      aadharBack: "Aadhar Card - Back Side"
    };
    return labels[type as keyof typeof labels] || type;
  };

  const downloadFile = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const renderDocumentContent = () => {
    if (isImage(currentDocument.fileName)) {
      return (
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
          {error ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 15.5C3.544 17.333 4.506 19 6.046 19z" />
              </svg>
              <p className="text-lg font-medium">Unable to load image</p>
              <p className="text-sm">The image file might be corrupted or unavailable</p>
            </div>
          ) : (
            <img
              src={currentDocument.url}
              alt={currentDocument.fileName}
              className="max-w-full max-h-[60vh] object-contain mx-auto rounded-lg shadow-lg"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
        </div>
      );
    } else if (isPdf(currentDocument.fileName)) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg font-medium">PDF Document</p>
          <p className="text-sm mb-4">Click the download button to save this file</p>
          <button
            onClick={() => downloadFile(currentDocument.url, currentDocument.fileName)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
          >
            Download PDF
          </button>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg font-medium">File preview not available</p>
          <p className="text-sm mb-4">This file type cannot be previewed in the browser</p>
          <button
            onClick={() => downloadFile(currentDocument.url, currentDocument.fileName)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
          >
            Download File
          </button>
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl max-h-[90vh] w-full overflow-hidden">

        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {getDocumentTypeIcon(currentDocument.type)}
            </span>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {getDocumentTypeLabel(currentDocument.type)}
              </h2>
              <p className="text-sm text-gray-600">{currentDocument.fileName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {currentDocumentIndex + 1} of {documents.length}
            </span>
            <button
              onClick={() => downloadFile(currentDocument.url, currentDocument.fileName)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
            >
              Download
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>


        <div className="relative">

          {documents.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          <div className="p-4">
            {renderDocumentContent()}
          </div>
        </div>

        {documents.length > 1 && (
          <div className="border-t border-gray-200 p-4">
            <div className="flex justify-center gap-2 overflow-x-auto">
              {documents.map((doc, index) => (
                <button
                  key={doc.id}
                  onClick={() => goToDocument(index)}
                  className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    index === currentDocumentIndex
                      ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                      : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                  }`}
                >
                  <span className="text-lg">{getDocumentTypeIcon(doc.type)}</span>
                  <span className="hidden sm:inline">{getDocumentTypeLabel(doc.type)}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentViewModal;