import { PageTitleSkeleton, SkeletonBlock } from '@/components/dastone/skeleton/SkeletonPrimitives';

export function KanbanPageSkeleton() {
  return (
    <>
      <PageTitleSkeleton withActions />
      <div className="kanban-board">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="kanban-col">
            <div className="my-3">
              <SkeletonBlock height={18} width="140px" className="mb-2" />
              <SkeletonBlock height={14} width="100px" />
            </div>
            {Array.from({ length: 2 }).map((__, cardIndex) => (
              <div key={cardIndex} className="card mb-3">
                <div className="card-body">
                  <SkeletonBlock height={14} width="80px" className="mb-2" />
                  <SkeletonBlock height={18} width="100%" className="mb-2" />
                  <SkeletonBlock height={14} width="90%" className="mb-3" />
                  <SkeletonBlock height={4} width="100%" />
                </div>
              </div>
            ))}
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
            <div className="card">
              <div className="card-body">
                <SkeletonBlock height={18} width="70%" className="mb-2" />
                <SkeletonBlock height={14} width="100%" className="mb-2" />
                <SkeletonBlock height={14} width="45%" />
              </div>
            </div>
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
          <div className="card">
            <div className="card-body">
              {Array.from({ length: 5 }).map((_, index) => (
                <SkeletonBlock key={index} height={36} className={index < 4 ? 'mb-2' : ''} />
              ))}
            </div>
          </div>
        </div>
        <div className="col-md-8 mb-3">
          <div className="card">
            <div className="card-body">
              <SkeletonBlock height={240} className="mb-3" />
              <SkeletonBlock height={40} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
