# Configurar o Supabase real

Passo a passo para criar o banco de verdade, que o app vai usar no celular. Você faz isso uma vez só. O banco local (no Docker) serve só para desenvolver e testar.

## 1. Criar o projeto

1. Entre em [supabase.com](https://supabase.com) e clique em **New project**.
2. Nome: `pelada-sorteio`. Região: **South America (São Paulo)**. Plano: **Free**.
3. Crie uma senha forte para o banco e guarde num gerenciador de senhas. O app não usa essa senha, mas você pode precisar dela um dia.

## 2. Desligar o cadastro público (obrigatório)

A chave pública fica dentro do app. Com o cadastro ligado, qualquer pessoa poderia criar uma conta e mexer nos dados.

1. No menu lateral: **Authentication → Sign In / Providers → Email**.
2. Desligue **Allow new users to sign up** e salve.

## 3. Criar o usuário de acesso (fase de teste)

Na fase de teste a tela de login pede só um **código de acesso**. Por baixo, é a senha de um usuário fixo.

1. **Authentication → Users → Add user → Create new user**.
2. E-mail: `acesso@calangofut.app` (precisa ser exatamente este; está no código, em `src/ui/telas/Login.tsx`).
3. Senha: o código que o grupo vai digitar (mínimo 6 caracteres).
4. Marque **Auto Confirm User** e crie.

Para trocar o código: **Users → acesso@calangofut.app → Reset password** (ou apague e crie de novo com o novo código).

> Depois do teste: convidar os 3 organizadores (**Add user → Send invitation**) e voltar a tela de login com e-mail e senha.

## 4. Mandar as tabelas e regras para o projeto

No terminal, dentro da pasta do projeto:

```bash
npx supabase login                                # abre o navegador para autorizar
npx supabase link --project-ref SEU_PROJECT_REF   # o "ref" está na URL do painel: supabase.com/dashboard/project/SEU_PROJECT_REF
npx supabase db push --remote                     # cria as tabelas e liga as regras de acesso (RLS)
npx supabase migration list --remote              # confira: a coluna Remote deve listar todas as migrações
```

Sem `--remote`, o `db push` vai para o banco local e não toca no projeto real.

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
