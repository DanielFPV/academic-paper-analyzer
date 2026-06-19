import MarkdownRenderer from './MarkdownRenderer'

const ICONS = {
  target: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  ),
  book: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5v-17z" />
      <path d="M4 19A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M8 7h8M8 11h6" />
    </svg>
  ),
  lightbulb: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6" />
      <path d="M10 21h4" />
      <path d="M12 3a6 6 0 0 0-4 10.5c.8.7 1.5 1.6 1.5 3.5h5c0-1.9.7-2.8 1.5-3.5A6 6 0 0 0 12 3z" />
    </svg>
  ),
  flask: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3h6M10 3v6L4.5 17a2.5 2.5 0 0 0 2.1 3.8h10.8a2.5 2.5 0 0 0 2.1-3.8L14 9V3" />
      <path d="M6.5 15h11" />
    </svg>
  ),
  spark: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  ),
  scale: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18M5 7h14M6 7l-3 6a4 4 0 0 0 6 0L6 7zM18 7l-3 6a4 4 0 0 0 6 0l-3-6z" />
    </svg>
  ),
  path: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <path d="M8 6h8M18 8v8M8 8l8 8" />
    </svg>
  ),
  chat: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a7 7 0 0 1-10.3 6L5 20l1.7-4.4A7 7 0 1 1 21 12z" />
      <circle cx="9" cy="12" r="1" fill="currentColor" />
      <circle cx="13" cy="12" r="1" fill="currentColor" />
      <circle cx="17" cy="12" r="1" fill="currentColor" />
    </svg>
  ),
  trophy: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 21h8M12 17v4M6 3h12v4a6 6 0 0 1-12 0V3z" />
      <path d="M6 5H3a3 3 0 0 0 3 5M18 5h3a3 3 0 0 1-3 5" />
    </svg>
  ),
  gradCap: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l9 4-9 4-9-4 9-4z" />
      <path d="M6 10v6c0 1 2.5 3 6 3s6-2 6-3v-6" />
      <path d="M21 8v6" />
    </svg>
  ),
  graph: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5" cy="6" r="2" />
      <circle cx="19" cy="6" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="5" cy="18" r="2" />
      <circle cx="19" cy="18" r="2" />
      <path d="M7 7l3 3M17 7l-3 3M7 17l3-3M17 17l-3-3" />
    </svg>
  ),
  review: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h12l4 4v12H4z" />
      <path d="M16 4v4h4M8 12h8M8 16h6M8 8h4" />
    </svg>
  ),
  doc: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6z" />
      <path d="M14 2v6h6M8 13h8M8 17h6" />
    </svg>
  ),
}

const ICON_COLORS = {
  target: 'bg-rose-50 text-rose-500',
  book: 'bg-amber-50 text-amber-600',
  lightbulb: 'bg-yellow-50 text-yellow-600',
  flask: 'bg-emerald-50 text-emerald-600',
  spark: 'bg-violet-50 text-violet-600',
  scale: 'bg-slate-100 text-slate-600',
  path: 'bg-cyan-50 text-cyan-600',
  chat: 'bg-indigo-50 text-indigo-600',
  trophy: 'bg-orange-50 text-orange-600',
  gradCap: 'bg-blue-50 text-blue-600',
  graph: 'bg-teal-50 text-teal-600',
  review: 'bg-pink-50 text-pink-600',
  doc: 'bg-gray-100 text-gray-500',
}

function SkeletonLine({ width = '100%', height = '14px', marginTop = '8px' }) {
  return (
    <div
      className="rounded-md bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-[shimmer_1.6s_infinite]"
      style={{ width, height, marginTop }}
    />
  )
}

export default function ModuleCard({
  title,
  icon,
  content,
  fullWidth = false,
  delay = 0,
  loading = false,
}) {
  const colorClass = ICON_COLORS[icon] || ICON_COLORS.doc
  const IconComponent = ICONS[icon] || ICONS.doc

  return (
    <div
      className={`
        bg-white rounded-[24px] p-7 shadow-sm
        hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 ease-out
        animate-fade-in
        ${fullWidth ? 'col-span-full' : ''}
      `}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
          {IconComponent}
        </div>
        <h3 className="text-lg font-semibold tracking-tight text-gray-900">{title}</h3>
      </div>

      <div>
        {loading ? (
          <div className="pt-1">
            <SkeletonLine width="80%" height="14px" marginTop="0px" />
            <SkeletonLine width="92%" height="14px" marginTop="10px" />
            <SkeletonLine width="70%" height="14px" marginTop="10px" />
            <SkeletonLine width="85%" height="14px" marginTop="10px" />
            <SkeletonLine width="60%" height="14px" marginTop="10px" />
          </div>
        ) : (
          <MarkdownRenderer markdown={content} />
        )}
      </div>
    </div>
  )
}
