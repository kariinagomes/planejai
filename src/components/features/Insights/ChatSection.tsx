import { AlertCircle, MessageCircle, Send, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Divider } from '@/components/shared/Divider';
import { buildQuestionPrompt } from '@/data/aiPrompt';
import type { ChatExchange, SimulationRecord } from '@/data/simulation';
import { useSimulationStorage } from '@/hooks/useSimulationStorage';
import { askQuestion } from '@/services/aiService';

interface ChatSectionProps {
  simulationId: string;
}

function ConversationItem({ label, value }: { label: string; value: string }) {
  return (
    <>
      <p className="text-muted-foreground flex gap-2 text-sm">
        <MessageCircle size={18} className="text-primary" />
        {label}
      </p>
      <p className="text-muted-foreground text-sm">{value}</p>
      <Divider />
    </>
  );
}

export function ChatSection({ simulationId }: ChatSectionProps) {
  const { getFormData, updateSimulation } = useSimulationStorage();
  const [conversations, setConversations] = useState<ChatExchange[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);

  useEffect(() => {
    const simulation = getFormData(simulationId);
    if (simulation?.conversations) {
      setConversations(simulation.conversations);
    } else {
      setConversations([]);
    }
  }, [simulationId, getFormData]);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userQuestion = input.trim();
    setInput('');
    setActiveQuestion(userQuestion);
    setIsLoading(true);
    setError(null);

    const simulation = getFormData(simulationId);
    if (!simulation) {
      setError('Simulação não encontrada.');
      setIsLoading(false);
      setActiveQuestion(null);
      return;
    }

    try {
      const prompt = buildQuestionPrompt(simulation, userQuestion, conversations);
      const answer = await askQuestion(prompt);

      const newExchange: ChatExchange = {
        id: crypto.randomUUID(),
        question: userQuestion,
        answer,
        createdAt: new Date().toISOString(),
      };

      const updatedConversations = [...conversations, newExchange];
      setConversations(updatedConversations);

      updateSimulation(simulationId, {
        ...simulation,
        conversations: updatedConversations,
      } as SimulationRecord);

      setActiveQuestion(null);
    } catch (err) {
      console.error(err);
      setError('Desculpe, ocorreu um erro ao obter a resposta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = async () => {
    if (!activeQuestion || isLoading) return;
    setIsLoading(true);
    setError(null);

    const simulation = getFormData(simulationId);
    if (!simulation) {
      setError('Simulação não encontrada.');
      setIsLoading(false);
      return;
    }

    try {
      const prompt = buildQuestionPrompt(simulation, activeQuestion, conversations);
      const answer = await askQuestion(prompt);

      const newExchange: ChatExchange = {
        id: crypto.randomUUID(),
        question: activeQuestion,
        answer,
        createdAt: new Date().toISOString(),
      };

      const updatedConversations = [...conversations, newExchange];
      setConversations(updatedConversations);

      updateSimulation(simulationId, {
        ...simulation,
        conversations: updatedConversations,
      } as SimulationRecord);

      setActiveQuestion(null);
    } catch (err) {
      console.error(err);
      setError('Desculpe, ocorreu um erro ao obter a resposta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-6 flex flex-col">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles size={18} className="text-primary" />
        <h4 className="text-foreground text-sm font-semibold">Pergunte sobre a sua simulação</h4>
      </div>

      <div className="mb-4 flex max-h-[350px] flex-col gap-4 overflow-y-auto scroll-smooth pr-1">
        {conversations.map((exchange) => (
          <div key={exchange.id} className="flex flex-col gap-3">
            <ConversationItem label="Você" value={exchange.question} />
            <ConversationItem label="Resposta da IA" value={exchange.answer} />
          </div>
        ))}

        {activeQuestion && (
          <div className="flex flex-col gap-3">
            <div className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground/90 max-w-[85%] self-end rounded-2xl rounded-tr-none px-4 py-2.5 text-sm font-medium break-words shadow-xs">
              {activeQuestion}
            </div>
            {isLoading && (
              <div className="bg-secondary-button border-border text-foreground flex max-w-[85%] items-center gap-2 self-start rounded-2xl rounded-tl-none border px-4 py-2.5 text-sm shadow-xs">
                <span className="text-muted-foreground text-xs">Digitando</span>
                <div className="mt-0.5 flex items-center gap-1">
                  <div className="bg-primary h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:-0.3s]"></div>
                  <div className="bg-primary h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:-0.15s]"></div>
                  <div className="bg-primary h-1.5 w-1.5 animate-bounce rounded-full"></div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex max-w-[85%] flex-col gap-2 self-start rounded-2xl rounded-tl-none border border-red-200/50 bg-red-500/10 px-4 py-2.5 text-sm text-red-600 shadow-xs dark:text-red-400">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
                <button
                  onClick={handleRetry}
                  className="text-left text-xs font-semibold underline transition-opacity hover:opacity-80"
                >
                  Tentar novamente
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="bg-input border-border flex flex-1 items-center rounded-xl border px-4 py-2.5 shadow-xs">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Ex: Como posso economizar 200 reais a mais?"
            className="text-foreground w-full bg-transparent text-sm outline-hidden disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-primary text-primary-foreground flex cursor-pointer items-center justify-center rounded-xl p-3 shadow-md transition-all hover:opacity-95 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
