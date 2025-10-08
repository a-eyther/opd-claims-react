import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { ZoomInIcon, ZoomOutIcon, RotateIcon, DownloadIcon, DocumentIcon, ChevronDownIcon } from '../icons'

// Configure PDF.js worker - use CDN with specific version
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

/**
 * Document Viewer Component
 * Displays PDF documents with zoom and navigation controls
 */
const DocumentViewer = ({ documentUrl, document, currentPage, totalPages, onPageChange }) => {
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [numPages, setNumPages] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50))
  const handleRotate = () => setRotation(prev => (prev + 90) % 360)

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
    setLoading(false)
    setError(null)
  }

  const onDocumentLoadError = (error) => {
    console.error('PDF Load Error:', error)
    setError(error.message)
    setLoading(false)
  }

  const onDocumentLoadStart = () => {
    setLoading(true)
    setError(null)
  }

  if (!document) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <p>No document selected</p>
      </div>
    )
  }

  const displayPages = totalPages || 10

  return (
    <div className="flex flex-col h-full">
      {/* Header Section */}
      <div className="px-5 py-3 mt-2">
        {/* Title Row */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-0.5">Document Viewer</h3>
            <p className="text-xs text-gray-500">Supporting documents & invoices</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-600">Page {currentPage} of {numPages || displayPages}</span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-gray-700">1</span>
              <DocumentIcon className="w-3.5 h-3.5 text-red-500" />
              <select className="px-2 py-0.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 text-gray-700">
                <option>{document.name || 'Doc.h344453...'}</option>
              </select>
              <ChevronDownIcon className="w-3 h-3 text-gray-400" />
            </div>
          </div>
        </div>
        <div className='border border-gray-200 rounded-md border-dashed p-2'>

        
        {/* Controls Row */}
        <div className="flex items-center justify-between mb-2">
          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-[10px] text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed rounded-md"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(Math.min(currentPage + 1, numPages || displayPages))}
              disabled={currentPage === (numPages || displayPages)}
              className="px-3 py-2 text-[10px] text-gray-900 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed rounded-md"
            >
              Next
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleZoomOut}
              className="p-1 hover:bg-gray-100 rounded"
              title="Zoom Out"
            >
              <ZoomOutIcon className="w-4 h-4 text-gray-600" />
            </button>
            <span className="text-sm font-medium text-gray-900 min-w-[48px] text-center">
              {zoom}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1 hover:bg-gray-100 rounded"
              title="Zoom In"
            >
              <ZoomInIcon className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={handleRotate}
              className="p-1 hover:bg-gray-100 rounded"
              title="Rotate 90°"
            >
              <RotateIcon className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded" title="Download">
              <DownloadIcon className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

      {/* Document Display Area */}
      <div className="flex-1 overflow-auto bg-gray-100 p-6">
        {documentUrl ? (
          /* PDF Viewer */
          <div className="h-full flex items-center justify-center overflow-auto">
            <div
              className="transition-all duration-300"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: 'center center'
              }}
            >
              {loading && (
                <div className="text-gray-600">Loading PDF...</div>
              )}
              {error && (
                <div className="text-red-600">
                  <p>Failed to load PDF</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}
              <Document
                file={documentUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={<div className="text-gray-600">Loading PDF...</div>}
                error={<div className="text-red-600">Failed to load PDF file</div>}
                className="flex justify-center"
              >
                <Page
                  pageNumber={currentPage}
                  height={700}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="shadow-lg"
                  loading={<div className="text-gray-400">Loading page...</div>}
                />
              </Document>
            </div>
          </div>
        ) : (
          /* Document Display */
          <div className="max-w-2xl mx-auto">
            <div
              className="bg-white rounded border border-gray-200 shadow-sm p-5 transition-transform duration-300"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: 'center center'
              }}
            >
              <div className="space-y-4">
                {/* Document Header */}
                <div className="pb-3 border-b border-gray-200">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
                    <DocumentIcon className="w-3 h-3" />
                    <span>{document.name} - Page {currentPage}</span>
                  </div>
                  <h4 className="text-base font-bold text-gray-900">{document.type}</h4>
                </div>

                {/* Document Details */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                  {document.details?.map((detail, idx) => (
                    <div key={idx}>
                      <span className="font-semibold text-gray-900">{detail.label}:</span>
                      <span className="text-gray-700 ml-1">{detail.value}</span>
                    </div>
                  ))}
                </div>

                {/* Services Section */}
                {document.services && (
                  <div className="pt-3">
                    <h5 className="font-bold text-sm text-gray-900 mb-2">Services Provided:</h5>
                    <div>
                      {document.services.map((service, idx) => (
                        <div key={idx} className="flex justify-between py-1.5 text-sm">
                          <span className="text-gray-700">{service.name}</span>
                          <span className="text-gray-900">Kes. {service.amount.toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="flex justify-between py-1.5 text-sm font-bold border-t border-gray-300 mt-1 pt-2">
                        <span>Total Amount</span>
                        <span>Kes. {document.totalAmount?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
      </div>
    </div>
  )
}

export default DocumentViewer
