'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import type { DateSelectArg, EventClickArg, EventDropArg } from '@fullcalendar/core';
import { AnimatedModal } from '@/components/dastone/AnimatedModal';
import {
  type AgendaActivity,
  type AgendaDealOption,
  formatActivityScheduleLabel,
  formatDealNumber,
  getActivityBadgeClass,
  getActivityBadgeLabel,
  getActivityDisplayStatus,
  getActivityInitials,
  mapActivityToCalendarEvent,
  sortSidebarActivities,
} from '@/lib/agenda/activities';
import { writeTimelineEvent } from '@/lib/timeline/events';
import { createClient } from '@/lib/supabase/client';
import { getClientTenantContext } from '@/lib/settings/client-context';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface AgendaCalendarProps {
  initialActivities: AgendaActivity[];
  initialDeals: AgendaDealOption[];
}

type ModalMode = 'create' | 'view' | 'complete';

interface ActivityFormState {
  title: string;
  dueAt: string;
  description: string;
  contactMethod: string;
  dealId: string;
  nextTitle: string;
  nextDueAt: string;
}

const emptyForm: ActivityFormState = {
  title: '',
  dueAt: '',
  description: '',
  contactMethod: '',
  dealId: '',
  nextTitle: '',
  nextDueAt: '',
};

function toDateTimeLocalValue(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function fromDateTimeLocalValue(value: string) {
  return new Date(value).toISOString();
}

function ActivityAvatar({ name }: { name: string | null }) {
  return (
    <div className="thumb-md rounded-circle bg-soft-primary text-primary d-flex align-items-center justify-content-center me-3 flex-shrink-0 fw-semibold">
      {getActivityInitials(name)}
    </div>
  );
}

export function AgendaCalendar({ initialActivities, initialDeals }: AgendaCalendarProps) {
  const router = useRouter();
  const supabase = createClient();
  const [activities, setActivities] = useState(initialActivities);
  const [deals] = useState(initialDeals);
  const [modalMode, setModalMode] = useState<ModalMode | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<AgendaActivity | null>(null);
  const [form, setForm] = useState<ActivityFormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const sidebarActivities = useMemo(() => sortSidebarActivities(activities), [activities]);
  const calendarEvents = useMemo(() => activities.map(mapActivityToCalendarEvent), [activities]);
  const overdueCount = useMemo(
    () =>
      activities.filter((item) => getActivityDisplayStatus(item.due_at, item.status) === 'overdue')
        .length,
    [activities],
  );
  const todayCount = useMemo(
    () =>
      activities.filter((item) => getActivityDisplayStatus(item.due_at, item.status) === 'today')
        .length,
    [activities],
  );
  const isMobile = useMediaQuery('(max-width: 767.98px)');
  const calendarToolbar = useMemo(
    () => ({
      left: 'prev,next today',
      center: 'title',
      right: isMobile ? 'listWeek,dayGridMonth' : 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
    }),
    [isMobile],
  );

  const closeModal = useCallback(() => {
    setModalMode(null);
    setSelectedActivity(null);
    setForm(emptyForm);
    setError(null);
  }, []);

  const openCreateModal = useCallback((dueAt?: string) => {
    const defaultDue = dueAt ?? new Date().toISOString();
    setSelectedActivity(null);
    setForm({
      ...emptyForm,
      dueAt: toDateTimeLocalValue(defaultDue),
    });
    setModalMode('create');
    setError(null);
  }, []);

  const openViewModal = useCallback((activity: AgendaActivity) => {
    setSelectedActivity(activity);
    setForm({
      title: activity.title,
      dueAt: toDateTimeLocalValue(activity.due_at),
      description: activity.description ?? '',
      contactMethod: activity.contact_method ?? '',
      dealId: activity.deal_id ?? '',
      nextTitle: '',
      nextDueAt: '',
    });
    setModalMode('view');
    setError(null);
  }, []);

  const refreshActivities = useCallback(async () => {
    const { data } = await supabase
      .from('activities')
      .select(`
        id,
        title,
        description,
        due_at,
        status,
        contact_method,
        deal_id,
        person_id,
        assigned_user_id,
        deals:deal_id ( deal_number ),
        people:person_id ( full_name )
      `)
      .neq('status', 'done')
      .neq('status', 'cancelled')
      .order('due_at', { ascending: true })
      .limit(300);

    const mapped = (data ?? []).map((row) => {
      const activity = row as {
        id: string;
        title: string;
        description: string | null;
        due_at: string;
        status: string;
        contact_method: string | null;
        deal_id: string | null;
        person_id: string | null;
        assigned_user_id: string | null;
        deals: { deal_number: number } | { deal_number: number }[] | null;
        people: { full_name: string } | { full_name: string }[] | null;
      };
      const deal = Array.isArray(activity.deals) ? activity.deals[0] : activity.deals;
      const person = Array.isArray(activity.people) ? activity.people[0] : activity.people;
      return {
        id: activity.id,
        title: activity.title,
        description: activity.description,
        due_at: activity.due_at,
        status: activity.status,
        contact_method: activity.contact_method,
        deal_id: activity.deal_id,
        person_id: activity.person_id,
        assigned_user_id: activity.assigned_user_id,
        deal_number: deal?.deal_number ?? null,
        person_name: person?.full_name ?? null,
      } satisfies AgendaActivity;
    });

    setActivities(mapped);
  }, [supabase]);

  const handleDateSelect = useCallback(
    (selection: DateSelectArg) => {
      openCreateModal(selection.startStr);
      selection.view.calendar.unselect();
    },
    [openCreateModal],
  );

  const handleEventClick = useCallback(
    (clickInfo: EventClickArg) => {
      const activity = clickInfo.event.extendedProps.activity as AgendaActivity | undefined;
      if (activity) {
        openViewModal(activity);
      }
    },
    [openViewModal],
  );

  const handleEventDrop = useCallback(
    async (dropInfo: EventDropArg) => {
      const activity = dropInfo.event.extendedProps.activity as AgendaActivity | undefined;
      if (!activity || !dropInfo.event.start) {
        dropInfo.revert();
        return;
      }

      const nextDueAt = dropInfo.event.start.toISOString();
      const { error: updateError } = await supabase
        .from('activities')
        .update({ due_at: nextDueAt })
        .eq('id', activity.id);

      if (updateError) {
        dropInfo.revert();
        return;
      }

      if (activity.deal_id) {
        await supabase
          .from('deals')
          .update({ next_action_at: nextDueAt, next_action_note: activity.title })
          .eq('id', activity.deal_id);
      }

      await refreshActivities();
    },
    [refreshActivities, supabase],
  );

  const handleCreate = useCallback(async () => {
    if (!form.title.trim() || !form.dueAt) {
      setError('Informe título e data.');
      return;
    }

    setSaving(true);
    setError(null);

    const context = await getClientTenantContext(supabase);

    if (!context) {
      setError('Loja não configurada.');
      setSaving(false);
      return;
    }

    const dueAt = fromDateTimeLocalValue(form.dueAt);
    let personId: string | null = null;

    if (form.dealId) {
      const { data: dealRow } = await supabase
        .from('deals')
        .select('person_id')
        .eq('id', form.dealId)
        .maybeSingle();
      personId = dealRow?.person_id ?? null;
    }

    const { data: created, error: insertError } = await supabase
      .from('activities')
      .insert({
        tenant_id: context.tenantId,
        title: form.title.trim(),
        description: form.description.trim() || null,
        due_at: dueAt,
        contact_method: form.contactMethod || null,
        deal_id: form.dealId || null,
        person_id: personId,
        assigned_user_id: context.userId,
        created_by: context.userId,
      })
      .select('id')
      .single();

    if (insertError || !created) {
      setError('Não foi possível criar a atividade.');
      setSaving(false);
      return;
    }

    if (form.dealId) {
      await supabase
        .from('deals')
        .update({ next_action_at: dueAt, next_action_note: form.title.trim() })
        .eq('id', form.dealId);

      await writeTimelineEvent(supabase, {
        tenantId: context.tenantId,
        entityType: 'deal',
        entityId: form.dealId,
        eventType: 'activity_scheduled',
        title: 'Atividade agendada',
        description: form.title.trim(),
        userId: context.userId,
      });
    }

    await refreshActivities();
    closeModal();
    setSaving(false);
  }, [closeModal, deals, form, refreshActivities, router, supabase]);

  const handleComplete = useCallback(async () => {
    if (!selectedActivity) return;

    setSaving(true);
    setError(null);

    const context = await getClientTenantContext(supabase);

    if (!context) {
      setError('Loja não configurada.');
      setSaving(false);
      return;
    }

    const completedAt = new Date().toISOString();
    const { error: completeError } = await supabase
      .from('activities')
      .update({
        status: 'done',
        completed_at: completedAt,
      })
      .eq('id', selectedActivity.id);

    if (completeError) {
      setError('Não foi possível concluir a atividade.');
      setSaving(false);
      return;
    }

    if (selectedActivity.deal_id) {
      await writeTimelineEvent(supabase, {
        tenantId: context.tenantId,
        entityType: 'deal',
        entityId: selectedActivity.deal_id,
        eventType: 'activity_completed',
        title: 'Atividade concluída',
        description: selectedActivity.title,
        userId: context.userId,
      });
    }

    if (form.nextTitle.trim() && form.nextDueAt) {
      const nextDueAt = fromDateTimeLocalValue(form.nextDueAt);

      await supabase.from('activities').insert({
        tenant_id: context.tenantId,
        deal_id: selectedActivity.deal_id,
        person_id: selectedActivity.person_id,
        assigned_user_id: context.userId,
        title: form.nextTitle.trim(),
        due_at: nextDueAt,
        contact_method: form.contactMethod || null,
        created_by: context.userId,
      });

      if (selectedActivity.deal_id) {
        await supabase
          .from('deals')
          .update({
            next_action_at: nextDueAt,
            next_action_note: form.nextTitle.trim(),
          })
          .eq('id', selectedActivity.deal_id);
      }
    } else if (selectedActivity.deal_id) {
      await supabase
        .from('deals')
        .update({
          next_action_at: null,
          next_action_note: null,
        })
        .eq('id', selectedActivity.deal_id);
    }

    await refreshActivities();
    closeModal();
    setSaving(false);
  }, [closeModal, form, refreshActivities, router, selectedActivity, supabase]);

  return (
    <>
      <div className="row animate-stagger g-3">
        <div className="col-12 col-xl-4">
          <div className="card">
            <div className="card-body">
              <div className="row">
                <div className="col">
                  <h5 className="m-0 fs-16">Agenda</h5>
                  <p className="text-muted mb-0 mt-1">
                    <i className="iconoir-calendar me-1" />
                    Organize retornos, ligações e visitas
                  </p>
                </div>
                <div className="col-auto align-self-center">
                  <button
                    type="button"
                    className="btn btn-sm btn-soft-primary"
                    onClick={() => openCreateModal()}
                  >
                    <i className="iconoir-plus me-1" />
                    Nova
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body p-0">
              {sidebarActivities.length ? (
                <ul className="list-group list-group-flush">
                  {sidebarActivities.map((activity) => {
                    const displayStatus = getActivityDisplayStatus(activity.due_at, activity.status);
                    const isOverdue = displayStatus === 'overdue';

                    return (
                      <li
                        key={activity.id}
                        className="list-group-item align-items-center d-flex justify-content-between align-items-start"
                      >
                        <button
                          type="button"
                          className="btn btn-link text-start text-decoration-none p-0 border-0 flex-grow-1"
                          onClick={() => openViewModal(activity)}
                        >
                          <div className="d-flex align-items-center">
                            <ActivityAvatar name={activity.person_name} />
                            <div className="flex-grow-1 ms-0 text-truncate">
                              <h5 className={`m-0 fs-13 ${isOverdue ? 'text-danger' : ''}`}>
                                {activity.title}
                              </h5>
                              <p className={`mb-0 ${isOverdue ? 'text-danger' : 'text-muted'}`}>
                                {formatActivityScheduleLabel(activity.due_at)}
                                {activity.person_name ? ` — ${activity.person_name}` : ''}
                              </p>
                              {activity.deal_number ? (
                                <span className="small text-primary">
                                  {formatDealNumber(activity.deal_number)}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </button>
                        <span className={`badge ${getActivityBadgeClass(displayStatus)} rounded`}>
                          {getActivityBadgeLabel(displayStatus)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="p-3">
                  <p className="text-muted mb-0">Nenhuma atividade pendente.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-primary-subtle p-3 border-dashed border-primary rounded mt-3">
            <div className="d-flex align-items-center gap-2 mb-1">
              <i className="iconoir-calendar fs-20 text-primary" />
              <span className="text-primary fw-semibold">Resumo do dia</span>
            </div>
            <p className="text-primary mb-0">
              {todayCount} atividade(s) hoje
              {overdueCount > 0 ? (
                <>
                  {' '}
                  · <span className="text-danger fw-semibold">{overdueCount} atrasada(s)</span>
                </>
              ) : (
                ' · agenda em dia'
              )}
            </p>
          </div>
        </div>

        <div className="col-12 col-xl-8">
          <div className="card">
            <div className="card-body">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin, bootstrap5Plugin]}
                themeSystem="bootstrap5"
                locale={ptBrLocale}
                headerToolbar={calendarToolbar}
                initialView="dayGridMonth"
                height="auto"
                editable
                selectable
                selectMirror
                dayMaxEvents
                events={calendarEvents}
                select={handleDateSelect}
                eventClick={handleEventClick}
                eventDrop={handleEventDrop}
              />
            </div>
          </div>
        </div>
      </div>

      <AnimatedModal
        open={modalMode !== null}
        onClose={closeModal}
        title={
          modalMode === 'create'
            ? 'Nova atividade'
            : modalMode === 'complete'
              ? 'Concluir e agendar próxima'
              : 'Atividade'
        }
        footer={
          <>
            <button type="button" className="btn btn-light" onClick={closeModal}>
              Fechar
            </button>
            {modalMode === 'create' ? (
              <button
                type="button"
                className="btn btn-primary"
                disabled={saving}
                onClick={handleCreate}
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            ) : null}
            {modalMode === 'view' ? (
              <button type="button" className="btn btn-primary" onClick={() => setModalMode('complete')}>
                Concluir
              </button>
            ) : null}
            {modalMode === 'complete' ? (
              <button
                type="button"
                className="btn btn-primary"
                disabled={saving}
                onClick={handleComplete}
              >
                {saving ? 'Salvando...' : 'Concluir atividade'}
              </button>
            ) : null}
          </>
        }
      >
        {error ? <div className="alert alert-danger py-2 animate-in">{error}</div> : null}

        {modalMode === 'view' && selectedActivity ? (
          <div className="mb-3 animate-in">
            <p className="mb-1">
              <strong>{selectedActivity.title}</strong>
            </p>
            <p className="text-muted mb-1">
              {formatActivityScheduleLabel(selectedActivity.due_at)}
            </p>
            {selectedActivity.person_name ? (
              <p className="mb-1">Cliente: {selectedActivity.person_name}</p>
            ) : null}
            {selectedActivity.deal_id && selectedActivity.deal_number ? (
              <Link href={`/crm/${selectedActivity.deal_id}`} className="small">
                Ficha {formatDealNumber(selectedActivity.deal_number)}
              </Link>
            ) : null}
            {selectedActivity.description ? (
              <p className="text-muted mt-2 mb-0">{selectedActivity.description}</p>
            ) : null}
          </div>
        ) : null}

        {modalMode === 'create' || modalMode === 'complete' ? (
          <div className="row g-3 animate-in">
            {modalMode === 'create' ? (
              <>
                <div className="col-12">
                  <label htmlFor="activity-title" className="form-label">
                    Título
                  </label>
                  <input
                    id="activity-title"
                    className="form-control"
                    value={form.title}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, title: event.target.value }))
                    }
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="activity-due-at" className="form-label">
                    Data e hora
                  </label>
                  <input
                    id="activity-due-at"
                    type="datetime-local"
                    className="form-control"
                    value={form.dueAt}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, dueAt: event.target.value }))
                    }
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="activity-contact" className="form-label">
                    Contato
                  </label>
                  <select
                    id="activity-contact"
                    className="form-select"
                    value={form.contactMethod}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        contactMethod: event.target.value,
                      }))
                    }
                  >
                    <option value="">Selecione</option>
                    <option value="phone">Telefone</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="visit">Visita</option>
                    <option value="email">E-mail</option>
                  </select>
                </div>
                <div className="col-12">
                  <label htmlFor="activity-deal" className="form-label">
                    Ficha
                  </label>
                  <select
                    id="activity-deal"
                    className="form-select"
                    value={form.dealId}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, dealId: event.target.value }))
                    }
                  >
                    <option value="">Sem ficha</option>
                    {deals.map((deal) => (
                      <option key={deal.id} value={deal.id}>
                        {formatDealNumber(deal.deal_number)} —{' '}
                        {deal.person_name ?? deal.title ?? 'Sem cliente'}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12">
                  <label htmlFor="activity-description" className="form-label">
                    Observações
                  </label>
                  <textarea
                    id="activity-description"
                    className="form-control"
                    rows={3}
                    value={form.description}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                  />
                </div>
              </>
            ) : (
              <>
                <div className="col-12">
                  <label htmlFor="next-title" className="form-label">
                    Próxima ação
                  </label>
                  <input
                    id="next-title"
                    className="form-control"
                    placeholder="Ex.: Retornar ligação"
                    value={form.nextTitle}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, nextTitle: event.target.value }))
                    }
                  />
                </div>
                <div className="col-12">
                  <label htmlFor="next-due-at" className="form-label">
                    Data da próxima ação
                  </label>
                  <input
                    id="next-due-at"
                    type="datetime-local"
                    className="form-control"
                    value={form.nextDueAt}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, nextDueAt: event.target.value }))
                    }
                  />
                </div>
              </>
            )}
          </div>
        ) : null}
      </AnimatedModal>
    </>
  );
}
