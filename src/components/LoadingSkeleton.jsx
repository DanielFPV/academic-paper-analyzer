export default function LoadingSkeleton() {
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative w-16 h-16 mb-6">
          <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-lg font-medium text-gray-700 mb-2">Analyzing Paper…</p>
        <p className="text-gray-400">This may take a few moments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-white rounded-card p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-100 rounded-full skeleton"></div>
              <div className="w-32 h-6 bg-gray-200 rounded skeleton"></div>
            </div>
            <div className="space-y-2">
              <div className="w-full h-4 bg-gray-100 rounded skeleton"></div>
              <div className="w-full h-4 bg-gray-100 rounded skeleton"></div>
              <div className="w-3/4 h-4 bg-gray-100 rounded skeleton"></div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-card p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-100 rounded-full skeleton"></div>
          <div className="w-28 h-6 bg-gray-200 rounded skeleton"></div>
        </div>
        <div className="space-y-2">
          <div className="w-full h-4 bg-gray-100 rounded skeleton"></div>
          <div className="w-full h-4 bg-gray-100 rounded skeleton"></div>
          <div className="w-full h-4 bg-gray-100 rounded skeleton"></div>
          <div className="w-2/3 h-4 bg-gray-100 rounded skeleton"></div>
        </div>
      </div>
    </div>
  )
}
