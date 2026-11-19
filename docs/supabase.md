# Configurar o Supabase real

Passo a passo para criar o banco de verdade, que o app vai usar no celular. Você faz isso uma vez só. O banco local (no Docker) serve só para desenvolver e testar.

## 1. Criar o projeto

1. Entre em [supabase.com](https://supabase.com) e clique em **New project**.
2. Nome: `pelada-sorteio`. Região: **South America (São Paulo)**. Plano: **Free**.
3. Crie uma senha forte para o banco e guarde num gerenciador de senhas. O app não usa essa senha, mas você pode precisar dela um dia.

## 2. Desligar o cadastro público

Só os 3 admins podem entrar. Ninguém mais pode criar conta.

1. No menu lateral: **Authentication → Sign In / Providers**.
2. Desligue **Allow new users to sign up** e salve.

## 3. Convidar os 3 admins

1. **Authentication → Users → Add user → Send invitation**.
2. Coloque o e-mail de cada admin. Cada um recebe um link para criar a senha.

> O link do convite leva para o endereço do app. Enquanto o app não estiver publicado (parte E), deixe os convites para depois ou ajuste em **Authentication → URL Configuration → Site URL**.

## 4. Mandar as tabelas e regras para o projeto

No terminal, dentro da pasta do projeto:

```bash
npx supabase login                                # abre o navegador para autorizar
npx supabase link --project-ref SEU_PROJECT_REF   # o "ref" está na URL do painel: supabase.com/dashboard/project/SEU_PROJECT_REF
npx supabase db push                              # cria as tabelas e liga as regras de acesso (RLS)
```

O `db push` aplica só os arquivos de `supabase/migrations/`. O `supabase/seed.sql` (admin de teste) **não** vai para o projeto real.

## 5. Ligar o app ao projeto

1. No painel: **Project Settings → API**.
2. Copie a **Project URL** e a chave **anon public**.
3. Na pasta do projeto, crie o arquivo `.env.local` (ele já está fora do git):

```
VITE_SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=cole-a-anon-key-aqui
```

A anon key pode ficar no app: quem protege os dados são as regras de acesso (RLS), que só deixam admins logados lerem e gravarem.

**Nunca copie a chave `service_role`.** Ela passa por cima de todas as regras e não pode ir para o app, para o `.env.local` nem para o git.

## Comandos do dia a dia (banco local)

| Comando | O que faz |
| --- | --- |
| `npm run db:start` | Liga o Supabase local (abra o Docker antes) |
| `npm run db:stop` | Desliga e libera memória do computador |
| `npm run db:reset` | Recria o banco local do zero com as migrações e o admin de teste |
| `npm run db:test` | Testa tabelas e regras de acesso |
| `npm run test:integration` | Testa `src/data/` contra o banco local |
| `npm run db:types` | Atualiza os tipos TypeScript depois de mudar uma migração |
