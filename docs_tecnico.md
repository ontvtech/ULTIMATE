**SaaSWPP AI**

Documentação Técnico-Comportamental

Versão 1.0

17 de Março de 2026

# Sumário

1\. Introdução 3

2\. Visão Geral dos Planos e Addons 4

3\. Regras de Acesso e Permissões (RBAC) 8

4\. Comportamento em Caso de Uso Indiscriminado 11

5\. Fluxos Detalhados por Módulo 14

6\. Painel Admin: Funcionalidades e Fluxos 26

7\. Painel Revendedor: Funcionalidades e Fluxos 32

8\. Painel Lojista: Funcionalidades e Fluxos 36

9\. Integrações e Webhooks 45

10\. Casos de Borda e Tratamento de Erros 48

11\. Glossário 51

# 1. Introdução

O presente documento constitui a documentação técnico-comportamental
completa do sistema SaaSWPP AI, uma plataforma SaaS de operação
comercial via WhatsApp com inteligência artificial integrada. Este
documento foi elaborado para fornecer uma visão abrangente e detalhada
de todos os aspectos técnicos e comportamentais do sistema, servindo
como referência oficial para desenvolvedores, analistas de negócio,
testadores e equipes de suporte.

O escopo desta documentação abrange o sistema completo, incluindo todos
os atores envolvidos (Admin, Revendedor, Lojista e Cliente Final), todos
os módulos disponíveis e todas as integrações implementadas. O sistema é
organizado em três painéis principais: Painel Admin, Painel Revendedor e
Painel Lojista, com uma camada central de IA que atravessa todos os
módulos operacionais.

Este documento relaciona-se com outros documentos do projeto, incluindo
o Blueprint Técnico, o Guia de Implementação e a documentação de API.
Enquanto aqueles documentos focam em aspectos específicos de
implementação, esta documentação técnico-comportamental oferece uma
visão integrada do funcionamento do sistema, incluindo regras de
negócio, fluxos de dados e comportamentos esperados em diferentes
cenários.

O público-alvo principal inclui desenvolvedores que necessitam
compreender a arquitetura e os fluxos do sistema, analistas de negócio
que precisam entender as regras e comportamentos implementados,
testadores que realizam validações funcionais e de integração, e equipes
de suporte que necessitam de referência para diagnóstico e resolução de
problemas. A estrutura do documento foi organizada para permitir tanto a
leitura sequencial quanto a consulta específica de tópicos.

# 2. Visão Geral dos Planos e Addons

## 2.1 Plano Básico

O Plano Básico representa a porta de entrada para lojistas que desejam
experimentar a automação de atendimento via WhatsApp com inteligência
artificial. Este plano foi desenhado para pequenos negócios que
necessitam de funcionalidades essenciais de atendimento automatizado.

Preço sugerido: R\$ 97,00 mensais, com ciclo de cobrança mensal. O
período de trial é de 7 dias, seguido por um grace period de 3 dias em
caso de inadimplência.

Módulos incluídos:\
• IA Atendente - Sistema de atendimento automatizado com compreensão de
contexto\
• Chatbot/Fluxo Robotizado - Menus e fluxos de navegação estruturados\
• Base de Conhecimento - Armazenamento e consulta de informações do
negócio\
• Agenda Simples - Agendamento básico sem aprovação

Limites quantitativos:\
• 1 número de WhatsApp conectado\
• 500 mensagens de IA por mês\
• 100 contatos na base\
• 1 usuário do sistema

Funcionalidades exclusivas: O plano não inclui funcionalidades
exclusivas, servindo como base para upgrade.

Comportamento ao atingir limites: Ao atingir 80% da cota de mensagens, o
sistema envia alerta para o lojista. Ao atingir 100%, a IA automática é
pausada e as novas mensagens são encaminhadas para fila de atendimento
manual.

Exemplo de uso típico: Pequeno salão de beleza que utiliza o sistema
para agendamentos simples e respostas a perguntas frequentes sobre
horários e preços.

## 2.2 Plano Profissional

O Plano Profissional é voltado para negócios em crescimento que
necessitam de ferramentas mais robustas de vendas e relacionamento com
clientes. Este plano representa o equilíbrio ideal entre custo e
funcionalidade.

Preço sugerido: R\$ 197,00 mensais, com ciclo de cobrança mensal. O
período de trial é de 14 dias, seguido por um grace period de 5 dias.

Módulos incluídos:\
• IA Atendente - Sistema de atendimento automatizado avançado\
• IA Vendedora - Sistema de qualificação de leads e propostas
comerciais\
• CRM completo - Gestão de leads, clientes e oportunidades\
• Campanhas Automáticas - Disparos segmentados e follow-up\
• Agenda com Aprovação - Agendamento com fluxo de aprovação\
• Alertas Operacionais - Notificações de eventos críticos

Limites quantitativos:\
• 2 números de WhatsApp conectados\
• 2.000 mensagens de IA por mês\
• 500 contatos na base\
• 3 usuários do sistema\
• 5 campanhas ativas simultâneas

Funcionalidades exclusivas: IA Vendedora com capacidade de qualificação
automática de leads, sugestão de produtos e criação de propostas.
Sistema de alertas para clientes insatisfeitos e leads quentes.

Comportamento ao atingir limites: O sistema notifica quando 80% dos
limites são atingidos. Ao exceder, funcionalidades específicas são
gradualmente restritas: primeiro novas campanhas, depois novos contatos,
mantendo sempre o atendimento ativo.

Exemplo de uso típico: Clínica odontológica que utiliza o sistema para
agendamentos, acompanhamento de pacientes, campanhas de retorno e
qualificação de novos pacientes.

## 2.3 Plano Premium

O Plano Premium oferece a experiência completa do SaaSWPP AI, destinado
a negócios que necessitam de automação total de operações comerciais.
Este plano inclui todas as funcionalidades avançadas e integrações
especiais.

Preço sugerido: R\$ 397,00 mensais, com ciclo de cobrança mensal. O
período de trial é de 21 dias, seguido por um grace period de 7 dias.

Módulos incluídos:\
• IA Atendente - Sistema de atendimento automatizado completo\
• IA Vendedora - Sistema de vendas com negociação automática\
• IA Preditiva - Análise de comportamento e previsão de vendas\
• ERP no WhatsApp - Comandos operacionais via mensagens\
• OS (Ordem de Serviço) - Gestão completa de ordens de serviço\
• Multiatendentes - Múltiplos operadores com distribuição de conversas\
• Auditoria completa - Registro detalhado de todas as ações\
• Equipe Interna - Gestão de números internos para alertas\
• Handoff Avançado - Transferência inteligente para humanos\
• CRM completo com pipeline visual\
• Campanhas Avançadas com segmentação\
• Financeiro Simples integrado

Limites quantitativos:\
• 5 números de WhatsApp conectados\
• 10.000 mensagens de IA por mês\
• 2.000 contatos na base\
• 10 usuários do sistema\
• Campanhas ilimitadas\
• API de integração disponível

Funcionalidades exclusivas: IA Preditiva para análise de tendências e
comportamento de clientes. ERP no WhatsApp para comandos operacionais
via mensagem. Handoff inteligente com routing baseado em habilidades da
equipe.

Comportamento ao atingir limites: O sistema mantém operação completa
mesmo após atingir limites, com alertas para necessidade de upgrade ou
compra de addons. Mensagens adicionais de IA são cobradas conforme
política de excesso.

Exemplo de uso típico: Rede de oficinas mecânicas com múltiplos
atendentes, gestão de OS, pedidos de peças, controle financeiro e
campanhas de retenção de clientes.

## 2.4 Addons Disponíveis

Os addons são módulos adicionais que podem ser adquiridos separadamente
para complementar qualquer plano base. Cada addon possui sua própria
tabela de preços e regras de funcionamento.

ERP no WhatsApp (Addon)\
Preço: R\$ 49,00 mensais adicionais\
Funcionalidade: Permite comandos operacionais via WhatsApp como \"quanto
vendeu hoje\", \"agenda de amanhã\", \"cria OS\", entre outros. Inclui
permissões configuráveis por número interno.\
Disponível para: Planos Básico e Profissional

OS - Ordem de Serviço (Addon)\
Preço: R\$ 39,00 mensais adicionais\
Funcionalidade: Gestão completa de ordens de serviço com timeline,
status, vínculo com clientes, agenda e pedidos. Inclui alertas
automáticos para OS paradas.\
Disponível para: Planos Básico e Profissional

Campanhas Avançadas (Addon)\
Preço: R\$ 29,00 mensais adicionais\
Funcionalidade: Recursos avançados de segmentação, A/B testing,
automações de follow-up e integração com CRM para campanhas
comportamentais.\
Disponível para: Plano Básico

IA Preditiva (Addon)\
Preço: R\$ 79,00 mensais adicionais\
Funcionalidade: Análise preditiva de comportamento de clientes, previsão
de churn, identificação de oportunidades de venda cruzada e
recomendações automáticas.\
Disponível para: Plano Profissional

Auditoria Avançada (Addon)\
Preço: R\$ 19,00 mensais adicionais\
Funcionalidade: Logs detalhados de todas as ações do sistema, exportação
de relatórios, trilha de auditoria para compliance e retenção estendida
de logs.\
Disponível para: Planos Básico e Profissional

Integrações Especiais (Addon)\
Preço: Variável conforme integração\
Funcionalidade: Conexão com sistemas externos como ERPs, CRMs terceiros,
plataformas de e-commerce e sistemas de gestão financeira.\
Disponível para: Todos os planos

# 3. Regras de Acesso e Permissões (RBAC)

## 3.1 Hierarquia de Usuários

O sistema SaaSWPP AI implementa um modelo de controle de acesso baseado
em papéis (RBAC - Role-Based Access Control), organizado em uma
hierarquia clara que reflete a estrutura de governança da plataforma.

A hierarquia de usuários é composta por quatro níveis principais:

Nível 1 - Super Admin (Plataforma)\
Usuários com acesso total a todas as funcionalidades do sistema,
incluindo gestão de outros administradores, configurações globais e
acesso cross-tenant. Este nível é restrito a membros da equipe técnica e
executiva da plataforma.

Nível 2 - Admin (Plataforma)\
Administradores da plataforma com acesso a todas as áreas operacionais:
gestão de lojistas, revendedores, planos, billing, monitoramento e
segurança. Não possuem acesso cross-tenant nem configurações críticas de
infraestrutura.

Nível 3 - Revendedor\
Parceiros comerciais com acesso restrito ao painel de revendedor. Podem
visualizar sua carteira de lojistas, gerar links de aquisição,
acompanhar comissões e gerenciar campanhas de prospecção. Não possuem
acesso aos dados operacionais dos lojistas.

Nível 4 - Lojista Admin\
Administradores da conta lojista com acesso completo ao painel do
lojista, incluindo gestão de usuários internos, configurações da IA,
integrações e assinatura. São responsáveis pela gestão da conta e podem
criar outros usuários.

Nível 5 - Lojista Usuário\
Usuários operacionais da conta lojista com acesso limitado às
funcionalidades definidas pelo administrador da conta. Podem operar
atendimento, CRM, agenda e outros módulos conforme permissões
atribuídas.

## 3.2 Permissões Granulares por Módulo e Ação

O sistema implementa permissões granulares que combinam módulos e ações
específicas. Cada permissão segue o formato \"modulo:acao\" e pode ser
atribuída individualmente a papéis ou usuários.

Estrutura de Permissões:

Módulo: Conversas\
• conversas:visualizar - Visualizar lista de conversas\
• conversas:responder - Responder mensagens manualmente\
• conversas:assumir - Assumir conversa da IA\
• conversas:transferir - Transferir conversa para outro atendente\
• conversas:encerrar - Encerrar conversa\
• conversas:etiquetar - Adicionar/remover etiquetas\
• conversas:ver_historico - Acessar histórico completo

Módulo: CRM\
• crm:visualizar - Visualizar leads e clientes\
• crm:criar - Criar novos leads/clientes\
• crm:editar - Editar dados de leads/clientes\
• crm:excluir - Excluir leads/clientes\
• crm:importar - Importar listas de contatos\
• crm:exportar - Exportar dados do CRM\
• crm:alterar_estagio - Mover leads entre estágios do pipeline

Módulo: Agenda\
• agenda:visualizar - Visualizar agenda\
• agenda:criar - Criar agendamentos\
• agenda:editar - Editar agendamentos existentes\
• agenda:cancelar - Cancelar agendamentos\
• agenda:aprovar - Aprovar agendamentos pendentes\
• agenda:bloquear - Bloquear horários

Módulo: Pedidos\
• pedidos:visualizar - Visualizar pedidos\
• pedidos:criar - Criar novos pedidos\
• pedidos:editar - Editar pedidos\
• pedidos:cancelar - Cancelar pedidos\
• pedidos:alterar_status - Alterar status de pedidos

Módulo: OS (Ordem de Serviço)\
• os:visualizar - Visualizar ordens de serviço\
• os:criar - Criar novas ordens\
• os:editar - Editar ordens existentes\
• os:alterar_status - Alterar status\
• os:atribuir - Atribuir a responsáveis

Módulo: Financeiro\
• financeiro:visualizar - Visualizar entradas e resumos\
• financeiro:registrar - Registrar novas entradas\
• financeiro:editar - Editar registros\
• financeiro:exportar - Exportar relatórios

Módulo: Campanhas\
• campanhas:visualizar - Visualizar campanhas\
• campanhas:criar - Criar novas campanhas\
• campanhas:editar - Editar campanhas existentes\
• campanhas:iniciar - Iniciar disparos\
• campanhas:pausar - Pausar campanhas ativas\
• campanhas:excluir - Excluir campanhas

Módulo: Configurações\
• config:ia - Configurar comportamento da IA\
• config:equipe - Gerenciar equipe e números internos\
• config:integracoes - Gerenciar integrações\
• config:assinatura - Visualizar e gerenciar assinatura

## 3.3 Aplicação de Permissões

As permissões são aplicadas em múltiplas camadas para garantir segurança
adequada:

Camada de Rota (Backend)\
Todas as rotas da API são protegidas por middleware de autorização.
Antes de processar qualquer requisição, o sistema verifica se o usuário
possui a permissão necessária para a ação solicitada. A verificação é
realizada comparando as permissões do papel do usuário com as permissões
exigidas pela rota.

Camada de Interface (Frontend)\
O frontend consulta as permissões do usuário logado e esconde ou
desabilita elementos de interface para os quais o usuário não tem
acesso. Botões, menus e seções inteiras são condicionalmente
renderizados com base nas permissões.

Camada de Dados (Query Level)\
Mesmo quando um usuário tem permissão para visualizar um módulo, as
queries de banco de dados são automaticamente filtradas pelo tenant_id
do usuário, garantindo isolamento de dados entre contas.

Quando um usuário tenta acessar uma rota não autorizada:

1\. A requisição é interceptada pelo middleware de autorização\
2. O sistema registra a tentativa no log de auditoria\
3. Uma resposta HTTP 403 (Forbidden) é retornada\
4. No frontend, uma mensagem de erro amigável é exibida\
5. Se houver múltiplas tentativas suspeitas, um alerta de segurança é
gerado para o admin da plataforma

## 3.4 Exemplos Práticos

Exemplo 1: Atendente tentando acessar configurações\
Um usuário com papel \"Atendente\" tenta acessar a página de
configuração da IA. O sistema bloqueia o acesso porque a permissão
\"config:ia\" não está incluída no papel Atendente. A mensagem exibida
é: \"Você não tem permissão para acessar esta área. Entre em contato com
o administrador da conta.\"

Exemplo 2: Gerente visualizando conversas de todos os atendentes\
Um usuário com papel \"Gerente\" possui a permissão
\"conversas:visualizar\" e pode ver todas as conversas da conta, não
apenas as atribuídas a ele. O filtro de tenant_id garante que ele só
veja conversas da sua própria empresa.

Exemplo 3: Revendedor tentando acessar painel admin\
Um revendedor tenta acessar diretamente uma URL do painel admin. O
middleware de tenant_type verifica que o usuário pertence a um tenant do
tipo RESELLER e bloqueia o acesso com HTTP 403, mesmo que a rota não
exija permissões específicas.

Exemplo 4: Lojista em período de graça tentando criar campanha\
Um lojista em grace_period tenta criar uma nova campanha. O sistema
verifica o estado da assinatura e bloqueia a ação, exibindo mensagem:
Esta funcionalidade está temporariamente indisponível. Regularize sua
assinatura para continuar.

# 4. Comportamento em Caso de Uso Indiscriminado

## 4.1 Rate Limiting por IP, por Tenant e por Usuário

O sistema implementa múltiplas camadas de rate limiting para proteger
contra uso abusivo, garantir qualidade de serviço e prevenir ataques de
negação de serviço.

Rate Limiting por IP\
Limite: 100 requisições por minuto por endereço IP\
Escopo: Aplicado a todas as rotas públicas e autenticadas\
Comportamento: Após exceder, retorna HTTP 429 com header Retry-After\
Exception: Rotas de webhook têm limite separado de 1000/minute

Rate Limiting por Tenant\
Limite: 500 requisições por minuto por tenant_id\
Escopo: Aplicado a todas as rotas autenticadas de lojistas\
Comportamento: Após exceder, requisições são enfileiradas com
processamento throttling\
Nota: O limite varia conforme o plano contratado

Rate Limiting por Usuário\
Limite: 200 requisições por minuto por user_id\
Escopo: Aplicado a todas as rotas autenticadas\
Comportamento: Após exceder, o usuário recebe mensagem de limite
atingido

Rate Limiting Específico por Módulo:

Módulo Conversas\
• Envio de mensagens: 60 mensagens por minuto por usuário\
• API de mensagens: 120 requisições por minuto

Módulo Campanhas\
• Criação de campanhas: 5 campanhas por hora\
• Disparo de mensagens: Conforme plano do tenant\
• Upload de listas: 10 uploads por hora

Módulo IA\
• Requisições para IA: Conforme limite do plano\
• Queries de conhecimento: 100 queries por minuto

## 4.2 Proteção contra Abuso da IA

A inteligência artificial do sistema é protegida contra uso abusivo
através de múltiplos mecanismos que garantem uso sustentável e qualidade
das respostas.

Quota Management\
Cada plano possui uma quota mensal de interações com IA. O sistema
monitora o consumo em tempo real e aplica as seguintes regras:

• Ao atingir 80% da quota: Alerta enviado para o lojista\
• Ao atingir 100% da quota: IA automática é pausada, handoff
obrigatório\
• Disponível: Compra de pacotes adicionais de IA

Detecção de Padrões Abusivos\
O sistema analisa padrões de uso para identificar comportamentos
potencialmente abusivos:

• Múltiplas mensagens idênticas em curto período\
• Tentativas de extração sistemática de informações\
• Mensagens com prompts de injeção ou manipulação\
• Alto volume de consultas em horários atípicos

Ações Tomadas\
Ao detectar padrões suspeitos:

1\. Nível 1 (Leve): Registro em log, monitoramento intensificado\
2. Nível 2 (Moderado): Rate limiting temporário reduzido, notificação ao
lojista\
3. Nível 3 (Severo): Suspensão temporária da IA, alerta para admin da
plataforma\
4. Nível 4 (Crítico): Bloqueio da conta para investigação

Proteção contra Injeção de Prompts\
O sistema implementa filtros para detectar e bloquear tentativas de
injeção de prompts:

• Padrões conhecidos de ataque são bloqueados automaticamente\
• Mensagens com instruções de sistema são filtradas\
• Contextos sensíveis são isolados do conteúdo do usuário

## 4.3 Tentativas de Burlar Limites

O sistema implementa proteções contra tentativas de burlar limites
estabelecidos:

Criação de Múltiplas Contas\
• Detecção por fingerprint de dispositivo\
• Verificação cruzada de dados cadastrais\
• Análise de padrões de uso similares\
• Bloqueio preventivo de contas suspeitas

Rotação de IPs\
• Tracking de sessões consistentes\
• Análise comportamental além do IP\
• Rate limiting por dispositivo e sessão

Compartilhamento de Credenciais\
• Detecção de logins simultâneos de IPs diferentes\
• Análise de padrões de uso divergentes\
• Notificação de segurança para o titular

Manipulação de Headers/Requests\
• Validação rigorosa de estrutura de requests\
• Verificação de integridade de tokens\
• Bloqueio de requests malformados

## 4.4 Comportamento em Caso de Inadimplência

O sistema implementa um modelo progressivo de restrições em caso de
inadimplência, equilibrando a necessidade de proteção comercial com a
continuidade do negócio do lojista.

Estados da Assinatura:\
• trialing: Período de teste gratuito\
• active: Assinatura em dia\
• past_due: Cobrança falhou ou venceu\
• grace_period: Período de tolerância\
• suspended: Bloqueio operacional\
• canceled: Assinatura encerrada

Comportamento por Estado:

Estado: past_due\
Ações automáticas:\
• Notificação imediata ao lojista via WhatsApp e e-mail\
• Banner de aviso no painel\
• Registro em log de auditoria\
Funcionalidades: Todas mantidas

Estado: grace_period\
Ações automáticas:\
• Contador regressivo visível no painel\
• Lembretes diários de regularização\
• Notificação ao revendedor vinculado\
Funcionalidades restringidas:\
• Criação de novas campanhas bloqueada\
• Contratação de addons bloqueada\
• Criação de novos usuários bloqueada\
Funcionalidades mantidas:\
• Atendimento normal\
• IA operacional\
• Acesso a dados históricos

Estado: suspended\
Ações automáticas:\
• IA automática pausada\
• Campanhas ativas pausadas\
• Modo somente leitura para dados\
• Botão de regularização em destaque\
Funcionalidades restringidas:\
• Toda criação de novos registros\
• Envio de mensagens proativas\
• Disparo de campanhas\
Funcionalidades mantidas:\
• Visualização de dados\
• Histórico e auditoria\
• Acesso para regularização

Estado: canceled\
Ações automáticas:\
• Desconexão de números WhatsApp\
• Arquivamento de dados\
• Notificação de fim de período de retenção\
• Cancelamento de comissões futuras para revendedor

# 5. Fluxos Detalhados por Módulo

## 5.1 Autenticação e Onboarding

Objetivo do Módulo\
Gerenciar o ciclo completo de entrada de novos usuários na plataforma,
desde o primeiro contato até a operação plena do sistema, garantindo uma
experiência de onboarding zero-touch.

Atores Envolvidos\
• Cliente potencial (visitante)\
• Sistema de autenticação\
• Sistema de billing (Iugu)\
• Sistema de templates de nicho\
• IA central\
• Revendedor (quando aplicável)

Pré-condições\
• Sistema operacional\
• Integração com Iugu configurada\
• Templates de nicho disponíveis\
• Links de aquisição ativos

Fluxo Principal - Entrada via Link de Revendedor:

Passo 1: Acesso ao Link\
O cliente potencial acessa um link compartilhado pelo revendedor. O link
contém parâmetros de tracking (código do revendedor, campanha, UTM
parameters). O sistema registra a origem em uma sessão temporária.

Passo 2: Escolha de Nicho\
Se o link permite nicho livre, o cliente visualiza a lista de nichos
disponíveis com descrições e módulos sugeridos. Se o link tem nicho
pré-definido, o nicho é automaticamente selecionado.

Passo 3: Cadastro Inicial\
O cliente preenche formulário com:\
• Nome da empresa\
• Nome do responsável\
• WhatsApp principal\
• Ramo de atividade\
• Senha ou login social

Passo 4: Criação da Conta\
O sistema cria:\
• Tenant com configurações do nicho selecionado\
• Usuário admin com as credenciais fornecidas\
• Assinatura em modo trial\
• Atribuição ao revendedor (quando aplicável)

Passo 5: Zero-Touch Onboarding\
Automaticamente o sistema:\
• Aplica template do nicho (linguagem, prompts, interface)\
• Carrega base de conhecimento inicial do nicho\
• Configura IA com parâmetros padrão\
• Prepara módulos conforme plano selecionado

Passo 6: Conexão WhatsApp\
O sistema apresenta QR Code para conexão do WhatsApp. Após escaneamento,
a instância é criada e o número vinculado.

Passo 7: Operação Iniciada\
O sistema confirma que a operação está ativa, apresenta tutorial rápido
e dashboard inicial.

Fluxo Alternativo - Falha na Conexão WhatsApp:\
Se a conexão falhar após 3 tentativas:\
1. Sistema oferece suporte via chat\
2. Permite retomar conexão posteriormente\
3. Conta permanece em estado \"pendente de conexão\"

Fluxo Alternativo - Trial Expirado:\
Se o trial expirar sem conversão:\
1. Sistema entra em modo suspenso\
2. Notificações de upgrade são enviadas\
3. Dados são preservados por 30 dias\
4. Após 30 dias, conta é cancelada

Regras de Negócio Específicas:\
• Trial não pode ser estendido sem intervenção admin\
• Um WhatsApp só pode ser conectado a uma conta por vez\
• Nicho pode ser alterado apenas uma vez nos primeiros 7 dias\
• Revendedor vinculado não pode ser alterado após criação

Integrações com Outros Módulos:\
• Billing: Criação e gestão da assinatura\
• IA: Configuração inicial do perfil de IA\
• WhatsApp: Conexão de instância\
• CRM: Importação inicial de contatos (quando disponível)

Exemplo Prático:\
João, proprietário de uma clínica odontológica, acessa um link de
revendedor especializado em saúde. Ele seleciona o nicho
\"Odontologia\", cadastra sua clínica, conecta o WhatsApp da recepção e
em menos de 10 minutos já está com o sistema respondendo automaticamente
perguntas sobre procedimentos, agendando consultas e qualificando novos
pacientes.

## 5.2 Central de Conversas

Objetivo do Módulo\
Centralizar todas as interações via WhatsApp, permitindo gestão
eficiente de atendimentos humanos e automatizados, com contexto completo
do cliente e integração com todos os módulos operacionais.

Atores Envolvidos\
• Cliente final (via WhatsApp)\
• IA Atendente\
• Atendente humano\
• Supervisor

Pré-condições\
• Número WhatsApp conectado e ativo\
• IA configurada e operacional\
• Plano com acesso ao módulo

Fluxo Principal - Atendimento Automatizado:

Passo 1: Recebimento de Mensagem\
O cliente envia mensagem via WhatsApp. O sistema identifica o tenant
pelo número destinatário e carrega o contexto: nicho, plano, regras do
lojista e histórico do cliente.

Passo 2: Classificação de Intenção\
A IA analisa a mensagem e classifica a intenção do cliente:\
• Dúvida sobre produto/serviço\
• Solicitação de orçamento\
• Agendamento\
• Suporte/Reclamação\
• Pedido de compra\
• Conversa geral

Passo 3: Análise de Sentimento\
O sistema avalia o sentimento da mensagem:\
• Positivo: Continua fluxo normal\
• Neutro: Continua fluxo normal\
• Negativo: Cria alerta para equipe\
• Crítico: Aciona handoff imediato

Passo 4: Geração de Resposta\
A IA gera resposta apropriada utilizando:\
• Prompt base do sistema\
• Template do nicho\
• Regras do lojista\
• Base de conhecimento\
• Contexto da conversa

Passo 5: Execução de Ações\
Conforme a intenção, o sistema pode:\
• Atualizar dados do CRM\
• Criar/agendar compromisso\
• Gerar proposta\
• Abrir OS\
• Criar pedido

Passo 6: Registro e Auditoria\
Todas as interações são registradas:\
• Mensagem original\
• Resposta gerada\
• Intenção detectada\
• Confiança da classificação\
• Ações executadas\
• Tempo de resposta

Fluxo Alternativo - Handoff Humano:\
Quando a IA detecta necessidade de intervenção humana:\
1. Classifica motivo do handoff\
2. Seleciona atendente disponível apropriado\
3. Transfere conversa com contexto completo\
4. Notifica atendente via WhatsApp interno\
5. Monitora tempo de resposta (SLA)

Fluxo Alternativo - Assunção Manual:\
Atendente pode assumir conversa a qualquer momento:\
1. Clica em \"Assumir\" na interface\
2. IA pausa respostas automáticas\
3. Atendente visualiza histórico completo\
4. Pode retornar controle para IA quando desejar

Layout de 3 Colunas:\
• Coluna Esquerda: Lista de conversas com filtros, etiquetas, status\
• Coluna Central: Chat ativo com histórico e campo de resposta\
• Coluna Direita: Contexto do cliente (CRM, pedidos, OS, agenda)

Regras de Negócio Específicas:\
• Conversas não respondidas por 24h geram alerta\
• SLA de resposta configurável por tenant\
• IA pode ser pausada globalmente ou por conversa\
• Etiquetas personalizáveis por tenant

Integrações com Outros Módulos:\
• CRM: Sincronização de dados do cliente\
• Agenda: Criação de agendamentos\
• Pedidos: Criação e consulta de pedidos\
• OS: Abertura de ordens de serviço\
• Alertas: Notificação de eventos críticos\
• Base de Conhecimento: Consulta para respostas

Exemplo Prático:\
Maria envia mensagem perguntando sobre clareamento dental. A IA
identifica a intenção de \"informação sobre serviço\", consulta a base
de conhecimento, responde com detalhes do procedimento e preços,
pergunta se deseja agendar, e ao confirmar, cria automaticamente um lead
no CRM com status \"interessado\" e oferece horários disponíveis na
agenda.

## 5.3 CRM

Objetivo do Módulo\
Gerenciar o relacionamento com clientes e leads, desde a prospecção até
o fechamento, com automação de follow-ups e análise de pipeline.

Atores Envolvidos\
• IA Vendedora\
• Vendedor humano\
• Gerente comercial

Pré-condições\
• Plano com acesso ao módulo CRM\
• Pipeline configurado

Fluxo Principal - Gestão de Leads:

Passo 1: Entrada de Lead\
Leads entram no sistema via:\
• Conversa de WhatsApp convertida\
• Importação de lista\
• Campanha de prospecção\
• Formulário externo

Passo 2: Qualificação Automática\
A IA analisa o lead e atribui:\
• Score de qualificação\
• Estágio inicial no pipeline\
• Tags relevantes\
• Previsão de valor

Passo 3: Acompanhamento\
O sistema gerencia automaticamente:\
• Follow-ups agendados\
• Lembretes para vendedor\
• Alertas de leads parados\
• Sugestões de próxima ação

Passo 4: Movimentação no Pipeline\
Conforme interações, o lead é movido entre estágios:\
• Novo → Em contato → Qualificado → Proposta → Negociação → Fechado

Passo 5: Conversão\
Ao fechar negócio:\
• Lead é convertido em Cliente\
• Pedido/OS é criado\
• Vendedor atribuído\
• Comissão calculada (se aplicável)

Fluxo Alternativo - Lead Perdido:\
Quando um lead não converte:\
1. Motivo é registrado\
2. Lead movido para \"Perdido\"\
3. Follow-up futuro pode ser agendado\
4. Análise de perda alimentada IA

Regras de Negócio Específicas:\
• Lead sem interação há 7 dias gera alerta\
• Score é recalculado a cada interação\
• Tags são acumulativas, não exclusivas\
• Follow-ups automáticos respeitam horários

Integrações com Outros Módulos:\
• Conversas: Histórico de interações\
• Agenda: Agendamentos vinculados\
• Pedidos: Pedidos do cliente\
• Campanhas: Segmentação para campanhas\
• IA: Automação de follow-up

Exemplo Prático:\
Um lead chega via WhatsApp perguntando sobre implantes. A IA qualifica
automaticamente (score 85), identifica alto potencial, agenda uma
avaliação, e coloca em follow-up. Após 3 interações e uma visita, o lead
é convertido em cliente com pedido de R\$ 15.000,00.

## 5.4 Agenda

Objetivo do Módulo\
Gerenciar compromissos e disponibilidade, permitindo agendamento
automatizado via conversa com IA, com validação de conflitos e fluxos de
aprovação.

Atores Envolvidos\
• Cliente final\
• IA Agenda\
• Atendente/Recepcionista\
• Profissional executor

Pré-condições\
• Plano com acesso ao módulo Agenda\
• Horários de funcionamento configurados\
• Profissionais cadastrados (opcional)

Fluxo Principal - Agendamento Automatizado:

Passo 1: Solicitação de Agendamento\
Cliente solicita agendamento via WhatsApp. A IA identifica:\
• Serviço desejado\
• Preferência de data/hora\
• Profissional específico (se houver)

Passo 2: Consulta de Disponibilidade\
Sistema consulta:\
• Horários disponíveis\
• Calendários dos profissionais\
• Regras de antecedência\
• Duração do serviço

Passo 3: Proposta de Horários\
IA apresenta 3 opções de horários próximos à preferência do cliente.

Passo 4: Confirmação\
Cliente escolhe horário. Sistema verifica se agendamento requer
aprovação:\
• Se não: Confirma automaticamente\
• Se sim: Cria pendência de aprovação

Passo 5: Registro\
Agendamento é criado com:\
• Dados do cliente\
• Serviço/profissional\
• Data/hora\
• Origem (IA/Humano)\
• Status

Passo 6: Notificações\
Sistema envia:\
• Confirmação imediata ao cliente\
• Alerta para profissional (se configurado)\
• Lembrete 24h antes (automático)\
• Lembrete 2h antes (automático)

Fluxo Alternativo - Reagendamento:\
Cliente solicita alteração:\
1. Sistema busca agendamento atual\
2. Oferece novas opções\
3. Atualiza registro\
4. Notifica partes envolvidas

Fluxo Alternativo - Cancelamento:\
Cliente solicita cancelamento:\
1. Sistema solicita motivo\
2. Registra cancelamento\
3. Libera horário\
4. Oferece reagendamento\
5. Aplica política de cancelamento (se houver)

Modos de Aprovação:\
• Automático: IA confirma sem intervenção\
• Assistido: IA confirma mas notifica humano\
• Manual: Aguardando aprovação humana

Regras de Negócio Específicas:\
• Conflito de horários é bloqueado\
• Antecedência mínima configurável\
• Intervalos entre compromissos respeitados\
• Bloqueios de agenda são prioritários

Integrações com Outros Módulos:\
• Conversas: Contexto de agendamento\
• CRM: Vinculação com cliente\
• OS: Criação automática para serviços\
• Alertas: Notificação de conflitos\
• ERP WhatsApp: Consulta via comando

Exemplo Prático:\
Cliente pede pelo WhatsApp para agendar uma limpeza dental. A IA
pergunta preferência de dia, consulta a agenda da dentista, oferece 3
horários na quinta-feira, confirma o escolhido, cria o agendamento,
atualiza o CRM do cliente e envia confirmação com endereço e instruções.

## 5.5 Pedidos

Objetivo do Módulo\
Controlar o ciclo completo de vendas, desde a criação do pedido até a
entrega/conclusão, com rastreamento de status e integração com
financeiro.

Atores Envolvidos\
• Cliente final\
• IA Vendedora\
• Vendedor humano\
• Operacional

Pré-condições\
• Plano com acesso ao módulo Pedidos\
• Catálogo de produtos/serviços configurado

Fluxo Principal - Criação de Pedido:

Passo 1: Identificação da Necessidade\
Cliente expressa intenção de compra via WhatsApp. IA identifica
produtos/serviços de interesse.

Passo 2: Montagem do Pedido\
IA ou atendente adiciona itens:\
• Produto/serviço do catálogo\
• Quantidade\
• Variações (se aplicável)\
• Observações

Passo 3: Cálculo\
Sistema calcula automaticamente:\
• Subtotal por item\
• Total do pedido\
• Descontos aplicáveis\
• Prazo de entrega

Passo 4: Apresentação ao Cliente\
Pedido é apresentado para confirmação via WhatsApp.

Passo 5: Confirmação e Pagamento\
Cliente confirma e método de pagamento é definido:\
• Dinheiro na entrega\
• PIX\
• Cartão (via link de pagamento)\
• Faturado

Passo 6: Registro\
Pedido é criado com status inicial e timeline iniciada.

Passo 7: Acompanhamento\
Status do pedido é atualizado:\
• Novo → Em preparação → Pronto → Em entrega → Entregue

Fluxo Alternativo - Cancelamento:\
Pedido pode ser cancelado:\
1. Verificação de estado (apenas antes de \"Pronto\")\
2. Registro de motivo\
3. Estorno (se pago)\
4. Notificação ao cliente

Regras de Negócio Específicas:\
• Preços são obtidos do catálogo\
• Descontos seguem políticas configuradas\
• Pedidos de serviços podem gerar OS automaticamente\
• Timeline é imutável após registro

Integrações com Outros Módulos:\
• Conversas: Origem do pedido\
• CRM: Vinculação com cliente\
• Catálogo: Produtos e preços\
• OS: Conversão para ordem de serviço\
• Financeiro: Registro de entrada\
• Agenda: Agendamento de entrega/instalação

Exemplo Prático:\
Cliente pede pelo WhatsApp uma pizza. A IA pergunta sabores, adiciona ao
pedido, calcula total com taxa de entrega, envia PIX para pagamento,
confirma recebimento, passa para \"Em preparação\", depois \"Saiu para
entrega\", e por fim \"Entregue\", registrando cada etapa na timeline.

## 5.6 OS (Ordem de Serviço)

Objetivo do Módulo\
Gerenciar a execução de serviços técnicos, desde a abertura até o
fechamento, com atribuição de responsáveis, timeline de execução e
integração com agenda e pedidos.

Atores Envolvidos\
• Cliente final\
• IA Atendente\
• Técnico responsável\
• Gestor operacional

Pré-condições\
• Plano com acesso ao módulo OS\
• Tipos de serviço cadastrados\
• Técnicos configurados

Fluxo Principal - Abertura de OS:

Passo 1: Solicitação de Serviço\
Cliente relata problema ou solicita serviço via WhatsApp. IA coleta
informações:\
• Descrição do problema/serviço\
• Local/Endereço\
• Urgência\
• Fotos (se aplicável)

Passo 2: Criação da OS\
Sistema cria OS com:\
• Número sequencial\
• Cliente vinculado\
• Descrição detalhada\
• Prioridade\
• Tipo de serviço

Passo 3: Atribuição\
OS é atribuída a técnico:\
• Manual: Gestor seleciona responsável\
• Automática: Por disponibilidade e especialidade

Passo 4: Execução\
Técnico atualiza status via painel ou WhatsApp:\
• Em deslocamento\
• Em execução\
• Aguardando peça\
• Concluído

Passo 5: Fechamento\
Ao concluir:\
• Descrição do serviço realizado\
• Peças utilizadas\
• Fotos (opcional)\
• Assinatura do cliente (opcional)

Passo 6: Avaliação\
Cliente recebe solicitação de avaliação do serviço.

Fluxo Alternativo - Reagendamento:\
Se não for possível executar:\
1. Motivo é registrado\
2. Novo agendamento proposto\
3. Cliente notificado\
4. Status atualizado

Fluxo Alternativo - OS Rejeitada:\
Se cliente rejeita serviço:\
1. Motivo registrado\
2. OS reaberta\
3. Nova ação planejada\
4. Escalação se necessário

Regras de Negócio Específicas:\
• OS tem prazo de resolução por prioridade\
• Alertas para OS paradas há mais de 24h\
• Peças utilizadas baixam do estoque (se integrado)\
• OS pode gerar pedido de peças adicionais

Integrações com Outros Módulos:\
• Conversas: Origem e comunicação\
• CRM: Vinculação com cliente\
• Agenda: Agendamento de visita\
• Pedidos: Pedidos de peças\
• Financeiro: Registro de custos\
• Alertas: Notificação de atrasos

Exemplo Prático:\
Cliente relata vazamento no banheiro. IA coleta descrição, fotos e
endereço, cria OS de alta prioridade, atribui ao encanador disponível,
agenda visita, técnico registra execução com fotos do reparo, sistema
solicita avaliação do cliente e fecha OS com avaliação 5 estrelas.

## 5.7 Financeiro Simples

Objetivo do Módulo\
Fornecer controle básico de fluxo de caixa, registrando entradas
vinculadas a operações comerciais e permitindo consulta rápida via
painel ou WhatsApp.

Atores Envolvidos\
• Sistema automatizado\
• Gestor financeiro\
• Lojista admin

Pré-condições\
• Plano com acesso ao módulo Financeiro

Fluxo Principal - Registro de Entrada:

Passo 1: Origem da Entrada\
Entradas são geradas automaticamente quando:\
• Pedido é marcado como \"Pago\"\
• OS é fechada com valor\
• Entrada manual é registrada

Passo 2: Registro Automático\
Sistema cria registro com:\
• Data\
• Valor\
• Categoria (Pedido/OS/Outro)\
• Origem (ID do pedido/OS)\
• Descrição automática

Passo 3: Consolidação\
Diariamente o sistema consolida:\
• Total de entradas do dia\
• Comparação com período anterior\
• Projeção mensal

Passo 4: Consulta\
Gestor pode consultar:\
• Por período\
• Por categoria\
• Por origem\
• Via painel ou ERP WhatsApp

Fluxo Alternativo - Entrada Manual:\
Para entradas não vinculadas:\
1. Usuário acessa módulo Financeiro\
2. Clica em \"Nova Entrada\"\
3. Informa valor, data e descrição\
4. Sistema registra

Fluxo Alternativo - Estorno:\
Quando necessário reverter:\
1. Entrada original é identificada\
2. Estorno é registrado como saída\
3. Vinculação mantida\
4. Auditoria preservada

Regras de Negócio Específicas:\
• Entradas não podem ser excluídas, apenas estornadas\
• Valores são sempre positivos\
• Datas retroativas permitidas até 30 dias\
• Fechamento diário irreversível após 7 dias

Integrações com Outros Módulos:\
• Pedidos: Entrada automática\
• OS: Entrada automática\
• ERP WhatsApp: Consultas\
• Relatórios: Dados para dashboards

Exemplo Prático:\
Ao final do dia, o lojista envia \"quanto vendeu hoje\" pelo WhatsApp
para o número do sistema. A IA consulta o módulo financeiro e responde:
\"Hoje você registrou R\$ 2.450,00 em vendas, sendo R\$ 1.800,00 em
pedidos e R\$ 650,00 em serviços. Isso representa 15% a mais que ontem.

## 5.8 Alertas Operacionais

Objetivo: Detectar e notificar eventos operacionais críticos que
requerem atenção humana imediata.

Tipos de Alertas:\
• Cliente Irritado: Sentimento negativo detectado em conversa\
• Lead Quente: Alto potencial de conversão identificado\
• Pedido Parado: Pedido sem atualização há mais de 24h\
• OS Pendente: OS sem andamento há mais de 24h\
• Aprovação Pendente: Agendamento aguardando aprovação\
• Falha de Integração: Erro em webhook ou conexão

Fluxo de Alerta:\
1. Sistema detecta condição\
2. Alerta é criado com severidade\
3. Responsável é notificado (WhatsApp/Notificação)\
4. Alerta aparece no dashboard\
5. Ao resolver, alerta é fechado\
6. Tempo de resposta é registrado

Exemplo Prático: Durante uma conversa, a IA detecta que o cliente está
expressando frustração repetida. O sistema cria um alerta de \"Cliente
Irritado\" com severidade alta, notifica imediatamente o gerente via
WhatsApp interno e destaca a conversa no painel com uma etiqueta
vermelha.

## 5.9 Handoff Humano

Objetivo: Gerenciar a transferência de conversas da IA para atendentes
humanos quando necessário.

Motivos de Handoff:\
• Cliente solicita explicitamente\
• Sentimento crítico detectado\
• IA não consegue responder (baixa confiança)\
• Questão fora do escopo configurado\
• Assunto sensível (reclamação grave)

Fluxo de Handoff:\
1. IA detecta necessidade de handoff\
2. Sistema identifica atendentes disponíveis\
3. Seleciona atendente por regras (setor, carga, habilidade)\
4. Transfere conversa com contexto completo\
5. Notifica atendente\
6. Monitora SLA de resposta\
7. Ao finalizar, atendente pode retornar à IA

Estados do Handoff:\
• Pendente: Aguardando aceitação\
• Em Atendimento: Atendente ativo\
• Resolvido: Concluído com sucesso\
• Escalado: Transferido para supervisor

Exemplo Prático: Cliente expressa que quer \"falar com um humano\". A IA
gentilmente explica que vai transferir, cria handoff, seleciona o
atendente disponível do setor de suporte, transfere a conversa incluindo
todo o histórico, e notifica o atendente com a mensagem: \"Cliente
solicita atendimento humano. Motivo: solicitação direta. Tempo de
espera: 30 segundos.

## 5.10 Base de Conhecimento

Objetivo: Armazenar e organizar informações do negócio para consulta da
IA durante o atendimento.

Categorias de Conteúdo:\
• Catálogo: Produtos e serviços\
• FAQ: Perguntas frequentes\
• Preços: Tabelas de preços\
• Políticas: Políticas de devolução, garantia, etc.\
• Promoções: Ofertas vigentes\
• Operacional: Procedimentos internos

Fontes de Conteúdo:\
• Upload manual (PDF, imagens, textos)\
• Canal de treinamento via WhatsApp\
• URL de site/Instagram (scraping)\
• Digitação direta no painel

Processamento:\
1. Conteúdo é recebido\
2. Classificação automática ou manual\
3. Chunking e embedding para IA\
4. Aprovação pendente (configurável)\
5. Publicação na base

Exemplo Prático: O lojista posta no grupo de treinamento uma imagem do
cardápio do dia. O sistema processa automaticamente, classifica como
\"Cardápio/Promoção\", extrai os textos, cria embeddings para a IA
consultar, e nas próximas conversas, quando clientes perguntarem \"o que
tem hoje\", a IA responderá com os itens do cardápio.

## 5.11 Campanhas

Objetivo: Gerenciar comunicações proativas para clientes, incluindo
prospecção, reativação e pós-venda.

Tipos de Campanhas:\
• Prospecção: Abordagem de leads frios\
• Reativação: Retorno de clientes inativos\
• Pós-venda: Follow-up após compra\
• Promocional: Ofertas e promoções\
• Aniversário: Parabéns e ofertas

Fluxo de Campanha:\
1. Definição de objetivo\
2. Seleção de segmento (critérios)\
3. Criação da mensagem (template)\
4. Agendamento ou disparo imediato\
5. Monitoramento de resultados\
6. Análise de métricas

Métricas Acompanhadas:\
• Taxa de entrega\
• Taxa de abertura\
• Taxa de resposta\
• Conversões geradas\
• Opt-outs

Regras de Negócio:\
• Limite de campanhas por plano\
• Respeito ao horário de silêncio (22h-8h)\
• Opção de descadastro respeitada\
• Intervalo mínimo entre campanhas

Exemplo Prático: O sistema identifica automaticamente clientes que não
compram há 60 dias. O lojista cria uma campanha de reativação com
mensagem personalizada oferecendo 15% de desconto. A campanha é enviada
para 150 clientes segmentados, gerando 45 respostas e 12 vendas
recuperadas.

## 5.12 ERP no WhatsApp

Objetivo: Permitir operação do sistema via comandos de texto no
WhatsApp, proporcionando acesso rápido a informações e ações.

Comandos Disponíveis:\
• \"quanto vendeu hoje/ontem/semana\" - Resumo financeiro\
• \"agenda de amanhã\" - Compromissos agendados\
• \"pedidos pendentes\" - Lista de pedidos abertos\
• \"OS abertas\" - Ordens de serviço ativas\
• \"cria OS para \[cliente\]\" - Abrir nova OS\
• \"novo pedido para \[cliente\]\" - Iniciar pedido

Permissões:\
Cada comando pode ser habilitado/desabilitado para números internos
específicos, permitindo controle granular de quem pode executar cada
ação.

Fluxo de Comando:\
1. Número autorizado envia comando\
2. Sistema identifica remetente e tenant\
3. Valida permissão para o comando\
4. Executa ação correspondente\
5. Retorna resultado formatado

Segurança:\
• Apenas números internos cadastrados podem usar\
• Cada comando tem permissão específica\
• Logs de todos os comandos executados\
• Confirmação para ações destrutivas

Exemplo Prático: O proprietário da oficina envia pelo seu WhatsApp
pessoal: \"quanto vendeu hoje\" para o número da empresa. O sistema
reconhece o número como interno autorizado, consulta o financeiro, e
responde: \"Olá! Hoje tivemos R\$ 3.200,00 em vendas (5 pedidos e 3 OS).
Em comparação com ontem, crescemos 12%.

## 5.13 Equipe e Números Internos

Objetivo: Cadastrar e gerenciar membros da equipe e seus números de
WhatsApp para alertas, handoffs e comandos ERP.

Campos do Cadastro:\
• Nome\
• Número WhatsApp (E.164)\
• Cargo/Função\
• Setor\
• Prioridade para handoff\
• Alertas que recebe\
• Comandos ERP autorizados\
• Horário de disponibilidade

Uso no Sistema:\
• Alertas: Números recebem notificações de eventos\
• Handoff: Seleção de atendente disponível\
• ERP WhatsApp: Autorização para comandos\
• Aprovações: Recebem solicitações de aprovação

Regras de Negócio:\
• Um número só pode estar em uma conta por vez\
• Prioridade define ordem de seleção para handoff\
• Alertas são enviados conforme severidade configurada\
• Disponibilidade é respeitada no handoff

Exemplo Prático: A recepcionista Maria é cadastrada com prioridade 1
para handoffs do setor comercial. Quando um cliente solicita atendimento
humano, Maria é a primeira a receber a notificação. Se não responder em
5 minutos, o sistema escala para o próximo da fila.

## 5.14 Relatórios e Auditoria

Objetivo: Fornecer visão analítica da operação e registro completo de
ações para compliance e diagnóstico.

Tipos de Relatórios:\
• Atendimento: Volume, tempo de resposta, satisfação\
• Vendas: Conversão, ticket médio, produtos\
• Campanhas: Performance, ROI, segmentação\
• Agenda: Ocupação, cancelamentos, no-show\
• IA: Uso de quota, acurácia, handoffs

Auditoria:\
Todo evento relevante é registrado:\
• Login/logout\
• Criação/edição/exclusão de registros\
• Ações da IA\
• Mudanças de configuração\
• Eventos de billing\
• Acessos administrativos

Campos do Log:\
• Timestamp\
• Actor (usuário/sistema/IA)\
• Action type\
• Entity type e ID\
• Before/After (para mudanças)\
• IP address\
• Request ID

Retenção:\
• Logs operacionais: 90 dias\
• Logs financeiros: 5 anos\
• Logs de auditoria: 1 ano\
• Exportação disponível para admin

Exemplo Prático: O admin precisa investigar por que um cliente foi
cobrado incorretamente. Consulta os logs de auditoria filtrando pelo
customer_id, encontra a sequência de eventos, identifica que a IA criou
um pedido duplicado, e documenta o achado para correção e ajuste no
comportamento da IA.

# 6. Painel Admin: Funcionalidades e Fluxos

O Painel Admin é a central de comando da plataforma SaaSWPP AI,
destinado à equipe interna da plataforma. Possui acesso completo a todas
as funcionalidades de governança, incluindo gestão de lojistas,
revendedores, planos, billing, monitoramento e segurança.

## 6.1 Dashboard Global

O Dashboard Global oferece uma visão executiva da saúde da plataforma,
consolidando métricas críticas em tempo real.

Métricas Principais:\
• MRR (Monthly Recurring Revenue): Receita recorrente mensal atual\
• Contas ativas: Número de tenants com status active\
• Trials em andamento: Contas em período de teste\
• Contas em grace period: Contas em período de tolerância\
• Contas suspensas: Contas bloqueadas por inadimplência\
• Churn rate: Taxa de cancelamento mensal

Métricas de Consumo:\
• Consumo de IA por tenant: Ranking de uso\
• Consumo de mensageria: Volume de mensagens\
• Status de integrações: Saúde dos webhooks

Métricas Operacionais:\
• Falhas críticas: Erros que afetam operação\
• Jobs falhos: Tarefas assíncronas com erro\
• Latência média: Tempo de resposta da plataforma\
• Uptime: Disponibilidade do sistema

Como Acessar:\
O Dashboard é a página inicial padrão do Painel Admin. Pode ser acessado
também pelo menu lateral.

Exemplo de Uso:\
O admin verifica o dashboard pela manhã e nota que 15 contas entraram em
grace_period nas últimas 24h. Investiga os motivos e identifica que
houve uma falha no processamento de cobrança da Iugu. Toma ações
corretivas antes que as contas sejam suspensas.

## 6.2 Gestão de Lojistas

A área de Gestão de Lojistas permite administrar todas as contas
clientes da plataforma.

Funcionalidades Disponíveis:\
• Listagem de todos os lojistas com filtros (status, plano, nicho)\
• Busca por nome, e-mail ou CNPJ\
• Visualização de detalhes da conta\
• Edição de dados cadastrais\
• Troca de plano\
• Aplicação/remoção de addons\
• Suspensão manual de conta\
• Reativação de conta suspensa\
• Cancelamento de conta

Detalhes Visíveis por Lojista:\
• Dados da empresa\
• Usuários da conta\
• Números WhatsApp conectados\
• Consumo atual (IA, mensagens)\
• Status da assinatura\
• Histórico de cobrança\
• Alertas técnicos\
• Log de ações

Ações que o Admin Pode Fazer:\
• Forçar reprocessamento de cobrança\
• Estender trial (excepcional)\
• Aplicar desconto manual\
• Resetar senha de usuário\
• Desconectar WhatsApp remotamente\
• Aplicar créditos de IA extra

Exemplo de Uso:\
Um lojista entra em contato com suporte alegando que foi cobrado em
duplicidade. O admin acessa a gestão de lojistas, localiza a conta pelo
CNPJ, verifica o histórico de cobrança, confirma a duplicidade e emite
estorno manual via Iugu.

## 6.3 Gestão de Revendedores

A área de Gestão de Revendedores administra os parceiros comerciais da
plataforma.

Funcionalidades Disponíveis:\
• Cadastro de novos revendedores\
• Listagem com filtros (status, faixa, performance)\
• Configuração de comissão por revendedor\
• Definição de faixas progressivas\
• Visualização de carteira de lojistas\
• Acompanhamento de conversão\
• Análise de inadimplência da carteira\
• Histórico de comissões pagas\
• Ativação/desativação de parceiro

Métricas por Revendedor:\
• Total de leads gerados\
• Taxa de conversão trial → pago\
• MRR da carteira\
• Comissão acumulada\
• Faixa atual de comissão\
• Meta para próxima faixa\
• Inadimplência da carteira

Ações Disponíveis:\
• Ajustar comissão manualmente (excepcional)\
• Reatribuir lojista para outro revendedor\
• Bloquear geração de novos links\
• Suspender comissões futuras\
• Gerar relatório de performance

Exemplo de Uso:\
O admin analisa a performance dos revendedores e identifica que um
parceiro está com alta taxa de inadimplência na carteira. Investiga os
casos, identifica padrão de captação de clientes de baixa qualidade, e
decide reduzir a comissão futura até que a qualidade melhore.

## 6.4 Gestão de Planos

A área de Gestão de Planos permite configurar a oferta comercial da
plataforma.

Configurações por Plano:\
• Nome e descrição\
• Preço por ciclo (mensal/anual)\
• Dias de trial\
• Dias de grace period\
• Política de suspensão\
• Módulos incluídos\
• Addons compatíveis\
• Limites quantitativos (mensagens, contatos, usuários)\
• Recursos bloqueados

Ações Disponíveis:\
• Criar novo plano\
• Editar plano existente\
• Arquivar plano (não aparece para novos)\
• Definir plano como padrão\
• Configurar upgrade/downgrade

Cuidados ao Editar Planos:\
• Mudanças afetam novos clientes imediatamente\
• Clientes existentes mantêm condições antigas\
• Para migrar existentes, usar ferramenta de migração\
• Mudanças de preço requerem campanha de comunicação

Exemplo de Uso:\
A equipe comercial decide lançar um plano intermediário entre Básico e
Profissional. O admin cria o novo plano com preço R\$ 147,00, inclui os
módulos adequados, define limites intermediários, e configura
compatibilidade com addons. O plano fica disponível para novos
cadastros.

## 6.5 Billing / Assinaturas

A área de Billing gerencia todas as assinaturas e cobranças da
plataforma.

Funcionalidades:\
• Visão geral de receita\
• Lista de assinaturas por status\
• Detalhes de cada assinatura\
• Histórico de invoices\
• Gestão de retries\
• Configuração de regras de cobrança\
• Integração com Iugu

Configurações de Billing:\
• Dias de grace period por plano\
• Régua de cobrança (lembretes)\
• Política de suspensão\
• Tentativas de retry\
• Templates de notificação

Monitoramento:\
• Cobranças pendentes\
• Falhas de pagamento recentes\
• Assinaturas prestes a vencer\
• Contas em grace period

Ações Manuais:\
• Processar cobrança avulsa\
• Aplicar desconto\
• Emitir nota fiscal manual\
• Cancelar assinatura\
• Reativar assinatura cancelada

Exemplo de Uso:\
O sistema detecta picos de falha de pagamento em um dia específico. O
admin investiga e descobre que a Iugu teve instabilidade. Usa a função
de retry em massa para reprocessar as cobranças falhas, recuperando a
maioria dos pagamentos.

## 6.6 Comissão / Split

A área de Comissão gerencia o pagamento a revendedores.

Estrutura de Comissões:\
• Faixas progressivas: 20% a 40%\
• Base: 20% para até 10 contas ativas\
• Bronze: 25% para 11-25 contas\
• Prata: 30% para 26-50 contas\
• Ouro: 35% para 51-100 contas\
• Diamante: 40% para 100+ contas

Funcionalidades:\
• Cálculo automático de comissão\
• Visão por competência\
• Aprovação de pagamentos\
• Histórico de splits\
• Ajustes manuais (excepcionais)

Processamento:\
1. No dia 1 de cada mês, sistema calcula comissões\
2. Comissões ficam em \"Pendente aprovação\"\
3. Admin revisa e aprova\
4. Integração bancária processa pagamentos\
5. Status atualizado para \"Pago\"

Exemplo de Uso:\
O admin acessa a área de comissões no início do mês. Revisa o cálculo
automático, verifica se há disputas ou chargebacks a considerar, aplica
ajustes necessários, e aprova o pagamento para todos os revendedores
elegíveis.

## 6.7 Monitoramento

A área de Monitoramento fornece visão técnica da plataforma.

Indicadores:\
• Status das integrações (WhatsApp, Iugu, Meta)\
• Status das instâncias WhatsApp por tenant\
• Latência de resposta\
• Taxa de erro\
• Filas de mensagens\
• Jobs agendados vs. executados

Alertas de Sistema:\
• Falha de webhook\
• Timeout de integração\
• Erro de processamento\
• Quase-falha de infraestrutura

Ações Disponíveis:\
• Reiniciar fila de mensagens\
• Replay de jobs falhos\
• Testar conexão de webhook\
• Verificar saúde de instância

Exemplo de Uso:\
O dashboard de monitoramento mostra que a integração com Evolution API
está com latência alta. O admin investiga, identifica sobrecarga no
servidor de integração, escala recursos e monitora até a normalização.

## 6.8 Segurança e Logs

A área de Segurança gerencia políticas de proteção e acesso.

Funcionalidades:\
• Gestão de usuários admin\
• Política de senhas\
• Rate limits globais\
• IP whitelist/blacklist\
• API keys de integração\
• Rotação de secrets

Logs e Auditoria:\
• Log de acessos admin\
• Log de ações críticas\
• Log de erros de sistema\
• Exportação de logs

Incidentes:\
• Registro de incidentes\
• Análise de causa raiz\
• Ações corretivas

Exemplo de Uso:\
O admin detecta tentativas de login suspeitas de um IP estrangeiro.
Adiciona o IP à blacklist, revisa logs de acesso, confirma que nenhuma
conta foi comprometida, e reforça políticas de autenticação.

# 7. Painel Revendedor: Funcionalidades e Fluxos

O Painel Revendedor é a área do parceiro comercial, focado em aquisição
e gestão de carteira de lojistas. O revendedor não tem acesso a dados
operacionais dos lojistas, apenas a informações comerciais relacionadas
à sua carteira.

## 7.1 Dashboard Comercial

O Dashboard Comercial oferece visão consolidada da performance comercial
do revendedor.

Métricas Principais:\
• Total de leads no funil\
• Trials ativos\
• Conversões do mês\
• MRR da carteira\
• Upgrades realizados\
• Inadimplência da carteira\
• Comissão prevista\
• Comissão acumulada

Comparativos:\
• Performance vs. mês anterior\
• Performance vs. meta\
• Posição no ranking de revendedores

O que o Revendedor Pode Fazer:\
• Visualizar todas as métricas\
• Filtrar por período\
• Exportar relatórios básicos

O que o Revendedor NÃO Pode Fazer:\
• Ver dados operacionais dos lojistas\
• Acessar conversas de clientes\
• Modificar configurações de contas

Exemplo de Uso:\
O revendedor acessa o dashboard e vê que está a 2 conversões de atingir
a faixa Prata (30% de comissão). Foca esforços nos 3 trials que estão
para expirar, oferecendo suporte adicional para converter antes do fim
do mês.

## 7.2 Carteira de Lojistas

A área de Carteira de Lojistas lista todos os clientes vinculados ao
revendedor.

Informações Disponíveis:\
• Nome da empresa\
• Nicho\
• Plano atual\
• Status da assinatura\
• Data de entrada\
• Origem (link/campanha)\
• Último pagamento\
• Risco de churn

Filtros:\
• Por status (ativo, trial, grace, suspenso)\
• Por plano\
• Por nicho\
• Por data de entrada

Ações:\
• Ver detalhes comerciais\
• Iniciar conversa com lojista\
• Sugerir upgrade\
• Registrar interação

O que NÃO Pode Ver:\
• Conversas com clientes finais\
• Dados financeiros detalhados\
• Configurações da conta\
• Performance operacional

Exemplo de Uso:\
O revendedor filtra a carteira por \"grace period\" e identifica 3
lojistas em risco. Entra em contato com cada um para oferecer suporte na
regularização, evitando cancelamentos e mantendo sua comissão.

## 7.3 Trial Links

A área de Trial Links permite criar e gerenciar links de aquisição.

Tipos de Links:\
• Link global: Nicho livre (cliente escolhe)\
• Link por nicho: Nicho pré-definido\
• Link por campanha: Com UTM e tracking específico

Configurações:\
• Nome do link\
• Nicho (se fixo)\
• Trial days override (opcional)\
• Campanha associada\
• UTMs (source, medium, campaign)

Métricas por Link:\
• Cliques\
• Cadastros iniciados\
• Cadastros completos\
• Trials iniciados\
• Conversões

Exemplo de Uso:\
O revendedor cria um link específico para uma campanha em Instagram,
configurando UTMs para rastrear origem. Divulga o link e acompanha em
tempo real quantos cliques resultam em cadastros e conversões.

## 7.4 Funnel

O Funnel mostra a jornada de conversão dos leads do revendedor.

Etapas do Funil:\
• Clique no link\
• Cadastro iniciado\
• Nicho escolhido\
• Onboarding iniciado\
• WhatsApp conectado\
• Trial iniciado\
• Pagamento realizado\
• Conversão completa

Análises:\
• Taxa de conversão por etapa\
• Tempo médio por etapa\
• Abandono por etapa\
• Comparação entre links

Exemplo de Uso:\
O revendedor analisa o funil e identifica que há muita queda na etapa
\"WhatsApp conectado\". Investiga com o suporte e descobre que há
dificuldade técnica para alguns usuários. Solicita melhoria na UX dessa
etapa.

## 7.5 Statement e Comissões

A área de Statement mostra o histórico de comissões do revendedor.

Informações:\
• Competência\
• Base de cálculo\
• Percentual aplicado\
• Valor da comissão\
• Status (previsto/pago)\
• Data de pagamento

Exportação:\
• Extrato em PDF\
• Relatório para imposto de renda

Exemplo de Uso:\
O revendedor acessa o statement para verificar se a comissão do mês
anterior foi paga corretamente. Confere o cálculo baseado nos pagamentos
recebidos dos lojistas e aprova o valor.

## 7.6 Upsell

A área de Upsell identifica oportunidades de upgrade na carteira.

Critérios de Identificação:\
• Uso próximo do limite\
• Crescimento de demanda\
• Nicho com potencial\
• Tempo de casa

Sugestões:\
• Clientes prontos para upgrade\
• Addons recomendados\
• Argumentos de venda

Exemplo de Uso:\
O sistema sugere que 5 clientes do Plano Básico estão usando 90% da cota
de mensagens. O revendedor entra em contato oferecendo upgrade para
Profissional, destacando os benefícios da IA Vendedora e CRM.

# 8. Painel Lojista: Funcionalidades e Fluxos

O Painel Lojista é a central operacional do cliente final da plataforma.
Através dele, o lojista gerencia atendimento, vendas, CRM, agenda,
pedidos, OS, financeiro, equipe e todas as configurações do seu negócio.

## 8.1 Dashboard Operacional

O Dashboard Operacional oferece visão do estado atual do negócio.

Cards Principais:\
• Conversas do dia: Novas e em andamento\
• Leads do dia: Novos leads qualificados\
• Vendas do dia: Total de pedidos fechados\
• Agendamentos: Compromissos do dia\
• Pedidos pendentes: Aguardando ação\
• OS abertas: Ordens em andamento

Indicadores de Atenção:\
• Alertas críticos ativos\
• Follow-ups pendentes\
• Clientes em risco

Status da Conta:\
• Plano atual\
• Uso de quota IA\
• Dias de trial restantes (se aplicável)\
• Status da assinatura

Ações Rápidas:\
• Nova conversa\
• Novo pedido\
• Novo agendamento\
• Ver relatórios

Exemplo de Uso:\
O lojista abre o dashboard pela manhã e vê que há 5 conversas não
respondidas, 2 pedidos pendentes e 3 agendamentos para o dia. Prioriza
as ações e começa a operação.

## 8.2 Central de Conversas

A Central de Conversas é o coração do sistema, onde todo o atendimento
acontece.

Layout de 3 Colunas:

Coluna Esquerda - Lista de Conversas:\
• Filtros: Status, etiqueta, atendente, período\
• Busca por nome ou telefone\
• Indicadores: Mensagens não lidas, status IA/humano\
• Ações em lote: Etiquetar, transferir, encerrar

Coluna Central - Chat Ativo:\
• Histórico de mensagens\
• Indicador de status (IA ativa/humano assumiu)\
• Campo de resposta\
• Respostas rápidas configuráveis\
• Botões de ação: Assumir, Transferir, Handoff

Coluna Direita - Contexto:\
• Dados do cliente\
• Lead no CRM (estágio, score)\
• Pedidos relacionados\
• OS relacionadas\
• Agendamentos\
• Notas internas

Funcionalidades:\
• Resposta manual ou delegar para IA\
• Anexar arquivos (imagens, documentos)\
• Enviar mensagens de voz\
• Usar templates salvos\
• Criar pedido/OS/agendamento a partir da conversa

Exemplo de Uso:\
O lojista seleciona uma conversa, vê que a IA está atendendo
normalmente, consulta o contexto do cliente (cliente recorrente com
histórico de compras) e decide intervir para oferecer um upgrade
personalizado.

## 8.3 CRM

O módulo CRM gerencia leads, clientes e oportunidades.

Pipeline Visual:\
Estágios configuráveis com arrastar-e-soltar:\
• Novo → Em contato → Qualificado → Proposta → Negociação →
Ganho/Perdido

Lista de Leads:\
• Nome, telefone, e-mail\
• Estágio atual\
• Score de qualificação\
• Valor estimado\
• Tags\
• Última interação

Ações:\
• Criar lead manual\
• Importar lista (CSV)\
• Exportar dados\
• Atribuir a vendedor\
• Agendar follow-up\
• Enviar mensagem

Automações:\
• Follow-up automático por estágio\
• Alerta de lead parado\
• Sugestão de próxima ação pela IA

Exemplo de Uso:\
O lojista acessa o CRM, vê que há 5 leads no estágio \"Proposta\" há
mais de uma semana. Usa a função de enviar mensagem em massa para esses
leads, oferecendo condições especiais para fechar.

## 8.4 Agenda

O módulo Agenda gerencia compromissos e disponibilidade.

Visões:\
• Dia: Lista horário a horário\
• Semana: Visão de 7 dias\
• Mês: Calendário mensal

Funcionalidades:\
• Criar agendamento manual\
• Ver agendamentos por profissional\
• Identificar conflitos\
• Bloquear horários\
• Configurar horários de funcionamento

Configurações:\
• Modo de aprovação (automático/assistido/manual)\
• Antecedência mínima\
• Intervalos entre compromissos\
• Tempo de tolerância

Integrações:\
• Acessar conversa do cliente\
• Criar OS associada\
• Enviar lembrete manual

Exemplo de Uso:\
O lojista vê que há um buraco na agenda de 14h às 15h. Usa a função de
buscar clientes com agendamentos futuros e envia proposta de antecipação
de horário para os interessados.

## 8.5 Pedidos

O módulo Pedidos controla vendas e entregas.

Lista de Pedidos:\
• Número, cliente, data\
• Status (Novo, Em preparação, Pronto, Entregue, Cancelado)\
• Valor total\
• Origem (IA/Humano/Manual)

Detalhes do Pedido:\
• Itens com quantidades e preços\
• Descontos aplicados\
• Forma de pagamento\
• Endereço de entrega (se aplicável)\
• Observações\
• Timeline de status

Ações:\
• Criar pedido manual\
• Editar pedido (se permitido)\
• Cancelar pedido\
• Imprimir comanda\
• Gerar link de pagamento\
• Atualizar status

Exemplo de Uso:\
O lojista recebe um pedido via IA para 3 pizzas. Acessa o pedido,
confirma os itens, adiciona observação sobre retirada, imprime comanda
para a cozinha e atualiza status para \"Em preparação\".

## 8.6 OS (Ordem de Serviço)

O módulo OS gerencia ordens de serviço técnico.

Lista de OS:\
• Número, cliente, data\
• Status (Aberta, Em execução, Aguardando, Concluída)\
• Prioridade (Baixa, Normal, Alta, Urgente)\
• Técnico atribuído

Detalhes da OS:\
• Descrição do problema/serviço\
• Endereço\
• Fotos anexadas\
• Peças utilizadas\
• Tempo de execução\
• Valor cobrado\
• Timeline completa

Ações:\
• Abrir nova OS\
• Atribuir técnico\
• Atualizar status\
• Adicionar fotos\
• Registrar peças\
• Fechar OS\
• Solicitar avaliação

Exemplo de Uso:\
Um técnico recebe notificação de nova OS atribuída. Acessa os detalhes,
vê o endereço e descrição do problema, segue para o local, executa o
serviço, tira foto do resultado e fecha a OS via WhatsApp.

## 8.7 Financeiro

O módulo Financeiro oferece controle simples de fluxo de caixa.

Visões:\
• Dia: Entradas do dia atual\
• Semana: Acumulado da semana\
• Mês: Acumulado do mês

Informações:\
• Total de entradas\
• Comparação com período anterior\
• Origem (Pedidos, OS, Manual)\
• Gráfico de evolução

Ações:\
• Registrar entrada manual\
• Ver detalhes por origem\
• Exportar relatório

ERP no WhatsApp:\
O lojista pode consultar via WhatsApp:\
• \"quanto vendeu hoje\"\
• \"extrato da semana\"\
• \"resumo do mês\"

Exemplo de Uso:\
Ao final do dia, o lojista acessa o financeiro e vê que faturou R\$
2.500,00, sendo R\$ 1.800 em pedidos e R\$ 700 em serviços. Compara com
a média do mês e planeja ações para melhorar.

## 8.8 Campanhas

O módulo Campanhas gerencia comunicações proativas.

Tipos:\
• Prospecção: Abordar novos leads\
• Reativação: Trazer clientes inativos\
• Pós-venda: Follow-up após compra\
• Promocional: Ofertas especiais

Criação de Campanha:\
1. Definir objetivo\
2. Selecionar segmento (filtros)\
3. Escrever mensagem (ou usar template)\
4. Agendar ou disparar imediatamente\
5. Acompanhar resultados

Métricas:\
• Enviadas\
• Entregues\
• Lidas\
• Respondidas\
• Conversões

Exemplo de Uso:\
O lojista cria uma campanha de reativação para clientes que não compram
há 60 dias. Segmenta 150 clientes, personaliza a mensagem com nome e
último pedido, oferece 15% de desconto, e acompanha os 45 que
responderam.

## 8.9 IA

O módulo IA permite configurar o comportamento da inteligência
artificial.

Configurações Disponíveis:\
• Tom de voz (formal/informal/neutro)\
• Nível de formalidade\
• Horário de funcionamento da IA\
• Autonomia (respostas simples/negociações/handoff)\
• Política de handoff

Regras de Venda:\
• Descontos máximos permitidos\
• Produtos que pode oferecer\
• Prazos que pode prometer\
• Condições de pagamento aceitas

Temas Proibidos:\
• Assuntos que a IA não deve tratar\
• Palavras-chave que acionam handoff

Escopo:\
• O que a IA pode fazer sozinha\
• O que requer aprovação humana\
• O que é exclusivamente humano

Exemplo de Uso:\
O lojista configura a IA para usar tom informal, permitir descontos de
até 10%, oferecer apenas produtos do catálogo, e transferir
automaticamente para humano quando o cliente mencionar \"reclamação\" ou
\"problema\".

## 8.10 Base de Conhecimento

O módulo Base de Conhecimento armazena informações para a IA consultar.

Categorias:\
• Catálogo: Produtos e serviços\
• FAQ: Perguntas frequentes\
• Preços: Tabelas de preços\
• Políticas: Termos e condições\
• Promoções: Ofertas vigentes\
• Operacional: Procedimentos

Formas de Adicionar:\
• Upload de PDF/imagem\
• Digitação manual\
• Link de site/Instagram\
• Canal de treinamento via WhatsApp

Status:\
• Rascunho: Em edição\
• Pendente: Aguardando aprovação\
• Ativo: Disponível para IA\
• Arquivado: Não utilizado

Exemplo de Uso:\
O lojista posta no grupo de treinamento uma foto do cardápio do dia e um
PDF com a tabela de preços atualizada. O sistema processa
automaticamente e a IA passa a usar essas informações nas conversas.

## 8.11 Alertas

O módulo Alertas centraliza notificações de eventos críticos.

Tipos de Alertas:\
• Cliente irritado: Sentimento negativo detectado\
• Lead quente: Alto potencial de conversão\
• Pedido parado: Sem atualização há 24h+\
• OS pendente: Sem andamento há 24h+\
• Aprovação pendente: Aguardando sua ação

Severidades:\
• Baixa: Informação\
• Normal: Atenção\
• Alta: Ação necessária\
• Crítica: Urgente

Ações:\
• Ver detalhes do alerta\
• Ir para conversa relacionada\
• Marcar como resolvido\
• Atribuir para outro usuário

Exemplo de Uso:\
O lojista recebe um alerta de \"Cliente irritado\" com severidade alta.
Clica para ver detalhes, é direcionado para a conversa, assume o
atendimento e resolve a situação antes que escale.

## 8.12 Equipe

O módulo Equipe gerencia membros e números internos.

Cadastros:\
• Nome\
• WhatsApp\
• Cargo\
• Setor\
• Prioridade para handoff\
• Alertas que recebe\
• Permissões de ERP

Usuários do Sistema:\
• Criar novo usuário\
• Definir papel/permissões\
• Resetar senha\
• Desativar acesso

Números Internos:\
• Cadastrar para alertas\
• Autorizar comandos ERP\
• Definir disponibilidade

Exemplo de Uso:\
O lojista cadastra sua recepcionista como número interno para receber
alertas de cliente irritado e handoffs. Configura que ela pode usar
comandos de agenda mas não de financeiro.

## 8.13 Integrações

O módulo Integrações gerencia conexões externas.

WhatsApp:\
• Ver status da conexão\
• Reconectar se necessário\
• Ver QR Code\
• Desconectar

Iugu:\
• Ver status da integração\
• Atualizar dados de pagamento

Meta Créditos:\
• Ver saldo\
• Ver consumo\
• Configurar alerta de saldo baixo

Webhooks:\
• Configurar URLs de saída\
• Testar webhook\
• Ver logs de envio

Exemplo de Uso:\
O lojista percebe que o WhatsApp está desconectado. Acessa Integrações,
escaneia o QR Code novamente e restabelece a conexão em menos de 1
minuto.

## 8.14 Assinatura

O módulo Assinatura gerencia o plano e cobrança.

Informações:\
• Plano atual\
• Status da assinatura\
• Valor mensal\
• Data de vencimento\
• Dias de trial restantes\
• Dias de grace period restantes

Ações:\
• Fazer upgrade de plano\
• Adicionar addon\
• Ver histórico de invoices\
• Baixar fatura atual\
• Atualizar forma de pagamento\
• Regularizar pendência

Upgrade:\
• Ver planos disponíveis\
• Calcular diferença proporcional\
• Confirmar upgrade\
• Pagar diferença (se aplicável)

Exemplo de Uso:\
O lojista está no plano Básico e percebe que precisa do CRM. Acessa
Assinatura, solicita upgrade para Profissional, vê o valor proporcional,
confirma e a mudança é aplicada imediatamente.

# 9. Integrações e Webhooks

## 9.1 WhatsApp (Evolution e Meta)

O sistema integra com WhatsApp através de duas vias:

Evolution API (Não Oficial):\
Utilizada para automação de atendimento em larga escala.\
• Conexão via QR Code\
• Envio e recebimento de mensagens\
• Suporte a mídias (imagens, vídeos, documentos)\
• Webhooks de eventos (mensagem recebida, enviada, lida)

Meta Cloud API (Oficial):\
Utilizada para mensageria oficial com créditos.\
• Conexão via token de negócio\
• Templates aprovados pela Meta\
• Cobrança por conversação\
• Maior confiabilidade e suporte oficial

Fluxo de Mensagem:\
1. Cliente envia mensagem\
2. Webhook recebe no sistema\
3. Tenant é identificado pelo número destinatário\
4. IA processa e gera resposta\
5. Resposta é enviada via API

Considerações:\
• Número pode usar apenas uma API por vez\
• Troca de API requer reconexão\
• Meta API tem custos por conversação\
• Evolution API pode sofrer instabilidades

## 9.2 Pagamentos (Iugu)

O sistema integra com Iugu para gestão de assinaturas e cobranças.

Funcionalidades:\
• Criação de assinaturas recorrentes\
• Geração de invoices\
• Processamento de pagamentos (PIX, boleto, cartão)\
• Gestão de clientes\
• Webhooks de eventos

Eventos Monitorados:\
• invoice.created: Nova fatura criada\
• invoice.paid: Pagamento confirmado\
• invoice.payment_failed: Falha no pagamento\
• invoice.due: Fatura vencida\
• subscription.created: Nova assinatura\
• subscription.suspended: Assinatura suspensa\
• subscription.activated: Assinatura reativada

Fluxo de Cobrança:\
1. Sistema cria assinatura na Iugu\
2. Iugu gera invoice conforme ciclo\
3. Webhook notifica eventos\
4. Sistema atualiza status internamente\
5. Ações automáticas são executadas

Configuração:\
• API Key: Configurada no admin\
• Webhook URL: Endpoint do sistema\
• Métodos: PIX, Boleto, Cartão

## 9.3 IA Providers

O sistema utiliza pool de provedores de IA com fallback automático.

Provedores Suportados:\
• OpenAI (GPT-4, GPT-3.5)\
• Anthropic (Claude)\
• Google (Gemini)\
• Provedores locais (quando configurado)

Estratégia de Fallback:\
1. Requisição enviada para provedor primário\
2. Se timeout ou erro, tenta secundário\
3. Se falhar, tenta próximo da lista\
4. Registra evento para monitoramento

Configurações por Tenant:\
• Modelo preferido\
• Temperatura\
• Max tokens\
• Custo por token

Quota Management:\
• Contador mensal por tenant\
• Alertas em 80% e 100%\
• Pausa automática ao exceder\
• Opção de compra extra

## 9.4 Webhooks de Saída

O sistema pode enviar webhooks para integração com sistemas externos.

Eventos Disponíveis:\
• conversation.created: Nova conversa iniciada\
• conversation.message: Nova mensagem\
• conversation.closed: Conversa encerrada\
• lead.created: Novo lead criado\
• lead.converted: Lead convertido\
• order.created: Novo pedido\
• order.updated: Pedido atualizado\
• os.created: Nova OS\
• os.updated: OS atualizada\
• appointment.created: Novo agendamento\
• appointment.updated: Agendamento alterado

Formato do Payload:\
{\
\"event\": \"order.created\",\
\"timestamp\": \"2026-03-17T10:30:00Z\",\
\"tenant_id\": \"abc123\",\
\"data\": {\
\"id\": \"order_456\",\
\"customer\": {\...},\
\"items\": \[\...\],\
\"total\": 150.00\
},\
\"signature\": \"sha256_hash\"\
}

Configuração:\
• URL de destino\
• Eventos selecionados\
• Secret para assinatura\
• Timeout\
• Tentativas de retry

# 10. Casos de Borda e Tratamento de Erros

## 10.1 Falhas de Conectividade

Cenário: WhatsApp desconectado durante operação\
Comportamento:\
• Sistema detecta desconexão via webhook\
• Alerta é criado e notificado ao lojista\
• Mensagens recebidas durante a queda são recuperadas ao reconectar\
• IA é pausada automaticamente\
• Histórico não é perdido

Cenário: API de IA indisponível\
Comportamento:\
• Fallback automático para provedor secundário\
• Se todos falharem, handoff automático para humano\
• Log de incidente registrado\
• Alerta para admin da plataforma

## 10.2 Conflitos de Dados

Cenário: Agendamento em horário já ocupado\
Comportamento:\
• Sistema bloqueia conflito antes de confirmar\
• Oferece horários alternativos próximos\
• Se conflito for detectado após criação, alerta é gerado

Cenário: Cliente duplicado\
Comportamento:\
• Sistema detecta duplicidade por telefone\
• Oferece opção de mesclar registros\
• Histórico de ambos é preservado

## 10.3 Exceções de Negócio

Cenário: Cliente solicita cancelamento de pedido já enviado\
Comportamento:\
• Sistema verifica estado atual\
• Se já em entrega, oferece opção de devolução\
• Registra motivo e processo de retorno\
• Notifica partes envolvidas

Cenário: Reclamação grave de cliente\
Comportamento:\
• IA detecta gravidade automaticamente\
• Handoff imediato para humano\
• Alerta de alta severidade criado\
• Gerente é notificado automaticamente

Cenário: Tentativa de agendamento fora do horário\
Comportamento:\
• Sistema informa horários válidos\
• Oferece próxima disponibilidade\
• Não permite criação de agendamento inválido

## 10.4 Erros de Sistema

Cenário: Falha no processamento de webhook\
Comportamento:\
• Evento é enfileirado para retry\
• Tentativas com backoff exponencial\
• Após 5 falhas, vai para Dead Letter Queue\
• Alerta para admin da plataforma

Cenário: Timeout de operação\
Comportamento:\
• Operação é cancelada após timeout configurado\
• Usuário recebe mensagem de erro amigável\
• Log de timeout registrado\
• Ação pode ser retentada

Cenário: Dados corrompidos\
Comportamento:\
• Validação impede processamento\
• Log detalhado do problema\
• Notificação para equipe técnica\
• Backup pode ser restaurado se necessário

# 11. Glossário

Admin: Usuário com acesso total à plataforma, responsável pela
governança do sistema.

Addon: Módulo adicional que pode ser adquirido separadamente para
complementar um plano.

Grace Period: Período de tolerância após falha de pagamento, onde a
conta permanece parcialmente ativa.

Handoff: Transferência de conversa da IA para atendente humano.

IA (Inteligência Artificial): Sistema de processamento de linguagem
natural que automatiza atendimento e operações.

Lead: Potencial cliente que demonstrou interesse mas ainda não
converteu.

Lojista: Cliente pagante da plataforma, dono de uma conta de negócio.

MRR: Monthly Recurring Revenue, receita recorrente mensal.

Nicho: Segmento de mercado com configurações específicas de linguagem e
operação.

OS: Ordem de Serviço, registro de execução de trabalho técnico.

Pipeline: Visualização do funil de vendas com estágios de negociação.

RBAC: Role-Based Access Control, controle de acesso baseado em papéis.

Revendedor: Parceiro comercial que indica clientes e recebe comissão.

SaaS: Software as a Service, modelo de software oferecido como serviço.

Tenant: Conta isolada dentro da plataforma multi-tenant.

Trial: Período de teste gratuito antes da cobrança.

Webhook: Notificação automática enviada para URL externa quando um
evento ocorre.

Zero-Touch Onboarding: Processo de cadastro completamente automatizado
sem intervenção manual.
