export default function ResultCard({ title, content, icon, delay = 0 }) {
  const icons = {
    lightbulb: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 2.5V2.5V2.5z" opacity="0" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17h6M12 3v1m4.95 2.05l-.707.707M21 12h-1M4 12H3m12.707 6.757l-.707-.707M12 6a5 5 0 010 7.071 10l-.707.707A2 2 0 0014 19v19a2 2 0 01-4 0v-1.586A5.172 5.172 0 015.293 14.293z" />
      <circle cx="12" cy="12" r="3" strokeWidth={1.8} />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17h6" />
    </svg>
    ),
    flask: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M9 3h6l-1 1v6.172a2 2 0 00.586 1.414l4.414 4.414a2 2 0 010 2.828l-10 0a2 2 0 010-2.828L9 11.586V5z" />
    </svg>
    ),
    fileText: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14 2v6h6M8 13h8M8 17h6M8 9h2" />
      </svg>
    ),
  }

  return (
    <div
      className="bg-white rounded-card p-7 shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 ease-out animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-50 text-blue-500">
          {icons[icon]}
        </div>
        <h3 className="text-lg font-semibold tracking-tight text-gray-900">{title}</h3>
      </div>
      <div className="text-gray-600 leading-[1.8] text-[15px] whitespace-pre-wrap">
        {content}
      </div>
    </div>
  )
}
