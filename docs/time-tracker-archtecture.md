# Arquitetura de Time Tracking (Rastreamento de Horas)

## 1. Visão Geral
O sistema de rastreamento de horas do PGI-PROA é dividido em duas camadas para garantir precisão e evitar perda de dados:
1. **Rastreamento Bruto (Time Sessions):** Registra os cliques de Play e Pause em tempo real.
2. **Histórico Consolidado (Time Logs):** O registro oficial e auditável (Relatório) do que foi feito, gerado ao clicar em Stop.

---

## 2. Lógica de Interface (UI/UX)

A interface utiliza três botões de controle de mídia, com cores semânticas claras:

*   🟢 **Play (Verde):** 
    *   **Visibilidade:** Sempre visível quando o timer está parado ou pausado.
    *   **Ação:** Cria uma nova `TimeSession` no banco com `endTime = null`.
*   🟠 **Pause (Laranja):**
    *   **Visibilidade:** Só aparece quando o timer está ativamente rodando (Play foi acionado).
    *   **Ação:** Atualiza a `TimeSession` atual preenchendo o `endTime`. O tempo fica "em repouso", pronto para ser retomado com um novo Play ou finalizado com o Stop.
*   🔴 **Stop (Vermelho):**
    *   **Visibilidade:** Aparece se existir *qualquer* tempo acumulado não consolidado (seja rodando ou pausado).
    *   **Ação:** Se estiver rodando, faz um "Pause" automático em background. Em seguida, abre a `RegistrarHorasSheet`. 
    *   **Automação:** O formulário já vem pré-preenchido com a soma do tempo acumulado, a data e a tarefa. O usuário só precisa escolher a `Natureza` e escrever o `Relato`.

---

## 3. Modelo de Dados

### `TimeSession` (As "Fatias" de Tempo)
Responsável por salvar o estado no banco e garantir que o tempo não se perca se o usuário fechar a aba do navegador.
*   `startTime`: Data/Hora exata do clique no Play.
*   `endTime`: Data/Hora exata do clique no Pause/Stop.
*   `isConsolidated`: Flag que indica se esta fatia de tempo já virou um Log oficial.

### `TimeLog` (O Histórico Oficial)
A tabela que alimenta relatórios, painéis de gestão e o campo de "Total de Horas" da Tarefa.
*   Recebe os dados do formulário (`RegistrarHorasSheet`).
*   Agrupa várias `TimeSessions` em uma única entrada narrativa.

---

## 4. Fluxo de Execução (Ciclo de Vida)

1. **Início:** Usuário clica em `Play`. Uma `TimeSession` é criada.
2. **Interrupção:** Usuário clica em `Pause`. A sessão ganha um `endTime`.
3. **Retomada:** Usuário clica em `Play` novamente. Uma *nova* `TimeSession` é criada. (Agora temos duas fatias de tempo para a mesma tarefa).
4. **Fechamento:** Usuário clica em `Stop`. A UI soma o tempo das duas sessões não consolidadas e abre o modal.
5. **Consolidação:** O usuário escreve o relato e clica em "Registrar".
    *   O Backend cria o `TimeLog`.
    *   O Backend marca todas as `TimeSessions` abertas do usuário para aquela tarefa como `isConsolidated = true` (ou as deleta).
    *   A tabela `Task` soma essas horas no seu contador geral.