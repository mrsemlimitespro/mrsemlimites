# MR SEM LIMITES — REPAGINAÇÃO VISUAL PREMIUM (FASE 2)

Finalizar a transição visual para o novo Design System Cyber SaaS, garantindo que o layout seja responsivo ao estado da Sidebar e que todas as telas principais reflitam a nova estética Azul Neon/Ciano.

## Mudanças

### Design System & Layout Base
- **Layout Responsivo (`src/routes/_app.tsx`)**: Ajustar o padding lateral do container principal para variar dinamicamente conforme o estado da Sidebar (Recolhida vs. Expandida).
- **Consistência de Tokens**: Revisar `src/styles.css` para garantir que gradientes e efeitos glassmorphism estejam aplicados globalmente.

### Telas Administrativas & Gestão
- **Painel Admin (`src/routes/admin.index.tsx`)**: Repaginar cards de controle, logs e métricas do sistema seguindo o padrão de design dos KPI Cards do Dashboard.
- **Central de Downloads (`src/routes/_app.baixar-extensao.tsx`)**: Modernizar a visualização das versões, badges de status e o Master Kit ZIP para administradores.

### Componentes Globais
- **Watermark & Rodapé**: Ajustar o rodapé para um visual mais sutil e integrado.
- **Botões Flutuantes**: Refinar os ícones de suporte para não obstruir o conteúdo.

## Detalhes Técnicos
- Utilizar CSS Variables controladas via JS ou classes utilitárias do Tailwind para o layout responsivo.
- Aplicar a utilidade `.glass` e `.glass-strong` em todos os novos containers de dados.
- Garantir contraste adequado em fundos `surface/30` para acessibilidade.
