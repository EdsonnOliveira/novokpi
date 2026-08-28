import { CardSkeleton, PageTitleSkeleton, SkeletonBlock } from '@/components/dastone/skeleton/SkeletonPrimitives';

export function DetailPageSkeleton({ withTabs = true }: { withTabs?: boolean }) {
  return (
    <>
      <PageTitleSkeleton withActions />
      {withTabs ? (
        <div className="d-flex gap-3 mb-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <SkeletonBlock key={index} height={32} width={`${72 + index * 8}px`} />
          ))}
        </div>
      ) : null}
      <div className="row">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="col-lg-4 mb-3">
            <CardSkeleton>
              {Array.from({ length: 6 }).map((__, lineIndex) => (
                <SkeletonBlock
                  key={lineIndex}
                  height={14}
                  className={lineIndex < 5 ? 'mb-3' : ''}
                  width={`${55 + ((lineIndex + index) % 4) * 12}%`}
                />
              ))}
            </CardSkeleton>
          </div>
        ))}
      </div>
    </>
  );
}
