import 'react-loading-skeleton/dist/skeleton.css';

import Skeleton from 'react-loading-skeleton';

import { ChatSection } from '@/components/features/Insights/ChatSection';
import { Content } from '@/components/features/Insights/Content';
import { Error } from '@/components/features/Insights/Error';
import { Divider } from '@/components/shared/Divider';
import { useInsight } from '@/hooks/useInsight';

interface AIInsightCardProps {
  simulationId: string;
}

export function AIInsightsCard({ simulationId }: AIInsightCardProps) {
  const { insight, isLoading, error, fetchInsight } = useInsight(simulationId);

  return (
    <div className="bg-card order-2 flex flex-col rounded-2xl p-6 shadow-[4px_4px_18px_0px_rgba(0,0,0,0.2)] lg:order-1 lg:col-span-2">
      <div className="mb-3 flex shrink-0 items-center gap-1.5">
        <span>✨</span>
        <span className="text-primary text-xs font-semibold tracking-widest uppercase">
          Insight Financeiro Personalizado
        </span>
      </div>

      {isLoading && (
        <div className="flex">
          <Skeleton
            count={10.5}
            baseColor="var(--color-skeleton-base)"
            highlightColor="var(--color-skeleton-highlight)"
            className="mb-3 flex rounded-lg"
            containerClassName="flex-1"
            inline
          />
        </div>
      )}
      {!isLoading && error && (
        <Error
          simulationId={simulationId}
          message={error}
          onRetry={() => {
            fetchInsight(simulationId);
          }}
        />
      )}
      {!isLoading && insight && !error && (
        <>
          <Content insight={insight} />
          <Divider orientation="horizontal" spacing={8} />
          <ChatSection simulationId={simulationId} />
        </>
      )}
    </div>
  );
}
