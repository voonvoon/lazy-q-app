export default function AdminSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          {/* Title skeleton */}
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          
          {/* Content sections skeleton */}
          <div className="space-y-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}