export type AlertLevel = 'info' | 'warning' | 'overdue';

export type CampaignChannel = 'sms' | 'email' | 'whatsapp';

export type CampaignStatus = 'draft' | 'scheduled' | 'running' | 'completed' | 'cancelled';

export interface CampaignRow {
  id: string;
  name: string;
  channel: CampaignChannel;
  status: CampaignStatus;
  subject: string | null;
  scheduled_at: string | null;
  sent_at: string | null;
  created_at: string;
}

export interface TenantAlertRow {
  id: string;
  level: AlertLevel;
  title: string;
  message: string | null;
  module: string | null;
  href: string | null;
  is_read: boolean;
  is_dismissed: boolean;
  created_at: string;
}

export interface TenantRow {
  id: string;
  name: string;
  slug: string;
  document: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
}

export interface TenantSiteSettingsRow {
  id: string;
  tenant_id: string;
  domain: string | null;
  is_published: boolean;
  sync_inventory: boolean;
  theme: Record<string, string>;
  seo: Record<string, string>;
}

export interface AiConversationRow {
  id: string;
  title: string | null;
  created_at: string;
}

export interface AiMessageRow {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  created_at: string;
}

export interface ReportDefinition {
  id: string;
  title: string;
  description: string;
  href: string;
  exportLabel: string;
}

export function formatCampaignChannel(channel: CampaignChannel) {
  const labels: Record<CampaignChannel, string> = {
    sms: 'SMS',
    email: 'E-mail',
    whatsapp: 'WhatsApp',
  };
  return labels[channel];
}

export function formatCampaignStatus(status: CampaignStatus) {
  const labels: Record<CampaignStatus, string> = {
    draft: 'Rascunho',
    scheduled: 'Agendada',
    running: 'Em envio',
    completed: 'Concluída',
    cancelled: 'Cancelada',
  };
  return labels[status];
}

export function formatAlertLevelLabel(level: AlertLevel) {
  const labels: Record<AlertLevel, string> = {
    info: 'Informação',
    warning: 'Atenção',
    overdue: 'Atrasado',
  };
  return labels[level];
}
