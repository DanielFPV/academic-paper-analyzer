import { useState, useCallback, useEffect, useMemo } from 'react'
import Header from './components/Header'
import FileUpload from './components/FileUpload'
import ModeTabs from './components/ModeTabs'
import ProgressBar from './components/ProgressBar'
import ModuleCard from './components/ModuleCard'
import HistoryPanel from './components/HistoryPanel'
import ApiKeyModal from './components/ApiKeyModal'
import KeyManager from './components/KeyManager'
import { parsePdf } from './utils/pdfParser'
import { analyzePaper, getStoredApiKey, setStoredApiKey, clearStoredApiKey } from './utils/deepseekApi'

const MODULE_META = {
  problem: { title: 'Problem · 论文解决的问题', icon: 'target', fullWidth: false, delay: 0 },
  background: { title: 'Background · 前置知识', icon: 'book', fullWidth: false, delay: 100 },
  coreIdea: { title: 'Core Idea · 核心思想', icon: 'lightbulb', fullWidth: false, delay: 200 },
  method: { title: 'Method · 方法分析', icon: 'flask', fullWidth: false, delay: 300 },
  innovation: { title: 'Innovation · 创新点', icon: 'spark', fullWidth: false, delay: 400 },
  limitations: { title: 'Limitations · 批判性审查', icon: 'scale', fullWidth: false, delay: 500 },
  learningPath: { title: 'Learning Path · 学习路线', icon: 'path', fullWidth: false, delay: 600 },
  interview: { title: 'Interview Questions · 复试题', icon: 'chat', fullWidth: false, delay: 700 },
  keyFindings: { title: 'Key Findings · 核心发现', icon: 'trophy', fullWidth: true, delay: 800 },
  professor: { title: 'Professor Explanation · 教授讲解', icon: 'gradCap', fullWidth: true, delay: 900 },
  knowledgeGraph: { title: 'Knowledge Graph · 知识图谱', icon: 'graph', fullWidth: true, delay: 1000 },
  reviewScore: { title: 'Peer Review · 审稿人评分', icon: 'review', fullWidth: true, delay: 1100 },
}

function modeModules(mode) {
  if (mode === 'quick') return ['problem', 'keyFindings']
  if (mode === 'review') return [...Object.keys(MODULE_META).filter((k) => k !== 'reviewScore'), 'reviewScore']
  return Object.keys(MODULE_META).filter((k) => k !== 'reviewScore')
}

const HISTORY_KEY = 'paper_analyzer_history_v2'

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveHistory(history) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  } catch {
    /* swallow quota errors */
  }
}

function Toast({ message, type, onClose }) {
  const palette =
    type === 'error'
      ? 'border-red-200 bg-red-50 text-red-700'
      : type === 'success'
      ? 'border-green-200 bg-green-50 text-green-700'
      : 'border-blue-200 bg-blue-50 text-blue-700'
  return (
    <div className={`fixed top-6 right-6 z-50 border rounded-[24px] px-5 py-3 shadow-md animate-fade-in ${palette}`}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{message}</span>
        {onClose && (
          <button onClick={onClose} className="ml-2 text-gray-400 hover:text-gray-600 text-sm">
            ×
          </button>
        )}
      </div>
    </div>
  )
}

export default function App() {
  const [mode, setMode] = useState('deep')
  const [pdfName, setPdfName] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState({})
  const [statusMsg, setStatusMsg] = useState('')
  const [toast, setToast] = useState(null)
  const [history, setHistory] = useState([])
  const [currentHistoryId, setCurrentHistoryId] = useState(null)

  // API key state
  const [apiKey, setApiKey] = useState(() => getStoredApiKey())
  const [showKeyModal, setShowKeyModal] = useState(() => !getStoredApiKey())
  const [authInvalidMsg, setAuthInvalidMsg] = useState(false)

  // Keep React state in sync with sessionStorage
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'deepseek_api_key') {
        setApiKey(e.newValue || '')
        if (!e.newValue) setShowKeyModal(true)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Load history on mount
  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  const handleSaveKey = useCallback((value) => {
    setStoredApiKey(value)
    setApiKey(value)
    setAuthInvalidMsg(false)
    setShowKeyModal(false)
  }, [])

  const handleReplaceKey = useCallback(() => {
    setShowKeyModal(true)
  }, [])

  const handleClearKey = useCallback(() => {
    clearStoredApiKey()
    setApiKey('')
    setAuthInvalidMsg(false)
    setShowKeyModal(true)
  }, [])

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2800)
  }, [])

  const modulesForMode = useMemo(() => modeModules(mode), [mode])

  const resetAnalysis = useCallback(() => {
    setResults({})
    setCurrentHistoryId(null)
    setStatusMsg('')
  }, [])

  const handleFileSelect = useCallback(
    async (file) => {
      // No API key → show the modal first
      const key = getStoredApiKey()
      if (!key) {
        setShowKeyModal(true)
        return
      }

      resetAnalysis()
      setPdfName(file?.name || 'paper.pdf')
      setIsLoading(true)
      setStatusMsg('正在解析 PDF…')

      try {
        const text = await parsePdf(file)
        if (!text || text.trim().length < 200) {
          throw new Error('PDF 内容过短，无法提取有效文本')
        }
        setStatusMsg('PDF 解析完成，正在调用 AI 分析…')

        const finalResults = await analyzePaper(text, mode, ({ moduleId, content, index, total }) => {
          if (moduleId === '__status__') {
            setStatusMsg(content)
          } else {
            setResults((prev) => ({ ...prev, [moduleId]: content }))
            if (typeof total === 'number') {
              setStatusMsg(`已完成 ${index + 1} / ${total} 模块`)
            }
          }
        })

        // Merge any modules the streaming calls might have missed
        setResults((prev) => {
          const merged = { ...prev }
          for (const [k, v] of Object.entries(finalResults || {})) {
            if (!merged[k] && !k.startsWith('_')) merged[k] = v
          }
          return merged
        })

        // Save to history
        const now = Date.now()
        const newItem = {
          id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
          title: file?.name || 'paper.pdf',
          mode,
          results: Object.fromEntries(
            Object.entries(finalResults || {}).filter(([k]) => !k.startsWith('_')),
          ),
          timestamp: now,
        }

        setHistory((prev) => {
          // de-dupe by title, place most recent first, cap at 10
          const filtered = prev.filter((h) => h.title !== newItem.title)
          const next = [newItem, ...filtered].slice(0, 10)
          saveHistory(next)
          return next
        })
        setCurrentHistoryId(newItem.id)

        showToast('分析完成，已保存到历史记录', 'success')
      } catch (err) {
        console.error(err)
        if (err?.name === 'ApiAuthError') {
          setApiKey('')
          setAuthInvalidMsg(true)
          setShowKeyModal(true)
          showToast(err.message || 'API Key 无效，请重新填写', 'error')
        } else {
          showToast(err?.message || '分析论文失败，请重试', 'error')
        }
      } finally {
        setIsLoading(false)
        setStatusMsg('')
      }
    },
    [mode, resetAnalysis, showToast],
  )

  const handleSelectHistory = useCallback((item) => {
    setResults(item.results || {})
    setPdfName(item.title)
    setMode(item.mode || 'deep')
    setCurrentHistoryId(item.id)
    showToast('已恢复历史解析结果', 'success')
  }, [showToast])

  const handleDeleteHistory = useCallback((id) => {
    setHistory((prev) => {
      const next = prev.filter((h) => h.id !== id)
      saveHistory(next)
      return next
    })
    if (currentHistoryId === id) setCurrentHistoryId(null)
  }, [currentHistoryId])

  const handleClearHistory = useCallback(() => {
    setHistory([])
    setCurrentHistoryId(null)
    saveHistory([])
    showToast('历史记录已清空', 'success')
  }, [showToast])

  const handleStartNew = useCallback(() => {
    resetAnalysis()
    setPdfName(null)
  }, [resetAnalysis])

  const hasAnyResult = modulesForMode.some((m) => results[m])

  return (
    <div className="min-h-screen bg-background">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <ApiKeyModal
        isOpen={showKeyModal}
        onSave={handleSaveKey}
        prefill={apiKey || ''}
        showInvalidMsg={authInvalidMsg}
      />

      <div className="max-w-[1500px] mx-auto px-4 py-10">
        <Header
          rightSlot={
            <KeyManager
              apiKey={apiKey}
              onReplace={handleReplaceKey}
              onClear={handleClearKey}
            />
          }
        />

        <div className="mb-8">
          <ModeTabs current={mode} onChange={setMode} disabled={isLoading} />
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Main content */}
          <div className="flex-1 min-w-0 w-full space-y-6">
            <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} fileName={pdfName} />

            {/* Progress bar during analysis */}
            {isLoading && (
              <>
                <ProgressBar
                  completed={modulesForMode.filter((m) => results[m]).length}
                  total={modulesForMode.length}
                  message={statusMsg || '正在分析论文…'}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {modulesForMode.map((mid, idx) => {
                    const meta = MODULE_META[mid] || { title: mid, icon: 'doc', fullWidth: false }
                    const hasContent = !!results[mid]
                    return (
                      <div key={mid} className={meta.fullWidth ? 'md:col-span-2 xl:col-span-3' : ''}>
                        <ModuleCard
                          title={meta.title}
                          icon={meta.icon}
                          fullWidth={meta.fullWidth}
                          content={results[mid]}
                          loading={!hasContent}
                          delay={idx * 60}
                        />
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {/* Rendered results once complete (or when viewing from history) */}
            {!isLoading && hasAnyResult && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
                {modulesForMode.map((mid, idx) => {
                  const meta = MODULE_META[mid] || { title: mid, icon: 'doc', fullWidth: false }
                  return (
                    <div key={mid} className={meta.fullWidth ? 'md:col-span-2 xl:col-span-3' : ''}>
                      <ModuleCard
                        title={meta.title}
                        icon={meta.icon}
                        fullWidth={meta.fullWidth}
                        content={results[mid]}
                        delay={idx * 80}
                      />
                    </div>
                  )
                })}
              </div>
            )}

            {/* "Start a new analysis" button when results exist */}
            {!isLoading && hasAnyResult && (
              <div className="text-center pt-2">
                <button
                  onClick={handleStartNew}
                  className="px-5 py-3 bg-white text-gray-600 rounded-[24px] shadow-sm hover:shadow-md hover:text-gray-800 transition-all duration-300 text-sm font-medium"
                >
                  上传新的论文
                </button>
              </div>
            )}

            {/* Empty state when no paper uploaded yet */}
            {!isLoading && !hasAnyResult && !pdfName && (
              <div className="text-center py-12 animate-fade-in">
                <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-full shadow-sm flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">选择分析模式，拖入 PDF 开始</p>
              </div>
            )}
          </div>

          {/* History sidebar */}
          <div className="w-full lg:w-[320px] flex-shrink-0 lg:sticky lg:top-10">
            <HistoryPanel
              history={history}
              onSelect={handleSelectHistory}
              onDelete={handleDeleteHistory}
              onClear={handleClearHistory}
              currentId={currentHistoryId}
            />
          </div>
        </div>

        <footer className="mt-16 text-center text-xs text-gray-400">
          Powered by DeepSeek · Local PDF parsing · Your data stays in your browser
        </footer>
      </div>
    </div>
  )
}
