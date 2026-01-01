from flask import Flask, request, jsonify, render_template, send_from_directory, redirect, url_for
import json
import os
import logging
from datetime import datetime
from functools import wraps
import uuid
from collections import defaultdict

app = Flask(__name__, static_folder='static', template_folder='templates')

# Configurações do app
app.config['MAX_CONTENT_LENGTH'] = 2 * 1024 * 1024  # Limite de 2MB para uploads
app.config['SECRET_KEY'] = os.environ.get('FLASK_SECRET', 'default-secret-key')

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)

# Base de conhecimento expandida para compatibilidade total
def load_knowledge_base():
    """Base de conhecimento completa com informações detalhadas"""
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
        },
        "typescript": {
            "name": "TypeScript",
            "version": "5.3",
            "description": "JavaScript com tipagem estática para desenvolvimento mais robusto.",
            "typing": "Estática e forte",
            "paradigms": ["OOP", "Funcional"],
            "package_manager": "npm",
            "popularity_rank": 5,
            "category": "Web",
            "frameworks": ["Angular", "React", "Vue.js", "NestJS"],
            "use_cases": ["Web Development", "Large Applications", "Enterprise Software"],
            "learning_curve": "Moderate",
            "community_size": "Large",
            "job_market": "Very Good",
            "syntax_example": "console.log('Hello, World!');",
            "icon": "fas fa-code",
            "color": "#3178c6",
            "created_year": 2012,
            "creator": "Microsoft"
        },
        "go": {
            "name": "Go",
            "version": "1.21",
            "description": "Linguagem criada pelo Google para desenvolvimento de sistemas e microsserviços.",
            "typing": "Estática e forte",
            "paradigms": ["Imperativo", "Concorrente"],
            "package_manager": "go mod",
            "popularity_rank": 6,
            "category": "Systems",
            "frameworks": ["Gin", "Echo", "Fiber", "Beego"],
            "use_cases": ["Microservices", "Cloud Applications", "DevOps Tools", "APIs"],
            "learning_curve": "Beginner to Moderate",
            "community_size": "Large",
            "job_market": "Good",
            "syntax_example": "fmt.Println(\"Hello, World!\")",
            "icon": "fas fa-bolt",
            "color": "#00add8",
            "created_year": 2009,
            "creator": "Google"
        }
    }

# Carregar base de conhecimento
knowledge_base = load_knowledge_base()

# Cache simples em memória
cache = {}
cache_timestamps = {}

# Middleware para medir tempo de resposta
@app.before_request
def before_request():
    request.start_time = datetime.now()

@app.after_request
def after_request(response):
    duration = datetime.now() - request.start_time
    response.headers['X-Response-Time'] = str(duration.total_seconds())
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    
    logging.info(f"{request.method} {request.path} - {response.status} - {duration.total_seconds():.3f}s")
    return response

# Decorator para cache
def cache_response(timeout=300):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            cache_key = f"{request.path}?{request.query_string.decode()}"
            
            # Verificar se está no cache e não expirou
            if cache_key in cache:
                timestamp = cache_timestamps.get(cache_key, 0)
                if datetime.now().timestamp() - timestamp < timeout:
                    return cache[cache_key]
            
            # Executar função e cachear resultado
            result = f(*args, **kwargs)
            cache[cache_key] = result
            cache_timestamps[cache_key] = datetime.now().timestamp()
            
            return result
        return decorated_function
    return decorator

def format_for_template(lang_data):
    """Formata os dados da base para o template result.html"""
    return {
        'intro': lang_data.get('description', ''),
        'principais_usos': lang_data.get('use_cases', []),
        'caracteristicas': {
            'tipagem': lang_data.get('typing', ''),
            'paradigma': lang_data.get('paradigms', []),
            'gerenciador_pacotes': lang_data.get('package_manager', ''),
            'versao_atual': lang_data.get('version', ''),
            'ano_criacao': lang_data.get('created_year', ''),
            'criador': lang_data.get('creator', ''),
            'comunidade': lang_data.get('community_size', '')
        },
        'frameworks': {
            'principais': lang_data.get('frameworks', [])[:5]
        },
        'exemplos': {
            'hello_world': lang_data.get('syntax_example', ''),
            'exemplo_basico': get_basic_example(lang_data.get('name', ''))
        },
        'curiosidade': get_fun_fact(lang_data.get('name', ''))
    }

def get_basic_example(lang_name):
    """Retorna exemplo básico baseado na linguagem"""
    examples = {
        'Python': 'def hello():\n    print("Hello, World!")',
        'JavaScript': 'function hello() {\n    console.log("Hello, World!");\n}',
        'Java': 'public class Hello {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
        'Rust': 'fn main() {\n    println!("Hello, World!");\n}'
    }
    return examples.get(lang_name, '// Exemplo básico')

def get_fun_fact(lang_name):
    """Retorna curiosidade sobre a linguagem"""
    facts = {
        'Python': 'O nome Python vem do grupo de humor britânico Monty Python',
        'JavaScript': 'Foi desenvolvida em apenas 10 dias em 1995',
        'Java': 'Originalmente chamada de Oak (Carvalho)',
        'Rust': 'Eleita a linguagem mais amada no Stack Overflow por 8 anos consecutivos'
    }
    return facts.get(lang_name, 'Linguagem de programação poderosa e versátil.')
# Rota principal
@app.route('/')
@cache_response(timeout=300)
def home():
    """Rota principal que serve o portfólio com dados dinâmicos"""
    # Estatísticas para o frontend
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
    """Endpoint para obter detalhes completos de uma linguagem"""
    language = language_name.lower().strip()
    
    if language in knowledge_base:
        data = knowledge_base[language].copy()
        data['query_timestamp'] = datetime.now().isoformat()
        data['related_languages'] = get_related_languages(language)
        
        return jsonify({
            "success": True,
            "language": language,
            "data": data
        })
    else:
        suggestions = get_language_suggestions(language)
        return jsonify({
            "success": False,
            "error": f"Linguagem '{language_name}' não encontrada",
            "suggestions": suggestions,
            "available_languages": list(knowledge_base.keys())
        }), 404

# API para pesquisa com sugestões
@app.route('/api/search')
def search_languages():
    """Endpoint para pesquisa inteligente de linguagens"""
    query = request.args.get('q', '').strip().lower()
    
    if not query:
        return jsonify({
            "success": False,
            "error": "Parâmetro 'q' é obrigatório"
        }), 400
    
    # Buscar correspondências
    results = []
    for key, lang in knowledge_base.items():
        if (query in key.lower() or 
            query in lang['name'].lower() or 
            query in lang['description'].lower() or
            any(query in framework.lower() for framework in lang['frameworks']) or
            any(query in use_case.lower() for use_case in lang['use_cases'])):
            
            results.append({
                'key': key,
                'name': lang['name'],
                'description': lang['description'],
                'popularity_rank': lang['popularity_rank'],
                'category': lang['category'],
                'match_score': calculate_match_score(query, key, lang)
            })
    
    # Ordenar por relevância
    results.sort(key=lambda x: x['match_score'], reverse=True)
    
    return jsonify({
        "success": True,
        "query": query,
        "results": results[:10],  # Limitar a 10 resultados
        "total_found": len(results)
    })

# API para comparação de linguagens
@app.route('/api/compare')
def compare_languages():
    """Endpoint para comparar múltiplas linguagens"""
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
    
    # Análise comparativa
    comparison_analysis = {
        'performance_ranking': sorted(comparison_data, key=lambda x: x['popularity_rank']),
        'learning_difficulty': group_by_difficulty(comparison_data),
        'use_cases_overlap': find_common_use_cases(comparison_data),
        'paradigms_comparison': compare_paradigms(comparison_data)
    }
    
    return jsonify({
        "success": True,
        "languages": comparison_data,
        "analysis": comparison_analysis,
        "comparison_timestamp": datetime.now().isoformat()
    })

# API para estatísticas gerais
@app.route('/api/stats')
@cache_response(timeout=3600)
def get_statistics():
    """Endpoint para estatísticas gerais do knowledge base"""
    stats = {
        'total_languages': len(knowledge_base),
        'languages_by_category': defaultdict(int),
        'paradigms_distribution': defaultdict(int),
        'popularity_distribution': defaultdict(int),
        'package_managers': defaultdict(int),
        'creation_timeline': {}
    }
    
    for lang_data in knowledge_base.values():
        stats['languages_by_category'][lang_data['category']] += 1
        stats['package_managers'][lang_data['package_manager']] += 1
        stats['creation_timeline'][lang_data['created_year']] = lang_data['name']
        
        for paradigm in lang_data['paradigms']:
            stats['paradigms_distribution'][paradigm] += 1
        
        if lang_data['popularity_rank'] <= 3:
            stats['popularity_distribution']['Top 3'] += 1
        elif lang_data['popularity_rank'] <= 6:
            stats['popularity_distribution']['Top 6'] += 1
        else:
            stats['popularity_distribution']['Others'] += 1
    
    return jsonify({
        "success": True,
        "statistics": dict(stats),
        "generated_at": datetime.now().isoformat()
    })

# API para contato melhorada
@app.route('/api/contact', methods=['POST'])
def contact_api():
    """Endpoint melhorado para envio de mensagens de contato"""
    data = request.get_json()
    
    # Validação mais robusta
    required_fields = ['name', 'email', 'message']
    if not data or not all(field in data and data[field].strip() for field in required_fields):
        return jsonify({
            "success": False,
            "error": "Dados incompletos. Campos obrigatórios: name, email, message"
        }), 400
    
    # Validação de email básica
    if '@' not in data['email'] or '.' not in data['email']:
        return jsonify({
            "success": False,
            "error": "Email inválido"
        }), 400
    
    # Criar registro de contato
    contact_record = {
        "id": str(uuid.uuid4()),
        "name": data['name'].strip(),
        "email": data['email'].strip().lower(),
        "message": data['message'].strip(),
        "subject": data.get('subject', 'Contato via Knowledge Base'),
        "timestamp": datetime.now().isoformat(),
        "status": "received"
    }
    
    # Log estruturado
    logging.info(f"Nova mensagem de contato: {contact_record}")
    
    # Aqui você salvaria no banco de dados
    # save_contact_to_database(contact_record)
    
    return jsonify({
        "success": True,
        "message": "Mensagem recebida com sucesso! Entraremos em contato em breve.",
        "contact_id": contact_record['id'],
        "timestamp": contact_record['timestamp']
    })

# API para sugestões de linguagens
@app.route('/api/suggestions')
@cache_response(timeout=3600)
def get_suggestions():
    """Endpoint para obter sugestões de linguagens por categoria"""
    category = request.args.get('category', '').lower()
    
    if category:
        suggestions = [
            lang for lang in knowledge_base.values() 
            if lang['category'].lower() == category
        ]
    else:
        # Sugestões baseadas em popularidade
        suggestions = sorted(
            knowledge_base.values(),
            key=lambda x: x['popularity_rank']
        )[:6]
    
    return jsonify({
        "success": True,
        "category": category or "popular",
        "suggestions": suggestions
    })

@app.route('/query')
def query_language():
    """Rota para pesquisa de linguagens via formulário HTML"""
    language = request.args.get('language', '').lower().strip()
    
    if not language:
        return redirect(url_for('home'))
    
    # Buscar na base de conhecimento
    if language in knowledge_base:
        # Usar a estrutura do app.py (não do JSON)
        lang_data = knowledge_base[language]
        return render_template('result.html', 
                             language=language, 
                             data=lang_data,
                             formatted_data=format_for_template(lang_data))
    else:
        # Tentar encontrar correspondências aproximadas
        suggestions = get_language_suggestions(language)
        return render_template('result.html', 
                             language=language, 
                             data=None,
                             suggestions=suggestions)

# Funções auxiliares
def get_related_languages(language_key):
    """Encontra linguagens relacionadas"""
    current_lang = knowledge_base[language_key]
    related = []
    
    for key, lang in knowledge_base.items():
        if key != language_key:
            # Calcular similaridade baseada em categoria, paradigmas e casos de uso
            similarity_score = 0
            
            if lang['category'] == current_lang['category']:
                similarity_score += 3
            
            common_paradigms = set(lang['paradigms']) & set(current_lang['paradigms'])
            similarity_score += len(common_paradigms)
            
            common_use_cases = set(lang['use_cases']) & set(current_lang['use_cases'])
            similarity_score += len(common_use_cases)
            
            if similarity_score > 0:
                related.append({
                    'key': key,
                    'name': lang['name'],
                    'similarity_score': similarity_score
                })
    
    return sorted(related, key=lambda x: x['similarity_score'], reverse=True)[:3]

def get_language_suggestions(query):
    """Gera sugestões baseadas na query"""
    suggestions = []
    
    for key, lang in knowledge_base.items():
        if (query in key or 
            any(query in word.lower() for word in lang['name'].split()) or
            any(query in framework.lower() for framework in lang['frameworks'])):
            suggestions.append({
                'key': key,
                'name': lang['name'],
                'category': lang['category']
            })
    
    return suggestions[:5]

def calculate_match_score(query, key, lang_data):
    """Calcula pontuação de relevância para busca"""
    score = 0
    
    if query == key:
        score += 10
    elif query in key:
        score += 5
    
    if query in lang_data['name'].lower():
        score += 8
    
    if query in lang_data['description'].lower():
        score += 3
    
    for framework in lang_data['frameworks']:
        if query in framework.lower():
            score += 2
    
    for use_case in lang_data['use_cases']:
        if query in use_case.lower():
            score += 1
    
    return score

def group_by_difficulty(languages):
    """Agrupa linguagens por dificuldade"""
    difficulty_groups = defaultdict(list)
    
    for lang in languages:
        difficulty = lang['learning_curve']
        difficulty_groups[difficulty].append(lang['name'])
    
    return dict(difficulty_groups)

def find_common_use_cases(languages):
    """Encontra casos de uso comuns"""
    all_use_cases = set()
    for lang in languages:
        all_use_cases.update(lang['use_cases'])
    
    common_use_cases = []
    for use_case in all_use_cases:
        count = sum(1 for lang in languages if use_case in lang['use_cases'])
        if count > 1:
            common_use_cases.append({
                'use_case': use_case,
                'language_count': count
            })
    
    return sorted(common_use_cases, key=lambda x: x['language_count'], reverse=True)

def compare_paradigms(languages):
    """Compara paradigmas entre linguagens"""
    paradigm_analysis = {}
    
    for lang in languages:
        for paradigm in lang['paradigms']:
            if paradigm not in paradigm_analysis:
                paradigm_analysis[paradigm] = []
            paradigm_analysis[paradigm].append(lang['name'])
    
    return paradigm_analysis

# Rota para servir arquivos estáticos com cache otimizado
@app.route('/static/<path:filename>')
def static_files(filename):
    """Serve arquivos estáticos com cache control otimizado"""
    return send_from_directory(app.static_folder, filename, max_age=86400)

# Páginas de erro personalizadas
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
                "/api/stats",
                "/api/contact",
                "/api/suggestions"
            ]
        }), 404
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(e):
    logging.error(f"Erro interno: {e}")
    if request.path.startswith('/api/'):
        return jsonify({
            "success": False,
            "error": "Erro interno do servidor",
            "timestamp": datetime.now().isoformat()
        }), 500
    return render_template('500.html'), 500

# Health check expandido
@app.route('/health')
def health_check():
    """Health check detalhado para monitoramento"""
    health_data = {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "Knowledge Base API",
        "version": "2.0.0",
        "environment": os.environ.get('FLASK_ENV', 'production'),
        "database": {
            "status": "connected",
            "languages_count": len(knowledge_base)
        },
        "cache": {
            "entries": len(cache),
            "memory_usage": "normal"
        },
        "uptime": "operational"
    }
    
    return jsonify(health_data)

# Rota para página de análise de código
@app.route('/code_analysis')
def code_analysis():
    """Página de análise de código"""
    return render_template('code-analysis.html')

# Rota para API de análise de código (opcional - se quiser backend)
@app.route('/api/analyze', methods=['POST'])
def analyze_code_api():
    """Endpoint para análise de código no backend"""
    data = request.get_json()
    
    if not data or 'code' not in data or 'language' not in data:
        return jsonify({
            "success": False,
            "error": "Dados incompletos. Campos obrigatórios: code, language"
        }), 400
    
    code = data['code']
    language = data['language'].lower()
    
    # Análise básica (em produção, use bibliotecas apropriadas)
    analysis = {
        "success": True,
        "language": language,
        "line_count": len(code.split('\n')),
        "char_count": len(code),
        "has_functions": 'def ' in code or 'function ' in code or 'fn ' in code,
        "has_comments": '#' in code or '//' in code or '/*' in code,
        "analysis_timestamp": datetime.now().isoformat()
    }
    
    return jsonify(analysis)
# Endpoint para métricas
@app.route('/metrics')
def metrics():
    """Endpoint para métricas de uso"""
    return jsonify({
        "cache_size": len(cache),
        "knowledge_base_size": len(knowledge_base),
        "request_count": "tracking_required",
        "timestamp": datetime.now().isoformat()
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'
    
    logging.info(f"Iniciando Knowledge Base API v2.0.0 na porta {port}")
    logging.info(f"Linguagens carregadas: {list(knowledge_base.keys())}")
    
    app.run(
        debug=debug,
        host='0.0.0.0',
        port=port,
        threaded=True
    )