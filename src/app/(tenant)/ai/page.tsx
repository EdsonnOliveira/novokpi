import { PageTitle } from '@/components/dastone/PageTitle';
import { Card } from '@/components/dastone/Card';
import { AiChatPanel } from '@/components/ai/AiChatPanel';
import { createClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/settings/tenant-context';
import type { AiConversationRow, AiMessageRow } from '@/types/platform';
import { redirect } from 'next/navigation';

export default async function AiPage() {
  const supabase = await createClient();
  const context = await getTenantContext(supabase);

  if (!context) {
    redirect('/login');
  }

  const { data: conversationsData } = await supabase
    .from('ai_conversations')
    .select('id, title, created_at')
    .eq('user_id', context.userId)
    .order('created_at', { ascending: false })
    .limit(30);

  const conversations = (conversationsData ?? []) as AiConversationRow[];
  const initialConversationId = conversations[0]?.id ?? null;

  let initialMessages: AiMessageRow[] = [];

  if (initialConversationId) {
    const { data: messagesData } = await supabase
      .from('ai_messages')
      .select('id, conversation_id, role, content, created_at')
      .eq('conversation_id', initialConversationId)
      .order('created_at', { ascending: true });

    initialMessages = (messagesData ?? []) as AiMessageRow[];
  }

  return (
    <>
      <PageTitle
        title="Assistente IA"
        subtitle="Assistente linguagem natural"
        breadcrumbs={[{ label: 'IA' }]}
      />
      <Card>
        <AiChatPanel
          tenantId={context.tenantId}
          userId={context.userId}
          initialConversations={conversations}
          initialMessages={initialMessages}
          initialConversationId={initialConversationId}
        />
      </Card>
    </>
  );
}
