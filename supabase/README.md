# Painel administrativo — configuração do Supabase

O código já está pronto. Para ativar o painel e as métricas, faça **1 vez** a configuração abaixo.

## 1. Criar as tabelas, políticas e o bucket

No painel do Supabase → **SQL Editor** → **New query**, execute **nesta ordem**:

1. `supabase/migrations/0001_init.sql` — cria `products`, `events`, RLS e o bucket `product-images`.
2. `supabase/migrations/0002_seed_products.sql` — insere os 56 produtos atuais do site (idempotente).

## 2. Variáveis de ambiente

Use a chave **publishable/anon** (pública). Nunca use a `service_role` no front-end.

**Local (`.env.local`):**

```
VITE_SUPABASE_URL=https://bzntclmgobfmfjgpdsfi.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_wJm02jh3HNcywCttyrR9HQ_d58AVzDi
```

**Vercel:** Project → Settings → Environment Variables → adicione as duas variáveis acima e faça um novo deploy.

## 3. Usuário administrador

O administrador é um usuário do Supabase Auth (e-mail + senha).

- Login pedido: `faleconosco@dcribishop.com`.
  Observação: o domínio `dcribishop.com` **não possui registro MX**, e o Supabase recusa o cadastro como e-mail inválido.
- Foi criado o usuário com o domínio correto, que possui MX: **`faleconosco@dcribioshop.com`** (mesma senha `dcribishop@2026`).

Para poder entrar, escolha uma das opções:

- **Confirmar e-mail:** abra o e-mail de confirmação enviado e clique no link; **ou**
- **Confirmação automática:** no Supabase → Authentication → Users → confirme o usuário manualmente; **ou**
- **Criar/confirmar pelo painel:** Authentication → Users → **Add user** → marque *Auto Confirm User*.

## 4. Acesso ao painel

- Login: `https://SEU-SITE/admin`
- Dashboard: `/admin/painel` · Produtos: `/admin/produtos`

Ao salvar qualquer alteração no painel, a tabela `products` é atualizada e o site público passa a exibir os dados novos (com recarregamento/reentrada na aba).
