const MODES = [
  {
    id: 'quick',
    label: 'Quick',
    subtitle: '摘要',
    description: '快速判断论文价值',
  },
  {
    id: 'deep',
    label: 'Deep Learning',
    subtitle: '深度解析',
    description: '11模块完整解读',
  },
  {
    id: 'review',
    label: 'Peer Review',
    subtitle: '审稿人视角',
    description: '深度模式 + 评分卡',
  },
]

export default function ModeTabs({ current, onChange, disabled }) {
  return (
    <div className="w-full bg-white rounded-[24px] p-1.5 shadow-sm flex flex-col sm:flex-row gap-1.5">
      {MODES.map((mode) => {
        const active = current === mode.id
        return (
          <button
            key={mode.id}
            onClick={() => !disabled && onChange(mode.id)}
            disabled={disabled}
            className={`
              flex-1 text-left px-5 py-4 rounded-[18px] transition-all duration-300 ease-out
              ${active
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-50'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="flex items-baseline gap-2 mb-1">
              <span className={`text-base font-semibold tracking-tight ${active ? 'text-white' : 'text-gray-900'}`}>
                {mode.label}
              </span>
              <span className={`text-xs ${active ? 'text-blue-100' : 'text-gray-400'}`}>
                {mode.subtitle}
              </span>
            </div>
            <div className={`text-xs ${active ? 'text-blue-100' : 'text-gray-500'}`}>
              {mode.description}
            </div>
          </button>
        )
      })}
    </div>
  )
}
