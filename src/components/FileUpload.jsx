import { useState, useCallback, useEffect } from 'react'

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function FileUpload({ onFileSelect, isLoading, fileName }) {
  const [isDragging, setIsDragging] = useState(false)
  const [hasUploaded, setHasUploaded] = useState(false)

  useEffect(() => {
    if (fileName) {
      setHasUploaded(true)
    } else {
      setHasUploaded(false)
    }
  }, [fileName])

  const processFile = useCallback((file) => {
    if (file.type === 'application/pdf') {
      setHasUploaded(true)
      onFileSelect(file)
    }
  }, [onFileSelect])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragEnter = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      processFile(files[0])
    }
  }, [processFile])

  const handleFileInput = useCallback((e) => {
    const file = e.target.files[0]
    if (file) {
      processFile(file)
    }
  }, [processFile])

  return (
    <div
      className={`
        relative w-full max-w-2xl mx-auto p-10
        bg-white rounded-[24px]
        border-2 border-dashed transition-all duration-300 ease-out
        ${isDragging ? 'border-blue-400 bg-blue-50/50 scale-[1.01]' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'}
        ${isLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-sm'}
      `}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !isLoading && document.getElementById('file-input')?.click()}
    >
      <input
        id="file-input"
        type="file"
        accept="application/pdf"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isLoading}
      />

      <div className="text-center">
        {hasUploaded ? (
          <div className="animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-50 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-green-600 mb-1">PDF Loaded Successfully</p>
            <p className="text-sm text-gray-400 mt-1">{fileName || '正在分析...'}</p>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-700 mb-1">Drag & Drop your PDF here</p>
            <p className="text-gray-400">or click to browse</p>
            <p className="mt-4 text-sm text-gray-400">Supports PDF format, single file upload</p>
          </>
        )}
      </div>
    </div>
  )
}
