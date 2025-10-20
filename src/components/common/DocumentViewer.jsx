import { useState, useEffect, useMemo, memo } from 'react'
import { ZoomInIcon, ZoomOutIcon, RotateIcon, DownloadIcon, DocumentIcon, ChevronDownIcon } from '../icons'

/**
 * Document Viewer Component
 * Displays PDF documents with zoom and navigation controls
 */
const DocumentViewer = memo(({
  documents = [],
  selectedDocumentIndex = 0,
  onDocumentChange,
  currentPage,
  totalPages,
  onPageChange
}) => {
  // Get currently selected document
  const document = documents[selectedDocumentIndex] || null
  const documentUrl = document?.url || null
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [numPages, setNumPages] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [PdfDocument, setPdfDocument] = useState(null)
  const [PdfPage, setPdfPage] = useState(null)

  // Check if documentUrl is valid first - MUST be memoized
  const isValidPdfUrl = useMemo(() => {
    const isValid = Boolean(
      documentUrl &&
      documentUrl !== 'Not Available' &&
      documentUrl !== 'Not Found' &&
      documentUrl !== '' &&
      documentUrl !== null &&
      typeof documentUrl === 'string' &&
      documentUrl.length > 0 &&
      (documentUrl.startsWith('http') || documentUrl.startsWith('/'))
    )
    return isValid
  }, [documentUrl])

  // Memoized file object for PDF
  const pdfFile = useMemo(() => {
    if (!isValidPdfUrl || !documentUrl) return null
    return { url: documentUrl }
  }, [isValidPdfUrl, documentUrl])

  // Memoized options for PDF
  const pdfOptions = useMemo(() => ({
    cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
    cMapPacked: true,
  }), [])

  // Only load react-pdf if we have a valid URL
  useEffect(() => {
    let mounted = true

    if (isValidPdfUrl && !PdfDocument) {
      import('react-pdf').then(({ Document, Page, pdfjs }) => {
        if (mounted) {
          // Configure PDF.js worker
          pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
          setPdfDocument(() => Document)
          setPdfPage(() => Page)
        }
      }).catch(err => {
        if (mounted) {
          console.error('Failed to load PDF library:', err)
          setError('Failed to load PDF library')
        }
      })
    } else if (!isValidPdfUrl && PdfDocument) {
      // Clear PDF components if URL becomes invalid
      setPdfDocument(null)
      setPdfPage(null)
      setNumPages(null)
      setError(null)
      setLoading(false)
    }

    return () => {
      mounted = false
    }
  }, [isValidPdfUrl, PdfDocument, documentUrl])

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50))
  const handleRotate = () => setRotation(prev => (prev + 90) % 360)

  const handleDownload = async () => {
    if (!documentUrl || !document) {
      console.error('No document URL or document available')
      return
    }

    const fileName = document.name || 'document.pdf'

    try {
      console.log('Attempting to download:', documentUrl)

      // Try fetching without credentials for AWS S3 signed URLs
      const response = await fetch(documentUrl, {
        mode: 'cors'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const blob = await response.blob()
      console.log('Blob created:', blob.size, 'bytes')

      // Create a download link
      const url = window.URL.createObjectURL(blob)
      const link = window.document.createElement('a')
      link.href = url
      link.download = fileName
      window.document.body.appendChild(link)
      link.click()

      // Cleanup
      setTimeout(() => {
        window.document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }, 100)
    } catch (error) {
      console.error('Error downloading file:', error)

      // Fallback: Try direct download link if fetch fails (CORS issue)
      try {
        const link = window.document.createElement('a')
        link.href = documentUrl
        link.download = fileName
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
        window.document.body.appendChild(link)
        link.click()
        window.document.body.removeChild(link)
      } catch (fallbackError) {
        console.error('Fallback download also failed:', fallbackError)
        alert('Unable to download the document. Please check your browser console for details.')
      }
    }
  }

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

  // Helper function to shorten long file names
  const shortenFileName = (fileName, maxLength = 20) => {
    if (!fileName || fileName.length <= maxLength) return fileName

    // Get file extension
    const lastDotIndex = fileName.lastIndexOf('.')
    const extension = lastDotIndex > 0 ? fileName.substring(lastDotIndex) : ''
    const nameWithoutExt = lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName

    // Calculate how many characters to show from start and end
    const charsToShow = maxLength - extension.length - 3 // 3 for "..."
    const startChars = Math.ceil(charsToShow / 2)
    const endChars = Math.floor(charsToShow / 2)

    return `${nameWithoutExt.substring(0, startChars)}...${nameWithoutExt.substring(nameWithoutExt.length - endChars)}${extension}`
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <p>No documents available</p>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <p>No document selected</p>
      </div>
    )
  }

  const displayPages = totalPages || 10
  const shortFileName = shortenFileName(document.name || 'Document', 25)

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
              <span className="text-sm text-gray-700">{documents.length}</span>
              <DocumentIcon className="w-3.5 h-3.5 text-red-500" />
              <select
                className="px-2 py-0.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 text-gray-700 max-w-[200px]"
                value={selectedDocumentIndex}
                onChange={(e) => onDocumentChange(Number(e.target.value))}
                title={document?.name || 'Document'}
              >
                {documents.map((doc, index) => (
                  <option key={index} value={index}>
                    {shortenFileName(doc.name, 25)}
                  </option>
                ))}
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
            <button
              onClick={handleDownload}
              className="p-1 hover:bg-gray-100 rounded"
              title="Download"
            >
              <DownloadIcon className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
        </div>
      </div>

      {/* Document Display Area */}
      <div className="flex-1 bg-gray-100 p-6 overflow-y-auto">
        {isValidPdfUrl && PdfDocument && PdfPage && pdfFile ? (
          /* PDF Viewer */
          <div className="flex justify-center">
            {loading && !error && (
              <div className="text-gray-600">Loading PDF...</div>
            )}
            {error && (
              <div className="text-center text-red-600 p-4 bg-red-50 rounded">
                <p className="font-semibold">Failed to load PDF</p>
                <p className="text-sm mt-2">{error}</p>
              </div>
            )}
            {!error && (
              <div
                className="transition-all duration-300"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transformOrigin: 'center center'
                }}
              >
                <PdfDocument
                  file={pdfFile}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  onLoadStart={onDocumentLoadStart}
                  loading={<div className="text-gray-600">Loading PDF...</div>}
                  error={<div className="text-red-600">Failed to load PDF file</div>}
                  className="flex justify-center"
                  options={pdfOptions}
                >
                  <PdfPage
                    pageNumber={currentPage}
                    width={800}
                    scale={zoom / 100}
                    renderTextLayer={true}
                    renderAnnotationLayer={false}
                    className="shadow-lg"
                    loading={<div className="text-gray-400">Loading page...</div>}
                  />
                </PdfDocument>
              </div>
            )}
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
                    <span className="truncate" title={document.name}>{shortFileName} - Page {currentPage}</span>
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
  )
})

DocumentViewer.displayName = 'DocumentViewer'

export default DocumentViewer
