import { CardsPageSkeleton } from '@/components/dastone/skeleton/KanbanPageSkeleton';
import { DashboardPageSkeleton, OverviewPageSkeleton } from '@/components/dastone/skeleton/DashboardPageSkeleton';
import { DetailPageSkeleton } from '@/components/dastone/skeleton/DetailPageSkeleton';
import { FormPageSkeleton, FormTablePageSkeleton } from '@/components/dastone/skeleton/FormPageSkeleton';
import { ChatPageSkeleton, KanbanPageSkeleton } from '@/components/dastone/skeleton/KanbanPageSkeleton';
import { TablePageSkeleton } from '@/components/dastone/skeleton/TablePageSkeleton';

export type PageSkeletonVariant =
  | 'table'
  | 'dashboard'
  | 'overview'
  | 'detail'
  | 'kanban'
  | 'cards'
  | 'chat'
  | 'form'
  | 'form-table';

interface PageSkeletonProps {
  variant?: PageSkeletonVariant;
}

export function PageSkeleton({ variant = 'table' }: PageSkeletonProps) {
  return <div className="animate-in">{renderVariant(variant)}</div>;
}

function renderVariant(variant: PageSkeletonVariant) {
  switch (variant) {
    case 'dashboard':
      return <DashboardPageSkeleton />;
    case 'overview':
      return <OverviewPageSkeleton />;
    case 'detail':
      return <DetailPageSkeleton />;
    case 'kanban':
      return <KanbanPageSkeleton />;
    case 'cards':
      return <CardsPageSkeleton />;
    case 'chat':
      return <ChatPageSkeleton />;
    case 'form':
      return <FormPageSkeleton />;
    case 'form-table':
      return <FormTablePageSkeleton />;
    default:
      return <TablePageSkeleton withActions />;
  }
}

export {
  CardsPageSkeleton,
  ChatPageSkeleton,
  DashboardPageSkeleton,
  DetailPageSkeleton,
  FormPageSkeleton,
  FormTablePageSkeleton,
  KanbanPageSkeleton,
  OverviewPageSkeleton,
  TablePageSkeleton,
};
