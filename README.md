# Knowledge Base API

A **Knowledge Base API** é um projeto em Flask que fornece informações detalhadas sobre linguagens de programação. Ele inclui uma interface web responsiva e um backend eficiente para consultas, usando uma base de dados fictícia para exemplos.

## Recursos do Projeto

- **Backend:** Desenvolvido em Flask com rotas para consultas de linguagens.
- **Frontend:** Interface responsiva com Bootstrap 5 para busca e exibição de resultados.
- **Base de Dados:** JSON com informações detalhadas de várias linguagens de programação.
- **Estrutura Amigável:** Suporte para páginas de erro personalizadas (404).
- **Exemplos Práticos:** Demonstrações de código para cada linguagem incluída.

---

## Estrutura do Projeto

```plaintext
project_directory/
├── app.py            # Arquivo principal do Flask
├── templates/
│   ├── index.html    # Página inicial com formulário de busca
│   ├── result.html   # Exibe os resultados da pesquisa
│   ├── 404.html      # Página personalizada para erros
├── static/
│   ├── css/
│   │   └── styles.css   # Estilos personalizados
│   ├── js/
│   │   └── scripts.js   # Scripts opcionais
├── requirements.txt  # Dependências do projeto
├── README.md         # Documentação do projeto


---

Tecnologias Utilizadas

Linguagem: Python 3.10+

Framework Web: Flask

Frontend: HTML5, CSS3, Bootstrap 5

Base de Dados: Estrutura JSON embutida



---

Como Executar o Projeto

1. Clone o Repositório

git clone https://github.com/seu_usuario/seu_repositorio.git
cd seu_repositorio

2. Crie o Ambiente Virtual e Instale Dependências

python -m venv venv
source venv/bin/activate  # Linux/MacOS
venv\Scripts\activate     # Windows
pip install -r requirements.txt

3. Execute o Servidor

python app.py

Acesse a aplicação em: http://127.0.0.1:5000


---

Exemplos de Consulta

Rota Principal

URL: /

Descrição: Página inicial com formulário para buscar informações.


Rota de Consulta

URL: /query?language=python

Método: GET

Descrição: Retorna informações detalhadas sobre a linguagem especificada.



---

Melhorias futuras.

Conexão com um banco de dados real (SQLite ou PostgreSQL).

Inclusão de autenticação para acessar as rotas.

Integração de mais linguagens de programação.

Deploy para um servidor de produção (ex: Heroku ou AWS).



---

Licença

Este projeto foi desenvolvido por Dione Castro Alves e faz parte da InNovaIdeia Assessoria em Tecnologia ®. Uso livre para fins educacionais e estudos.


---

Contato

LinkedIn: InNovaIdeia

E-mail: innovaideia2023@gmail.com

GitHub: Foxactive1
