# Plan: Repaginação Visual e Funcional do Dashboard "MR Sem Limites"

O objetivo é transformar o dashboard administrativo em uma interface premium, futurista e tecnológico, seguindo fielmente a imagem de referência e a identidade visual solicitada.

## User Review Required

> [!IMPORTANT]
> A sidebar direita contextual será implementada como uma coluna fixa em telas grandes (desktop) e se recolherá automaticamente em telas menores. O conteúdo central será adaptado para o novo layout de 3 colunas.

## Proposed Changes

### Identidade Visual e Tematização
- Atualizar `src/styles.css` com a nova paleta de cores (Preto profundo #03050B, Azul elétrico #145BFF, etc.) e brilhos neon elegantes.
- Refinar fontes (Inter/Manrope) e espaçamentos globais para um visual "compacto e moderno".

### Estrutura de Layout (AppShell)
- Modificar `src/routes/_app.tsx` para implementar a estrutura de 3 colunas:
  - Sidebar Esquerda (204px).
  - Área Central (flexível).
  - Sidebar Direita (238px).
- Garantir responsividade total (sidebar direita vira drawer no mobile).

### Componentes de Interface
- **Sidebar Esquerda:**
  - Adicionar cartão de usuário "MARIO ROGERIO" com avatar futurista e cargo "Ultra Administrador".
  - Agrupar navegação (VISÃO GERAL, COMERCIAL, REVENDA, CONTEÚDO, OPERAÇÃO, SISTEMA).
  - Estilizar item ativo com gradiente e brilho neon.
- **Área Central (Dashboard/Licenças):**
  - Adicionar linha decorativa horizontal com segmentos neon.
  - Criar breadcrumb e título destacado em ciano/azul elétrico.
  - Adicionar botões de ação rápida (Express Trial, Vincular Cliente, + Gerar Licença).
  - Implementar cartões de estatísticas (7 itens responsivos).
  - Criar painel de filtros por período em formato de cápsula.
  - Adicionar marca d'água discreta no fundo da tabela.
  - Implementar elemento decorativo inferior com slogan.
- **Sidebar Direita:**
  - Repetir cartão de usuário.
  - Seções: Saldo de Créditos, Ações Rápidas, Informações da Conta e Cartão Promocional "Seja um Revendedor".

### Funcionalidades e Modais
- Refinar `NovaLicencaModal` para o novo design moderno.
- Implementar o fluxo de "Express Trial (1h)" com envio por WhatsApp/E-mail.

## Technical Details
- **Tech Stack:** React, TypeScript, Tailwind CSS, Lucide Icons.
- **State Management:** TanStack Router e Query permanecem intactos.
- **Responsive Design:** Utilização de CSS Grid e Flexbox para o layout de 3 colunas.
- **Assets:** Uso da logo oficial `mr-sem-limites-logo.png`.

## Validação
- Verificação visual via preview em diferentes viewports.
- Teste de interação nos filtros e abertura de modais.
