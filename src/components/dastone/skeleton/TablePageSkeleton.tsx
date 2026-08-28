import { CardSkeleton, PageTitleSkeleton, SkeletonBlock } from '@/components/dastone/skeleton/SkeletonPrimitives';

function TableRowsSkeleton({ rows = 8, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="table-responsive">
      <table className="table mb-0">
        <thead>
          <tr>
            {Array.from({ length: columns }).map((_, index) => (
              <th key={index}>
                <SkeletonBlock height={14} width={`${60 + index * 8}px`} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex}>
                  <SkeletonBlock height={14} width={`${50 + ((rowIndex + colIndex) % 4) * 18}px`} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TablePageSkeleton({ rows = 8, columns = 5, withActions = false }: { rows?: number; columns?: number; withActions?: boolean }) {
  return (
    <>
      <PageTitleSkeleton withActions={withActions} />
      <CardSkeleton>
        <TableRowsSkeleton rows={rows} columns={columns} />
      </CardSkeleton>
    </>
  );
}

export function TableRowsSkeletonExport({ rows = 8, columns = 5 }: { rows?: number; columns?: number }) {
  return <TableRowsSkeleton rows={rows} columns={columns} />;
}
