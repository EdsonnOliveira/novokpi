import { CardSkeleton, PageTitleSkeleton, SkeletonBlock } from '@/components/dastone/skeleton/SkeletonPrimitives';

export function DashboardPageSkeleton() {
  return (
    <>
      <PageTitleSkeleton withActions />
      {Array.from({ length: 4 }).map((_, sectionIndex) => (
        <div key={sectionIndex}>
          <SkeletonBlock height={14} width="120px" className="mb-2" />
          <div className="row mb-3">
            {Array.from({ length: 4 }).map((__, index) => (
              <div key={index} className="col-md-3 mb-3">
                <CardSkeleton title={false}>
                  <SkeletonBlock height={14} width="80px" className="mb-2" />
                  <SkeletonBlock height={28} width="96px" />
                </CardSkeleton>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="row">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="col-xl-4 mb-3">
            <CardSkeleton>
              {Array.from({ length: 5 }).map((__, lineIndex) => (
                <SkeletonBlock key={lineIndex} height={14} className="mb-2" width={`${60 + lineIndex * 8}%`} />
              ))}
            </CardSkeleton>
          </div>
        ))}
      </div>
      <div className="row">
        <div className="col-xl-6 mb-3">
          <CardSkeleton>
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonBlock key={index} height={14} className="mb-2" />
            ))}
          </CardSkeleton>
        </div>
        <div className="col-xl-6 mb-3">
          <CardSkeleton>
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonBlock key={index} height={14} className="mb-2" />
            ))}
          </CardSkeleton>
        </div>
      </div>
    </>
  );
}

export function OverviewPageSkeleton() {
  return (
    <>
      <PageTitleSkeleton withActions />
      <div className="row mb-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="col-md-4 mb-3">
            <CardSkeleton title={false}>
              <SkeletonBlock height={14} width="80px" className="mb-2" />
              <SkeletonBlock height={28} width="96px" />
            </CardSkeleton>
          </div>
        ))}
      </div>
      <CardSkeleton>
        {Array.from({ length: 8 }).map((_, index) => (
          <SkeletonBlock key={index} height={14} className="mb-2" />
        ))}
      </CardSkeleton>
    </>
  );
}
