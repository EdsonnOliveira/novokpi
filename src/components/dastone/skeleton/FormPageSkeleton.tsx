import { CardSkeleton, PageTitleSkeleton, SkeletonBlock } from '@/components/dastone/skeleton/SkeletonPrimitives';
import { TableRowsSkeletonExport } from '@/components/dastone/skeleton/TablePageSkeleton';

function FormFieldsSkeleton({ fields = 6 }: { fields?: number }) {
  return (
    <div className="row">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="col-md-4 mb-3">
          <SkeletonBlock height={32} />
        </div>
      ))}
      <div className="col-md-3 mb-3">
        <SkeletonBlock height={32} width="120px" />
      </div>
    </div>
  );
}

export function FormPageSkeleton({ fields = 6 }: { fields?: number }) {
  return (
    <>
      <PageTitleSkeleton />
      <CardSkeleton>
        <FormFieldsSkeleton fields={fields} />
      </CardSkeleton>
    </>
  );
}

export function FormTablePageSkeleton({ fields = 4, rows = 6, columns = 5 }: { fields?: number; rows?: number; columns?: number }) {
  return (
    <>
      <PageTitleSkeleton />
      <CardSkeleton title={false}>
        <FormFieldsSkeleton fields={fields} />
      </CardSkeleton>
      <CardSkeleton className="mt-3">
        <TableRowsSkeletonExport rows={rows} columns={columns} />
      </CardSkeleton>
    </>
  );
}
