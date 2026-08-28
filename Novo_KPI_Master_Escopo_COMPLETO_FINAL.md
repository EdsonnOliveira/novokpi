# NOVO KPI --- ESCOPO FUNCIONAL COMPLETO DO MVP

**Documento de requisitos para desenvolvimento**\
**Versão:** 0.1 --- consolidação do escopo levantado até 25/08/2026

> Este documento consolida todas as regras, telas, funcionalidades e
> conceitos definidos até aqui para o **Novo KPI**, SaaS de gestão para
> lojas de veículos.\
> O **Master** (sistema da empresa proprietária do Novo KPI) é um
> produto separado e não é detalhado neste documento, salvo pontos de
> integração ou conceitos necessários ao Novo KPI.

------------------------------------------------------------------------

## 1. VISÃO DO PRODUTO

O Novo KPI será um SaaS para gestão operacional, comercial, financeira,
documental e gerencial de lojas de veículos.

O sistema deverá ser construído para uso real em lojas de veículos, com
foco em:

-   baixa burocracia no primeiro atendimento e na captação;
-   enriquecimento dos dados conforme a negociação evolui;
-   rastreabilidade completa;
-   CRM integrado ao estoque;
-   gestão de leads;
-   gestão de veículos próprios, consignados e consignados on-line;
-   integração com portais de anúncios;
-   integração com site da loja;
-   gestão financeira vinculada às operações;
-   gestão de preparação e custos dos veículos;
-   documentos e formulários automáticos;
-   controle fiscal;
-   dashboards gerenciais com drill-down até a base;
-   análise por vendedor;
-   histórico permanente de clientes e veículos;
-   permissões configuráveis por loja e usuário.

O sistema **não deve obrigar o usuário a seguir um fluxo rígido e
sequencial**. As informações e funcionalidades devem ficar disponíveis
conforme as permissões do usuário. Eventos objetivos podem alterar
status automaticamente.

------------------------------------------------------------------------

# 2. ARQUITETURA DE USUÁRIOS, PERFIS E PERMISSÕES

## 2.1 Perfis

O Novo KPI deverá aceitar múltiplos perfis de usuários, incluindo, mas
não limitados a:

-   proprietário/administrador da loja;
-   gerente;
-   vendedor;
-   secretária de vendas;
-   F&I;
-   vendedor de acessórios;
-   preparador;
-   financeiro;
-   avaliador;
-   administrativo/documentação;
-   outros perfis criados pela própria loja.

## 2.2 Perfis não podem ser rígidos

Os perfis padrão servirão como modelos iniciais.

Cada loja deverá poder configurar:

-   o que cada perfil visualiza;
-   o que cada perfil cria;
-   o que cada perfil edita;
-   o que cada perfil exclui, quando permitido;
-   o que cada perfil aprova;
-   o que cada perfil finaliza;
-   quais valores financeiros enxerga;
-   se enxerga custo do veículo;
-   se enxerga margem;
-   se pode alterar preço;
-   se pode cadastrar reparos;
-   se pode lançar pagamentos;
-   se pode emitir documentos;
-   se pode emitir notas;
-   se pode acessar fichas de outros vendedores;
-   demais permissões por módulo e função.

Também deverá ser possível, quando necessário, configurar permissões
específicas para um usuário individualmente.

A premissa é que cada loja possui um nível diferente de confiança em
seus colaboradores.

## 2.3 Auditoria de usuário

Toda ação relevante deverá registrar:

-   usuário;
-   data;
-   hora;
-   ação executada;
-   registro afetado;
-   valor anterior;
-   valor novo, quando houver alteração.

O proprietário/usuário autorizado poderá corrigir informações, mas a
alteração nunca deverá apagar o histórico anterior.

------------------------------------------------------------------------

# 3. LINHAS DO TEMPO --- CONCEITO CENTRAL

O Novo KPI deverá trabalhar com linhas do tempo integradas.

## 3.1 Linha do tempo da ficha/negociação

Deverá registrar:

-   abertura da ficha;
-   origem;
-   contatos;
-   forma de contato;
-   observações;
-   o que foi combinado;
-   propostas;
-   avaliações;
-   anexos;
-   agendamentos;
-   próximas ações;
-   mudanças relevantes;
-   reserva;
-   avanço para fechamento;
-   venda;
-   venda perdida;
-   motivo da perda;
-   usuário;
-   data;
-   hora.

## 3.2 Linha do tempo do cliente

O cliente é único, mesmo possuindo várias fichas.

A linha do tempo consolidada deverá mostrar todas as relações do cliente
com a loja, inclusive:

-   atendimentos;
-   fichas;
-   compras;
-   veículos vendidos para a loja;
-   avaliações;
-   trade-ins;
-   propostas;
-   vendas;
-   vendas perdidas;
-   financiamentos;
-   produtos;
-   entregas;
-   documentos;
-   demais interações.

Um cliente pode comprar dois carros, vender outros dois para a loja e
ter vários atendimentos com vendedores diferentes. Tudo deverá
permanecer consolidado.

## 3.3 Linha do tempo do veículo

O veículo terá histórico permanente, mesmo passando várias vezes pelo
estoque.

Deverá registrar:

-   cada entrada;
-   modalidade da entrada;
-   data/hora;
-   km;
-   proprietário/possuidor;
-   compra;
-   troca;
-   consignação;
-   consignação on-line;
-   reparos;
-   bateria;
-   oficina;
-   pneus;
-   laudos;
-   custos;
-   fotos;
-   anúncios;
-   alterações de preço;
-   reserva;
-   venda;
-   entrega;
-   km de entrega;
-   transferência;
-   garantia;
-   ocorrências de garantia;
-   retorno futuro ao estoque.

## 3.4 Linha do tempo do usuário

Deverá permitir consultar tudo que determinado usuário realizou no
sistema, com data e hora.

## 3.5 Eventos compartilhados

Um evento poderá alimentar mais de uma timeline.

Exemplo: vendedor registra proposta para um cliente em determinado
veículo.

O evento poderá aparecer simultaneamente:

-   na ficha;
-   no cliente;
-   no veículo;
-   no usuário.

------------------------------------------------------------------------

# 4. CADASTRO DE CLIENTE E NOVA FICHA

## 4.1 Botão global "Nova Ficha"

Deverá existir em qualquer tela do sistema um botão visível para abrir
uma **Nova Ficha**.

## 4.2 Cadastro rápido

O objetivo é não burocratizar o atendimento.

Para abertura inicial, exigir somente:

-   nome;
-   telefone;
-   e-mail OU rede social.

A qualificação poderá ser completada a qualquer momento.

## 4.3 Cadastro completo

Quando necessário, o usuário poderá usar um botão como **Completar
cadastro**.

Após o negócio ser fechado, deverão ser completados os dados necessários
à operação, documentação e fiscal.

## 4.4 Origem automática

As fichas poderão nascer:

-   manualmente;
-   por portais de anúncios;
-   por integrações de CRM;
-   por outros canais futuramente integrados.

Dados recebidos das integrações deverão pré-preencher a ficha.

## 4.5 Número único de atendimento

Toda ficha deverá possuir número único de atendimento.

Exemplo:

`Ficha #001584`

------------------------------------------------------------------------

# 5. DUPLICIDADE DE FICHAS

## 5.1 Critérios

Duplicidade deverá ser identificada por:

-   telefone;
-   e/ou e-mail.

**Nome não será critério de duplicidade.**

## 5.2 Duplicidade não bloqueia

O sistema deverá alertar, mas nunca impedir a criação da nova ficha.

Lead vindo de portal também será criado normalmente.

## 5.3 Sinalização

Ao lado do número da ficha deverá aparecer aviso de duplicidade.

Exemplo:

`Ficha #001584 — Duplicidade`

## 5.4 Consulta da duplicidade

Ao clicar no aviso, mostrar:

-   número da outra ficha;
-   vendedor responsável;
-   veículo de interesse.

Se for do mesmo vendedor, permitir abrir a ficha.

Se pertencer a outro vendedor, não permitir acesso ao conteúdo da ficha,
salvo as informações resumidas autorizadas.

## 5.5 Cliente único

Fichas duplicadas ou múltiplas não podem fragmentar o cadastro do
cliente.

O histórico deverá permanecer integrado ao cadastro único do cliente.

------------------------------------------------------------------------

# 6. DISTRIBUIÇÃO DE LEADS/FICHAS

## 6.1 Automática

Fichas/leads automáticos deverão ser distribuídos de forma randômica
entre vendedores habilitados a receber leads.

## 6.2 Manual

Ao criar ficha manualmente, o usuário poderá selecionar o vendedor
responsável.

------------------------------------------------------------------------

# 7. CRM E TELA DE TRABALHO DO VENDEDOR

A principal base de trabalho do vendedor deverá ser uma tela de CRM
contendo:

-   clientes;
-   leads;
-   agendamentos;
-   atividades;
-   atrasados;
-   compromissos do dia;
-   próximos compromissos;
-   negociações;
-   acesso às fichas;
-   filtros.

Deverá existir visualização em:

-   tabela/planilha;
-   Kanban.

## 7.1 Negociação

A tela de negociação deverá permitir:

-   registrar livremente o que foi falado;
-   forma de contato;
-   observações;
-   combinado com cliente;
-   anexos;
-   proposta;
-   carro de interesse;
-   avaliação;
-   próxima ação;
-   agendamento.

Não haverá obrigação de avançar por etapas rígidas.

## 7.2 Próxima ação obrigatória

Toda negociação ativa deverá ter uma próxima ação agendada.

A exceção é quando a negociação for encerrada como **Venda Perdida**.

## 7.3 Agenda

O vendedor deverá encerrar o dia com sua agenda futura organizada.

Ao iniciar o próximo dia, deverá visualizar prioritariamente:

-   clientes programados para o dia;
-   atividades do dia;
-   atividades atrasadas.

## 7.4 Regra de atraso

Uma atividade já será considerada atrasada a partir de **1 dia de
atraso**.

Atividades atrasadas deverão aparecer em vermelho até serem
tratadas/concluídas.

## 7.5 Concluir atividade não encerra negociação

O usuário poderá concluir uma atividade e imediatamente programar a
próxima.

------------------------------------------------------------------------

# 8. VENDA PERDIDA

Para encerrar uma negociação sem venda, o usuário deverá marcar **Venda
Perdida**.

Será obrigatório:

-   selecionar motivo pré-cadastrado;
-   escrever explicação/justificativa.

Motivos iniciais poderão incluir:

-   desistência do cliente;
-   financiamento recusado;
-   carta de consórcio não contemplada;
-   baixa avaliação do usado;
-   cliente comprou em outra loja;
-   preço;
-   veículo vendido antes da decisão;
-   cliente sem retorno;
-   outros.

Cada loja poderá criar/adaptar os próprios motivos conforme sua
realidade e região.

## 8.1 Dashboard de perdas

O administrador da loja deverá analisar perdas por:

-   motivo;
-   vendedor;
-   período;
-   origem do lead;
-   canal;
-   portal;
-   veículo;
-   modelo;
-   demais dimensões relevantes.

Todo indicador deverá permitir drill-down até a base.

------------------------------------------------------------------------

# 9. FILAS INTELIGENTES DE DEMANDA E OFERTA

Existirão duas filas.

## 9.1 Fila de demanda

Clientes procurando veículos que a loja não possui.

## 9.2 Fila de oferta

Clientes/proprietários oferecendo veículos para os quais a loja ainda
não possui comprador.

## 9.3 Cruzamento

Quando houver compatibilidade entre oferta e demanda, o sistema deverá
alertar o usuário.

Critérios poderão considerar:

-   marca;
-   modelo;
-   versão;
-   ano;
-   preço;
-   km;
-   combustível;
-   câmbio;
-   outros critérios da qualificação.

------------------------------------------------------------------------

# 10. QUALIFICAÇÃO E AVALIAÇÃO DE USADO

A avaliação nasce dentro da qualificação do cliente.

Se o cliente informar que possui veículo para entrada/venda, o sistema
deverá permitir abrir a avaliação sem burocracia.

Informações:

-   veículo;
-   placa;
-   km;
-   cor;
-   fotos;
-   valor avaliado;
-   FIPE automática via integração;
-   previsão de custo;
-   previsão de venda;
-   titular/possuidor;
-   telefone;
-   observações;
-   anexos;
-   laudo, quando houver;
-   status do laudo.

O preenchimento poderá ser complementado posteriormente.

------------------------------------------------------------------------

# 11. CADASTRO DE VEÍCULO

## 11.1 Cadastro rápido

Obrigatórios:

-   versão;
-   modelo;
-   ano;
-   cor;
-   km;
-   placa.

## 11.2 Base padronizada

Marca/modelo/versão e campos equivalentes deverão vir de banco de dados
selecionável.

Evitar digitação livre para não gerar inconsistências como:

-   maiúsculas/minúsculas;
-   abreviações;
-   erros;
-   versões duplicadas.

## 11.3 Consulta automática pela placa

O sistema deverá integrar com serviço de consulta por placa para
pré-preencher dados.

## 11.4 Cadastro completo

Quando a operação exigir entrada completa/fiscal ou emissão de nota,
deverão ser preenchidos os demais dados necessários, como:

-   Renavam;
-   chassi;
-   proprietário;
-   documentação;
-   dados fiscais;
-   demais campos exigidos.

------------------------------------------------------------------------

# 12. FORMAS DE ENTRADA DO VEÍCULO

Inicialmente:

-   compra;
-   troca;
-   consignação.

A lista poderá ser configurável por administrador autorizado.

Entretanto, configurações fiscais não podem ser livres a ponto de gerar
CFOP incorreto.

A natureza fiscal/CFOP deverá respeitar a legislação aplicável à
operação e ao estado.

------------------------------------------------------------------------

# 13. ENTRADA NO ESTOQUE E IDADE

A idade do estoque começa no momento em que o veículo é cadastrado
efetivamente como estoque no Novo KPI.

## 13.1 Renovação da entrada

Quando houver mudança relevante de modalidade, poderá ser iniciada nova
entrada/ciclo.

Exemplo:

-   veículo ficou 45 dias consignado;
-   loja comprou o veículo;
-   histórico anterior é preservado;
-   estoque próprio começa novamente no dia 0.

Registrar na timeline:

-   modalidade anterior;
-   nova modalidade;
-   data;
-   hora;
-   usuário.

------------------------------------------------------------------------

# 14. TABELA DE ESTOQUE

Deverá conter, no mínimo:

-   dias em estoque;
-   captador;
-   ex-proprietário/cliente;
-   marca/modelo;
-   versão;
-   km;
-   ano fabricação/modelo;
-   custo;
-   valor de venda;
-   margem percentual.

## 14.1 Cores da idade

-   até 30 dias: verde;
-   31 a 60 dias: amarelo;
-   acima de 60 dias: vermelho.

## 14.2 Configuração da tabela

Permitir:

-   filtros;
-   ordenação;
-   escolha de colunas;
-   salvar visualização, quando implementado;
-   exportar Excel.

------------------------------------------------------------------------

# 15. MODALIDADES DE ESTOQUE

O dashboard deverá separar e somar pelo menos:

-   estoque próprio;
-   estoque consignado;
-   consignação on-line.

------------------------------------------------------------------------

# 16. CONSIGNAÇÃO

## 16.1 Remuneração

Duas modalidades iniciais:

### Valor líquido na mão do cliente

O proprietário define quanto deseja receber.

Tudo que exceder esse valor na venda pertence à loja.

### Percentual

Percentual informado manualmente na negociação.

## 16.2 Histórico

Registrar histórico de:

-   valor inicialmente autorizado;
-   reduções;
-   novas autorizações;
-   percentual;
-   alterações;
-   usuário;
-   data/hora.

------------------------------------------------------------------------

# 17. CONSIGNAÇÃO ON-LINE

Veículo permanece com o proprietário.

A loja poderá anunciá-lo sem assumir responsabilidade física pelo carro.

Cadastro propositalmente simples:

-   placa;
-   km;
-   cor;
-   dados básicos;
-   parte da qualificação;
-   parte da avaliação;
-   fotos.

Não exigir documentação completa nesse momento.

## 17.1 Follow-up automático

Deverá ser possível configurar lembrete, por exemplo:

-   7 dias após captação;
-   gerar compromisso para o vendedor captador;
-   verificar se houve leads;
-   se necessário, ligar para proprietário;
-   tentar renegociar preço.

Prazo e atividade deverão ser configuráveis.

------------------------------------------------------------------------

# 18. PREPARAÇÃO DO VEÍCULO

Não haverá workflow obrigatório.

Usuários com permissão poderão lançar serviços/reparos.

Cada lançamento deverá registrar:

-   responsável interno;
-   data;
-   hora;
-   serviço;
-   descrição;
-   interno ou terceiro;
-   fornecedor/prestador;
-   telefone;
-   orçamento;
-   valor autorizado, quando utilizado;
-   custo efetivo;
-   nota fiscal/comprovante;
-   anexos;
-   garantia;
-   data final da garantia;
-   status do pagamento.

## 18.1 Custos

O custo efetivo deverá integrar automaticamente o custo do veículo
daquela passagem.

Exemplo:

-   compra: R\$ 80.000;
-   bateria: R\$ 700;
-   oficina: R\$ 1.800;
-   pneus: R\$ 2.000;
-   custo atualizado: R\$ 84.500.

Margem deverá ser recalculada.

## 18.2 Sem alçada monetária obrigatória

Não é necessário criar limites de aprovação por valor no MVP.

Permissões definem quem pode lançar/alterar.

------------------------------------------------------------------------

# 19. FOTOS

Deverá existir controle de fotos do veículo, incluindo:

-   arquivos;
-   responsável;
-   data;
-   histórico;
-   disponibilidade para publicação.

------------------------------------------------------------------------

# 20. LAUDO

Deverá existir:

-   botão/campo indicando se possui laudo;
-   status do laudo;
-   anexo do arquivo;
-   histórico.

Status poderá ser configurável.

------------------------------------------------------------------------

# 21. PREÇO DO VEÍCULO

Permissão para definir/alterar preço deverá ser configurável.

Toda alteração deverá registrar:

-   preço anterior;
-   novo preço;
-   usuário;
-   data;
-   hora.

O histórico de preço deverá ser consultável.

------------------------------------------------------------------------

# 22. INTEGRADOR DE PORTAIS

Deverá existir módulo específico **Integrador**.

Cada veículo terá controle individual por portal.

O usuário poderá:

-   publicar em todos;
-   selecionar portal por portal;
-   desativar portal específico;
-   acompanhar status.

Exemplo prático: loja publica veículos acima de R\$ 100 mil na
Webmotors, mas não os veículos abaixo desse valor.

## 22.1 Status por portal

Exemplos:

-   publicado;
-   processando;
-   erro;
-   pausado;
-   removido/desativado.

## 22.2 Sincronização

Alterações no Novo KPI deverão ser enviadas automaticamente aos portais
selecionados, incluindo quando aplicável:

-   preço;
-   km;
-   fotos;
-   descrição;
-   demais dados.

------------------------------------------------------------------------

# 23. SITE DA LOJA

O Novo KPI deverá integrar com site desenvolvido para cada loja
assinante.

O estoque do site deverá ser alimentado pelo Novo KPI.

## 23.1 Templates

Disponibilizar pelo menos **5 modelos padronizados de site**.

O usuário escolherá um template.

Personalizações poderão incluir:

-   logotipo;
-   nome;
-   cores;
-   telefone;
-   WhatsApp;
-   endereço;
-   redes sociais;
-   banners;
-   estoque.

O objetivo é escala: não desenvolver um site exclusivo do zero para cada
cliente.

Idealmente, permitir troca futura de template sem perda dos dados.

------------------------------------------------------------------------

# 24. RESERVA

A reserva nasce quando o usuário avança a negociação para
reserva/fechamento.

O veículo permanecerá reservado enquanto a negociação estiver ativa.

**Não haverá expiração automática.**

Para voltar ao estoque disponível, usuário autorizado deverá
cancelar/encerrar a negociação.

Registrar:

-   usuário;
-   data;
-   hora;
-   motivo/ação correspondente.

------------------------------------------------------------------------

# 25. TELA DE NEGOCIAÇÃO X FINALIZAÇÃO

## 25.1 Tela de negociação

Área viva do CRM.

Contém:

-   timeline;
-   contatos;
-   forma de contato;
-   observações;
-   combinado;
-   propostas;
-   carro de interesse;
-   avaliação;
-   anexos;
-   próxima ação;
-   agenda.

## 25.2 Tela de finalização/reserva

Só deverá ser aberta quando o usuário decidir avançar para
fechamento/reserva.

Essa tela deverá consolidar, conforme o desenvolvimento do módulo:

-   valores finais;
-   formas de pagamento;
-   parcelas;
-   veículo de troca;
-   produtos adicionais;
-   documentos;
-   reserva;
-   demais dados necessários.

**Detalhamento final desta tela ainda precisa ser fechado no
levantamento do MVP.**

------------------------------------------------------------------------

# 26. FORMAS DE PAGAMENTO DA COMPRA DE VEÍCULO

Uma compra poderá possuir múltiplos pagamentos:

-   datas diferentes;
-   favorecidos diferentes;
-   pessoas diferentes;
-   contas diferentes.

Cada pagamento deverá registrar, quando aplicável:

-   favorecido;
-   CPF/CNPJ;
-   forma;
-   conta de origem;
-   valor;
-   data prevista;
-   data efetiva;
-   comprovante;
-   status.

Exemplos:

-   pagamento ao proprietário;
-   quitação de financiamento;
-   pagamento de débito;
-   pagamento para terceiro.

------------------------------------------------------------------------

# 27. ADIANTAMENTOS E DÉBITOS

Na entrada/compra, controlar:

-   adiantamento recebido/deixado;
-   finalidade/destino;
-   saldo;
-   utilização;
-   baixa;
-   pagamentos realizados;
-   vínculo com custos;
-   linha do tempo.

Exemplo:

Cliente deixa R\$ 1.000 para pagar auto de infração.

Loja paga R\$ 800 com desconto.

Resultado de R\$ 200 deverá ser contabilizado como lucro/receita
operacional do mês, **não como margem do veículo**, pois representa
outro produto/resultado.

------------------------------------------------------------------------

# 28. PRODUTOS ADICIONAIS DA LOJA

O sistema deverá considerar que a loja vende, além do veículo:

-   financiamento;
-   despachante;
-   seguro;
-   consórcio;
-   acessórios;
-   outros produtos futuramente configurados.

Financiamento, seguro e consórcio deverão registrar:

-   vínculo com a venda;
-   comissão;
-   data prevista de recebimento;
-   data efetiva de recebimento;
-   responsável;
-   demais dados necessários.

O objetivo é saber o lucro da operação e a contribuição de cada produto.

------------------------------------------------------------------------

# 29. FINANCEIRO --- CONCEITO

O financeiro será integrado ao operacional.

Cada loja deverá cadastrar todas as contas que movimenta:

-   bancos;
-   caixa;
-   outras contas/carteiras.

O sistema deverá oferecer:

-   extrato por conta;
-   fluxo de caixa;
-   lançamentos;
-   pagamentos;
-   recebimentos;
-   baixas;
-   conciliação;
-   anexos;
-   vínculos operacionais.

------------------------------------------------------------------------

# 30. LANÇAMENTOS FINANCEIROS

Cada lançamento deverá possuir três dimensões principais:

1.  conta financeira;
2.  categoria;
3.  origem operacional.

Exemplo:

-   Conta: Banco X;
-   Categoria: Despachante/DUA;
-   Origem: Venda #1842 / Cliente João / Corolla XEi.

## 30.1 Origens possíveis

-   compra de veículo;
-   venda;
-   preparação;
-   reparo;
-   DUA/despachante;
-   comissão de financiamento;
-   seguro;
-   consórcio;
-   multa;
-   adiantamento;
-   cliente;
-   veículo;
-   operação;
-   outros.

------------------------------------------------------------------------

# 31. VÍNCULO BIDIRECIONAL FINANCEIRO ↔ OPERAÇÃO

Regra estrutural:

**nenhum lançamento financeiro deve ficar isolado quando possuir origem
operacional.**

Do veículo/cliente/operação:

-   visualizar lançamento;
-   abrir lançamento;
-   localizar pagamento no extrato;
-   associar.

Do extrato:

-   abrir lançamento;
-   ver origem;
-   navegar para carro;
-   cliente;
-   venda;
-   custo;
-   produto;
-   operação.

O usuário deve conseguir "ir e voltar" entre financeiro e operação.

## 31.1 Rateio

Um único lançamento poderá ser vinculado a mais de uma origem, com
rateio.

Exemplo: transferência única pagando serviços de três veículos.

## 31.2 Pagamento parcial

Permitir:

-   despesa parcelada;
-   baixa parcial;
-   comissão recebida parcialmente;
-   saldo pendente.

------------------------------------------------------------------------

# 32. RESULTADO ECONÔMICO X CAIXA

O sistema deverá diferenciar:

-   resultado econômico da operação;
-   movimentação financeira/caixa.

Exemplo:

uma comissão de financiamento pode compor o resultado da venda, mas
ainda estar a receber.

------------------------------------------------------------------------

# 33. CUSTO E LUCRO DA OPERAÇÃO

O sistema deverá calcular:

-   custo de aquisição;
-   preparação;
-   reparos;
-   despesas relacionadas;
-   margem do veículo;
-   receitas de produtos;
-   custos dos produtos;
-   resultado total da operação.

Produtos/receitas paralelas deverão ser separados quando não fizerem
parte da margem do carro.

------------------------------------------------------------------------

# 34. NOTA FISCAL

Cada operação deverá possuir controle fiscal conforme estágio e
natureza.

## 34.1 Compra

Possibilidade de emitir/registrar NF de compra.

## 34.2 Venda

Possibilidade de emitir/registrar NF de venda.

## 34.3 Outras naturezas

Prever:

-   consignação;
-   demonstração;
-   remessa;
-   retorno;
-   demais naturezas necessárias.

## 34.4 Dados

Registrar:

-   número;
-   série;
-   data;
-   valor;
-   natureza;
-   CFOP;
-   status;
-   chave de acesso;
-   XML;
-   DANFE/PDF;
-   anexos.

## 34.5 Status fiscal

Exemplos:

-   NF compra pendente;
-   NF compra emitida;
-   NF venda pendente;
-   NF venda emitida;
-   retorno pendente;
-   outros.

## 34.6 Integração futura/necessária

Arquitetura preparada para provedor de emissão de NF-e.

CFOP e regras fiscais não devem ser livremente manipulados de forma que
gere documento incorreto.

------------------------------------------------------------------------

# 35. CENTRAL DE FORMULÁRIOS E DOCUMENTOS

Deverá existir uma tela exclusiva de **Formulários/Documentos**.

Também deverá existir botão de documentos dentro de:

-   cliente;
-   veículo;
-   negócio/operação.

## 35.1 Princípio

O usuário **não deverá redigitar os dados do formulário**.

O documento será montado automaticamente com dados já existentes em
diferentes telas.

Exemplo --- contrato de venda:

-   dados do cliente;
-   dados do carro;
-   negociação;
-   parcelas;
-   pagamentos;
-   demais informações.

Exemplo --- contrato de consignação:

-   proprietário;
-   veículo;
-   valor na mão;
-   percentual;
-   condições;
-   demais dados.

## 35.2 Modelos

A loja poderá cadastrar modelos com campos dinâmicos.

Exemplos conceituais:

-   cliente_nome;
-   cliente_cpf;
-   veiculo_modelo;
-   veiculo_placa;
-   valor_venda;
-   km_entrega.

## 35.3 Documentos possíveis

-   contrato de compra;
-   contrato de venda;
-   contrato de consignação;
-   proposta;
-   ficha;
-   avaliação;
-   termo de entrega;
-   checklist;
-   recibo;
-   autorização;
-   termo de garantia;
-   procuração;
-   documentos de despachante;
-   outros.

## 35.4 Busca na central

Filtrar/localizar por:

-   tipo;
-   operação;
-   cliente;
-   veículo;
-   ficha;
-   período.

## 35.5 Saída

Permitir:

-   visualizar;
-   imprimir;
-   gerar PDF;
-   armazenar versão emitida.

## 35.6 Versionamento

Documento emitido não deverá ser silenciosamente sobrescrito após
alteração da operação.

Registrar:

-   versão;
-   usuário;
-   data;
-   hora.

------------------------------------------------------------------------

# 36. ACERTO DE COMPRA / CAPA DE PROCESSO

Após entrada/compra do veículo, permitir gerar:

-   contrato de compra;
-   acerto de compra.

O **Acerto de Compra** funcionará como capa de processo/pasta.

Deverá resumir:

-   processo/operação;
-   veículo;
-   placa;
-   antigo proprietário;
-   valor;
-   pagamentos;
-   favorecidos;
-   pendências;
-   débitos;
-   documentos;
-   captador;
-   observações;
-   demais informações relevantes.

Deverá servir tanto para pasta física quanto processo digital.

------------------------------------------------------------------------

# 37. ARQUIVOS E ANEXOS

Cada etapa/tela relevante deverá aceitar anexos.

Exemplos:

-   CNH;
-   CRLV;
-   laudo;
-   fotos;
-   nota fiscal;
-   comprovantes;
-   contrato;
-   termo de entrega;
-   documentos de avaliação;
-   arquivos de oficina.

Anexos deverão permanecer vinculados ao contexto correto.

------------------------------------------------------------------------

# 38. DRIVE / ARMAZENAMENTO

O projeto deverá considerar integração/organização com armazenamento
externo, especialmente Google Drive.

Estrutura conceitual possível:

-   veículo;
-   passagem pelo estoque;
-   compra;
-   documentos;
-   pagamentos;
-   preparação;
-   venda;
-   transferência;
-   garantia.

A implementação exata da integração ainda deverá ser especificada
tecnicamente.

------------------------------------------------------------------------

# 39. ENTREGA DO VEÍCULO

Na entrega, registrar:

-   data;
-   km de entrega;
-   termo;
-   checklist;
-   anexos.

Checklist deverá poder contemplar:

-   manual;
-   chave principal;
-   chave reserva;
-   estepe;
-   macaco;
-   triângulo;
-   ferramentas;
-   documentação;
-   observações;
-   outros itens configurados.

------------------------------------------------------------------------

# 40. GARANTIA

Registrar:

-   garantia do veículo;
-   data de início;
-   data final;
-   ocorrências;
-   serviços;
-   custos;
-   anexos.

Reparos de terceiros também possuem garantia própria, vinculada ao
reparo.

**Fluxo completo de pós-venda/garantia ainda deverá ser detalhado para
fechamento do MVP.**

------------------------------------------------------------------------

# 41. PEDIDOS/NEGÓCIOS FECHADOS

Deverá existir tela permanente de **Pedidos Fechados / Negócios
Fechados**.

## 41.1 Filtros

No mínimo:

-   período;
-   vendedor;
-   cliente;
-   canal/origem;
-   portal;
-   veículo;
-   marca;
-   modelo;
-   versão;
-   forma de pagamento;
-   status da NF;
-   tipo de operação;
-   NF emitida;
-   NF pendente.

## 41.2 Colunas sugeridas

-   número do pedido;
-   data;
-   cliente;
-   veículo;
-   vendedor;
-   canal;
-   valor;
-   margem;
-   forma principal de pagamento;
-   status NF;
-   status entrega;
-   status transferência.

Clicar no pedido deverá abrir toda a operação.

------------------------------------------------------------------------

# 42. NAVEGAÇÃO PRINCIPAL

O menu superior ou lateral deverá possuir acesso claro a módulos como:

-   Dashboard;
-   Estoque;
-   Integrador;
-   Leads/CRM;
-   Agenda;
-   Pedidos Fechados;
-   Financeiro;
-   Formulários/Documentos;
-   Relatórios;
-   Configurações;
-   demais módulos definidos.

Estoque e Leads deverão possuir visualização em tabela/planilha.

Leads/CRM também deverá possuir Kanban.

------------------------------------------------------------------------

# 43. KANBAN

O CRM deverá oferecer Kanban.

Etapas poderão ser configuráveis pela loja.

Exemplo inicial:

-   Novo Lead;
-   Contato realizado;
-   Qualificado;
-   Avaliação;
-   Negociação;
-   Proposta;
-   Venda;
-   Perdida.

A troca entre tabela e Kanban deverá idealmente preservar filtros.

------------------------------------------------------------------------

# 44. EXPORTAÇÃO PARA EXCEL --- REGRA GLOBAL

Toda tela que apresentar tabela deverá possuir opção **Exportar para
Excel**.

A exportação deverá respeitar:

-   filtros;
-   período;
-   permissões;
-   dados visíveis.

Idealmente permitir:

-   exportar visualização atual;
-   exportar dados completos permitidos.

Nunca exportar dados que o usuário não tem permissão para visualizar.

------------------------------------------------------------------------

# 45. DASHBOARD --- REGRA GLOBAL DE DRILL-DOWN

O dashboard deverá ser clicável.

Fluxo obrigatório:

**Dashboard → indicador/gráfico → base filtrada → registro individual**

Exemplo:

18 vendas pela Webmotors → clique → tabela das 18 vendas → clique em
venda → pedido → negociação → cliente/veículo/timeline.

Filtros aplicados devem ser preservados no drill-down.

Todo KPI deve ser rastreável até os dados que o formaram.

------------------------------------------------------------------------

# 46. DASHBOARD DE ESTOQUE

Deverá apresentar indicadores como:

-   quantidade em estoque;
-   valor do estoque;
-   estoque próprio;
-   consignado;
-   consignação on-line;
-   idade;
-   giro;
-   margem;
-   despesas;
-   modelos mais rentáveis;
-   modelos que giram mais rápido;
-   retorno sobre capital;
-   lucro por dia em estoque;
-   outros.

Importante diferenciar:

-   modelo que mais vende;
-   modelo mais lucrativo;
-   modelo que gira mais rápido;
-   modelo com melhor retorno sobre capital.

------------------------------------------------------------------------

# 47. DASHBOARD DE MARKETING/LEADS

Deverá analisar:

-   leads recebidos;
-   origem;
-   mídia;
-   portal;
-   período;
-   vendas por origem;
-   conversão;
-   veículos vendidos;
-   custo por lead, quando houver dados;
-   custo por venda, quando houver dados;
-   margem gerada;
-   ROI, quando houver dados.

Objetivo: saber **qual portal dá mais resultado**, e não apenas qual
gera mais leads.

------------------------------------------------------------------------

# 48. DASHBOARD POR VENDEDOR

Obrigatório permitir filtro/análise por vendedor.

Indicadores aplicáveis:

-   leads recebidos;
-   leads atendidos;
-   agendamentos;
-   atrasos;
-   vendas;
-   vendas perdidas;
-   motivos;
-   conversão;
-   margem média;
-   margem total;
-   tempo de resposta;
-   trade-in captado;
-   percentual de captação de trade-in;
-   penetração de financiamento;
-   penetração de seguro;
-   produtos adicionais;
-   receita de produtos;
-   disciplina da carteira;
-   negociações sem próxima ação;
-   atividades vencidas;
-   tempo médio de atraso;
-   quantidade de contatos por venda.

Cada KPI deverá permitir drill-down.

------------------------------------------------------------------------

# 49. DASHBOARD FINANCEIRO/RESULTADO

Deverá permitir enxergar separadamente:

-   lucro de veículos;
-   financiamento;
-   seguro;
-   consórcio;
-   despachante;
-   acessórios;
-   outras receitas operacionais;
-   despesas;
-   resultado bruto/operacional conforme regras definidas;
-   valores recebidos;
-   valores a receber;
-   fluxo de caixa.

------------------------------------------------------------------------

# 50. DASHBOARD DE PERDAS

Tabulação por:

-   motivo;
-   vendedor;
-   período;
-   canal;
-   origem;
-   portal;
-   veículo;
-   modelo;
-   demais filtros.

------------------------------------------------------------------------

# 51. CANAL/MÍDIA DE ATRAÇÃO

O sistema deverá registrar a fonte/origem do lead desde a
abertura/qualificação.

A origem deverá acompanhar a jornada até a venda para permitir:

**Origem → Lead → Atendimento → Proposta → Venda → Produtos → Lucro**

------------------------------------------------------------------------

# 52. HISTÓRICO DE UM MESMO VEÍCULO EM MÚLTIPLAS PASSAGENS

O veículo deve possuir identidade permanente, preferencialmente
vinculada a chassi/Renavam quando disponíveis.

Cada nova passagem terá:

-   entrada;
-   modalidade;
-   custos;
-   proprietário;
-   km;
-   venda;
-   margem;
-   documentos;
-   garantia;
-   saída.

Ao retornar, criar nova passagem sem apagar as anteriores.

O sistema deverá alertar:

**"Este veículo já possui histórico na loja."**

Permitir consultar passagens anteriores.

------------------------------------------------------------------------

# 53. DADOS DA COMPRA/ENTRADA

Quando aplicável, registrar:

-   valor de compra;
-   proprietário/possuidor;
-   representante legal;
-   captador;
-   pagamentos;
-   comissão de captação;
-   débitos;
-   financiamento a quitar;
-   FIPE;
-   adiantamentos;
-   destino de adiantamentos;
-   baixas;
-   data/hora;
-   vínculo com veículo dado/recebido em troca;
-   documentos;
-   pendências.

------------------------------------------------------------------------

# 54. AUTORIZAÇÕES

Fluxos de autorização deverão ser configuráveis pela loja.

Exemplo: determinada loja pode exigir aprovação do gerente para compra;
outra pode permitir que vendedor autorizado efetive.

Não impor um workflow universal.

------------------------------------------------------------------------

# 55. STATUS AUTOMÁTICOS

Apesar de não haver workflow rígido, eventos objetivos poderão alterar
estados automaticamente.

Exemplos:

-   venda concluída → vendido;
-   entrega registrada → entregue;
-   outros estados objetivos.

Os detalhes finais dos status automáticos deverão ser definidos durante
especificação técnica.

------------------------------------------------------------------------

# 56. TABELAS --- PADRÃO GERAL

Sempre que aplicável, tabelas deverão permitir:

-   filtros;
-   ordenação;
-   busca;
-   escolha de colunas;
-   drill-down;
-   exportação Excel;
-   respeito às permissões;
-   cores/status visuais quando definidos.

------------------------------------------------------------------------

# 57. PRINCÍPIOS DE UX DO NOVO KPI

1.  **Rapidez primeiro:** não exigir cadastro completo antes da hora.
2.  **Dados progressivos:** enriquecer conforme negociação evolui.
3.  **Sem workflow engessado:** funcionalidades disponíveis conforme
    contexto/permissão.
4.  **Tudo rastreável:** usuário/data/hora.
5.  **Timeline como eixo central.**
6.  **Financeiro integrado à operação.**
7.  **Dados padronizados:** evitar campos livres quando houver base
    selecionável.
8.  **Permissões configuráveis.**
9.  **Dashboard navegável até a base.**
10. **Reduzir redigitação:** dados alimentam documentos, financeiro,
    fiscal e relatórios.
11. **Integrações automáticas sempre que possível.**
12. **Operação simples para vendedor e profunda para gestor.**

------------------------------------------------------------------------

# 58. ESCOPO DO MASTER --- SOMENTE CONTEXTO

O sistema **Master** é separado do Novo KPI.

Ele será o sistema da empresa proprietária do Novo KPI e deverá
futuramente controlar, entre outros:

-   lojas clientes;
-   assinaturas;
-   planos;
-   cobranças;
-   CRM de carteira de lojas;
-   financeiro da empresa SaaS;
-   usuários internos;
-   usuário master;
-   dashboards da operação SaaS;
-   utilização dos clientes;
-   suporte;
-   demais funções.

Este documento não detalha o Master.

------------------------------------------------------------------------

# 59. PONTOS AINDA NÃO FECHADOS --- NÃO DEVEM SER PRESUMIDOS PELO DESENVOLVEDOR

Os itens abaixo já foram identificados, mas ainda precisam de
levantamento antes de considerar o MVP 100% fechado.

## 59.1 Fechamento da venda

Definir em detalhe:

-   campos finais do negócio;
-   desconto;
-   entrada;
-   saldo;
-   múltiplas formas de pagamento;
-   pagador diferente do comprador;
-   regras do veículo de troca;
-   quando a venda é considerada efetivamente fechada;
-   alterações após fechamento;
-   cancelamento de venda;
-   estornos;
-   regras da reserva;
-   autorização de entrega.

## 59.2 Financiamento/F&I

Definir:

-   banco;
-   valor;
-   entrada;
-   parcelas;
-   prazo;
-   taxa;
-   retorno;
-   comissão;
-   F&I;
-   previsão de recebimento;
-   recebimento;
-   demais dados.

## 59.3 Produtos adicionais

Fechar campos e regras de:

-   seguro;
-   consórcio;
-   despachante;
-   acessórios;
-   outros.

## 59.4 Comissão de vendedores e demais funções

Definir se o MVP calculará comissão e quais modelos serão suportados.

## 59.5 Pós-venda e garantia

Detalhar:

-   abertura de ocorrência;
-   autorização;
-   oficina;
-   custos;
-   responsabilidade;
-   encerramento;
-   indicadores;
-   documentos;
-   alertas.

## 59.6 Fiscal

Necessário levantamento técnico/fiscal para:

-   CFOP por natureza;
-   regras por UF;
-   provedor de NF-e;
-   cancelamento;
-   carta de correção;
-   devolução;
-   retorno;
-   contingência;
-   demais requisitos legais.

## 59.7 Integrações com portais

Definir:

-   portais prioritários do MVP;
-   APIs disponíveis;
-   limites;
-   campos;
-   retorno de leads;
-   atualização;
-   exclusão;
-   erros.

## 59.8 Consulta veicular/FIPE

Escolher provedores/API para:

-   placa;
-   FIPE;
-   dados do veículo.

## 59.9 Site

Definir:

-   os 5 templates;
-   páginas;
-   personalizações;
-   domínio;
-   hospedagem;
-   SEO;
-   leads;
-   WhatsApp;
-   integração.

## 59.10 Google Drive/armazenamento

Definir tecnicamente:

-   autenticação;
-   estrutura;
-   criação automática de pastas;
-   permissões;
-   nomenclatura;
-   sincronização.

## 59.11 Segurança e requisitos não funcionais

Ainda deverão ser especificados:

-   LGPD;
-   backups;
-   logs;
-   recuperação;
-   autenticação;
-   MFA, se aplicável;
-   sessão;
-   criptografia;
-   retenção;
-   disponibilidade;
-   performance;
-   limites de arquivo;
-   infraestrutura;
-   multi-tenant;
-   segregação de dados entre lojas.

## 59.12 Definição final do MVP x V2

Após fechar os blocos acima, cada funcionalidade deverá ser classificada
em:

-   MVP obrigatório;
-   MVP desejável;
-   V2;
-   futuro.

------------------------------------------------------------------------

# 60. RESUMO DA ESTRUTURA DE TELAS/MÓDULOS JÁ IDENTIFICADOS

1.  Login/autenticação.
2.  Dashboard.
3.  Estoque --- tabela.
4.  Cadastro rápido/completo do veículo.
5.  Histórico/timeline do veículo.
6.  Preparação/reparos.
7.  Fotos.
8.  Laudo.
9.  Integrador de portais.
10. Leads/CRM --- tabela.
11. Leads/CRM --- Kanban.
12. Nova Ficha.
13. Cadastro do cliente.
14. Timeline do cliente.
15. Ficha/negociação.
16. Agenda/atividades.
17. Avaliação de usado/trade-in.
18. Fila de demanda.
19. Fila de oferta.
20. Reserva/finalização da negociação.
21. Pedidos/Negócios Fechados.
22. Financeiro.
23. Contas financeiras.
24. Extrato.
25. Fluxo de caixa.
26. Lançamentos/baixas/conciliação.
27. Produtos adicionais.
28. Fiscal/Notas.
29. Central de Formulários/Documentos.
30. Visualização/geração de documentos.
31. Entrega/checklist.
32. Garantia/pós-venda.
33. Usuários.
34. Perfis e permissões.
35. Configurações.
36. Configuração de motivos de venda perdida.
37. Configuração de origens/canais.
38. Configuração de tipos/modalidades.
39. Relatórios/tabelas exportáveis.
40. Timeline/auditoria do usuário.

------------------------------------------------------------------------

# 61. REGRA DE DESENVOLVIMENTO

Quando existir dúvida entre "facilitar o lançamento" e "exigir
informação completa", o comportamento padrão do Novo KPI deverá ser:

**permitir cadastro rápido durante atendimento/negociação e
exigir/completar somente os dados efetivamente necessários quando a
operação avançar para uma etapa que juridicamente, financeiramente,
fiscalmente ou operacionalmente exija esses dados.**

Nenhuma informação definida neste documento deverá ser considerada
implicitamente descartável. Alterações de escopo devem ser registradas
em versões futuras desta especificação.

------------------------------------------------------------------------

# PARTE II --- CONSOLIDAÇÃO FINAL DO ESCOPO APÓS O MVP INICIAL

> Esta Parte II complementa, atualiza e prevalece sobre qualquer regra
> conflitante da Parte I. Ela incorpora as decisões posteriores do
> projeto, inclusive Master, entrega, documentos, preparação, marketing,
> IA, dashboards e inteligência de mercado.

# 31. PRINCÍPIOS FINAIS DE PRODUTO

## 31.1 Loja pequena primeiro

O Novo KPI deve ser simples para lojas pequenas e muitas vezes
administradas diretamente pelo dono. Processos avançados podem existir,
mas não devem ser obrigatórios quando a operação puder ser resolvida de
maneira simples.

## 31.2 Sem fluxo rígido obrigatório

O sistema não deverá impor sequência artificial como "Venda → Financeiro
→ Documentação → Preparação → Entrega". As informações devem permanecer
disponíveis durante a operação. O fechamento/reserva é uma transição
objetiva; os demais controles devem ser flexíveis/configuráveis.

## 31.3 Drive/arquivo digital transversal

Em pontos-chave deve existir área de arquivos/anexos. Obrigatoriamente
em: - cliente; - ficha; - avaliação; - veículo; - laudo cautelar; -
preparação/OS; - contrato; - pedido; - financeiro/comprovantes; -
NF/XML; - entrega; - transferência; - garantia; - despachante.

O usuário deve conseguir anexar cópias de documentos, documentos
assinados, fotos, PDFs, XML, comprovantes, orçamentos, NFs e demais
arquivos.

## 31.4 Ajuda contextual

Funções que possam gerar dúvida devem possuir ícone/link para vídeo
curto de ajuda, preferencialmente YouTube, configurável e aberto sem
perda do trabalho em andamento.

## 31.5 Tabelas e drill-down

-   Tabelas relevantes: exportação Excel.
-   Relatórios pertinentes: Excel e PDF.
-   Números de dashboards: clicáveis e com drill-down para a base exata.

------------------------------------------------------------------------

# 32. REGRAS FINAIS DE CLIENTE, FICHA, PEDIDO E RESPONSÁVEL

-   Cliente/Pessoa, Ficha e Pedido são entidades diferentes.
-   Pessoa é persistente e única.
-   Ficha possui número único.
-   Nome da ficha é livre.
-   Pedido possui número próprio e diferente da ficha.
-   CPF/CNPJ é identificador forte; evitar duplicidade.
-   Administrador pode mesclar duplicados preservando todo histórico.
-   A mesma pessoa pode ser cliente, fornecedor e/ou funcionário.
-   Todo cliente comercial deve possuir vendedor vinculado quando
    aplicável.
-   Ficha possui um responsável atual e histórico de responsáveis.
-   Se cliente com ficha ativa retornar, direcionar ao responsável
    atual.
-   Permitir transferência individual e em massa de carteira.

------------------------------------------------------------------------

# 33. FILA DE ESPERA E PERFIL DE INTERESSE --- REGRA FINAL

A fila não exige modelo exato.

## 33.1 Busca específica

Pode conter marca, modelo, versão, ano, km, cor, preço, combustível e
transmissão.

## 33.2 Cliente indeciso

Permitir registrar perfil amplo: - faixa de preço; - SUV, sedã, hatch,
picape e outras carrocerias; - faixa de ano; - km máxima; - câmbio; -
combustível; - demais preferências.

Esse perfil alimenta matching automático, Central de Oportunidades e
campanhas.

## 33.3 Duas filas

1.  Clientes buscando veículos.
2.  Pessoas oferecendo veículos que a loja ainda não comprou/consignou
    definitivamente.

------------------------------------------------------------------------

# 34. ESTOQUE --- COMPLEMENTOS FINAIS

A tabela deve permitir pesquisa/filtro por: - placa; - modelo; - antigo
cliente/proprietário; - captador; - entrada; - pedido; - vendedor quando
pertinente; - marca; - status; - localização.

Exibir também: - FIPE; - diferença para FIPE; - margem R\$; - margem
%; - dias de estoque; - preparação pendente; - quantidade de leads por
veículo; - reserva; - status de anúncio.

Cores de idade: - até 30 dias: verde; - 31 a 60: amarelo; - acima de 60:
vermelho.

Reserva: - permanece no estoque; - fica destacada; - permanece
anunciada; - pode ser retirada manualmente no carro/integrador; -
somente a venda efetiva dispara retirada automática de portais/site.

Saída temporária: - motorista; - motivo; - destino; - km saída; -
data/hora; - previsão; - km retorno; - data/hora retorno.

Reentrada: - mostrar histórico anterior antes de concluir nova passagem.

------------------------------------------------------------------------

# 35. FICHA DE EXPOSIÇÃO / PARA-BRISA

Criar formulário próprio para showroom.

Deve puxar automaticamente: - logo da loja; - marca/modelo/versão; -
ano; - km; - preço; - principais características; - equipamentos; -
outros dados selecionados.

O papel deve ser visualmente bem apresentado, com elementos coloridos e
pronto para impressão. Podem existir vários layouts padrão do Novo KPI
para escolha da loja.

------------------------------------------------------------------------

# 36. INTEGRADOR DE ANÚNCIOS --- REGRA FINAL

## 36.1 Anúncio único

Cadastro dentro do veículo com: - título; - descrição; - preço; -
fotos; - opcionais; - observações; - dados técnicos.

A mesma base alimenta site e portais.

## 36.2 Preço por portal

Permitir preço diferente por canal.

## 36.3 Fotos

-   ordenar;
-   definir capa;
-   adicionar/remover;
-   sincronizar quando API permitir.

## 36.4 Status por canal

-   Publicado;
-   Pendente;
-   Erro;
-   Pausado;
-   Não selecionado.

## 36.5 Regras automáticas

A loja pode configurar critérios de publicação por preço/outros
atributos, mantendo override manual.

## 36.6 Massa

Permitir ações em massa de publicação, retirada e alterações suportadas.

## 36.7 Lead

Preservar a cadeia: Mídia/portal → anúncio → veículo → data/hora →
cliente → ficha → vendedor.

## 36.8 Dashboard

Por portal: - anúncios; - custo; - visualizações; - leads; - CPL; -
vendas; - conversão; - faturamento; - lucro; - custo por venda.

Custos dos portais alimentam Financeiro/DRE como Marketing.

------------------------------------------------------------------------

# 37. SITE DA LOJA --- REGRA FINAL

-   O site será benefício/cortesia associado à mensalidade do Novo KPI.
-   Templates serão próprios do sistema.
-   Haverá vários templates.
-   O lojista escolhe o template na contratação/onboarding.
-   Master controla catálogo de templates.
-   Personalização permitida: logo, cores, telefones, WhatsApp,
    endereço, redes, textos, banners e campos definidos.
-   Suportar domínio próprio.
-   O site deve puxar diretamente o Integrador/estoque.
-   Publicou/alterou carro no sistema: refletir no site.
-   Vendeu: remover automaticamente.
-   Lead do site entra no CRM como Mídia de Atração "Site da Loja".

------------------------------------------------------------------------

# 38. DOCUMENTOS, DRIVE E ASSINATURA DIGITAL

## 38.1 Central

Haverá Central de Documentos/Formulários e botões contextuais nas
operações.

## 38.2 Templates

-   modelos padrão do Novo KPI;
-   loja pode adaptar contratos/formulários ao seu padrão;
-   Capa do Negócio/Processo é padrão oficial do Novo KPI e não um
    template livre da loja.

## 38.3 Variáveis

Ex.: {{cliente_nome}}, {{cliente_cpf}}, {{veiculo_placa}},
{{pedido_valor}}.

## 38.4 Imutabilidade

Documento emitido/assinado fica congelado. Alteração posterior de
cadastro não altera o documento antigo. Correção = nova
versão/documento.

## 38.5 Versões

Guardar: - versão; - usuário; - data/hora; - motivo; - arquivo.

## 38.6 Assinatura digital

Deve existir desde a primeira versão. Também permitir upload de
documento assinado fisicamente.

## 38.7 Sugestões automáticas

Exemplos: - pagamento por terceiro → Termo/Carta de Responsabilidade; -
consignação → contrato; - trade-in → documentos correspondentes; -
entrega → termo; - garantia → termos.

## 38.8 Checklist documental

Exibir itens como Contrato, CNH, CRLV, NF, Termo de Entrega, ATPV etc.
Itens podem ser alertas ou bloqueantes conforme configuração, mas a
regra atual de entrega é não travar automaticamente apenas por
pendência.

## 38.9 Capa do Negócio

Modelo padrão do Novo KPI, preenchido automaticamente com cliente,
veículo, pagamentos, pendências, documentos, despachante, observações e
demais informações definidas.

------------------------------------------------------------------------

# 39. NOTA FISCAL --- REGRA FINAL

-   Botão de emissão em pedido/entrada.
-   Natureza: compra, venda, consignação, demonstração, remessa e outras
    necessárias.
-   Configuração fiscal central por UF/natureza.
-   CFOP não fica livre para funcionário comum.
-   Alteração fiscal somente por autorizado.
-   Alertas fiscais devem ser simples e não assustar.
-   Valor da NF pode ser diferente do valor comercial.
-   Diferença gera aviso simples, sem alterar parcelas/composição/margem
    comercial.
-   NF vinculada a cliente/fornecedor, veículo, pedido/entrada e
    financeiro.
-   Guardar número, série, chave, valor, XML, PDF, data e situação.
-   Status: emitida, cancelada, substituída e outros.
-   Nunca apagar histórico.
-   Tabela de vendidos mostra Sim/Não, número, valor fiscal, data e
    status.

------------------------------------------------------------------------

# 40. ENTREGA --- REGRA FINAL

A entrega é o final do processo de negociação/operação.

Registrar: - data; - responsável; - garantia; - limite de km da
garantia; - comentários; - se ocorreu tudo certo; - satisfação do
cliente; - observações do cliente; - km; - fotos da entrega; - fotos do
veículo/painel; - anexos.

## 40.1 Checklist

Checklist padrão Novo KPI, permitindo itens adicionais. Deve poder: -
imprimir; - preencher/ticar; - assinar; - fazer upload; - guardar no
Drive.

## 40.2 Pendências

Criar tela "Pendências da Entrega". Pendência não deve obrigatoriamente
travar o processo. Deve: - gerar alerta; - continuar aparecendo em
outras telas; - permanecer até ser resolvida.

## 40.3 Termo

Gerar Termo de Entrega com cliente, veículo, pedido, data/hora, km,
checklist, observações/ressalvas e assinatura digital/física.

------------------------------------------------------------------------

# 41. TRANSFERÊNCIA

Pode ser executada por Secretária de Vendas, Assessora de Vendas,
Despachante ou usuário autorizado.

Possíveis etapas: - ATPV; - assinatura; - comunicação de venda; -
despachante; - transferência concluída.

Não impor etapas desnecessárias.

Registrar: - responsável; - terceiro; - prazos; - alertas; -
documentos; - data de conclusão; - comprovante; - situação.

O dono deve ter interface simples para configurar prazos dos processos
para os demais usuários.

------------------------------------------------------------------------

# 42. DESPACHANTE --- REGRA FINAL

Adiantamentos podem ser destinados a: - documentos; - acessórios; -
seguro; - outras finalidades.

Despesas podem ser fracionadas.

Categorias padrão: - DUA; - despachante; - vistoria; - placa; -
transferência de propriedade; - transferência de município; -
desalienação; - multa; - demais taxas DETRAN.

Administrador pode adicionar categorias.

## 42.1 Sobra

Valor remanescente pode: - voltar ao cliente; - permanecer como
crédito; - ser usado em outra obrigação autorizada; - ser reconhecido
como lucro/receita.

Somente responsável financeiro reconhece como lucro. Depois de baixado
como lucro, correção/retorno somente por estorno autorizado.

## 42.2 Tela consolidada

Cards: - Adiantamentos Recebidos; - Custos Pagos; - Saldo Disponível; -
Receita/Sobra Realizada; - Pendências.

Tabela inclui cliente, veículo, pedido e vendedor.

## 42.3 Conta corrente de despachante

Quando houver envio a terceiro: + enviado - serviços/despesas = saldo em
poder do despachante.

## 42.4 DRE

Receita só entra quando efetivamente reconhecida como receita.

## 42.5 Auditoria

Após baixa, correção somente via estorno.

------------------------------------------------------------------------

# 43. PREPARAÇÃO --- REGRA FINAL

## 43.1 Checklist de Preparação

Na entrada do carro deve existir Checklist de Preparação imprimível.

É a "bíblia do veículo" da entrada até ficar pronto: - imprimir; -
preparador tica; - upload posterior; - versão digital; - pendências; -
vínculo à passagem.

## 43.2 Orçado x realizado

Guardar ambos para medir acerto da avaliação.

## 43.3 OS

Campos: - veículo; - serviço; - fornecedor/responsável; - descrição; -
orçamento; - valor; - prazo; - fotos; - anexos; - observações; - status.

## 43.4 Categorias

Mecânica, funilaria, pintura, martelinho, pneus, bateria, estética,
higienização, polimento, PPF, vidros, elétrica, acessórios e outras
criadas pelo Administrador.

## 43.5 Aprovação

Não exigir aprovação formal de orçamento como padrão. A loja pequena
pode autorizar verbalmente.

## 43.6 Interno/terceiro

Interno: funcionário, data, serviço. Terceiro: fornecedor, envio,
previsão, retorno, NF, garantia.

## 43.7 Orçamentos e documentos

Uma OS pode ter múltiplos orçamentos. Sempre permitir upload de
orçamento/NF.

## 43.8 Peças e mão de obra

Permitir valor total ou separado.

## 43.9 Rateio

Uma NF pode ser rateada entre vários serviços/veículos.

## 43.10 Venda com pendência

Serviço pendente aparece nas Pendências da Entrega.

## 43.11 Preparação x garantia

Natureza do serviço define classificação; data de pagamento não muda a
natureza.

## 43.12 Indicadores

-   custo total;
-   custo médio;
-   orçado x realizado;
-   fornecedor;
-   categoria;
-   modelo;
-   captador;
-   vendedor;
-   tempo médio;
-   custo total por fornecedor;
-   atrasos;
-   performance de fornecedor;
-   reincidência;
-   garantia acionada.

------------------------------------------------------------------------

# 44. MARKETING, SMS, E-MAIL E PROSPECÇÃO

Criar Central de Marketing.

## 44.1 Canais

-   SMS;
-   e-mail;
-   arquitetura pronta para WhatsApp oficial/API.

## 44.2 Segmentação

-   clientes compradores;
-   clientes que venderam carro;
-   leads perdidos/não convertidos;
-   marca/modelo/perfil de interesse;
-   última compra;
-   inatividade;
-   vendedor;
-   cidade;
-   aniversariantes;
-   faixa de preço;
-   outros.

## 44.3 Estoque e oportunidade

Veículo entrou → identificar clientes compatíveis → botão Criar
Campanha. Central de Oportunidades também deve oferecer essa ação.

## 44.4 Templates

Veículo disponível, aniversário, pós-venda, troca, cliente inativo,
condição especial, novo estoque e modelos próprios.

## 44.5 Variáveis

Nome, vendedor, veículo e demais dados.

## 44.6 Envio

-   agora;
-   agendado;
-   automações configuráveis.

## 44.7 CRM

Respostas/interações retornam ao CRM quando a integração suportar.
Preservar vendedor responsável.

## 44.8 Métricas

-   enviados;
-   entregues;
-   falhas;
-   aberturas;
-   cliques;
-   respostas;
-   leads;
-   fichas;
-   vendas;
-   faturamento;
-   lucro;
-   custo;
-   CPL;
-   custo por venda;
-   ROI.

## 44.9 Atribuição

Venda pode ser atribuída à campanha em janela configurável.

## 44.10 Consentimento

Opt-in/opt-out/bloqueio conforme aplicável.

## 44.11 IA

IA pode sugerir público e texto, mas envio exige confirmação.

------------------------------------------------------------------------

# 45. DASHBOARD/KPIs --- REGRA FINAL

Filtros contextuais: - período; - vendedor; - marca; - modelo; -
veículo; - Mídia de Atração; - portal; - captador; - tipo de estoque; -
fornecedor; - forma de pagamento; - outros pertinentes.

## 45.1 Vendas

-   quantidade;
-   faturamento;
-   lucro bruto;
-   lucro total;
-   margem média;
-   ticket médio;
-   tempo de estoque;
-   \% trade-in;
-   custo médio de preparação.

## 45.2 Estoque

-   quantidade;
-   valor investido;
-   dias médios;
-   30/60/90;
-   sem lead;
-   sem anúncio;
-   preparação pendente;
-   leads por carro.

## 45.3 CRM

-   leads;
-   fichas;
-   Mídia de Atração;
-   marca;
-   modelo;
-   resposta;
-   conversão;
-   sem atendimento;
-   sem próxima ação.

## 45.4 Vendedores

-   vendas;
-   faturamento;
-   lucro;
-   margem;
-   conversão;
-   resposta;
-   atendimentos;
-   financiamento;
-   captação.

## 45.5 Captação

Quantidade, margem, giro e lucro.

## 45.6 Avaliação

Quantidade, aceita/recusada, tempo de precificação, orçado x realizado e
qualidade da avaliação.

## 45.7 Financeiro

Saldos, receber, pagar, vencidos, hoje, próximos dias, adiantamentos,
não identificados e projeção.

## 45.8 Preparação

Custo do período, custo médio, média de preparação, custo total por
fornecedor e atrasos.

## 45.9 Garantia

Custo, ocorrências e reincidência.

## 45.10 Despachante

Adiantamentos, saldo, despesas e lucro realizado.

## 45.11 Funil

Leads → Negociações → Propostas → Reservas → Vendas. Somente analítico.

## 45.12 Metas

Por loja/vendedor: - vendas; - faturamento; - lucro; - financiamento; -
outros configuráveis.

Mostrar meta, realizado, %, projeção.

## 45.13 Comparação

Mês anterior, mesmo período do ano anterior e médias históricas.

## 45.14 Alertas

Cliente sem retorno, transferência, garantia, pagamentos, estoque
parado, preparação, documentos, aniversários e outros.

------------------------------------------------------------------------

# 46. RELATÓRIOS, BUSCA E ALERTAS

## 46.1 Busca global

Nome, CPF/CNPJ, telefone, placa, modelo, ficha, pedido, NF e outros.

Resultado deve oferecer atalhos contextuais para registros relacionados.

## 46.2 Central de Relatórios

Relatórios de vendas, estoque, leads, clientes, avaliações, preparação,
garantia, financeiro, despachante, fornecedores, campanhas, vendedores,
portais e outros.

## 46.3 Personalização

Escolher colunas, filtros e salvar relatório personalizado.

## 46.4 Alertas

Cada usuário vê suas responsabilidades. Administrador vê também
equipe/loja.

Níveis: - Informativo; - Atenção; - Atrasado.

Pendência não desaparece ao fechar aviso.

## 46.5 Prazos

Tela Configurações → Prazos e Alertas. Exemplos: - preparação; -
transferência; - lead sem resposta; - ficha sem próxima ação; -
consignado sem revisão; - documentos; - outros.

------------------------------------------------------------------------

# 47. IA DO NOVO KPI

Assistente em linguagem natural.

Perguntas possíveis: - "Quais carros estão me dando prejuízo?" - "Qual
vendedor teve melhor margem?" - "Quais clientes devo prospectar hoje?" -
"Quais carros preciso girar?"

Pode sugerir ações, mas ações relevantes exigem confirmação.

## 47.1 Hoje na sua loja

Resumo automático: - vendas; - recebimentos; - leads; - carros
parados; - contas; - entregas; - transferências; - pendências.

## 47.2 Vendedor

Visão: - agenda; - retornos; - leads; - fichas sem próxima ação; -
entregas; - oportunidades.

## 47.3 Permissões

IA não pode revelar dado que usuário não poderia abrir diretamente.

## 47.4 Auditoria

Ação executada pela IA é auditada.

------------------------------------------------------------------------

# 48. MASTER --- ADMINISTRAÇÃO DO SAAS

## 48.1 Dashboard

-   lojas ativas;
-   usuários ativos;
-   MRR/receita recorrente;
-   faturamento;
-   inadimplência;
-   cancelamentos;
-   novos clientes;
-   crescimento.

## 48.2 Ficha da loja

-   razão social;
-   fantasia;
-   CNPJ;
-   endereço;
-   responsáveis;
-   telefones;
-   e-mails;
-   dados fiscais;
-   pagamentos;
-   assinatura;
-   vencimento;
-   início;
-   usuários;
-   situação;
-   site;
-   domínio;
-   template;
-   cobranças;
-   chamados;
-   histórico.

## 48.3 Grupos

Suportar várias lojas/filiais e visão consolidada.

## 48.4 Planos

Modelo ainda não decidido. Arquitetura deve ser configurável para preço,
usuários, recursos, limites, adicionais e cortesias sem engessar regra
comercial.

## 48.5 Sites

Master controla templates, domínio, status e configurações. Site
continua sincronizado com Integrador/estoque.

## 48.6 Cobrança

-   mensalidade;
-   vencimento;
-   pago/pendente/atrasado;
-   forma;
-   desconto;
-   cortesia;
-   adicional;
-   histórico;
-   NF;
-   reajuste individual/por plano/em massa.

## 48.7 Inadimplência

Regras configuráveis de avisos e bloqueios. Bloqueio nunca apaga dados.

## 48.8 Cancelamento

Data, motivo, solicitante, observação e concorrente/migração quando
conhecido.

## 48.9 CRM Master

Prospect → contato → demonstração → proposta → negociação →
cliente/perdido, sem rigidez. Origem = Mídia de Atração.

## 48.10 Implantação

Checklist: - loja; - usuários; - permissões; - estoque; - portais; -
domínio/site; - treinamento; - financeiro; - conclusão.

------------------------------------------------------------------------

# 49. SUPORTE / CHAT ENTRE NOVO KPI E MASTER

O usuário do Novo KPI deve abrir chamado/chat dentro do sistema.

No Master: - loja; - usuário; - assunto; - descrição; - responsável; -
prioridade; - status; - histórico; - chat; - anexos.

Prever métricas de: - volume; - primeira resposta; - solução; - assuntos
recorrentes.

Master deve manter histórico de chamados e cobranças.

------------------------------------------------------------------------

# 50. ACESSO MASTER AO TENANT

Botão "Acessar ambiente da loja".

Permissões separadas: - visualizar; - alterar.

Auditoria: - funcionário Master; - loja; - data/hora; -
ações/alterações.

Usuários internos configuráveis: - Super Admin; - Comercial; -
Financeiro; - Suporte; - Implantação; - Gestão; - outros.

------------------------------------------------------------------------

# 51. COMUNICAÇÃO DO MASTER

Master pode enviar avisos para: - todas as lojas; - lojas
selecionadas; - grupos.

Criar "O que há de novo" com: - texto; - novidade; - vídeo; - ajuda; -
público; - data.

------------------------------------------------------------------------

# 52. MASTER ANALYTICS / INTELIGÊNCIA DE MERCADO

## 52.1 Filtros

-   loja;
-   múltiplas lojas;
-   grupo;
-   cidade;
-   estado;
-   região;
-   todas.

## 52.2 Mapa

Mapa do Brasil com lojas e indicadores por geografia.

## 52.3 Estoque consolidado

Por marca/modelo/versão/ano: - quantidade; - preço médio anunciado; - km
média; - dias médios; - vendas.

## 52.4 Giro

-   dias até venda;
-   \% 30/60/90;
-   comparação regional.

## 52.5 Preços

-   entrada/compra;
-   anúncio;
-   venda;
-   FIPE;
-   tendência.

## 52.6 Margem

Por marca, modelo, versão, ano, faixa e região.

## 52.7 Preparação

Custo médio e tipos de serviço por modelo.

## 52.8 Garantia

Custo, frequência, reincidência e problemas.

## 52.9 Trade-in

\% das vendas, modelos entregues, valor médio e relação carro entregue →
carro comprado.

## 52.10 Leads/demanda

Procura por marca/modelo/faixa antes da venda.

## 52.11 Demanda reprimida

Consolidar anonimamente Fila de Espera, inclusive perfis amplos.

## 52.12 Oferta x demanda

Cruzar estoque + leads + fila + velocidade de venda.

## 52.13 Mídia de Atração

Comparar portais/canais por região/modelo/faixa com leads, vendas e
lucro.

## 52.14 Financeiro

Benchmarks agregados de faturamento, margem, despesas, resultado,
pessoal, marketing e DRE.

## 52.15 Grupos comparáveis

Comparar lojas de porte/região/perfil semelhantes.

## 52.16 Índice Novo KPI

Prever futuro índice combinando procura, giro, margem, oferta e
tendência.

## 52.17 Tendências

Procura, estoque, giro e preço.

## 52.18 IA Master

Perguntas em linguagem natural sobre toda a base consolidada.

## 52.19 Privacidade

Lojistas recebem benchmark agregado/anônimo. Super Admin do Master pode
identificar lojas componentes conforme permissão e auditoria.

------------------------------------------------------------------------

# 53. TAXONOMIA PADRÃO PARA INTELIGÊNCIA

Customizações da loja não podem destruir a padronização interna.

Manter códigos/taxonomia central para: - marca/modelo/versão; - Mídia de
Atração; - categorias de despesa; - receitas; - tipos de estoque; -
serviços; - status; - eventos; - regiões; - demais dimensões analíticas.

------------------------------------------------------------------------

# 54. DRE --- CONSOLIDAÇÃO

Formato: - linhas verticais; - meses Jan--Dez; - Total; - Média.

Estrutura: - Receita/Faturamento - (-) Custo dos veículos vendidos - =
Lucro bruto - (+) Financiamento - (+) Despachante - (+) Seguro - (+)
Consórcio - (+) Acessórios - (+) Outras receitas - (-) Despesas de
vendas - (-) Pessoal - (-) Marketing - (-) Impostos - (-)
Administrativas - (-) Outras - = Resultado operacional

Separar aportes, retiradas, distribuição de lucro e investimentos para
não distorcer DRE.

DRE deve ser automática e permitir drill-down.

------------------------------------------------------------------------

# 55. SEGURANÇA, LGPD E AUDITORIA

-   isolamento entre tenants;
-   menor privilégio;
-   permissões granulares;
-   logs de ações críticas;
-   acesso Master auditado;
-   documentos protegidos;
-   consentimento/opt-out de marketing;
-   benchmarks anonimizados para lojistas;
-   registros financeiros/documentais críticos não são apagados;
-   correção via estorno/cancelamento/nova versão;
-   política técnica de backup/recuperação a definir;
-   adequação LGPD na implementação.

------------------------------------------------------------------------

# 56. INTEGRAÇÕES PREVISTAS

Arquitetura desacoplada para: - consulta por placa; - FIPE; - portais; -
site; - WhatsApp oficial/API; - Instagram quando disponível; - SMS; -
e-mail; - assinatura digital; - fiscal/NF; - Open Finance; - OFX; -
Excel; - domínio/site; - IA; - futuras integrações.

Falha externa deve gerar status/erro sem corromper o núcleo do sistema.

------------------------------------------------------------------------

# 57. ENTIDADES CONCEITUAIS MÍNIMAS

Tenant/Loja, Grupo, Usuário, Perfil, Permissão, Pessoa, Papel,
Funcionário, Cliente, Fornecedor, Ficha, Lead, Interação, Agenda, Mídia
de Atração, Interesse, Perfil de Interesse, Fila, Match, Veículo,
Passagem, Avaliação, Contraproposta, Estoque, Localização, Saída
Temporária, Anúncio, Portal, Publicação, Métrica, Site, Template,
Pedido, Reserva, Participante, Forma de Pagamento, Pagamento, Baixa,
Estorno, Crédito/Adiantamento, Transferência de Crédito, Conta, Extrato,
Conciliação, Conta a Pagar, Conta a Receber, Categoria, Comissão,
Financiamento, Seguro, Consórcio, Acessório, Despachante, Preparação,
Checklist, OS, Orçamento, Serviço, Garantia de Serviço, NF de
fornecedor, Nota Fiscal, Documento, Template de Documento, Versão,
Assinatura, Entrega, Checklist de Entrega, Transferência Veicular,
Garantia, Ocorrência, Diagnóstico, Campanha, Segmento, Mensagem,
Consentimento, Meta, KPI, Alerta, Configuração de Prazo, Auditoria,
Chamado, Mensagem de Suporte, Assinatura SaaS, Cobrança SaaS, Plano,
Implantação, Comunicado e Benchmark.

------------------------------------------------------------------------

# 58. CRITÉRIOS GERAIS DE ACEITE

Uma função só é concluída quando, quando aplicável: 1. persiste dados;
2. respeita permissões; 3. registra timeline; 4. registra auditoria; 5.
suporta anexos; 6. filtra corretamente; 7. exporta; 8. permite
drill-down; 9. evita recadastro; 10. mantém vínculos bidirecionais; 11.
funciona de forma simples para loja pequena; 12. preserva histórico; 13.
isola tenants; 14. dashboards batem com base; 15. cálculos financeiros
fecham; 16. documentos puxam dados corretos; 17. documentos antigos não
são sobrescritos; 18. alertas persistentes só desaparecem ao resolver;
19. IA respeita permissões; 20. ações relevantes da IA exigem
confirmação; 21. integrações exibem falha/status; 22. correções
financeiras usam estorno; 23. NF cancelada/substituída mantém histórico;
24. reentrada de veículo preserva passagens anteriores.

------------------------------------------------------------------------

# 59. ITENS AINDA EM ABERTO

Não assumir sem decisão posterior: - nome comercial definitivo do
produto; - modelo final de planos; - preços; - limites por plano; -
quantidade de usuários por plano; - fornecedores de APIs; - provedor de
assinatura digital; - provedor fiscal; - provedor SMS/e-mail/WhatsApp; -
cloud/infraestrutura; - framework; - banco de dados; - política técnica
de backup; - cobrança automática.

------------------------------------------------------------------------

# 60. REGRA DE OURO DO PRODUTO

**Cadastrar uma vez, reutilizar em toda a operação e nunca perder o
histórico.**

Cliente, veículo, ficha, pedido, pagamentos, documentos, anúncios,
preparação, entrega, garantia e analytics devem conversar entre si. O
Master administra o SaaS e transforma dados padronizados das lojas em
inteligência de mercado, respeitando segregação, permissões e auditoria.
