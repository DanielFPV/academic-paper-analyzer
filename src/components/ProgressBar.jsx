export default function ProgressBar({ completed, total, message }) {
  const percentage = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0

  return (
    <div className="bg-white rounded-[24px] p-5 shadow-sm animate-fade-in col-span-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full border-2 border-blue-200 border-t-blue-500 animate-spin" />
          <span className="text-sm font-medium text-gray-700">
            {message || '正在分析论文…'}
          </span>
        </div>
        <span className="text-xs text-gray-500 tabular-nums">
          {completed} / {total} modules · {percentage}%
        </span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-500 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
