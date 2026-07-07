import { AppLayout } from "@/components/layout/AppLayout";

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`skeleton rounded-lg ${className ?? ""}`} aria-hidden="true" />;
}

export default function DashboardLoading() {
  return (
    <AppLayout title="Dashboard">
      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
            <div className="flex items-start justify-between mb-4">
              <SkeletonBlock className="h-4 w-32" />
              <SkeletonBlock className="h-10 w-10 rounded-lg" />
            </div>
            <SkeletonBlock className="h-8 w-28 mb-2" />
            <SkeletonBlock className="h-3 w-20" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Recent list skeleton */}
        <div className="xl:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between">
            <div className="space-y-1">
              <SkeletonBlock className="h-5 w-40" />
              <SkeletonBlock className="h-3 w-24" />
            </div>
            <SkeletonBlock className="h-4 w-16" />
          </div>
          <div className="divide-y divide-slate-50">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                <SkeletonBlock className="h-9 w-9 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <SkeletonBlock className="h-4 w-36" />
                  <SkeletonBlock className="h-3 w-24" />
                </div>
                <SkeletonBlock className="h-5 w-20" />
                <SkeletonBlock className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Status sidebar skeleton */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
          <SkeletonBlock className="h-5 w-24 mb-4" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="mb-4">
              <div className="flex justify-between mb-1.5">
                <SkeletonBlock className="h-4 w-20" />
                <SkeletonBlock className="h-4 w-6" />
              </div>
              <SkeletonBlock className="h-1.5 w-full rounded-full" />
            </div>
          ))}
          <SkeletonBlock className="h-16 w-full rounded-xl mt-4" />
        </div>
      </div>
    </AppLayout>
  );
}
