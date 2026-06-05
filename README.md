# FormaPro

FormaPro é uma plataforma educacional (LMS - Learning Management System) focada no aprendizado contínuo. Ela permite a gestão e consumo de Cursos, Trilhas de Aprendizagem, Carreiras e Planos de Assinatura, contando com áreas dedicadas tanto para os alunos quanto para os administradores.

## 🚀 Tecnologias Utilizadas

Este projeto foi desenvolvido utilizando as seguintes tecnologias:

- **React.js** (com Vite)
- **TypeScript**
- **React Router DOM** (para roteamento de páginas)
- **Bootstrap 5** & **Bootstrap Icons** (para estilização e ícones)
- **JSON Server** (para simular uma API REST/Banco de dados local)
- **Axios** (para consumo da API)

## 🎯 Principais Funcionalidades

### Área do Aluno
- Visualização do catálogo de cursos, trilhas e carreiras disponíveis.
- Navegação hierárquica (drill-down): possibilidade de explorar os cursos de uma trilha específica e as trilhas de uma carreira diretamente pelo painel.
- Matrícula em cursos individuais, trilhas fechadas ou carreiras inteiras.
- Player de Vídeo moderno com Grade Curricular interativa e separada por Módulos.
- Acompanhamento do progresso de aulas concluídas.

### Área Administrativa
- Gerenciamento completo (CRUD) de Usuários, Categorias, Cursos, Trilhas, Carreiras e Planos.
- Organização do conteúdo do curso (Módulos e Aulas).
- Gestão de matrículas e relacionamentos (Ex: vincular Cursos a Trilhas, Trilhas a Carreiras).

## 🛠️ Como executar o projeto localmente

1. Certifique-se de ter o **Node.js** instalado na sua máquina.
2. Clone o repositório ou baixe os arquivos.
3. Abra um terminal na pasta raiz do projeto.
4. Instale as dependências executando:
   ```bash
   npm install
   ```

5. **Inicie o Banco de Dados (JSON Server):**
   Abra um terminal e execute o comando abaixo para iniciar a API simulada na porta 3001:
   ```bash
   npm run server
   ```
   *Nota: O banco de dados consome o arquivo `db.json` localizado na raiz do projeto.*

6. **Inicie a Aplicação Frontend:**
   Abra **outro** terminal e execute:
   ```bash
   npm run dev
   ```

7. Acesse a aplicação no seu navegador pelo endereço fornecido pelo Vite (geralmente `http://localhost:5173`).

---

**Desenvolvido para fins acadêmicos e estudo.**
