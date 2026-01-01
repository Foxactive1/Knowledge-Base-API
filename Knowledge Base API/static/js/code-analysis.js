// code-analysis.js - Sistema Completo de Análise de Código

class CodeAnalyzer {
    constructor() {
        // Elementos DOM
        this.elements = {};
        this.stats = {
            totalAnalyses: 0,
            totalLines: 0,
            avgScore: 0,
            byLanguage: {},
            recentAnalyses: []
        };
        
        this.currentAnalysis = null;
        this.chart = null;
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.loadStats();
        this.updateUI();
        this.initChart();
        this.loadRecentAnalyses();
        
        console.log('Code Analyzer inicializado com sucesso!');
    }

    cacheElements() {
        // Elementos principais
        this.elements = {
            languageSelect: document.getElementById('language-select'),
            codeInput: document.getElementById('code-input'),
            submitBtn: document.getElementById('submit-code'),
            clearBtn: document.getElementById('clear-code'),
            quickExampleBtn: document.getElementById('quick-example'),
            formatBtn: document.getElementById('format-code'),
            copyCodeBtn: document.getElementById('copy-code'),
            detectLangBtn: document.getElementById('detect-language'),
            analysisResults: document.getElementById('analysis-results'),
            analysisContent: document.getElementById('analysis-content'),
            scoreDisplay: document.getElementById('score-display'),
            charCount: document.getElementById('char-count'),
            lineCount: document.getElementById('line-count'),
            languageTips: document.getElementById('tips-content'),
            totalAnalyses: document.getElementById('total-analyses'),
            avgScore: document.getElementById('avg-score'),
            topLanguage: document.getElementById('top-language'),
            recentAnalysesBody: document.getElementById('recent-analyses-body'),
            clearHistoryBtn: document.getElementById('clear-history'),
            autoSaveToggle: document.getElementById('auto-save-toggle'),
            shareBtn: document.getElementById('share-analysis'),
            exportBtn: document.getElementById('export-analysis'),
            saveAnalysisBtn: document.getElementById('save-analysis')
        };
    }

    bindEvents() {
        // Eventos principais
        this.elements.submitBtn.addEventListener('click', () => this.analyzeCode());
        this.elements.clearBtn.addEventListener('click', () => this.clearCode());
        this.elements.quickExampleBtn.addEventListener('click', () => this.loadQuickExample());
        this.elements.formatBtn.addEventListener('click', () => this.formatCode());
        this.elements.copyCodeBtn.addEventListener('click', () => this.copyCode());
        this.elements.detectLangBtn.addEventListener('click', () => this.detectLanguage());
        this.elements.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        this.elements.shareBtn.addEventListener('click', () => this.shareAnalysis());
        this.elements.exportBtn.addEventListener('click', () => this.exportAnalysis());
        this.elements.saveAnalysisBtn.addEventListener('click', () => this.saveAnalysis());

        // Eventos de input
        this.elements.codeInput.addEventListener('input', (e) => {
            this.updateCharCount(e.target.value);
            this.autoSave();
        });

        this.elements.languageSelect.addEventListener('change', () => {
            this.updateLanguageTips();
            this.autoSave();
        });

        // Atalhos de teclado
        this.elements.codeInput.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.analyzeCode();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveAnalysis();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
                e.preventDefault();
                this.clearCode();
            }
        });
    }

    async analyzeCode() {
        const language = this.elements.languageSelect.value;
        const code = this.elements.codeInput.value.trim();
        
        if (!code) {
            this.showAlert('Por favor, insira algum código para análise.', 'warning');
            return;
        }

        this.showLoading(true);
        
        // Simular análise assíncrona
        setTimeout(() => {
            const analysis = this.performAnalysis(language, code);
            this.currentAnalysis = analysis;
            this.displayAnalysis(analysis);
            this.saveToHistory(analysis);
            this.updateStats(analysis);
            this.showLoading(false);
            
            this.showAlert('Análise concluída com sucesso!', 'success');
        }, 1500);
    }

    performAnalysis(language, code) {
        const langInfo = this.getLanguageInfo(language);
        const lines = code.split('\n');
        const issues = this.detectIssues(language, code);
        const suggestions = this.generateSuggestions(language, code);
        const score = this.calculateScore(language, code, issues);
        
        return {
            id: Date.now(),
            timestamp: new Date().toLocaleString('pt-BR'),
            language: langInfo.name,
            languageKey: language,
            code: code,
            lines: lines.length,
            characters: code.length,
            issues: issues,
            suggestions: suggestions,
            score: score,
            complexity: this.calculateComplexity(lines),
            langInfo: langInfo
        };
    }

    detectIssues(language, code) {
        const issues = [];
        const lines = code.split('\n');
        
        // Verificações comuns para todas as linguagens
        if (lines.length > 100) issues.push('Código muito longo - considere modularizar');
        if (!code.includes('function') && !code.includes('def') && !code.includes('fn')) {
            issues.push('Código sem estruturação em funções/métodos');
        }
        
        // Verificações específicas por linguagem
        switch(language) {
            case 'javascript':
                if (code.includes('var ')) issues.push('Uso de "var" - prefira "const" ou "let"');
                if (code.includes('== ') && !code.includes('===')) {
                    issues.push('Uso de comparação não estrita (==) em vez de (===)');
                }
                if (code.includes('eval(')) issues.push('Uso de eval() - pode ser perigoso');
                break;
                
            case 'python':
                if (code.includes('global ')) issues.push('Uso de variáveis globais');
                if (code.includes('print(') && code.split('\n').length > 10) {
                    issues.push('Print statements em código de produção');
                }
                break;
                
            case 'java':
                if (code.includes('System.out.print')) issues.push('Print statements em código Java');
                if (code.includes('null') && code.includes('.equals(')) {
                    issues.push('Possível NullPointerException ao usar .equals()');
                }
                break;
        }
        
        // Verificações de segurança
        if (code.includes('password') || code.includes('senha') || code.includes('secret')) {
            issues.push('Possível exposição de credenciais no código');
        }
        
        if (code.includes('SELECT *') && code.includes('FROM')) {
            issues.push('Uso de SELECT * - especifique as colunas necessárias');
        }
        
        return issues;
    }

    generateSuggestions(language, code) {
        const suggestions = [];
        const langInfo = this.getLanguageInfo(language);
        
        // Sugestões gerais
        suggestions.push(...langInfo.bestPractices.slice(0, 3));
        
        // Sugestões baseadas no código
        const lines = code.split('\n');
        if (lines.length > 50) {
            suggestions.push('Considere dividir o código em funções/métodos menores');
        }
        
        if (code.includes('TODO') || code.includes('FIXME') || code.includes('XXX')) {
            suggestions.push('Remova comentários TODO/FIXME antes do deploy');
        }
        
        if (!this.hasComments(code)) {
            suggestions.push('Adicione comentários para documentar a lógica complexa');
        }
        
        // Sugestões de performance
        if (code.includes('for (') && code.includes('.length') && language === 'javascript') {
            suggestions.push('Armazene o comprimento do array em uma variável antes do loop');
        }
        
        return suggestions;
    }

    calculateScore(language, code, issues) {
        let score = 100;
        
        // Penalizações por problemas
        score -= issues.length * 8;
        
        // Bônus por boas práticas
        if (this.hasComments(code)) score += 10;
        if (this.hasFunctions(code)) score += 15;
        if (this.isWellIndented(code)) score += 10;
        
        // Penalizações específicas por linguagem
        if (language === 'javascript' && code.includes('var ')) score -= 15;
        if (language === 'python' && code.includes('global ')) score -= 12;
        
        return Math.max(0, Math.min(100, Math.round(score)));
    }

    displayAnalysis(analysis) {
        // Mostrar container de resultados
        this.elements.analysisResults.style.display = 'block';
        
        // Atualizar pontuação
        const scoreClass = analysis.score >= 80 ? 'score-excellent' :
                         analysis.score >= 60 ? 'score-good' :
                         analysis.score >= 40 ? 'score-average' : 'score-poor';
        
        this.elements.scoreDisplay.innerHTML = `
            <span class="score-badge ${scoreClass}">
                ${analysis.score}/100
            </span>
        `;
        
        // Gerar conteúdo da análise
        const issuesHTML = analysis.issues.length > 0 ? `
            <div class="analysis-section">
                <h4><i class="fas fa-exclamation-triangle text-warning me-2"></i>Problemas Detectados</h4>
                <ul class="issues-list">
                    ${analysis.issues.map(issue => `
                        <li>
                            <i class="fas fa-times-circle issue-icon"></i>
                            ${issue}
                        </li>
                    `).join('')}
                </ul>
            </div>
        ` : '';
        
        const suggestionsHTML = analysis.suggestions.length > 0 ? `
            <div class="analysis-section">
                <h4><i class="fas fa-lightbulb text-info me-2"></i>Sugestões de Melhoria</h4>
                <ul class="suggestions-list">
                    ${analysis.suggestions.map(suggestion => `
                        <li>
                            <i class="fas fa-check-circle suggestion-icon"></i>
                            ${suggestion}
                        </li>
                    `).join('')}
                </ul>
            </div>
        ` : '';
        
        this.elements.analysisContent.innerHTML = `
            <div class="analysis-meta mb-4">
                <div class="row">
                    <div class="col-md-4">
                        <div class="card bg-light">
                            <div class="card-body text-center">
                                <h6 class="text-muted">Linguagem</h6>
                                <h4>${analysis.language}</h4>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card bg-light">
                            <div class="card-body text-center">
                                <h6 class="text-muted">Complexidade</h6>
                                <h4>${analysis.complexity}</h4>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card bg-light">
                            <div class="card-body text-center">
                                <h6 class="text-muted">Linhas</h6>
                                <h4>${analysis.lines}</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            ${issuesHTML}
            ${suggestionsHTML}
            
            <div class="analysis-section">
                <h4><i class="fas fa-tools me-2"></i>Ferramentas Recomendadas</h4>
                <div class="d-flex flex-wrap gap-2">
                    ${analysis.langInfo.tools.map(tool => `
                        <span class="badge bg-secondary">${tool}</span>
                    `).join('')}
                </div>
            </div>
            
            ${analysis.score < 70 ? `
                <div class="alert alert-warning mt-3">
                    <i class="fas fa-graduation-cap me-2"></i>
                    <strong>Recomendação:</strong> Consulte a documentação do ${analysis.language} 
                    para melhorar a qualidade do seu código.
                </div>
            ` : ''}
        `;
        
        // Scroll para os resultados
        this.elements.analysisResults.scrollIntoView({ behavior: 'smooth' });
    }

    // Métodos auxiliares
    showLoading(show) {
        if (show) {
            this.elements.submitBtn.disabled = true;
            this.elements.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Analisando...';
            
            // Adicionar overlay de loading
            const overlay = document.createElement('div');
            overlay.className = 'loading-overlay';
            overlay.innerHTML = `
                <div class="spinner"></div>
                <p class="mt-3">Analisando seu código...</p>
            `;
            overlay.id = 'loading-overlay';
            document.querySelector('.code-editor-section').appendChild(overlay);
        } else {
            this.elements.submitBtn.disabled = false;
            this.elements.submitBtn.innerHTML = '<i class="fas fa-play me-2"></i>Analisar Código';
            
            const overlay = document.getElementById('loading-overlay');
            if (overlay) overlay.remove();
        }
    }

    showAlert(message, type) {
        const alertClass = {
            'success': 'alert-success',
            'warning': 'alert-warning',
            'info': 'alert-info',
            'danger': 'alert-danger'
        }[type];
        
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert ${alertClass} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = `
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
        `;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        // Remover após 5 segundos
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }

    updateCharCount(code) {
        const lines = code.split('\n').length;
        const chars = code.length;
        
        this.elements.charCount.textContent = chars;
        this.elements.lineCount.textContent = lines;
    }

    updateLanguageTips() {
        const language = this.elements.languageSelect.value;
        const langInfo = this.getLanguageInfo(language);
        
        this.elements.languageTips.textContent = langInfo.tips[0];
    }

    loadQuickExample() {
        const language = this.elements.languageSelect.value;
        const examples = this.getExamples(language);
        
        this.elements.codeInput.value = examples.code;
        this.updateCharCount(examples.code);
        this.showAlert('Exemplo carregado com sucesso!', 'success');
    }

    formatCode() {
        const code = this.elements.codeInput.value;
        const language = this.elements.languageSelect.value;
        
        // Formatação básica (em um sistema real, usaria uma biblioteca como Prettier)
        let formatted = code
            .replace(/\t/g, '    ') // Tabs para espaços
            .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove múltiplas linhas vazias
            .trim() + '\n';
        
        this.elements.codeInput.value = formatted;
        this.showAlert('Código formatado!', 'success');
    }

    copyCode() {
        navigator.clipboard.writeText(this.elements.codeInput.value)
            .then(() => this.showAlert('Código copiado para a área de transferência!', 'success'))
            .catch(err => this.showAlert('Erro ao copiar: ' + err, 'danger'));
    }

    detectLanguage() {
        const code = this.elements.codeInput.value;
        
        // Detecção simples baseada em keywords
        if (code.includes('def ') || code.includes('import ') || code.includes('print(')) {
            this.elements.languageSelect.value = 'python';
        } else if (code.includes('function') || code.includes('console.log') || code.includes('const ')) {
            this.elements.languageSelect.value = 'javascript';
        } else if (code.includes('public class') || code.includes('System.out.print')) {
            this.elements.languageSelect.value = 'java';
        } else if (code.includes('#include') || code.includes('std::')) {
            this.elements.languageSelect.value = 'cpp';
        }
        
        this.updateLanguageTips();
        this.showAlert('Linguagem detectada!', 'info');
    }

    clearCode() {
        this.elements.codeInput.value = '';
        this.updateCharCount('');
        this.elements.analysisResults.style.display = 'none';
        this.showAlert('Editor limpo!', 'info');
    }

    autoSave() {
        if (!this.elements.autoSaveToggle.checked) return;
        
        const draft = {
            language: this.elements.languageSelect.value,
            code: this.elements.codeInput.value,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('codeDraft', JSON.stringify(draft));
    }

    loadDraft() {
        const draft = JSON.parse(localStorage.getItem('codeDraft'));
        if (draft) {
            this.elements.languageSelect.value = draft.language;
            this.elements.codeInput.value = draft.code;
            this.updateCharCount(draft.code);
            this.updateLanguageTips();
        }
    }

    saveToHistory(analysis) {
        let history = JSON.parse(localStorage.getItem('analysisHistory') || '[]');
        
        // Limitar histórico a 20 análises
        history.unshift({
            id: analysis.id,
            timestamp: analysis.timestamp,
            language: analysis.language,
            lines: analysis.lines,
            score: analysis.score,
            languageKey: analysis.languageKey
        });
        
        if (history.length > 20) history = history.slice(0, 20);
        
        localStorage.setItem('analysisHistory', JSON.stringify(history));
        this.loadRecentAnalyses();
    }

    loadRecentAnalyses() {
        const history = JSON.parse(localStorage.getItem('analysisHistory') || '[]');
        this.elements.recentAnalysesBody.innerHTML = '';
        
        if (history.length === 0) {
            this.elements.recentAnalysesBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted">
                        Nenhuma análise recente
                    </td>
                </tr>
            `;
            return;
        }
        
        history.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.timestamp}</td>
                <td>
                    <span class="badge bg-primary">${item.language}</span>
                </td>
                <td>${item.lines}</td>
                <td>
                    <span class="badge ${item.score >= 80 ? 'bg-success' : item.score >= 60 ? 'bg-warning' : 'bg-danger'}">
                        ${item.score}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="app.loadFromHistory('${item.languageKey}')">
                        <i class="fas fa-redo"></i>
                    </button>
                </td>
            `;
            this.elements.recentAnalysesBody.appendChild(row);
        });
    }

    clearHistory() {
        if (confirm('Tem certeza que deseja limpar todo o histórico de análises?')) {
            localStorage.removeItem('analysisHistory');
            this.loadRecentAnalyses();
            this.showAlert('Histórico limpo!', 'success');
        }
    }

    shareAnalysis() {
        if (!this.currentAnalysis) {
            this.showAlert('Nenhuma análise para compartilhar', 'warning');
            return;
        }
        
        const analysis = this.currentAnalysis;
        const shareText = `Análise de código: ${analysis.language}\nPontuação: ${analysis.score}/100\nLinhas: ${analysis.lines}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Análise de Código',
                text: shareText,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(shareText)
                .then(() => this.showAlert('Análise copiada para compartilhamento!', 'success'));
        }
    }

    exportAnalysis() {
        if (!this.currentAnalysis) {
            this.showAlert('Nenhuma análise para exportar', 'warning');
            return;
        }
        
        // Em um sistema real, geraria um PDF aqui
        this.showAlert('Exportação de PDF em desenvolvimento...', 'info');
    }

    saveAnalysis() {
        if (!this.currentAnalysis) {
            this.showAlert('Nenhuma análise para salvar', 'warning');
            return;
        }
        
        // Em um sistema real, salvaria no servidor
        this.showAlert('Análise salva com sucesso!', 'success');
    }

    loadStats() {
        const stats = JSON.parse(localStorage.getItem('analysisStats') || '{"total": 0, "lines": 0, "byLanguage": {}}');
        this.stats = stats;
        
        this.elements.totalAnalyses.textContent = stats.total || 0;
        this.elements.avgScore.textContent = stats.avgScore ? Math.round(stats.avgScore) : '-';
        
        // Encontrar linguagem mais usada
        const topLang = Object.entries(stats.byLanguage || {})
            .sort((a, b) => b[1] - a[1])[0];
        this.elements.topLanguage.textContent = topLang ? this.getLanguageInfo(topLang[0]).name : '-';
    }

    updateStats(analysis) {
        this.stats.total = (this.stats.total || 0) + 1;
        this.stats.lines = (this.stats.lines || 0) + analysis.lines;
        this.stats.avgScore = this.stats.total > 0 ? 
            ((this.stats.avgScore || 0) * (this.stats.total - 1) + analysis.score) / this.stats.total : 
            analysis.score;
        
        // Atualizar por linguagem
        if (!this.stats.byLanguage) this.stats.byLanguage = {};
        this.stats.byLanguage[analysis.languageKey] = 
            (this.stats.byLanguage[analysis.languageKey] || 0) + 1;
        
        // Salvar
        localStorage.setItem('analysisStats', JSON.stringify(this.stats));
        
        // Atualizar UI
        this.loadStats();
        this.updateChart();
    }

    initChart() {
        const ctx = document.getElementById('language-chart').getContext('2d');
        const stats = JSON.parse(localStorage.getItem('analysisStats') || '{"byLanguage": {}}');
        
        const languages = Object.keys(stats.byLanguage || {});
        const counts = Object.values(stats.byLanguage || {});
        
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: languages.map(lang => this.getLanguageInfo(lang).name),
                datasets: [{
                    label: 'Análises por Linguagem',
                    data: counts,
                    backgroundColor: languages.map(lang => this.getLanguageInfo(lang).color || '#4361ee'),
                    borderColor: '#fff',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    updateChart() {
        if (!this.chart) return;
        
        const stats = JSON.parse(localStorage.getItem('analysisStats') || '{"byLanguage": {}}');
        const languages = Object.keys(stats.byLanguage || {});
        const counts = Object.values(stats.byLanguage || {});
        
        this.chart.data.labels = languages.map(lang => this.getLanguageInfo(lang).name);
        this.chart.data.datasets[0].data = counts;
        this.chart.data.datasets[0].backgroundColor = languages.map(lang => this.getLanguageInfo(lang).color || '#4361ee');
        this.chart.update();
    }

    updateUI() {
        this.updateCharCount(this.elements.codeInput.value);
        this.updateLanguageTips();
        this.loadDraft();
    }

    // Métodos utilitários
    hasComments(code) {
        const commentPatterns = [/\/\/.*/g, /#.*/g, /\/\*[\s\S]*?\*\//g];
        return commentPatterns.some(pattern => pattern.test(code));
    }

    hasFunctions(code) {
        const functionPatterns = [/function\s+\w+/, /def\s+\w+/, /fn\s+\w+/, /public\s+\w+\s+\w+\(/];
        return functionPatterns.some(pattern => pattern.test(code));
    }

    isWellIndented(code) {
        const lines = code.split('\n');
        let indentLevel = 0;
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            
            const currentIndent = line.match(/^\s*/)[0].length;
            
            if (currentIndent < indentLevel * 4 && !trimmed.match(/^(}|else|elif|except|finally)/)) {
                return false;
            }
            
            if (trimmed.match(/{(|if|else|for|while|def|function|class)\s*\(?/)) {
                indentLevel++;
            }
            
            if (trimmed.includes('}') || trimmed.match(/^(return|break|continue)/)) {
                indentLevel = Math.max(0, indentLevel - 1);
            }
        }
        
        return true;
    }

    calculateComplexity(lines) {
        const count = lines.length;
        if (count < 20) return 'Baixa';
        if (count < 50) return 'Média';
        if (count < 100) return 'Alta';
        return 'Muito Alta';
    }

    getLanguageInfo(langKey) {
        const languages = {
            python: {
                name: 'Python',
                tips: [
                    'Use snake_case para variáveis e funções',
                    'Classes devem usar CamelCase',
                    'Importe módulos na parte superior do arquivo'
                ],
                bestPractices: [
                    'Use docstrings para documentar funções e classes',
                    'Prefira list comprehensions para loops simples',
                    'Use context managers (with) para gerenciar recursos'
                ],
                tools: ['Pylint', 'Black', 'Flake8', 'MyPy'],
                color: '#3776ab'
            },
            javascript: {
                name: 'JavaScript',
                tips: [
                    'Use const e let em vez de var',
                    'Prefira arrow functions para callbacks',
                    'Use template literals para strings'
                ],
                bestPractices: [
                    'Use === em vez de == para comparações',
                    'Trate erros com try-catch',
                    'Evite funções muito longas'
                ],
                tools: ['ESLint', 'Prettier', 'JSHint'],
                color: '#f7df1e'
            },
            java: {
                name: 'Java',
                tips: [
                    'Use nomes descritivos para classes e métodos',
                    'Siga as convenções de nomenclatura Java',
                    'Documente com Javadoc'
                ],
                bestPractices: [
                    'Use Optional para valores que podem ser null',
                    'Siga o princípio SOLID',
                    'Trate exceções adequadamente'
                ],
                tools: ['Checkstyle', 'PMD', 'SpotBugs'],
                color: '#ed8b00'
            },
            cpp: {
                name: 'C++',
                tips: [
                    'Use smart pointers em vez de raw pointers',
                    'Prefira std::vector a arrays C-style',
                    'Use const sempre que possível'
                ],
                bestPractices: [
                    'Siga a regra dos três/cinco/zero',
                    'Evite macros quando possível',
                    'Use namespaces para organizar código'
                ],
                tools: ['Clang-Tidy', 'Cppcheck', 'PVS-Studio'],
                color: '#00599c'
            },
            php: {
                name: 'PHP',
                tips: [
                    'Use prepared statements para SQL',
                    'Valide e sanitize inputs do usuário',
                    'Use namespaces e autoloading'
                ],
                bestPractices: [
                    'Siga PSR standards',
                    'Use type hints e declare(strict_types=1)',
                    'Evite funções globais quando possível'
                ],
                tools: ['PHP_CodeSniffer', 'PHPStan', 'Psalm'],
                color: '#777bb4'
            },
            ruby: {
                name: 'Ruby',
                tips: [
                    'Siga convenções do Ruby on Rails',
                    'Use símbolos para chaves de hash',
                    'Prefira métodos com ! para versões destrutivas'
                ],
                bestPractices: [
                    'Use blocos em vez de loops quando possível',
                    'Documente com RDoc',
                    'Mantenha métodos curtos'
                ],
                tools: ['RuboCop', 'Reek', 'Fasterer'],
                color: '#cc342d'
            },
            rust: {
                name: 'Rust',
                tips: [
                    'Prefira imutabilidade',
                    'Use pattern matching extensivamente',
                    'Documente com /// para doc comments'
                ],
                bestPractices: [
                    'Siga as convenções do cargo clippy',
                    'Use Result e Option em vez de exceções',
                    'Evite unsafe code quando possível'
                ],
                tools: ['Clippy', 'rustfmt', 'cargo-audit'],
                color: '#dea584'
            },
            go: {
                name: 'Go',
                tips: [
                    'Use gofmt automaticamente',
                    'Trate todos os erros',
                    'Nomes curtos para variáveis locais'
                ],
                bestPractices: [
                    'Documente com godoc',
                    'Mantenha funções pequenas',
                    'Use interfaces quando apropriado'
                ],
                tools: ['gofmt', 'golint', 'staticcheck'],
                color: '#00add8'
            },
            swift: {
                name: 'Swift',
                tips: [
                    'Use optionals para valores que podem ser nil',
                    'Prefira let sobre var',
                    'Use guard para early returns'
                ],
                bestPractices: [
                    'Use structs quando possível',
                    'Prefira value types sobre reference types',
                    'Use protocolos para abstração'
                ],
                tools: ['SwiftLint', 'SwiftFormat', 'SwiftPM'],
                color: '#fa7343'
            },
            typescript: {
                name: 'TypeScript',
                tips: [
                    'Use tipagem estrita',
                    'Prefira interfaces sobre type aliases para objetos',
                    'Use enums para conjuntos de valores'
                ],
                bestPractices: [
                    'Evite any quando possível',
                    'Use generics para código reutilizável',
                    'Configure strict no tsconfig.json'
                ],
                tools: ['ESLint', 'Prettier', 'TSLint'],
                color: '#3178c6'
            }
        };
        
        return languages[langKey] || languages.python;
    }

    getExamples(langKey) {
        const examples = {
            python: {
                code: `def calcular_fatorial(n):
    """Calcula o fatorial de um número."""
    if n == 0:
        return 1
    return n * calcular_fatorial(n - 1)

def verificar_primo(num):
    """Verifica se um número é primo."""
    if num <= 1:
        return False
    for i in range(2, int(num ** 0.5) + 1):
        if num % i == 0:
            return False
    return True

# Exemplo de uso
if __name__ == "__main__":
    numero = 7
    if verificar_primo(numero):
        print(f"{numero} é primo")
    else:
        print(f"{numero} não é primo")`
            },
            javascript: {
                code: `// Função para calcular fatorial
function calcularFatorial(n) {
    if (n === 0) return 1;
    return n * calcularFatorial(n - 1);
}

// Função para verificar número primo
function verificarPrimo(num) {
    if (num <= 1) return false;
    if (num <= 3) return true;
    
    if (num % 2 === 0 || num % 3 === 0) return false;
    
    for (let i = 5; i * i <= num; i += 6) {
        if (num % i === 0 || num % (i + 2) === 0) {
            return false;
        }
    }
    return true;
}

// Exemplo de uso
const numero = 29;
console.log(\`\${numero} é primo? \${verificarPrimo(numero)}\`);`
            },
            java: {
                code: `public class Exemplo {
    
    // Método para calcular fatorial
    public static int calcularFatorial(int n) {
        if (n == 0) return 1;
        return n * calcularFatorial(n - 1);
    }
    
    // Método para verificar número primo
    public static boolean verificarPrimo(int num) {
        if (num <= 1) return false;
        if (num <= 3) return true;
        
        if (num % 2 == 0 || num % 3 == 0) return false;
        
        for (int i = 5; i * i <= num; i += 6) {
            if (num % i == 0 || num % (i + 2) == 0) {
                return false;
            }
        }
        return true;
    }
    
    // Método principal
    public static void main(String[] args) {
        int numero = 17;
        if (verificarPrimo(numero)) {
            System.out.println(numero + " é primo");
        } else {
            System.out.println(numero + " não é primo");
        }
    }
}`
            }
        };
        
        return examples[langKey] || examples.python;
    }
}

// Expor para uso global
window.CodeAnalyzer = CodeAnalyzer;
window.app = null;