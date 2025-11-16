# Sistema de Gerenciamento de Caçambas - TODO

## Fase 2: Definição de Requisitos
- [x] Documentar requisitos funcionais e não-funcionais
- [x] Definir modelo de dados completo

## Fase 3: Módulo de Cadastros
- [x] Criar tabelas do banco de dados (motoristas, caminhões, clientes, caçambas)
- [x] Implementar CRUD de motoristas
- [x] Implementar CRUD de caminhões
- [x] Implementar CRUD de clientes
- [x] Implementar CRUD de caçambas
- [ ] Criar interface de listagem com filtros

## Fase 4: Módulo de Pedidos e Rastreamento
- [x] Criar tabela de pedidos
- [x] Implementar CRUD de pedidos
- [ ] Adicionar rastreamento de localização (integração com Google Maps)
- [x] Implementar sistema de prazos de vencimento
- [ ] Criar interface de visualização de pedidos em mapa

## Fase 5: Faturamento e Otimização de Rotas
- [x] Criar tabela de transações (receitas e despesas)
- [x] Implementar CRUD de transações
- [x] Implementar cálculo de faturamento
- [x] Adicionar otimização de rotas (integração com Google Maps Directions)
- [x] Criar interface de gestão de rotas

## Fase 6: Dashboard Gerencial
- [x] Criar dashboard principal
- [x] Implementar gráficos de faturamento (dia, semana, mês, ano)
- [x] Implementar gráficos de despesas (dia, semana, mês, ano)
- [x] Adicionar resumo de KPIs (total ganho, total gasto, lucro)
- [x] Implementar filtros por período
- [ ] Adicionar visualização de pedidos pendentes

## Fase 7: Revisão e Testes
- [ ] Testar todos os módulos
- [ ] Validar integrações com Google Maps
- [ ] Revisar segurança e autenticação
- [ ] Otimizar performance
- [ ] Revisar design e UX

## Fase 8: Entrega
- [ ] Criar checkpoint final
- [ ] Documentar sistema
- [ ] Entregar ao usuário

## Fase 8: Otimizações Baseadas no Manual
- [x] Integração completa com Google Maps (Mapa Operacional)
- [x] Implementar visualização de locações ativas no mapa
- [x] Adicionar clustering de locações para melhor visualização
- [x] Criar página inicial otimizada com status de caçambas
- [x] Implementar sistema de Contas a Receber (Recebido, A Receber, Vencido)
- [x] Implementar sistema de Contas a Pagar (Pago, A Pagar, Vencido)
- [x] Adicionar filtros por fornecedor e datas em Contas a Pagar
- [ ] Implementar geração de arquivo de remessa
- [ ] Adicionar controle de caçambas locadas vs limite do plano
- [x] Melhorar dashboard com resumo de contas a receber/pagar


## Fase 9: Redesenho Conforme Manual Original
- [x] Redesenhar página Home com cards coloridos de status (Não Entregue, Regular, Alerta, Vencido)
- [x] Adicionar botões "NOVO CLIENTE" e "NOVA LOCAçãO" na página Home
- [x] Adicionar botão "Sem Prazo" com contador
- [x] Implementar barra de progresso de caçambas cadastradas
- [x] Redesenhar Mapa Operacional com alternância de visualizações (mapa vazio, com alfinetar, com agrupamento)
- [x] Adicionar botão "ALTERAR TIPO DE MAPA" no Mapa Operacional
- [x] Implementar zoom e pan no mapa


## Fase 10: Sistema de Cadastro via CEP
- [x] Criar componente de busca por CEP
- [x] Integrar geocodificação (Google Geocoder)
- [x] Implementar mapa interativo com pin arrastável
- [x] Adicionar busca de CEP no cadastro de Clientes
- [x] Adicionar busca de CEP no cadastro de Pedidos
- [x] Testar integração com Google Maps


## Bugs Críticos a Corrigir

- [x] BUG 1: Erro ao salvar cliente - Converter limiteCreditoReais para número e melhorar log de erro
- [x] BUG 2: Mapa volta para São Paulo - Usar coordenadas do pedido/cliente, fallback para RJ


## Bugs Críticos Novos

- [x] BUG 3: Pedidos não salvam - Converter tipos de coordenadas e campos opcionais corretamente
- [x] BUG 4: Mapa não mostra localização - Coordenadas não estão sendo persistidas no banco

- [x] BUG 5: CEP volta para SP ao salvar pedido - Coordenadas não estão sendo persistidas corretamente
- [x] BUG 6: Pedido não aparece no Mapa Operacional - Verificar se está sendo salvo no banco

- [x] BUG 7: Geocodificação incorreta - CEP 24905350 (Mangaratiba-RJ) está sendo geocodificado para São Paulo

- [ ] BUG CRÍTICO 8: Coordenadas não sendo persistidas - Pedido aparece em local aleatório no mapa (Av. Júlio Prestes-SP) em vez do CEP configurado
