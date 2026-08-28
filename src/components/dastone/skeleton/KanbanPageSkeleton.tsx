import { CardSkeleton, PageTitleSkeleton, SkeletonBlock } from '@/components/dastone/skeleton/SkeletonPrimitives';

export function KanbanPageSkeleton() {
  return (
    <>
      <PageTitleSkeleton withActions />
      <div className="row flex-nowrap overflow-hidden">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="col-md-3 mb-3">
            <CardSkeleton>
              <SkeletonBlock height={18} width="120px" className="mb-3" />
              {Array.from({ length: 3 }).map((__, cardIndex) => (
                <div key={cardIndex} className="card mb-2">
                  <div className="card-body py-3">
                    <SkeletonBlock height={14} className="mb-2" />
                    <SkeletonBlock height={12} width="70%" />
                  </div>
                </div>
              ))}
            </CardSkeleton>
          </div>
        ))}
      </div>
    </>
  );
}

export function CardsPageSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      <PageTitleSkeleton />
      <div className="row">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="col-md-4 mb-3">
            <CardSkeleton>
              <SkeletonBlock height={18} width="70%" className="mb-2" />
              <SkeletonBlock height={14} width="100%" className="mb-2" />
              <SkeletonBlock height={14} width="45%" />
            </CardSkeleton>
          </div>
        ))}
      </div>
    </>
  );
}

export function ChatPageSkeleton() {
  return (
    <>
      <PageTitleSkeleton />
      <div className="row">
        <div className="col-md-4 mb-3">
          <CardSkeleton>
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonBlock key={index} height={36} className={index < 4 ? 'mb-2' : ''} />
            ))}
          </CardSkeleton>
        </div>
        <div className="col-md-8 mb-3">
          <CardSkeleton title={false}>
            <SkeletonBlock height={240} className="mb-3" />
            <SkeletonBlock height={40} />
          </CardSkeleton>
        </div>
      </div>
    </>
  );
}
