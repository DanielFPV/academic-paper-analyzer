import { formatTime } from '../utils/history'

export default function HistoryPanel({
  history,
  onSelect,
  onDelete,
  onClear,
  currentId
}) {
  if (!history || history.length === 0) {
    return (
      <div className="bg-white rounded-[24px] p-6 shadow-sm animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-amber-50 rounded-full flex items-center justify-center text-amber-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold tracking-tight text-gray-900">History</h3>
            <p className="text-xs text-gray-400">Your analyzed papers</p>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="w-14 h-14 mx-auto mb-3 bg-gray-50 rounded-full flex items-center justify-center">
            <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-sm text-gray-400">暂无历史记录</p>
          <p className="text-xs text-gray-300 mt-1">解析论文后会自动保存</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-[24px] p-6 shadow-sm animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-50 rounded-full flex items-center justify-center text-amber-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold tracking-tight text-gray-900">History</h3>
            <p className="text-xs text-gray-400">{history.length} 篇已解析</p>
          </div>
        </div>
        {onClear && (
          <button
            onClick={onClear}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors duration-200 px-2 py-1 rounded-lg hover:bg-red-50"
          >
            清空
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {history.map((item, index) => {
          const isActive = currentId === item.id
          return (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              className={`
                group relative p-3.5 rounded-2xl cursor-pointer
                transition-all duration-300 ease-out
                hover:shadow-md hover:scale-[1.02] hover:-translate-y-0.5
                ${isActive
                  ? 'bg-gradient-to-br from-blue-50 to-indigo-50 ring-2 ring-blue-200/50'
                  : 'bg-gray-50 hover:bg-white hover:ring-1 hover:ring-gray-200'
                }
                animate-fade-in
              `}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="flex items-start gap-3 pr-6">
                <div className={`
                  w-8 h-8 flex-shrink-0 rounded-xl flex items-center justify-center
                  transition-all duration-300
                  ${isActive
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-500'
                  }
                `}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`
                    text-sm font-medium truncate leading-snug
                    ${isActive ? 'text-blue-700' : 'text-gray-700'}
                  `}>
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatTime(item.timestamp)}
                  </p>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(item.id)
                }}
                className={`
                  absolute top-2 right-2 p-1.5 rounded-lg
                  opacity-0 group-hover:opacity-100
                  transition-all duration-200
                  text-gray-300 hover:text-red-500 hover:bg-red-50
                `}
                title="删除"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
