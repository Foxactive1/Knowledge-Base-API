# Knowledge Base API

Uma API desenvolvida com **Flask** para consulta de informações sobre linguagens de programação. O projeto possui uma base de dados com informações detalhadas sobre linguagens populares, como Python, JavaScript, Java, C++, PHP e Ruby.

## Funcionalidades

- **Consulta de Linguagens**: Obtenha informações como introdução, principais usos, características, frameworks e exemplos de código.
- **Interface Web**: Página inicial simples e rota personalizada para erros 404.
- **Base de Dados JSON**: Facilidade de manutenção e expansão.

## Tecnologias Utilizadas

- **Python**: 3.12 ou superior
- **Flask**: Framework para desenvolvimento da API
- **HTML**: Templates para a interface web

## Estrutura do Projeto

```plaintext
├── app.py              # Código principal da aplicação Flask
├── knowledge_base.json # Base de dados das linguagens de programação
├── templates/          # Diretório para os templates HTML
│   ├── index.html      # Página inicial da aplicação
│   └── 404.html        # Página de erro 404 personalizada
└── README.md           # Documentação do projeto

Como Executar o Projeto

1. Clone o Repositório:

git clone https://github.com/SEU_USUARIO/knowledge-base-api.git
cd knowledge-base-api


2. Crie um Ambiente Virtual:

python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate


3. Instale as Dependências:

pip install flask


4. Execute a Aplicação:

python app.py


5. Acesse no Navegador:

Página inicial: http://127.0.0.1:5000

Consulta de linguagem: http://127.0.0.1:5000/query?language=python




Exemplo de Uso

Consulta de uma linguagem (Python):

GET /query?language=python

Resposta (JSON):

{
    "intro": "Python é uma linguagem de programação de alto nível, ideal para automação, IA, análise de dados e desenvolvimento web.",
    "principais_usos": ["Desenvolvimento Web (Django, Flask)", "Ciência de Dados (Pandas, NumPy)", "Machine Learning (TensorFlow, PyTorch)", "Automação e Scripting", "Desenvolvimento de APIs"],
    "caracteristicas": {
        "tipagem": "Dinâmica e forte",
        "paradigma": ["Orientado a Objetos", "Funcional", "Imperativo"],
        "gerenciador_pacotes": "pip",
        "versao_atual": "3.12"
    },
    "frameworks": {
        "web": ["Django", "Flask", "FastAPI"],
        "data_science": ["Pandas", "NumPy", "Matplotlib"],
        "ml": ["TensorFlow", "PyTorch", "Scikit-learn"]
    },
    "exemplos": {
        "hello_world": "print('Hello, world!')",
        "loop": "for i in range(5): print(f'Número {i}')",
        "funcao": "def soma(a, b): return a + b"
    }
}

Contribuindo

Contribuições são bem-vindas! Siga os passos abaixo para colaborar:

1. Faça um fork do projeto.


2. Crie uma nova branch:

git checkout -b minha-feature


3. Faça suas alterações e envie um pull request.



Licença

Este projeto é mantido por Dione Castro Alves e é parte da marca InNovaIdeia Assessoria em Tecnologia ®. Todos os direitos reservados.

Contato

LinkedIn: InNovaIdeia

E-mail: innovaideia2023@gmail.com

GitHub: Foxactive1


Caso precise de alterações específicas ou complementos no `README.md`, é só avisar!

