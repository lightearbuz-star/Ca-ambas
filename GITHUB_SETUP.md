# Como Criar o Repositório no GitHub

Este documento contém instruções para criar um repositório no GitHub para o projeto **Sistema de Gerenciamento de Caçambas**.

## Opção 1: Criar Repositório via Interface Web do GitHub

1. Acesse [GitHub](https://github.com) e faça login na sua conta `lightearbuz-star`
2. Clique no botão **"+"** no canto superior direito e selecione **"New repository"**
3. Preencha os dados:
   - **Repository name:** `cacamba-manager`
   - **Description:** `Sistema de Gerenciamento de Caçambas - Full Stack Application`
   - **Visibility:** Public ou Private (conforme sua preferência)
   - **NÃO** marque "Initialize this repository with a README"
4. Clique em **"Create repository"**

5. Após criar o repositório, execute os seguintes comandos no terminal:

```bash
cd /home/ubuntu/cacamba_manager_repo
git remote add origin https://github.com/lightearbuz-star/cacamba-manager.git
git branch -M main
git push -u origin main
```

## Opção 2: Criar Repositório via GitHub CLI (Requer Token com Permissões)

Se você tiver um token do GitHub com permissões adequadas:

```bash
cd /home/ubuntu/cacamba_manager_repo
gh repo create cacamba-manager --public --source=. --description="Sistema de Gerenciamento de Caçambas - Full Stack Application" --push
```

## Opção 3: Upload Manual via Interface Web

1. Acesse [GitHub](https://github.com) e crie um novo repositório (passos 1-4 da Opção 1)
2. Na página do repositório criado, clique em **"uploading an existing file"**
3. Arraste o arquivo ZIP do projeto ou selecione os arquivos
4. Adicione uma mensagem de commit: `Initial commit: Sistema de Gerenciamento de Caçambas`
5. Clique em **"Commit changes"**

## Estrutura do Projeto

O projeto contém:
- **client/**: Frontend React com TypeScript
- **server/**: Backend Node.js com Express e tRPC
- **drizzle/**: Schema e migrações do banco de dados
- **shared/**: Código compartilhado entre client e server
- **patches/**: Patches para dependências

## Tecnologias Utilizadas

- **Frontend:** React 19, TypeScript, TailwindCSS, Radix UI
- **Backend:** Node.js, Express, tRPC
- **Banco de Dados:** MySQL com Drizzle ORM
- **Autenticação:** OAuth com Manus
- **Build:** Vite, esbuild
- **Package Manager:** pnpm

## Próximos Passos

Após criar o repositório:

1. Clone o repositório localmente
2. Instale as dependências: `pnpm install`
3. Configure as variáveis de ambiente
4. Execute as migrações do banco de dados: `pnpm db:push`
5. Inicie o servidor de desenvolvimento: `pnpm dev`

---

**Nota:** O repositório Git já foi inicializado localmente em `/home/ubuntu/cacamba_manager_repo` com todos os arquivos commitados.
