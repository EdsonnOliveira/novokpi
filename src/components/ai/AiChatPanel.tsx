'use client';

import { FormEvent, useCallback, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { respondToAiQuestion } from '@/lib/ai/respond';
import type { AiConversationRow, AiMessageRow } from '@/types/platform';

interface AiChatPanelProps {
  tenantId: string;
  userId: string;
  initialConversations: AiConversationRow[];
  initialMessages: AiMessageRow[];
  initialConversationId: string | null;
}

export function AiChatPanel({
  tenantId,
  userId,
  initialConversations,
  initialMessages,
  initialConversationId,
}: AiChatPanelProps) {
  const supabase = createClient();
  const [conversations, setConversations] = useState(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState(initialConversationId);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeConversation = useMemo(
    () => conversations.find((item) => item.id === activeConversationId) ?? null,
    [activeConversationId, conversations],
  );

  const loadMessages = useCallback(
    async (conversationId: string) => {
      const { data } = await supabase
        .from('ai_messages')
        .select('id, conversation_id, role, content, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      setMessages((data ?? []) as AiMessageRow[]);
    },
    [supabase],
  );

  const handleSelectConversation = useCallback(
    async (conversationId: string) => {
      setActiveConversationId(conversationId);
      setError(null);
      await loadMessages(conversationId);
    },
    [loadMessages],
  );

  const handleNewConversation = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
    setInput('');
    setError(null);
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const content = input.trim();
      if (!content || loading) return;

      setLoading(true);
      setError(null);

      let conversationId = activeConversationId;

      if (!conversationId) {
        const title = content.length > 60 ? `${content.slice(0, 60)}...` : content;
        const { data: createdConversation, error: conversationError } = await supabase
          .from('ai_conversations')
          .insert({
            tenant_id: tenantId,
            user_id: userId,
            title,
          })
          .select('id, title, created_at')
          .single();

        if (conversationError || !createdConversation) {
          setError(conversationError?.message ?? 'Erro ao criar conversa.');
          setLoading(false);
          return;
        }

        conversationId = createdConversation.id;
        setConversations((prev) => [createdConversation as AiConversationRow, ...prev]);
        setActiveConversationId(conversationId);
      }

      const { data: userMessage, error: userMessageError } = await supabase
        .from('ai_messages')
        .insert({
          conversation_id: conversationId,
          role: 'user',
          content,
        })
        .select('id, conversation_id, role, content, created_at')
        .single();

      if (userMessageError || !userMessage) {
        setError(userMessageError?.message ?? 'Erro ao enviar mensagem.');
        setLoading(false);
        return;
      }

      const assistantContent = await respondToAiQuestion(supabase, tenantId, content);

      const { data: assistantMessage, error: assistantMessageError } = await supabase
        .from('ai_messages')
        .insert({
          conversation_id: conversationId,
          role: 'assistant',
          content: assistantContent,
        })
        .select('id, conversation_id, role, content, created_at')
        .single();

      if (assistantMessageError || !assistantMessage) {
        setError(assistantMessageError?.message ?? 'Erro ao registrar resposta.');
        setLoading(false);
        return;
      }

      setMessages((prev) => [...prev, userMessage as AiMessageRow, assistantMessage as AiMessageRow]);
      setInput('');
      setLoading(false);
    },
    [activeConversationId, input, loading, supabase, tenantId, userId],
  );

  return (
    <div className="row g-3">
      <div className="col-12 col-lg-4 mb-3 mb-lg-0">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="mb-0">Conversas</h6>
          <button type="button" className="btn btn-light btn-sm" onClick={handleNewConversation}>
            Nova
          </button>
        </div>
        <div className="list-group">
          {conversations.length ? (
            conversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                className={`list-group-item list-group-item-action ${
                  activeConversationId === conversation.id ? 'active' : ''
                }`}
                onClick={() => handleSelectConversation(conversation.id)}
              >
                <div className="fw-medium text-truncate">
                  {conversation.title ?? 'Conversa sem título'}
                </div>
                <small className={activeConversationId === conversation.id ? '' : 'text-muted'}>
                  {new Date(conversation.created_at).toLocaleString('pt-BR')}
                </small>
              </button>
            ))
          ) : (
            <p className="text-muted small mb-0">Nenhuma conversa ainda.</p>
          )}
        </div>
      </div>
      <div className="col-12 col-lg-8">
        <div className="border rounded p-3 mb-3" style={{ minHeight: 320 }}>
          <h6 className="mb-3">{activeConversation?.title ?? 'Nova conversa'}</h6>
          {messages.length ? (
            messages.map((message) => (
              <div
                key={message.id}
                className={`mb-3 ${message.role === 'user' ? 'text-end' : ''}`}
              >
                <span
                  className={`badge mb-1 ${
                    message.role === 'user' ? 'bg-primary' : 'bg-secondary'
                  }`}
                >
                  {message.role === 'user' ? 'Você' : 'Assistente'}
                </span>
                <div
                  className={`p-2 rounded ${
                    message.role === 'user' ? 'bg-light' : 'bg-secondary-subtle'
                  }`}
                >
                  {message.content}
                </div>
                <small className="text-muted">
                  {new Date(message.created_at).toLocaleString('pt-BR')}
                </small>
              </div>
            ))
          ) : (
            <p className="text-muted mb-0">Envie uma pergunta sobre CRM, estoque ou financeiro.</p>
          )}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Pergunte algo sobre a loja..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
              disabled={loading}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={loading || !input.trim()}>
              {loading ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
          {error ? <p className="text-danger small mt-2 mb-0">{error}</p> : null}
        </form>
      </div>
    </div>
  );
}
