🚀 Knowledge Base API

https://img.shields.io/badge/python-3.12+-blue.svg
https://img.shields.io/badge/flask-%23000.svg?style=flat&logo=flask&logoColor=white
https://img.shields.io/badge/Status-Active-brightgreen
https://img.shields.io/badge/License-All%20rights%20reserved-red.svg

Uma API desenvolvida com Flask para consulta de informações sobre linguagens de programação. O projeto possui uma base de dados com informações detalhadas sobre linguagens populares, como Python, JavaScript, Java, C++, PHP e Ruby.

---

📋 Índice

· ✨ Funcionalidades
· 🛠 Tecnologias Utilizadas
· 📁 Estrutura do Projeto
· 🚀 Como Executar o Projeto
· 📡 Exemplo de Uso
· 🖼 Preview da Interface
· 🤝 Contribuindo
· 📄 Licença
· 📞 Contato

---

✨ Funcionalidades

· Consulta de Linguagens: Obtenha informações como introdução, principais usos, características, frameworks e exemplos de código.
· Interface Web Amigável: Página inicial simples e rota personalizada para erros 404.
· Base de Dados JSON: Facilidade de manutenção e expansão.
· API RESTful: Endpoints claros e respostas em JSON.

---

🛠 Tecnologias Utilizadas

Tecnologia Descrição
https://img.shields.io/badge/Python-3.12+-3776AB?logo=python&logoColor=white Linguagem principal do backend
https://img.shields.io/badge/Flask-2.3.x-000000?logo=flask&logoColor=white Framework web leve e flexível
https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white Templates para interface web
https://img.shields.io/badge/JSON-Data%20Storage-000000?logo=json&logoColor=white Armazenamento estruturado de dados

---

📁 Estrutura do Projeto

```plaintext
knowledge-base-api/
├── 📄 app.py              # Código principal da aplicação Flask
├── 📄 knowledge_base.json # Base de dados das linguagens de programação
├── 📁 templates/          # Diretório para os templates HTML
│   ├── 📄 index.html      # Página inicial da aplicação
│   └── 📄 404.html        # Página de erro 404 personalizada
├── 📁 static/             # (Opcional) Arquivos estáticos (CSS, imagens)
│   └── 🎨 style.css       # Estilos para a interface
└── 📄 README.md           # Documentação do projeto
```

---

🚀 Como Executar o Projeto

1. Clone o Repositório:

```bash
git clone https://github.com/SEU_USUARIO/knowledge-base-api.git
cd knowledge-base-api
```

2. Crie um Ambiente Virtual:

```bash
python -m venv venv
# No Linux/Mac:
source venv/bin/activate
# No Windows:
venv\Scripts\activate
```

3. Instale as Dependências:

```bash
pip install flask
```

4. Execute a Aplicação:

```bash
python app.py
```

5. Acesse no Navegador:

· 🌐 Página inicial: http://127.0.0.1:5000
· 🔍 Consulta de linguagem: http://127.0.0.1:5000/query?language=python

---

📡 Exemplo de Uso

Consulta de uma linguagem (Python):

```http
GET /query?language=python
```

Resposta (JSON):

```json
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
```

---

🖼 Preview da Interface

Página Inicial

https://via.placeholder.com/800x400/2c3e50/ffffff?text=Knowledge+Base+API+Home+Page

Resultado da Consulta

https://via.placeholder.com/800x400/34495e/ffffff?text=Python+Language+Details+JSON+Response

---

🤝 Contribuindo

Contribuições são bem-vindas! Siga os passos abaixo para colaborar:

1. Faça um fork do projeto.
2. Crie uma nova branch:
   ```bash
   git checkout -b minha-feature
   ```
3. Faça suas alterações e commit:
   ```bash
   git commit -m "Adiciona nova funcionalidade"
   ```
4. Envie para o repositório remoto:
   ```bash
   git push origin minha-feature
   ```
5. Abra um Pull Request.

---

📄 Licença

Este projeto é mantido por Dione Castro Alves e é parte da marca InNovaIdeia Assessoria em Tecnologia ®. Todos os direitos reservados.

---

📞 Contato

· LinkedIn: InNovaIdeia
· E-mail: innovaideia2023@gmail.com
· GitHub: Foxactive1

---

<div align="center">
  <sub>Desenvolvido com ❤️ por <a href="https://github.com/Foxactive1">Foxactive1</a></sub>
</div>
