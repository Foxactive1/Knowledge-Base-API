from flask import Flask, request, jsonify, render_template
import json
import os

app = Flask(__name__)

# Carregando a base de dados de um arquivo externo
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_FILE = os.path.join(BASE_DIR, 'knowledge_base.json')

try:
    with open(DATABASE_FILE, 'r', encoding='utf-8') as file:
        knowledge_base = json.load(file)
except FileNotFoundError:
    knowledge_base = {}
    print("Arquivo 'knowledge_base.json' não encontrado. Certifique-se de que ele existe.")

# Rota principal com renderização de um template de boas-vindas
@app.route('/')
def home():
    return render_template('index.html')

# Rota para consulta de informações de linguagem

@app.route('/query', methods=['GET'])
def query():
    language = request.args.get('language', '').strip().lower()
    if language in knowledge_base:
        data = knowledge_base[language]
        return render_template('result.html', language=language, data=data)
    else:
        return render_template('404.html'), 404
        

# Página de erro personalizada
@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

# Iniciando o servidor Flask com boas práticas
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)