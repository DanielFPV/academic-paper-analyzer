import { useState, useRef, useEffect } from 'react'

export default function ApiKeyModal({ onSave, isOpen, prefill = '', showInvalidMsg = false }) {
  const [value, setValue] = useState(prefill)
  const [showPlain, setShowPlain] = useState(false)
  const [touched, setTouched] = useState(false)
  const [isAnimatingIn, setIsAnimatingIn] = useState(false)
  const inputRef = useRef(null)

  const invalid = value.length > 0 && !value.trim().startsWith('sk-')
  const canSubmit = value.trim().startsWith('sk-')

  useEffect(() => {
    if (isOpen) {
      // Trigger fade-in after render
      requestAnimationFrame(() => setIsAnimatingIn(true))
      setTimeout(() => inputRef.current?.focus(), 150)
    } else {
      setIsAnimatingIn(false)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      // When reopened from the "replace" flow, clear the input for a fresh entry
      setValue(showInvalidMsg ? '' : prefill)
      setShowPlain(false)
      setTouched(showInvalidMsg)
    }
  }, [isOpen, prefill, showInvalidMsg])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    setTouched(true)
    if (!canSubmit) return
    onSave(value.trim())
  }

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-200 ${
        isAnimatingIn ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`bg-white rounded-[24px] shadow-2xl w-[480px] max-w-[92vw] p-10 transition-transform duration-200 ${
          isAnimatingIn ? 'translate-y-0' : 'translate-y-2'
        }`}
      >
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-900 text-white mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 leading-tight">
            开始使用前，填入你的 API Key
          </h2>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            Key 仅保存在你的浏览器本地，不会上传到任何服务器
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2 tracking-wide uppercase">
              DeepSeek API Key
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type={showPlain ? 'text' : 'password'}
                value={value}
                onChange={(e) => {
                  setValue(e.target.value)
                  setTouched(true)
                }}
                placeholder="sk-..."
                autoComplete="off"
                spellCheck={false}
                className={`w-full px-4 py-3 pr-12 text-[15px] rounded-[12px] bg-white text-gray-900 outline-none transition-colors duration-200 font-mono ${
                  touched && invalid
                    ? 'border border-red-300 focus:border-red-500'
                    : 'border border-gray-200 focus:border-black'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPlain((p) => !p)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1.5 rounded-md transition-colors"
                aria-label={showPlain ? '隐藏明文' : '显示明文'}
              >
                {showPlain ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <div className="min-h-[20px] mt-2">
              {touched && invalid ? (
                <p className="text-sm text-red-500 font-medium">
                  格式不正确，DeepSeek Key 以 sk- 开头
                </p>
              ) : (
                <p className="text-sm text-gray-400">· Key 仅在本会话期间保存在浏览器</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className={`w-full py-3.5 rounded-[12px] text-white font-medium text-[15px] tracking-wide transition-all duration-200 ${
              canSubmit
                ? 'bg-black hover:opacity-85 active:scale-[0.98]'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            开始使用
          </button>
        </form>

        <div className="mt-5 text-center">
          <a
            href="https://platform.deepseek.com/api_keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-600 hover:text-black transition-colors underline decoration-gray-300 decoration-1 underline-offset-2"
          >
            没有 Key？点这里申请 →
          </a>
        </div>
      </div>
    </div>
  )
}
