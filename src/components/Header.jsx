export default function Header({ rightSlot }) {
  return (
    <header className="relative text-center mb-10 animate-fade-in pt-8">
      <div className="absolute right-0 top-6">
        {rightSlot}
      </div>

      <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-white shadow-sm border border-gray-100">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
        <span className="text-xs font-medium text-gray-600">AI Research Learning Assistant</span>
      </div>
      <h1 className="text-4xl sm:text-[42px] font-semibold tracking-tight text-gray-900 mb-3 leading-tight">
        Academic Paper Analyzer <span className="text-blue-500">Pro</span>
      </h1>
      <p className="text-lg text-gray-500 font-normal max-w-xl mx-auto">
        上传一篇论文，像一位资深导师坐在你身边逐页讲解 — 背景、原理、类比、批判、学习路径。
      </p>
    </header>
  )
}
