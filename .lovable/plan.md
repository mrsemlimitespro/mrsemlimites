# Plano — acesso ultra admin persistente

## Objetivo
Garantir que `Rogeriocftv.mr@gmail.com` entre como ultra admin e permaneça conectado no mesmo dispositivo.

## Ajustes
- Reconhecer o e-mail oficial como administrador também dentro do painel.
- Reaproveitar automaticamente uma sessão válida e evitar pedir a senha administrativa novamente ao ultra admin autenticado.
- Salvar e preencher o e-mail quando “Manter conectado” estiver marcado.
- Preservar a autenticação segura existente, sem guardar senha no navegador.

## Validação
- Confirmar no backend que a conta está ativa, confirmada e possui papel de administrador.
- Testar entrada, redirecionamento ao painel e restauração da sessão após recarregar a página.

## Detalhes técnicos
- Alterações limitadas ao fluxo de login e à proteção do painel administrativo.
- Nenhuma senha será lida, alterada ou armazenada em código.