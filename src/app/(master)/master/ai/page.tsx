import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { MasterAiChat } from '@/components/master/MasterAiChat';
import { createClient } from '@/lib/supabase/server';
import type { AiConversationRow, AiMessageRow } from '@/types/master';

export default async function MasterAiPage({
  searchParams,
}: {
  searchParams: Promise<{ conversation?: string }>;
}) {
  const { conversation: conversationId } = await searchParams;
  const supabase = await createClient();

  const { data: conversationsData } = await supabase
    .from('ai_conversations')
    .select('id, title, created_at')
    .eq('is_master', true)
    .order('created_at', { ascending: false })
    .limit(50);

  const conversations = (conversationsData ?? []) as AiConversationRow[];

  let initialMessages: AiMessageRow[] = [];

  if (conversationId) {
    const { data: messagesData } = await supabase
      .from('ai_messages')
      .select('id, role, content, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    initialMessages = (messagesData ?? []) as AiMessageRow[];
  }

  return (
    <>
      <PageTitle
        title="IA Master"
        subtitle="Assistente sobre base consolidada"
        breadcrumbs={[
          { label: 'Master', href: '/master' },
          { label: 'IA' },
        ]}
      />
      <Card title="Conversas">
        <MasterAiChat
          conversations={conversations}
          initialConversationId={conversationId}
          initialMessages={initialMessages}
        />
      </Card>
    </>
  );
}
