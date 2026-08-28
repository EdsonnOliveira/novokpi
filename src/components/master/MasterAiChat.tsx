'use client';

import { FormEvent, useCallback, useState } from 'react';
import { respondToMasterAiQuestion } from '@/lib/ai/respond';
import { createClient } from '@/lib/supabase/client';
import type { AiConversationRow, AiMessageRow } from '@/types/master';

interface MasterAiChatProps {
  conversations: AiConversationRow[];
  initialConversationId?: string;
  initialMessages: AiMessageRow[];
}

export function MasterAiChat({
  conversations,
  initialConversationId,
  initialMessages,
}: MasterAiChatProps) {
  const supabase = createClient();
  const [conversationId, setConversationId] = useState(initialConversationId ?? '');
  const [messages, setMessages] = useState(initialMessages);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(
    async (selectedId: string) => {
      const { data } = await supabase
        .from('ai_messages')
        .select('id, role, content, created_at')
        .eq('conversation_id', selectedId)
        .order('created_at', { ascending: true });

      setMessages((data ?? []) as AiMessageRow[]);
    },
    [supabase],
  );

  const handleSelectConversation = useCallback(
    async (selectedId: string) => {
      setConversationId(selectedId);
      await loadMessages(selectedId);
    },
    [loadMessages],
  );

  const handleNewConversation = useCallback(async () => {
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error: insertError } = await supabase
      .from('ai_conversations')
      .insert({
        is_master: true,
        user_id: user?.id ?? null,
        title: 'Nova conversa',
      })
      .select('id, title, created_at')
      .single();

    if (insertError || !data) {
      setError(insertError?.message ?? 'Erro ao criar conversa.');
      setLoading(false);
      return;
    }

    setConversationId(data.id);
    setMessages([]);
    setLoading(false);
    window.location.href = `/master/ai?conversation=${data.id}`;
  }, [supabase]);

  const handleSend = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!content.trim()) return;

      setLoading(true);
      setError(null);

      let activeConversationId = conversationId;

      if (!activeConversationId) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const { data: conversation, error: conversationError } = await supabase
          .from('ai_conversations')
          .insert({
            is_master: true,
            user_id: user?.id ?? null,
            title: content.slice(0, 60),
          })
          .select('id')
          .single();

        if (conversationError || !conversation) {
          setError(conversationError?.message ?? 'Erro ao criar conversa.');
          setLoading(false);
          return;
        }

        activeConversationId = conversation.id;
        setConversationId(conversation.id);
      }

      const trimmedContent = content.trim();

      const { error: insertError } = await supabase.from('ai_messages').insert({
        conversation_id: activeConversationId,
        role: 'user',
        content: trimmedContent,
      });

      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return;
      }

      const assistantContent = await respondToMasterAiQuestion(supabase, trimmedContent);

      const { error: assistantError } = await supabase.from('ai_messages').insert({
        conversation_id: activeConversationId,
        role: 'assistant',
        content: assistantContent,
      });

      if (assistantError) {
        setError(assistantError.message);
        setLoading(false);
        return;
      }

      setContent('');
      await loadMessages(activeConversationId);
      setLoading(false);
    },
    [content, conversationId, loadMessages, supabase],
  );

  return (
    <div className="row g-3">
      <div className="col-12 col-lg-4 col-xl-3">
        <div className="d-grid mb-2">
          <button type="button" className="btn btn-primary btn-sm" disabled={loading} onClick={handleNewConversation}>
            Nova conversa
          </button>
        </div>
        <div className="list-group">
          {conversations.length ? (
            conversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                className={`list-group-item list-group-item-action ${conversationId === conversation.id ? 'active' : ''}`}
                onClick={() => handleSelectConversation(conversation.id)}
              >
                {conversation.title ?? 'Conversa'}
                <small className="d-block">{new Date(conversation.created_at).toLocaleDateString('pt-BR')}</small>
              </button>
            ))
          ) : (
            <div className="text-muted small">Nenhuma conversa ainda.</div>
          )}
        </div>
      </div>
      <div className="col-12 col-lg-8 col-xl-9">
        <div className="border rounded p-3 mb-3" style={{ minHeight: 320 }}>
          {messages.length ? (
            messages.map((message) => (
              <div key={message.id} className={`mb-3 ${message.role === 'user' ? 'text-end' : ''}`}>
                <span className={`badge ${message.role === 'user' ? 'bg-primary' : 'bg-soft-secondary'}`}>
                  {message.role === 'user' ? 'Você' : 'Assistente'}
                </span>
                <p className="mb-0 mt-1">{message.content}</p>
                <small className="text-muted">{new Date(message.created_at).toLocaleString('pt-BR')}</small>
              </div>
            ))
          ) : (
            <p className="text-muted mb-0">Envie uma mensagem para iniciar.</p>
          )}
        </div>
        <form onSubmit={handleSend}>
          <div className="input-group">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Digite sua pergunta..."
              value={content}
              onChange={(event) => setContent(event.target.value)}
              disabled={loading}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
              {loading ? '...' : 'Enviar'}
            </button>
          </div>
          {error ? <div className="alert alert-danger py-1 px-2 mt-2 mb-0">{error}</div> : null}
        </form>
      </div>
    </div>
  );
}
