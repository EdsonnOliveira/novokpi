export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type TimelineEntityType =
  | 'person'
  | 'deal'
  | 'vehicle'
  | 'user'
  | 'order'
  | 'payment'
  | 'document'
  | 'invoice'
  | 'delivery'
  | 'transfer'
  | 'warranty'
  | 'campaign'
  | 'tenant';

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'approve'
  | 'cancel'
  | 'reverse'
  | 'login'
  | 'export'
  | 'assign'
  | 'merge';

export type Database = {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string;
          name: string;
          slug: string;
          document: string | null;
          phone: string | null;
          email: string | null;
          logo_url: string | null;
          is_active: boolean;
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          document?: string | null;
          phone?: string | null;
          email?: string | null;
          logo_url?: string | null;
          is_active?: boolean;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          document?: string | null;
          phone?: string | null;
          email?: string | null;
          logo_url?: string | null;
          is_active?: boolean;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          tenant_id: string | null;
          full_name: string | null;
          email: string | null;
          phone: string | null;
          avatar_url: string | null;
          is_active: boolean;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          tenant_id?: string | null;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string | null;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      roles: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          slug: string;
          description: string | null;
          is_system: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          slug: string;
          description?: string | null;
          is_system?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          is_system?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      permissions: {
        Row: {
          id: string;
          module: string;
          action: string;
          description: string | null;
        };
        Insert: {
          id?: string;
          module: string;
          action: string;
          description?: string | null;
        };
        Update: {
          id?: string;
          module?: string;
          action?: string;
          description?: string | null;
        };
        Relationships: [];
      };
      role_permissions: {
        Row: {
          id: string;
          role_id: string;
          permission_id: string;
          granted: boolean;
        };
        Insert: {
          id?: string;
          role_id: string;
          permission_id: string;
          granted?: boolean;
        };
        Update: {
          id?: string;
          role_id?: string;
          permission_id?: string;
          granted?: boolean;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role_id: string;
          tenant_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role_id: string;
          tenant_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role_id?: string;
          tenant_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      user_permission_overrides: {
        Row: {
          id: string;
          user_id: string;
          permission_id: string;
          tenant_id: string;
          granted: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          permission_id: string;
          tenant_id: string;
          granted: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          permission_id?: string;
          tenant_id?: string;
          granted?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      timeline_events: {
        Row: {
          id: string;
          tenant_id: string;
          entity_type: TimelineEntityType;
          entity_id: string;
          event_type: string;
          title: string;
          description: string | null;
          metadata: Json;
          user_id: string | null;
          occurred_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          entity_type: TimelineEntityType;
          entity_id: string;
          event_type: string;
          title: string;
          description?: string | null;
          metadata?: Json;
          user_id?: string | null;
          occurred_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          entity_type?: TimelineEntityType;
          entity_id?: string;
          event_type?: string;
          title?: string;
          description?: string | null;
          metadata?: Json;
          user_id?: string | null;
          occurred_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          tenant_id: string | null;
          user_id: string | null;
          action: AuditAction;
          module: string;
          entity_type: string;
          entity_id: string | null;
          previous_data: Json | null;
          new_data: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string | null;
          user_id?: string | null;
          action: AuditAction;
          module: string;
          entity_type: string;
          entity_id?: string | null;
          previous_data?: Json | null;
          new_data?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string | null;
          user_id?: string | null;
          action?: AuditAction;
          module?: string;
          entity_type?: string;
          entity_id?: string | null;
          previous_data?: Json | null;
          new_data?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      master_users: {
        Row: {
          id: string;
          user_id: string;
          full_name: string | null;
          email: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name?: string | null;
          email?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string | null;
          email?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      plans: {
        Row: {
          id: string;
          name: string;
          slug: string;
          price_monthly: number;
          features: Json;
          limits: Json;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          price_monthly?: number;
          features?: Json;
          limits?: Json;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          price_monthly?: number;
          features?: Json;
          limits?: Json;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          tenant_id: string;
          plan_id: string;
          status: string;
          started_at: string;
          ends_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          plan_id: string;
          status?: string;
          started_at?: string;
          ends_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          plan_id?: string;
          status?: string;
          started_at?: string;
          ends_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      lost_reasons: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          is_active?: boolean;
          sort_order?: number;
        };
        Relationships: [];
      };
      master_tickets: {
        Row: {
          id: string;
          tenant_id: string | null;
          subject: string;
          description: string | null;
          status: string;
          assigned_to: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string | null;
          subject: string;
          description?: string | null;
          status?: string;
          assigned_to?: string | null;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string | null;
          subject?: string;
          description?: string | null;
          status?: string;
          assigned_to?: string | null;
        };
        Relationships: [];
      };
      master_announcements: {
        Row: {
          id: string;
          title: string;
          body: string;
          is_published: boolean;
          published_at: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          body: string;
          is_published?: boolean;
          published_at?: string | null;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          body?: string;
          is_published?: boolean;
          published_at?: string | null;
        };
        Relationships: [];
      };
      demand_queue: {
        Row: {
          id: string;
          tenant_id: string;
          person_id: string;
          interest_profile_id: string | null;
          deal_id: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          person_id: string;
          interest_profile_id?: string | null;
          deal_id?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          person_id?: string;
          interest_profile_id?: string | null;
          deal_id?: string | null;
          status?: string;
        };
        Relationships: [];
      };
      offer_queue: {
        Row: {
          id: string;
          tenant_id: string;
          vehicle_id: string | null;
          interest_profile_id: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          vehicle_id?: string | null;
          interest_profile_id?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          vehicle_id?: string | null;
          interest_profile_id?: string | null;
          status?: string;
        };
        Relationships: [];
      };
      document_templates: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          slug: string;
          template_type: string;
          content_html: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          slug: string;
          template_type?: string;
          content_html?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          slug?: string;
          template_type?: string;
          content_html?: string;
          is_active?: boolean;
        };
        Relationships: [];
      };
      generated_documents: {
        Row: {
          id: string;
          tenant_id: string;
          template_id: string | null;
          entity_type: string | null;
          entity_id: string | null;
          title: string;
          file_path: string | null;
          content_html: string | null;
          metadata: Json;
          generated_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          template_id?: string | null;
          entity_type?: string | null;
          entity_id?: string | null;
          title: string;
          file_path?: string | null;
          content_html?: string | null;
          metadata?: Json;
          generated_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          template_id?: string | null;
          entity_type?: string | null;
          entity_id?: string | null;
          title?: string;
          file_path?: string | null;
          content_html?: string | null;
          metadata?: Json;
          generated_by?: string | null;
        };
        Relationships: [];
      };
      portal_integrations: {
        Row: {
          id: string;
          tenant_id: string;
          portal_slug: string;
          portal_name: string;
          is_active: boolean;
          credentials: Json;
          last_sync_at: string | null;
          sync_status: string;
          sync_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          portal_slug: string;
          portal_name: string;
          is_active?: boolean;
          credentials?: Json;
          last_sync_at?: string | null;
          sync_status?: string;
          sync_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          portal_slug?: string;
          portal_name?: string;
          is_active?: boolean;
          credentials?: Json;
          last_sync_at?: string | null;
          sync_status?: string;
          sync_message?: string | null;
        };
        Relationships: [];
      };
      vehicle_portal_ads: {
        Row: {
          id: string;
          tenant_id: string;
          passage_id: string;
          portal_integration_id: string;
          external_id: string | null;
          status: string;
          published_at: string | null;
          last_sync_at: string | null;
          sync_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          passage_id: string;
          portal_integration_id: string;
          external_id?: string | null;
          status?: string;
          published_at?: string | null;
          last_sync_at?: string | null;
          sync_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          passage_id?: string;
          portal_integration_id?: string;
          external_id?: string | null;
          status?: string;
          published_at?: string | null;
          last_sync_at?: string | null;
          sync_message?: string | null;
        };
        Relationships: [];
      };
      warranty_cases: {
        Row: {
          id: string;
          tenant_id: string;
          order_id: string | null;
          passage_id: string | null;
          person_id: string | null;
          title: string;
          description: string | null;
          status: string;
          opened_at: string;
          resolved_at: string | null;
          assigned_user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          order_id?: string | null;
          passage_id?: string | null;
          person_id?: string | null;
          title: string;
          description?: string | null;
          status?: string;
          opened_at?: string;
          resolved_at?: string | null;
          assigned_user_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          order_id?: string | null;
          passage_id?: string | null;
          person_id?: string | null;
          title?: string;
          description?: string | null;
          status?: string;
          opened_at?: string;
          resolved_at?: string | null;
          assigned_user_id?: string | null;
        };
        Relationships: [];
      };
      entity_attachments: {
        Row: {
          id: string;
          tenant_id: string;
          entity_type: string;
          entity_id: string;
          file_name: string;
          file_path: string;
          file_size: number | null;
          mime_type: string | null;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          entity_type: string;
          entity_id: string;
          file_name: string;
          file_path: string;
          file_size?: number | null;
          mime_type?: string | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          entity_type?: string;
          entity_id?: string;
          file_name?: string;
          file_path?: string;
          file_size?: number | null;
          mime_type?: string | null;
          uploaded_by?: string | null;
        };
        Relationships: [];
      };
      alert_rules: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          module: string;
          days_threshold: number;
          level: 'info' | 'warning' | 'overdue';
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          module: string;
          days_threshold?: number;
          level?: 'info' | 'warning' | 'overdue';
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          module?: string;
          days_threshold?: number;
          level?: 'info' | 'warning' | 'overdue';
          is_active?: boolean;
        };
        Relationships: [];
      };
      tenant_alerts: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string | null;
          level: 'info' | 'warning' | 'overdue';
          title: string;
          message: string | null;
          module: string | null;
          entity_type: string | null;
          entity_id: string | null;
          href: string | null;
          is_read: boolean;
          is_dismissed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          user_id?: string | null;
          level?: 'info' | 'warning' | 'overdue';
          title: string;
          message?: string | null;
          module?: string | null;
          entity_type?: string | null;
          entity_id?: string | null;
          href?: string | null;
          is_read?: boolean;
          is_dismissed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          user_id?: string | null;
          level?: 'info' | 'warning' | 'overdue';
          title?: string;
          message?: string | null;
          module?: string | null;
          entity_type?: string | null;
          entity_id?: string | null;
          href?: string | null;
          is_read?: boolean;
          is_dismissed?: boolean;
        };
        Relationships: [];
      };
      opportunities: {
        Row: {
          id: string;
          tenant_id: string;
          person_id: string | null;
          deal_id: string | null;
          passage_id: string | null;
          title: string;
          description: string | null;
          status: string;
          priority: string;
          assigned_user_id: string | null;
          due_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          person_id?: string | null;
          deal_id?: string | null;
          passage_id?: string | null;
          title: string;
          description?: string | null;
          status?: string;
          priority?: string;
          assigned_user_id?: string | null;
          due_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          person_id?: string | null;
          deal_id?: string | null;
          passage_id?: string | null;
          title?: string;
          description?: string | null;
          status?: string;
          priority?: string;
          assigned_user_id?: string | null;
          due_at?: string | null;
        };
        Relationships: [];
      };
      campaigns: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          channel: 'sms' | 'email' | 'whatsapp';
          status: 'draft' | 'scheduled' | 'running' | 'completed' | 'cancelled';
          subject: string | null;
          body: string;
          scheduled_at: string | null;
          sent_at: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          channel: 'sms' | 'email' | 'whatsapp';
          status?: 'draft' | 'scheduled' | 'running' | 'completed' | 'cancelled';
          subject?: string | null;
          body?: string;
          scheduled_at?: string | null;
          sent_at?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          channel?: 'sms' | 'email' | 'whatsapp';
          status?: 'draft' | 'scheduled' | 'running' | 'completed' | 'cancelled';
          subject?: string | null;
          body?: string;
          scheduled_at?: string | null;
          sent_at?: string | null;
          created_by?: string | null;
        };
        Relationships: [];
      };
      financial_reconciliation_items: {
        Row: {
          id: string;
          tenant_id: string;
          account_id: string | null;
          transaction_id: string | null;
          bank_date: string;
          description: string | null;
          amount: number;
          is_reconciled: boolean;
          reconciled_at: string | null;
          reconciled_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          account_id?: string | null;
          transaction_id?: string | null;
          bank_date: string;
          description?: string | null;
          amount: number;
          is_reconciled?: boolean;
          reconciled_at?: string | null;
          reconciled_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          account_id?: string | null;
          transaction_id?: string | null;
          bank_date?: string;
          description?: string | null;
          amount?: number;
          is_reconciled?: boolean;
          reconciled_at?: string | null;
          reconciled_by?: string | null;
        };
        Relationships: [];
      };
      support_tickets: {
        Row: {
          id: string;
          tenant_id: string;
          created_by: string | null;
          subject: string;
          description: string | null;
          status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
          priority: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          created_by?: string | null;
          subject: string;
          description?: string | null;
          status?: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
          priority?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          created_by?: string | null;
          subject?: string;
          description?: string | null;
          status?: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
          priority?: string;
        };
        Relationships: [];
      };
      tenant_site_settings: {
        Row: {
          id: string;
          tenant_id: string;
          domain: string | null;
          is_published: boolean;
          theme: Json;
          seo: Json;
          sync_inventory: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          domain?: string | null;
          is_published?: boolean;
          theme?: Json;
          seo?: Json;
          sync_inventory?: boolean;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          domain?: string | null;
          is_published?: boolean;
          theme?: Json;
          seo?: Json;
          sync_inventory?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      ai_conversations: {
        Row: {
          id: string;
          tenant_id: string | null;
          user_id: string | null;
          is_master: boolean;
          title: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string | null;
          user_id?: string | null;
          is_master?: boolean;
          title?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string | null;
          user_id?: string | null;
          is_master?: boolean;
          title?: string | null;
        };
        Relationships: [];
      };
      ai_messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: string;
          content: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          role?: string;
          content?: string;
        };
        Relationships: [];
      };
      tenant_onboarding_checklist: {
        Row: {
          id: string;
          tenant_id: string;
          step_key: string;
          step_label: string;
          is_completed: boolean;
          completed_at: string | null;
          completed_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          step_key: string;
          step_label: string;
          is_completed?: boolean;
          completed_at?: string | null;
          completed_by?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          step_key?: string;
          step_label?: string;
          is_completed?: boolean;
          completed_at?: string | null;
          completed_by?: string | null;
        };
        Relationships: [];
      };
      channels: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          slug: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          slug: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          slug?: string;
          is_active?: boolean;
        };
        Relationships: [];
      };
      deal_stages: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          slug: string;
          color: string | null;
          sort_order: number;
          is_won: boolean;
          is_lost: boolean;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          slug: string;
          color?: string | null;
          sort_order?: number;
          is_won?: boolean;
          is_lost?: boolean;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          slug?: string;
          color?: string | null;
          sort_order?: number;
          is_won?: boolean;
          is_lost?: boolean;
          is_active?: boolean;
        };
        Relationships: [];
      };
      people: {
        Row: {
          id: string;
          tenant_id: string;
          full_name: string;
          phone: string | null;
          email: string | null;
          social_handle: string | null;
          document: string | null;
          notes: string | null;
          assigned_user_id: string | null;
          is_client: boolean;
          is_supplier: boolean;
          is_employee: boolean;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          full_name: string;
          phone?: string | null;
          email?: string | null;
          social_handle?: string | null;
          document?: string | null;
          notes?: string | null;
          assigned_user_id?: string | null;
          is_client?: boolean;
          is_supplier?: boolean;
          is_employee?: boolean;
          metadata?: Json;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          full_name?: string;
          phone?: string | null;
          email?: string | null;
          social_handle?: string | null;
          document?: string | null;
          notes?: string | null;
          assigned_user_id?: string | null;
          is_client?: boolean;
          is_supplier?: boolean;
          is_employee?: boolean;
          metadata?: Json;
        };
        Relationships: [];
      };
      deals: {
        Row: {
          id: string;
          tenant_id: string;
          deal_number: number;
          title: string | null;
          person_id: string;
          stage_id: string;
          channel_id: string | null;
          assigned_user_id: string | null;
          status: string;
          lost_reason_id: string | null;
          is_duplicate_alert: boolean;
          duplicate_of_deal_id: string | null;
          next_action_at: string | null;
          next_action_note: string | null;
          closed_at: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          deal_number: number;
          title?: string | null;
          person_id: string;
          stage_id: string;
          channel_id?: string | null;
          assigned_user_id?: string | null;
          status?: string;
          lost_reason_id?: string | null;
          is_duplicate_alert?: boolean;
          duplicate_of_deal_id?: string | null;
          next_action_at?: string | null;
          next_action_note?: string | null;
          closed_at?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          deal_number?: number;
          title?: string | null;
          person_id?: string;
          stage_id?: string;
          channel_id?: string | null;
          assigned_user_id?: string | null;
          status?: string;
          lost_reason_id?: string | null;
          is_duplicate_alert?: boolean;
          duplicate_of_deal_id?: string | null;
          next_action_at?: string | null;
          next_action_note?: string | null;
          closed_at?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      deal_assignments: {
        Row: {
          id: string;
          tenant_id: string;
          deal_id: string;
          user_id: string;
          assigned_by: string | null;
          assigned_at: string;
          unassigned_at: string | null;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          deal_id: string;
          user_id: string;
          assigned_by?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          deal_id?: string;
          user_id?: string;
          assigned_by?: string | null;
          unassigned_at?: string | null;
        };
        Relationships: [];
      };
      activities: {
        Row: {
          id: string;
          tenant_id: string;
          deal_id: string | null;
          person_id: string | null;
          assigned_user_id: string | null;
          title: string;
          description: string | null;
          due_at: string;
          completed_at: string | null;
          status: string;
          contact_method: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          deal_id?: string | null;
          person_id?: string | null;
          assigned_user_id?: string | null;
          title: string;
          description?: string | null;
          due_at: string;
          completed_at?: string | null;
          status?: string;
          contact_method?: string | null;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          deal_id?: string | null;
          person_id?: string | null;
          assigned_user_id?: string | null;
          title?: string;
          description?: string | null;
          due_at?: string;
          completed_at?: string | null;
          status?: string;
          contact_method?: string | null;
        };
        Relationships: [];
      };
      vehicle_brands: {
        Row: {
          id: string;
          tenant_id: string | null;
          name: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string | null;
          name: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          tenant_id?: string | null;
          name?: string;
          is_active?: boolean;
        };
        Relationships: [];
      };
      vehicle_models: {
        Row: {
          id: string;
          tenant_id: string;
          brand_id: string;
          name: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          brand_id: string;
          name: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          brand_id?: string;
          name?: string;
          is_active?: boolean;
        };
        Relationships: [];
      };
      vehicle_versions: {
        Row: {
          id: string;
          tenant_id: string;
          model_id: string;
          name: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          model_id: string;
          name: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          model_id?: string;
          name?: string;
          is_active?: boolean;
        };
        Relationships: [];
      };
      stock_modalities: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          slug: string;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          slug: string;
          is_active?: boolean;
          sort_order?: number;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          slug?: string;
          is_active?: boolean;
          sort_order?: number;
        };
        Relationships: [];
      };
      vehicles: {
        Row: {
          id: string;
          tenant_id: string;
          plate: string | null;
          chassis: string | null;
          renavam: string | null;
          brand_id: string | null;
          model_id: string | null;
          version_id: string | null;
          year_manufacture: number | null;
          year_model: number | null;
          color: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          plate?: string | null;
          chassis?: string | null;
          renavam?: string | null;
          brand_id?: string | null;
          model_id?: string | null;
          version_id?: string | null;
          year_manufacture?: number | null;
          year_model?: number | null;
          color?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          plate?: string | null;
          chassis?: string | null;
          renavam?: string | null;
          brand_id?: string | null;
          model_id?: string | null;
          version_id?: string | null;
          year_manufacture?: number | null;
          year_model?: number | null;
          color?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      vehicle_passages: {
        Row: {
          id: string;
          tenant_id: string;
          vehicle_id: string;
          passage_number: number;
          modality_id: string;
          status: string;
          stock_started_at: string;
          acquisition_cost: number;
          cost: number;
          sale_price: number | null;
          fipe_value: number | null;
          km: number | null;
          owner_person_id: string | null;
          capturer_user_id: string | null;
          deal_id: string | null;
          consignment_net_value: number | null;
          consignment_percent: number | null;
          has_history_alert: boolean;
          reserved_deal_id: string | null;
          reserved_at: string | null;
          sold_at: string | null;
          exited_at: string | null;
          notes: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          vehicle_id: string;
          passage_number: number;
          modality_id: string;
          status?: string;
          stock_started_at?: string;
          acquisition_cost?: number;
          cost?: number;
          sale_price?: number | null;
          fipe_value?: number | null;
          km?: number | null;
          owner_person_id?: string | null;
          capturer_user_id?: string | null;
          deal_id?: string | null;
          consignment_net_value?: number | null;
          consignment_percent?: number | null;
          has_history_alert?: boolean;
          notes?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          vehicle_id?: string;
          passage_number?: number;
          modality_id?: string;
          status?: string;
          stock_started_at?: string;
          acquisition_cost?: number;
          cost?: number;
          sale_price?: number | null;
          fipe_value?: number | null;
          km?: number | null;
          owner_person_id?: string | null;
          capturer_user_id?: string | null;
          deal_id?: string | null;
          consignment_net_value?: number | null;
          consignment_percent?: number | null;
          has_history_alert?: boolean;
          reserved_deal_id?: string | null;
          reserved_at?: string | null;
          sold_at?: string | null;
          exited_at?: string | null;
          notes?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      vehicle_prices: {
        Row: {
          id: string;
          tenant_id: string;
          passage_id: string;
          price_type: string;
          value: number;
          changed_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          passage_id: string;
          price_type: string;
          value: number;
          changed_by?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          passage_id?: string;
          price_type?: string;
          value?: number;
          changed_by?: string | null;
        };
        Relationships: [];
      };
      preparation_orders: {
        Row: {
          id: string;
          tenant_id: string;
          passage_id: string;
          title: string;
          description: string | null;
          is_internal: boolean;
          supplier_name: string | null;
          supplier_phone: string | null;
          budget_amount: number | null;
          authorized_amount: number | null;
          actual_cost: number;
          payment_status: string | null;
          warranty_until: string | null;
          status: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          passage_id: string;
          title: string;
          description?: string | null;
          is_internal?: boolean;
          supplier_name?: string | null;
          supplier_phone?: string | null;
          budget_amount?: number | null;
          authorized_amount?: number | null;
          actual_cost?: number;
          payment_status?: string | null;
          warranty_until?: string | null;
          status?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          passage_id?: string;
          title?: string;
          description?: string | null;
          is_internal?: boolean;
          supplier_name?: string | null;
          supplier_phone?: string | null;
          budget_amount?: number | null;
          authorized_amount?: number | null;
          actual_cost?: number;
          payment_status?: string | null;
          warranty_until?: string | null;
          status?: string;
        };
        Relationships: [];
      };
      vehicle_photos: {
        Row: {
          id: string;
          tenant_id: string;
          passage_id: string;
          storage_path: string;
          sort_order: number;
          is_published: boolean;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          passage_id: string;
          storage_path: string;
          sort_order?: number;
          is_published?: boolean;
          uploaded_by?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          passage_id?: string;
          storage_path?: string;
          sort_order?: number;
          is_published?: boolean;
        };
        Relationships: [];
      };
      vehicle_reports: {
        Row: {
          id: string;
          tenant_id: string;
          passage_id: string;
          status: string;
          storage_path: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          passage_id: string;
          status?: string;
          storage_path?: string | null;
          notes?: string | null;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          passage_id?: string;
          status?: string;
          storage_path?: string | null;
          notes?: string | null;
        };
        Relationships: [];
      };
      evaluations: {
        Row: {
          id: string;
          tenant_id: string;
          deal_id: string | null;
          person_id: string | null;
          brand_id: string | null;
          model_id: string | null;
          version_id: string | null;
          plate: string | null;
          year_manufacture: number | null;
          year_model: number | null;
          color: string | null;
          km: number | null;
          fipe_value: number | null;
          offered_value: number | null;
          notes: string | null;
          status: string;
          evaluated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          deal_id?: string | null;
          person_id?: string | null;
          brand_id?: string | null;
          model_id?: string | null;
          version_id?: string | null;
          plate?: string | null;
          year_manufacture?: number | null;
          year_model?: number | null;
          color?: string | null;
          km?: number | null;
          fipe_value?: number | null;
          offered_value?: number | null;
          notes?: string | null;
          status?: string;
          evaluated_by?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          deal_id?: string | null;
          person_id?: string | null;
          brand_id?: string | null;
          model_id?: string | null;
          version_id?: string | null;
          plate?: string | null;
          year_manufacture?: number | null;
          year_model?: number | null;
          color?: string | null;
          km?: number | null;
          fipe_value?: number | null;
          offered_value?: number | null;
          notes?: string | null;
          status?: string;
        };
        Relationships: [];
      };
      stock_exits: {
        Row: {
          id: string;
          tenant_id: string;
          passage_id: string;
          reason: string;
          exited_at: string;
          expected_return_at: string | null;
          returned_at: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          passage_id: string;
          reason: string;
          exited_at?: string;
          expected_return_at?: string | null;
          returned_at?: string | null;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          passage_id?: string;
          reason?: string;
          exited_at?: string;
          expected_return_at?: string | null;
          returned_at?: string | null;
        };
        Relationships: [];
      };
      payment_methods: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          slug: string;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          slug: string;
          is_active?: boolean;
          sort_order?: number;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          slug?: string;
          is_active?: boolean;
          sort_order?: number;
        };
        Relationships: [];
      };
      product_types: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          slug: string;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          slug: string;
          is_active?: boolean;
          sort_order?: number;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          slug?: string;
          is_active?: boolean;
          sort_order?: number;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          tenant_id: string;
          order_number: number;
          deal_id: string | null;
          person_id: string;
          vehicle_passage_id: string | null;
          seller_user_id: string | null;
          channel_id: string | null;
          status: string;
          total_value: number | null;
          vehicle_value: number | null;
          margin_value: number | null;
          margin_percent: number | null;
          primary_payment_method: string | null;
          invoice_status: string;
          delivery_status: string;
          transfer_status: string;
          reserved_at: string | null;
          closed_at: string | null;
          cancelled_at: string | null;
          cancel_reason: string | null;
          notes: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          order_number: number;
          deal_id?: string | null;
          person_id: string;
          vehicle_passage_id?: string | null;
          seller_user_id?: string | null;
          channel_id?: string | null;
          status?: string;
          total_value?: number | null;
          vehicle_value?: number | null;
          margin_value?: number | null;
          margin_percent?: number | null;
          primary_payment_method?: string | null;
          invoice_status?: string;
          delivery_status?: string;
          transfer_status?: string;
          reserved_at?: string | null;
          closed_at?: string | null;
          notes?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          order_number?: number;
          deal_id?: string | null;
          person_id?: string;
          vehicle_passage_id?: string | null;
          seller_user_id?: string | null;
          channel_id?: string | null;
          status?: string;
          total_value?: number | null;
          vehicle_value?: number | null;
          margin_value?: number | null;
          margin_percent?: number | null;
          primary_payment_method?: string | null;
          invoice_status?: string;
          delivery_status?: string;
          transfer_status?: string;
          reserved_at?: string | null;
          closed_at?: string | null;
          cancelled_at?: string | null;
          cancel_reason?: string | null;
          notes?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      order_payments: {
        Row: {
          id: string;
          tenant_id: string;
          order_id: string;
          payee_name: string | null;
          payee_document: string | null;
          payment_method_id: string | null;
          payment_method_name: string | null;
          amount: number;
          due_date: string | null;
          paid_at: string | null;
          status: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          order_id: string;
          payee_name?: string | null;
          payee_document?: string | null;
          payment_method_id?: string | null;
          payment_method_name?: string | null;
          amount: number;
          due_date?: string | null;
          paid_at?: string | null;
          status?: string;
          notes?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          order_id?: string;
          payee_name?: string | null;
          payee_document?: string | null;
          payment_method_id?: string | null;
          payment_method_name?: string | null;
          amount?: number;
          due_date?: string | null;
          paid_at?: string | null;
          status?: string;
          notes?: string | null;
        };
        Relationships: [];
      };
      order_products: {
        Row: {
          id: string;
          tenant_id: string;
          order_id: string;
          product_type_id: string | null;
          product_name: string;
          amount: number | null;
          commission: number | null;
          expected_receipt_at: string | null;
          received_at: string | null;
          responsible_user_id: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          order_id: string;
          product_type_id?: string | null;
          product_name: string;
          amount?: number | null;
          commission?: number | null;
          expected_receipt_at?: string | null;
          received_at?: string | null;
          responsible_user_id?: string | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          order_id?: string;
          product_type_id?: string | null;
          product_name?: string;
          amount?: number | null;
          commission?: number | null;
          expected_receipt_at?: string | null;
          received_at?: string | null;
          notes?: string | null;
        };
        Relationships: [];
      };
      order_advances: {
        Row: {
          id: string;
          tenant_id: string;
          order_id: string | null;
          person_id: string | null;
          purpose: string;
          amount: number;
          balance: number;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          order_id?: string | null;
          person_id?: string | null;
          purpose: string;
          amount: number;
          balance: number;
          status?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          order_id?: string | null;
          person_id?: string | null;
          purpose?: string;
          amount?: number;
          balance?: number;
          status?: string;
        };
        Relationships: [];
      };
      deliveries: {
        Row: {
          id: string;
          tenant_id: string;
          order_id: string;
          delivered_at: string | null;
          delivery_km: number | null;
          responsible_user_id: string | null;
          warranty_start: string | null;
          warranty_end: string | null;
          warranty_km_limit: number | null;
          client_satisfaction: string | null;
          went_well: boolean | null;
          client_notes: string | null;
          notes: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          order_id: string;
          delivered_at?: string | null;
          delivery_km?: number | null;
          responsible_user_id?: string | null;
          warranty_start?: string | null;
          warranty_end?: string | null;
          warranty_km_limit?: number | null;
          client_satisfaction?: string | null;
          went_well?: boolean | null;
          client_notes?: string | null;
          notes?: string | null;
          status?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          order_id?: string;
          delivered_at?: string | null;
          delivery_km?: number | null;
          responsible_user_id?: string | null;
          warranty_start?: string | null;
          warranty_end?: string | null;
          warranty_km_limit?: number | null;
          client_satisfaction?: string | null;
          went_well?: boolean | null;
          client_notes?: string | null;
          notes?: string | null;
          status?: string;
        };
        Relationships: [];
      };
      delivery_checklist_items: {
        Row: {
          id: string;
          tenant_id: string;
          delivery_id: string;
          item_key: string;
          item_label: string;
          is_checked: boolean;
          notes: string | null;
          sort_order: number;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          delivery_id: string;
          item_key: string;
          item_label: string;
          is_checked?: boolean;
          notes?: string | null;
          sort_order?: number;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          delivery_id?: string;
          item_key?: string;
          item_label?: string;
          is_checked?: boolean;
          notes?: string | null;
          sort_order?: number;
        };
        Relationships: [];
      };
      delivery_pendencies: {
        Row: {
          id: string;
          tenant_id: string;
          delivery_id: string;
          order_id: string;
          title: string;
          description: string | null;
          is_resolved: boolean;
          resolved_at: string | null;
          resolved_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          delivery_id: string;
          order_id: string;
          title: string;
          description?: string | null;
          is_resolved?: boolean;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          delivery_id?: string;
          order_id?: string;
          title?: string;
          description?: string | null;
          is_resolved?: boolean;
          resolved_at?: string | null;
          resolved_by?: string | null;
        };
        Relationships: [];
      };
      vehicle_transfers: {
        Row: {
          id: string;
          tenant_id: string;
          order_id: string;
          vehicle_passage_id: string | null;
          responsible_user_id: string | null;
          third_party_name: string | null;
          status: string;
          atpv_done: boolean;
          signature_done: boolean;
          sale_communication_done: boolean;
          dispatcher_done: boolean;
          completed_at: string | null;
          deadline_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          order_id: string;
          vehicle_passage_id?: string | null;
          responsible_user_id?: string | null;
          third_party_name?: string | null;
          status?: string;
          atpv_done?: boolean;
          signature_done?: boolean;
          sale_communication_done?: boolean;
          dispatcher_done?: boolean;
          completed_at?: string | null;
          deadline_at?: string | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          order_id?: string;
          vehicle_passage_id?: string | null;
          responsible_user_id?: string | null;
          third_party_name?: string | null;
          status?: string;
          atpv_done?: boolean;
          signature_done?: boolean;
          sale_communication_done?: boolean;
          dispatcher_done?: boolean;
          completed_at?: string | null;
          deadline_at?: string | null;
          notes?: string | null;
        };
        Relationships: [];
      };
      financial_accounts: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          slug: string;
          account_type: string;
          initial_balance: number;
          current_balance: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          slug: string;
          account_type: string;
          initial_balance?: number;
          current_balance?: number;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          slug?: string;
          account_type?: string;
          initial_balance?: number;
          current_balance?: number;
          is_active?: boolean;
        };
        Relationships: [];
      };
      financial_categories: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          slug: string;
          transaction_type: string;
          dre_group: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          slug: string;
          transaction_type: string;
          dre_group?: string | null;
          is_active?: boolean;
          sort_order?: number;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          slug?: string;
          transaction_type?: string;
          dre_group?: string | null;
          is_active?: boolean;
          sort_order?: number;
        };
        Relationships: [];
      };
      financial_transactions: {
        Row: {
          id: string;
          tenant_id: string;
          account_id: string;
          category_id: string;
          transaction_type: string;
          amount: number;
          paid_amount: number;
          description: string;
          transaction_date: string;
          due_date: string | null;
          paid_at: string | null;
          status: string;
          origin_type: string | null;
          origin_id: string | null;
          origin_label: string | null;
          order_id: string | null;
          person_id: string | null;
          vehicle_passage_id: string | null;
          reversed_transaction_id: string | null;
          is_reversal: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          account_id: string;
          category_id: string;
          transaction_type: string;
          amount: number;
          paid_amount?: number;
          description: string;
          transaction_date?: string;
          due_date?: string | null;
          paid_at?: string | null;
          status?: string;
          origin_type?: string | null;
          origin_id?: string | null;
          origin_label?: string | null;
          order_id?: string | null;
          person_id?: string | null;
          vehicle_passage_id?: string | null;
          reversed_transaction_id?: string | null;
          is_reversal?: boolean;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          account_id?: string;
          category_id?: string;
          transaction_type?: string;
          amount?: number;
          paid_amount?: number;
          description?: string;
          transaction_date?: string;
          due_date?: string | null;
          paid_at?: string | null;
          status?: string;
          origin_type?: string | null;
          origin_id?: string | null;
          origin_label?: string | null;
          order_id?: string | null;
          person_id?: string | null;
          vehicle_passage_id?: string | null;
          is_reversal?: boolean;
        };
        Relationships: [];
      };
      transaction_payments: {
        Row: {
          id: string;
          tenant_id: string;
          transaction_id: string;
          account_id: string;
          amount: number;
          paid_at: string;
          notes: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          transaction_id: string;
          account_id: string;
          amount: number;
          paid_at?: string;
          notes?: string | null;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          transaction_id?: string;
          account_id?: string;
          amount?: number;
          notes?: string | null;
        };
        Relationships: [];
      };
      dispatcher_records: {
        Row: {
          id: string;
          tenant_id: string;
          order_id: string | null;
          person_id: string | null;
          vehicle_passage_id: string | null;
          purpose: string;
          advance_received: number;
          costs_paid: number;
          balance: number;
          revenue_recognized: number;
          status: string;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          order_id?: string | null;
          person_id?: string | null;
          vehicle_passage_id?: string | null;
          purpose: string;
          advance_received?: number;
          costs_paid?: number;
          balance?: number;
          revenue_recognized?: number;
          status?: string;
          notes?: string | null;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          order_id?: string | null;
          person_id?: string | null;
          vehicle_passage_id?: string | null;
          purpose?: string;
          advance_received?: number;
          costs_paid?: number;
          balance?: number;
          revenue_recognized?: number;
          status?: string;
          notes?: string | null;
        };
        Relationships: [];
      };
      fiscal_settings: {
        Row: {
          id: string;
          tenant_id: string;
          fisqal_company_id: string | null;
          company_status: string;
          fiscal_ambiente: string;
          razao_social: string | null;
          nome_fantasia: string | null;
          cnpj: string | null;
          inscricao_municipal: string | null;
          inscricao_estadual: string | null;
          codigo_municipio: string | null;
          municipio: string | null;
          uf: string | null;
          logradouro: string | null;
          numero: string | null;
          complemento: string | null;
          bairro: string | null;
          cep: string | null;
          email: string | null;
          telefone: string | null;
          certificate_status: string | null;
          certificate_valid_until: string | null;
          webhook_secret: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          fisqal_company_id?: string | null;
          company_status?: string;
          fiscal_ambiente?: string;
          razao_social?: string | null;
          nome_fantasia?: string | null;
          cnpj?: string | null;
          inscricao_municipal?: string | null;
          inscricao_estadual?: string | null;
          codigo_municipio?: string | null;
          municipio?: string | null;
          uf?: string | null;
          logradouro?: string | null;
          numero?: string | null;
          complemento?: string | null;
          bairro?: string | null;
          cep?: string | null;
          email?: string | null;
          telefone?: string | null;
          certificate_status?: string | null;
          certificate_valid_until?: string | null;
          webhook_secret?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          fisqal_company_id?: string | null;
          company_status?: string;
          fiscal_ambiente?: string;
          razao_social?: string | null;
          nome_fantasia?: string | null;
          cnpj?: string | null;
          inscricao_municipal?: string | null;
          inscricao_estadual?: string | null;
          codigo_municipio?: string | null;
          municipio?: string | null;
          uf?: string | null;
          logradouro?: string | null;
          numero?: string | null;
          complemento?: string | null;
          bairro?: string | null;
          cep?: string | null;
          email?: string | null;
          telefone?: string | null;
          certificate_status?: string | null;
          certificate_valid_until?: string | null;
          webhook_secret?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      fiscal_documents: {
        Row: {
          id: string;
          tenant_id: string;
          document_type: string;
          nature: string;
          status: string;
          fisqal_external_id: string | null;
          fisqal_company_id: string | null;
          fiscal_request_id: string | null;
          order_id: string | null;
          person_id: string | null;
          vehicle_passage_id: string | null;
          document_number: string | null;
          document_series: string | null;
          access_key: string | null;
          protocol: string | null;
          cfop: string | null;
          total_value: number | null;
          issue_date: string | null;
          competence_date: string | null;
          authorized_at: string | null;
          cancelled_at: string | null;
          cancel_reason: string | null;
          recipient_name: string | null;
          recipient_document: string | null;
          service_description: string | null;
          error_message: string | null;
          idempotency_key: string | null;
          payload: Json;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          document_type: string;
          nature?: string;
          status?: string;
          fisqal_external_id?: string | null;
          fisqal_company_id?: string | null;
          fiscal_request_id?: string | null;
          order_id?: string | null;
          person_id?: string | null;
          vehicle_passage_id?: string | null;
          document_number?: string | null;
          document_series?: string | null;
          access_key?: string | null;
          protocol?: string | null;
          cfop?: string | null;
          total_value?: number | null;
          issue_date?: string | null;
          competence_date?: string | null;
          authorized_at?: string | null;
          cancelled_at?: string | null;
          cancel_reason?: string | null;
          recipient_name?: string | null;
          recipient_document?: string | null;
          service_description?: string | null;
          error_message?: string | null;
          idempotency_key?: string | null;
          payload?: Json;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          document_type?: string;
          nature?: string;
          status?: string;
          fisqal_external_id?: string | null;
          fisqal_company_id?: string | null;
          fiscal_request_id?: string | null;
          order_id?: string | null;
          person_id?: string | null;
          vehicle_passage_id?: string | null;
          document_number?: string | null;
          document_series?: string | null;
          access_key?: string | null;
          protocol?: string | null;
          cfop?: string | null;
          total_value?: number | null;
          issue_date?: string | null;
          competence_date?: string | null;
          authorized_at?: string | null;
          cancelled_at?: string | null;
          cancel_reason?: string | null;
          recipient_name?: string | null;
          recipient_document?: string | null;
          service_description?: string | null;
          error_message?: string | null;
          idempotency_key?: string | null;
          payload?: Json;
          created_by?: string | null;
        };
        Relationships: [];
      };
      fiscal_webhook_events: {
        Row: {
          id: string;
          tenant_id: string | null;
          event_type: string;
          fisqal_external_id: string | null;
          fiscal_document_id: string | null;
          payload: Json;
          processed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string | null;
          event_type: string;
          fisqal_external_id?: string | null;
          fiscal_document_id?: string | null;
          payload?: Json;
          processed?: boolean;
        };
        Update: {
          id?: string;
          tenant_id?: string | null;
          event_type?: string;
          fisqal_external_id?: string | null;
          fiscal_document_id?: string | null;
          payload?: Json;
          processed?: boolean;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      next_deal_number: {
        Args: { p_tenant_id: string };
        Returns: number;
      };
      next_order_number: {
        Args: { p_tenant_id: string };
        Returns: number;
      };
      next_passage_number: {
        Args: { p_vehicle_id: string };
        Returns: number;
      };
      recalculate_passage_cost: {
        Args: { p_passage_id: string };
        Returns: undefined;
      };
      recalculate_account_balance: {
        Args: { p_account_id: string };
        Returns: undefined;
      };
      get_user_tenant_id: {
        Args: Record<string, never>;
        Returns: string;
      };
      is_master_user: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      timeline_entity_type: TimelineEntityType;
      audit_action: AuditAction;
    };
    CompositeTypes: Record<string, never>;
  };
};
