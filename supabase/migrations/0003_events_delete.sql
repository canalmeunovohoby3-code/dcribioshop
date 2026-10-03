-- Execute este arquivo se você JÁ rodou o 0001_init.sql antes.
-- Adiciona a permissão para o admin apagar métricas (botão "Limpar métricas" no dashboard).

drop policy if exists events_admin_delete on public.events;
create policy events_admin_delete on public.events
  for delete to authenticated
  using (true);
