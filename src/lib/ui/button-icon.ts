export function resolveButtonIcon(text: string, className = ''): string {
  const normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (/cancelar|voltar|fechar/.test(normalized)) return 'iconoir-arrow-left';
  if (/excluir|remover|deletar|perder/.test(normalized)) return 'iconoir-trash';
  if (/nova|novo|criar|adicionar|cadastro|registrar/.test(normalized)) return 'iconoir-plus';
  if (/salvar|gravar|confirmar|aplicar|emitir|enviar|sincronizar|executar|processar|concluir|entrando|salvando|abrindo/.test(normalized)) {
    return 'iconoir-check';
  }
  if (/editar|alterar/.test(normalized)) return 'iconoir-edit-pencil';
  if (/exportar|excel|download/.test(normalized)) return 'iconoir-download';
  if (/kanban/.test(normalized)) return 'iconoir-view-grid';
  if (/relatorio|dre|analytics|fluxo/.test(normalized)) return 'iconoir-stats-report';
  if (/ver |detalhe|abrir|assistir|visualizar/.test(normalized)) return 'iconoir-eye';
  if (/entrar|login|acessar/.test(normalized)) return 'iconoir-log-in';
  if (/cadastrar|criar conta/.test(normalized)) return 'iconoir-user-plus';
  if (/pagar|pagamento|receber|lancamento|financeiro/.test(normalized)) return 'iconoir-wallet';
  if (/reverter|estornar|desfazer/.test(normalized)) return 'iconoir-undo';
  if (/buscar|pesquisar|filtrar/.test(normalized)) return 'iconoir-search';
  if (/agenda|calendario/.test(normalized)) return 'iconoir-calendar';
  if (/alerta/.test(normalized)) return 'iconoir-bell';
  if (/cliente|pessoa/.test(normalized)) return 'iconoir-user';
  if (/tabela|lista/.test(normalized)) return 'iconoir-list';
  if (/estoque|veiculo|inventario/.test(normalized)) return 'iconoir-car';
  if (/integrador|portal|sync/.test(normalized)) return 'iconoir-globe';
  if (/documento|nfse|nfe|fiscal|gerar|modelo/.test(normalized)) return 'iconoir-page';
  if (/entrega|delivery/.test(normalized)) return 'iconoir-delivery-truck';
  if (/reserva/.test(normalized)) return 'iconoir-bookmark';
  if (/transfer/.test(normalized)) return 'iconoir-refresh-double';
  if (/oferta|demanda|fila/.test(normalized)) return 'iconoir-community';
  if (/motivo|perda/.test(normalized)) return 'iconoir-warning-circle';
  if (/cobranca|billing|plano|assinatura/.test(normalized)) return 'iconoir-credit-card';
  if (/comunicado|marketing|campanha/.test(normalized)) return 'iconoir-megaphone';
  if (/loja|tenant/.test(normalized)) return 'iconoir-shop';
  if (/suporte|chamado|ticket/.test(normalized)) return 'iconoir-headset-help';
  if (/tentar|retry|atualizar|renovar|rodar/.test(normalized)) return 'iconoir-refresh';
  if (/upload|anexo|foto/.test(normalized)) return 'iconoir-upload';
  if (/concilia/.test(normalized)) return 'iconoir-check-circle';
  if (/configura|settings|conta/.test(normalized)) return 'iconoir-settings';
  if (/extrato|movimentacao/.test(normalized)) return 'iconoir-wallet';
  if (/despachante/.test(normalized)) return 'iconoir-doc-search';
  if (/avaliacao/.test(normalized)) return 'iconoir-search';
  if (/oportunidade/.test(normalized)) return 'iconoir-spark';
  if (/chat|conversa|ia/.test(normalized)) return 'iconoir-chat-bubble';
  if (/crm master|master/.test(normalized)) return 'iconoir-shop';
  if (/capa|windshield/.test(normalized)) return 'iconoir-page';
  if (/sair|logout/.test(normalized)) return 'iconoir-log-out';
  if (/continuar|proximo|avancar/.test(normalized)) return 'iconoir-arrow-right';
  if (/resolver|dismiss|dispensar/.test(normalized)) return 'iconoir-check';
  if (/marcar|done|concluido/.test(normalized)) return 'iconoir-check-circle';

  if (className.includes('btn-danger') || className.includes('outline-danger')) return 'iconoir-warning-circle';
  if (className.includes('btn-success')) return 'iconoir-check-circle';
  if (className.includes('btn-primary')) return 'iconoir-check';
  if (className.includes('btn-link')) return 'iconoir-eye';

  return 'iconoir-arrow-right';
}
