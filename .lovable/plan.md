# Plano de Repaginação e Correção Estrutural MR SEM LIMITES

Este plano foca na correção da arquitetura do layout (AppShell), padronização da identidade visual com a logo oficial e implementação de marca d'água premium, conforme solicitado.

## 1. Correção da Arquitetura do Layout (AppShell)
- **Problema:** Sidebar sobrepondo o conteúdo em desktop.
- **Solução:** Refatorar `src/routes/_app.tsx` para usar uma estrutura de grid ou flex que garanta que o `main` ocupe apenas o espaço restante, sem sobreposição.
- **Estados:** Garantir transições suaves entre os estados expandido (260px) e recolhido (80px).
- **Responsividade:** Sidebar fixa em telas grandes, drawer em mobile.

## 2. Padronização da Identidade Visual (Logo Oficial)
- **Centralização:** Usar o componente `BrandLogo` que consome a logo oficial enviada (`mr-sem-limites-logo.png`).
- **Aplicações:** Inserir a logo na Sidebar (topo), Topbar (assinatura), Login e Dashboard.
- **Marca d'água:** Implementar `BrandWatermark` com baixa opacidade (3%) fixa no fundo das áreas internas, sem interferir na usabilidade.

## 3. Componentização Global (Padronização)
- Criar/Refinar componentes base para evitar desalinhamentos futuros:
  - `PageContainer`: Padrão de padding e largura para todas as páginas.
  - `BrandLogo` & `BrandWatermark`: Única fonte de verdade para a marca.
  - `ResponsiveGrid`: Grid padronizado para dashboards e listas.

## 4. Revisão de Páginas Críticas
- **Dashboard:** Ajustar grid de cards e banners para evitar cortes.
- **Biblioteca/Aulas:** Garantir que o conteúdo não comece atrás da sidebar.
- **Configurações/Perfil:** Padronizar headers e containers.

## Detalhes Técnicos
- **CSS:** Uso de `grid-template-columns` no AppShell: `[sidebar-width] 1fr`.
- **Z-Index:** Background (negativo) < Watermark (z-[-1]) < Conteúdo (z-0) < Sidebar/Header (z-30+).
- **Imagens:** Todas as logos usarão `object-fit: contain` e preservarão o aspect-ratio original.
- **Performance:** Watermark otimizada como uma única imagem fixa com opacidade via CSS.
