from flask import Flask, request, jsonify, render_template, send_from_directory
import json
import os
import logging
from datetime import datetime
from functools import wraps
import uuid
from collections import defaultdict

app = Flask(__name__, static_folder='static', template_folder='templates')

# Configurações para Vercel
app.config['MAX_CONTENT_LENGTH'] = 2 * 1024 * 1024
app.config['SECRET_KEY'] = os.environ.get('FLASK_SECRET', 'vercel-default-secret-key')

# Configuração de logging para serverless
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)

# Base de conhecimento (mantida igual)
def load_knowledge_base():
    return {
        "python": {
            "name": "Python",
            "version": "3.12",
            "description": "Linguagem de alto nível para automação, IA, análise de dados e desenvolvimento web.",
            "typing": "Dinâmica e forte",
            "paradigms": ["OOP", "Funcional", "Imperativo"],
            "package_manager": "pip",
            "popularity_rank": 1,
            "category": "General Purpose",
            "frameworks": ["Django", "Flask", "FastAPI", "PyTorch", "TensorFlow"],
            "use_cases": ["Web Development", "Data Science", "AI/ML", "Automation", "Scientific Computing"],
            "learning_curve": "Beginner-friendly",
            "community_size": "Very Large",
            "job_market": "Excellent",
            "syntax_example": "print('Hello, World!')",
            "icon": "fab fa-python",
            "color": "#3776ab",
            "created_year": 1991,
            "creator": "Guido van Rossum"
        },
        "javascript": {
            "name": "JavaScript",
            "version": "ES2024",
            "description": "Linguagem versátil para desenvolvimento web front-end e back-end (Node.js).",
            "typing": "Dinâmica e fraca",
            "paradigms": ["OOP", "Funcional", "Prototipal"],
            "package_manager": "npm",
            "popularity_rank": 2,
            "category": "Web",
            "frameworks": ["React", "Vue.js", "Angular", "Node.js", "Express"],
            "use_cases": ["Web Development", "Mobile Apps", "Desktop Apps", "Server-side"],
            "learning_curve": "Moderate",
            "community_size": "Very Large",
            "job_market": "Excellent",
            "syntax_example": "console.log('Hello, World!');",
            "icon": "fab fa-js",
            "color": "#f7df1e",
            "created_year": 1995,
            "creator": "Brendan Eich"
        },
        "java": {
            "name": "Java",
            "version": "21",
            "description": "Linguagem robusta e multiplataforma para aplicações empresariais e Android.",
            "typing": "Estática e forte",
            "paradigms": ["Orientado a Objetos"],
            "package_manager": "Maven/Gradle",
            "popularity_rank": 3,
            "category": "Empresarial",
            "frameworks": ["Spring", "Spring Boot", "Hibernate", "Apache Struts"],
            "use_cases": ["Enterprise Applications", "Android Development", "Web Services", "Big Data"],
            "learning_curve": "Moderate to Advanced",
            "community_size": "Very Large",
            "job_market": "Excellent",
            "syntax_example": "System.out.println(\"Hello, World!\");",
            "icon": "fab fa-java",
            "color": "#ed8b00",
            "created_year": 1995,
            "creator": "James Gosling"
        },
        "rust": {
            "name": "Rust",
            "version": "1.75",
            "description": "Linguagem de sistemas focada em segurança, velocidade e concorrência.",
            "typing": "Estática e forte",
            "paradigms": ["Funcional", "Imperativo", "Concorrente"],
            "package_manager": "Cargo",
            "popularity_rank": 4,
            "category": "Systems",
            "frameworks": ["Tokio", "Actix", "Rocket", "Tauri"],
            "use_cases": ["Systems Programming", "WebAssembly", "CLI Tools", "Blockchain"],
            "learning_curve": "Advanced",
            "community_size": "Growing",
            "job_market": "Growing",
            "syntax_example": "println!(\"Hello, World!\");",
            "icon": "fas fa-cog",
            "color": "#dea584",
            "created_year": 2010,
            "creator": "Mozilla Research"
        }
    }

knowledge_base = load_knowledge_base()

# Cache para serverless (em memória, resetado a cada cold start)
cache = {}
cache_timestamps = {}

# Middleware simplificado para Vercel
@app.before_request
def before_request():
    request.start_time = datetime.now()

@app.after_request
def after_request(response):
    duration = datetime.now() - request.start_time
    response.headers['X-Response-Time'] = str(duration.total_seconds())
    response.headers['Access-Control-Allow-Origin'] = '*'
    logging.info(f"{request.method} {request.path} - {response.status} - {duration.total_seconds():.3f}s")
    return response

# Decorator para cache
def cache_response(timeout=300):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            cache_key = f"{request.path}?{request.query_string.decode() if request.query_string else ''}"
            
            if cache_key in cache:
                timestamp = cache_timestamps.get(cache_key, 0)
                if datetime.now().timestamp() - timestamp < timeout:
                    return cache[cache_key]
            
            result = f(*args, **kwargs)
            cache[cache_key] = result
            cache_timestamps[cache_key] = datetime.now().timestamp()
            return result
        return decorated_function
    return decorator

# Rota principal
@app.route('/')
@cache_response(timeout=300)
def home():
    stats = {
        'total_languages': len(knowledge_base),
        'popular_languages': [lang for lang in knowledge_base.values() if lang['popularity_rank'] <= 3],
        'latest_update': datetime.now().isoformat()
    }
    return render_template('index.html', stats=stats, languages=knowledge_base)

# API para buscar linguagem específica
@app.route('/api/language/<language_name>')
@cache_response(timeout=60)
def get_language_details(language_name):
    language = language_name.lower().strip()
    
    if language in knowledge_base:
        data = knowledge_base[language].copy()
        data['query_timestamp'] = datetime.now().isoformat()
        return jsonify({
            "success": True,
            "language": language,
            "data": data
        })
    else:
        return jsonify({
            "success": False,
            "error": f"Linguagem '{language_name}' não encontrada",
            "available_languages": list(knowledge_base.keys())
        }), 404

# API para pesquisa
@app.route('/api/search')
def search_languages():
    query = request.args.get('q', '').strip().lower()
    
    if not query:
        return jsonify({
            "success": False,
            "error": "Parâmetro 'q' é obrigatório"
        }), 400
    
    results = []
    for key, lang in knowledge_base.items():
        if (query in key.lower() or 
            query in lang['name'].lower() or 
            query in lang['description'].lower()):
            results.append({
                'key': key,
                'name': lang['name'],
                'description': lang['description'],
                'popularity_rank': lang['popularity_rank'],
                'category': lang['category']
            })
    
    return jsonify({
        "success": True,
        "query": query,
        "results": results,
        "total_found": len(results)
    })

# API para comparação
@app.route('/api/compare')
def compare_languages():
    languages = request.args.getlist('lang')
    
    if len(languages) < 2:
        return jsonify({
            "success": False,
            "error": "Pelo menos 2 linguagens são necessárias para comparação"
        }), 400
    
    comparison_data = []
    for lang in languages:
        lang_key = lang.lower().strip()
        if lang_key in knowledge_base:
            comparison_data.append(knowledge_base[lang_key])
        else:
            return jsonify({
                "success": False,
                "error": f"Linguagem '{lang}' não encontrada"
            }), 404
    
    return jsonify({
        "success": True,
        "languages": comparison_data,
        "comparison_timestamp": datetime.now().isoformat()
    })

# Rota de query (para formulário HTML)
@app.route('/query')
def query_language():
    language = request.args.get('language', '').lower().strip()
    
    if not language:
        return render_template('index.html', languages=knowledge_base)
    
    if language in knowledge_base:
        lang_data = knowledge_base[language]
        return render_template('result.html', 
                             language=language, 
                             data=lang_data)
    else:
        return render_template('result.html', 
                             language=language, 
                             data=None)

# API para contato
@app.route('/api/contact', methods=['POST'])
def contact_api():
    data = request.get_json()
    
    required_fields = ['name', 'email', 'message']
    if not data or not all(field in data and data[field].strip() for field in required_fields):
        return jsonify({
            "success": False,
            "error": "Dados incompletos. Campos obrigatórios: name, email, message"
        }), 400
    
    contact_record = {
        "id": str(uuid.uuid4()),
        "name": data['name'].strip(),
        "email": data['email'].strip().lower(),
        "message": data['message'].strip(),
        "timestamp": datetime.now().isoformat(),
        "status": "received"
    }
    
    logging.info(f"Nova mensagem de contato: {contact_record}")
    
    return jsonify({
        "success": True,
        "message": "Mensagem recebida com sucesso!",
        "contact_id": contact_record['id'],
        "timestamp": contact_record['timestamp']
    })

# Health check para Vercel
@app.route('/health')
def health_check():
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "Knowledge Base API",
        "version": "1.0.0",
        "environment": os.environ.get('VERCEL_ENV', 'production'),
        "languages_count": len(knowledge_base)
    })

# Rota para servir arquivos estáticos
@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory(app.static_folder, filename, max_age=86400)

# Páginas de erro
@app.errorhandler(404)
def page_not_found(e):
    if request.path.startswith('/api/'):
        return jsonify({
            "success": False,
            "error": "Endpoint não encontrado",
            "available_endpoints": [
                "/api/language/<name>",
                "/api/search",
                "/api/compare",
                "/api/contact"
            ]
        }), 404
    return render_template('404.html'), 404

# Handler para Vercel
def handler(event, context):
    """Handler para serverless functions do Vercel"""
    from vercel_wsgi import handle_request
    return handle_request(app, event, context)

# Execução local apenas se não estiver no Vercel
if __name__ == '__main__' and not os.environ.get('VERCEL'):
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'
    
    logging.info(f"Iniciando servidor local na porta {port}")
    app.run(debug=debug, host='0.0.0.0', port=port)