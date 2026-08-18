# Plano de Correção — Erro de Segurança e Publicação

O erro de segurança relatado durante a publicação no Lovable decorre de problemas na compilação do lado do servidor (SSR), especificamente uma importação quebrada na rota de download que impede o build de completar. Além disso, vamos garantir a conformidade com as políticas de segurança do backend.

## Ações Técnicas

### 1. Correção da Rota de Download (Crítico para Build)
*   **Problema:** O arquivo `src/routes/api/public/download-extensao.ts` tenta importar um asset de um caminho relativo (`../../../../../public/`) que não resolve corretamente durante o build do servidor no TanStack Start.
*   **Solução:** Mover o arquivo de metadados `.asset.json` para `src/assets/` e atualizar o import para usar o alias `@/assets/`, garantindo que o Vite processe o asset corretamente.

### 2. Estabilização do Backend (Extensão Chrome)
*   **CORS:** Manter a política estrita de aceitar apenas `chrome-extension://`, `localhost` e o domínio oficial.
*   **Normalização:** Garantir que todas as rotas usem `normalizeLicenseKey` para evitar falhas de validação por caracteres invisíveis ou formatação.
*   **Chaves MR:** Validar que a função `gerar_chave_licenca` no banco está gerando o formato `MR-XXXX-XXXX-XXXX` corretamente para novos usuários.

### 3. Interface de Download
*   **Sincronização:** Garantir que os links na página "Baixar Extensão" apontem para os novos arquivos corrigidos.
*   **ZIP Master:** Atualizar o ZIP de exportação para incluir as correções de build, permitindo que o usuário migre o projeto com sucesso.

### 4. Verificação de Publicação
*   Após as correções, realizarei um build local para confirmar que o erro "Build unsuccessful" (visto no print do usuário) foi resolvido.

## Detalhes Técnicos (Segurança)
*   As rotas sob `/api/public/ext/` continuam validando `status`, `expira_em` e `hwid` antes de qualquer processamento, mantendo o nível de segurança exigido.
*   O uso de `supabaseAdmin` em funções de servidor está protegido pela arquitetura do TanStack Start, nunca vazando chaves para o cliente.
