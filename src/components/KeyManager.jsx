import { useState, useEffect, useRef } from 'react'

function maskKey(key) {
  if (!key) return ''
  if (key.length <= 10) return key
  const head = key.slice(0, 6)
  const tail = key.slice(-4)
  return `${head}****${tail}`
}

export default function KeyManager({ apiKey, onReplace, onClear }) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)
  const buttonRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function onClick(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !buttonRef.current?.contains(e.target)
      ) {
        setOpen(false)
      }
    }
    function onEsc(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [open])

  const displayKey = maskKey(apiKey)
  const hasKey = Boolean(apiKey)

  return (
    <div className="relative z-50">
      <button
        ref={buttonRef}
        onClick={() => setOpen((p) => !p)}
        className={`flex items-center gap-2 px-4 py-2 rounded-[16px] transition-all duration-200 text-sm font-medium ${
          open
            ? 'bg-gray-900 text-white shadow-md'
            : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200'
        }`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 114 4 2 2 0 11-4-4z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 2l-9.6 9.6 9.6L7.172 16.828 4 21 5 20.828 12.172 19.2 16.828 21" />
          <circle cx="5.657" cy="18.343" r="1.5" strokeWidth="1.8" fill="none" />
        </svg>
        <span>API Key</span>
        <span
          className={`ml-1 w-1.5 h-1.5 rounded-full ${
            hasKey ? 'bg-green-400' : 'bg-gray-300'
          }`}
        />
      </button>

      {open && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-[340px] bg-white rounded-[24px] shadow-xl border border-gray-100 p-5 animate-fade-in"
        >
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">当前 Key</p>
            <div className="px-4 py-3 bg-gray-50 rounded-[12px] border border-gray-100 font-mono text-sm text-gray-700">
              {hasKey ? displayKey : '未设置'}
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => {
                setOpen(false)
                onReplace()
              }}
              className="w-full flex items-center justify-between px-4 py-3 rounded-[12px] bg-gray-50 hover:bg-gray-100 transition-colors duration-200 text-sm font-medium text-gray-800"
            >
              <span>更换 Key</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.792 2.571-4 2.571-.348 0-.677.055-.997.162-.21.497 0 .719 0 1.003 0M15 5l2 10.007 2-10.007" transform="scale(-1,1) translate(-24,0)" />
              </svg>
            </button>

            <button
              onClick={() => {
                setOpen(false)
                onClear()
              }}
              className="w-full flex items-center justify-between px-4 py-3 rounded-[12px] bg-red-50/50 hover:bg-red-50 transition-colors duration-200 text-sm font-medium text-red-600"
            >
                <span>清除 Key</span>
              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.867 1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h10a2 2 0 012 2v2" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
