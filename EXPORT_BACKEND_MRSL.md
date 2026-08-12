# MR SEM LIMITES — BACKEND MASTER EXPORT (v2.3.3)

Este documento contém a estrutura consolidada para sincronização com o motor de injeção v17.0.

## 1. Lógica de Validação de Licença (v2)
A lógica principal reside em `src/routes/api/public/ext/functions.v1.validate-license-v2.ts`.

## 2. Sistema de Chaves (Formato MR)
As chaves seguem o padrão `MR-XXXX-XXXX-XXXX` conforme definido na RPC `public.gerar_chave_licenca`.

## 3. Estrutura de Rotas de API
As rotas estão localizadas em `src/routes/api/public/`.

## 4. Instrução de Sincronização
Para exportação completa via terminal:
```bash
zip -r extension_master_kit.zip src/routes/api/ src/lib/admin/licencas-service.ts supabase/migrations/
```
