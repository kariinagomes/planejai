import { Goal, SquareArrowOutUpRight, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/shared/Button';
import { Divider } from '@/components/shared/Divider';
import { PageHero } from '@/components/shared/PageHero';
import type { SimulationRecord } from '@/data/simulation';
import { useSimulationStorage } from '@/hooks/useSimulationStorage';
import { formatDate } from '@/utils/date';
import { calcMonthlySavings } from '@/utils/simulation';

function InfoColumn({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col md:flex-1">
      <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
        {label}
      </span>
      <span className="text-foreground text-base font-semibold">{value}</span>
    </div>
  );
}

export function SimulationHistoryPage() {
  const { getAllFormData, deleteSimulation } = useSimulationStorage();
  const [history, setHistory] = useState<SimulationRecord[]>(() =>
    getAllFormData().slice().reverse()
  );
  const navigate = useNavigate();

  const handleDelete = (id: string) => {
    deleteSimulation(id);
    setHistory((currentHistory) => currentHistory.filter((simulation) => simulation.id !== id));
  };

  const hasHistory = history.length > 0;
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <PageHero
        title="Histórico de simulações"
        subtitle="Acompanhe o histórico de seus planos financeiros."
      />

      {!hasHistory ? (
        <div className="border-border bg-card rounded-3xl border p-10 text-center shadow-sm">
          <p className="text-lg font-semibold">Nenhuma simulação encontrada.</p>
          <p className="text-muted-foreground mt-2 text-sm">
            Sua jornada financeira ainda não tem registros. Faça uma nova simulação para começar.
          </p>
          <Button variant="primary" className="mx-auto mt-6" onClick={() => void navigate('/')}>
            Fazer nova simulação
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {history.map((simulation) => {
            const monthlySavings = calcMonthlySavings(simulation);
            const columns = [
              { label: 'CUSTO DA META', value: `R$ ${simulation.goalAmount}` },
              { label: 'PRAZO', value: `${simulation.goalDeadline} meses` },
              {
                label: 'ECONOMIA MENSAL',
                value: `R$ ${monthlySavings.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`,
              },
            ];

            return (
              <article
                key={simulation.id}
                className="border-border bg-card flex flex-col gap-4 rounded-3xl border px-6 py-4 shadow-[4px_4px_18px_0px_rgba(0,0,0,0.12)] md:flex-row md:items-center"
              >
                <div className="flex flex-col gap-4 md:flex-1 md:flex-row md:items-center md:gap-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ECE5F8] md:mr-4">
                    <Goal size={24} className="text-primary" />
                  </div>
                  <div className="flex flex-col md:flex-1">
                    <span
                      className="text-foreground text-base font-semibold"
                      title={simulation.goalName}
                    >
                      {simulation.goalName}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {formatDate(simulation.createdAt)}
                    </span>
                  </div>
                  {columns.map((col) => (
                    <InfoColumn key={col.label} label={col.label} value={col.value} />
                  ))}
                </div>

                <Divider orientation="horizontal" className="w-full md:hidden" spacing={0} />
                <Divider orientation="vertical" className="hidden md:block" spacing={0} />

                <div className="flex w-full items-center justify-center gap-3 md:w-auto md:flex-shrink-0">
                  <button
                    aria-label="Excluir simulação"
                    onClick={() => handleDelete(simulation.id)}
                    className="rounded-md bg-transparent p-2 text-red-500 transition-colors hover:bg-red-500/10"
                  >
                    <Trash2 size={20} />
                  </button>
                  <Divider orientation="vertical" className="w-full md:hidden" spacing={0} />
                  <Button
                    variant="secondary"
                    icon={SquareArrowOutUpRight}
                    onClick={() => void navigate(`/resultado/${simulation.id}`)}
                    className="hidden md:inline-flex"
                  >
                    Ver detalhes
                  </Button>

                  <Button
                    variant="ghost"
                    icon={SquareArrowOutUpRight}
                    onClick={() => void navigate(`/resultado/${simulation.id}`)}
                    className="md:hidden"
                  >
                    Ver detalhes
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
