# CineGames — Catálogo de Filmes e Jogos

## Sobre o projeto

O CineGames é um sistema simples para organizar informações sobre filmes e jogos. Pela página, é possível consultar os títulos cadastrados, pesquisar, filtrar, adicionar novos registros, editar e excluir informações.

O projeto foi desenvolvido como atividade de Programação Web. A ideia foi praticar a comunicação entre uma página web, uma API criada pelo próprio projeto e um banco de dados.

## Tecnologias utilizadas

- HTML, CSS e JavaScript no front-end.
- Node.js e Express no servidor.
- SQLite para guardar os dados.
- Fetch API para a comunicação entre a página e o servidor.

## Como executar

É necessário ter o Node.js instalado (versão 18 ou superior).

1. Baixe ou clone este repositório.
2. Abra a pasta `CineGames` no terminal ou no VS Code.
3. Instale as dependências:

   ```bash
   npm.cmd start
   ```

4. Inicie o servidor:

   ```bash
  npm.cmd install
   ```

5. Abra o navegador no endereço:

   `http://localhost:3000`

Na primeira execução, o sistema cria o arquivo `database/cinegames.db`, monta as tabelas e insere os registros iniciais. Não é necessário criar o banco manualmente.

Para encerrar o servidor, volte ao terminal e pressione `Ctrl + C`.

## Organização das pastas

```text
CineGames/
├── database/
│   └── schema.sql
├── public/
│   ├── app.js
│   ├── index.html
│   └── style.css
├── .gitignore
├── package.json
├── README.md
└── server.js
```

## Banco de dados

Foi escolhido o SQLite porque ele é leve e não precisa de um servidor separado para funcionar. O banco fica salvo em um arquivo dentro da pasta `database`.

Foram criadas duas tabelas:

- `categorias`: guarda o nome e a descrição das categorias.
- `titulos`: guarda nome, tipo, gênero, ano, plataforma, nota, descrição e categoria de cada filme ou jogo.

A tabela `titulos` possui uma relação com `categorias` por meio do campo `categoria_id`. O arquivo `database/schema.sql` cria essa estrutura e insere os dados iniciais.

O SQLite atende ao tamanho e à proposta deste projeto. Uma limitação é que ele pode não ser a melhor escolha caso o sistema passe a ter muitos usuários escrevendo no banco ao mesmo tempo.

## Rotas da API

| Método | Rota | Função |
|---|---|---|
| GET | `/api/titulos` | Lista os títulos |
| GET | `/api/titulos/:id` | Mostra um título específico |
| POST | `/api/titulos` | Cadastra um título |
| PUT | `/api/titulos/:id` | Atualiza um título |
| DELETE | `/api/titulos/:id` | Exclui um título |
| GET | `/api/categorias` | Lista as categorias |
| GET | `/api/relatorios/categorias` | Mostra a quantidade de títulos por categoria |

A listagem também aceita parâmetros:

- `nome`: pesquisa pelo nome. Exemplo: `/api/titulos?nome=matrix`
- `tipo`: filtra por `Filme` ou `Jogo`.
- `categoria_id`: filtra pela categoria.
- `page` e `limit`: controlam a paginação.
- `sort`: ordena por `nome`, `ano`, `nota` ou `tipo`.
- `order`: usa `asc` ou `desc`.

Exemplo:

`http://localhost:3000/api/titulos?tipo=Jogo&page=1&limit=6&sort=nota&order=desc`

## O que o sistema permite fazer

- Listar os filmes e jogos cadastrados.
- Pesquisar pelo nome e filtrar por tipo e categoria.
- Cadastrar, editar e excluir registros.
- Consultar os detalhes de um título.
- Visualizar a quantidade de registros por categoria.
- Manter os dados salvos no banco mesmo depois de fechar a página ou reiniciar o servidor.

O servidor também verifica os campos obrigatórios e impede notas fora do intervalo de 0 a 10.

## Uso de ferramentas de apoio

Foi utilizada uma ferramenta de inteligência artificial como apoio na organização inicial do projeto, na elaboração de partes do código e na revisão das instruções de execução. O código e o funcionamento devem ser conferidos e compreendidos antes da entrega.

## Integrante

- Nome: Athos Gabriel Fernandes Branches
- Curso: Sistemas de Informação
- Disciplina: Programação Web
