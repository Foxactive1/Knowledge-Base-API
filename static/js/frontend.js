class KnowledgeBaseAPI {
    constructor() {
        this.baseURL = window.location.origin;
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupSearch();
        this.updateStats(); // Novo bloco incorporado
    }

    async updateStats() {
        try {
            const stats = await this.request('/api/stats');
            if (stats.success) {
                this.displayStats(stats.statistics);
            }
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        }
    }

    displayStats(stats) {
        const totalEl = document.getElementById('total-languages');
        if (totalEl) {
            totalEl.textContent = stats.total_languages || 0;
        }
        // Caso queira atualizar mais KPIs, adicione aqui
        // exemplo:
        // document.getElementById('total-frameworks').textContent = stats.total_frameworks || 0;
    }

    async request(endpoint, options = {}) {
        const cacheKey = `${endpoint}_${JSON.stringify(options)}`;

        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    async getLanguageDetails(languageName) {
        return await this.request(`/api/language/${encodeURIComponent(languageName)}`);
    }

    setupEventListeners() {
        document.querySelectorAll('.btn-outline-primary').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const card = e.target.closest('.language-card');
                if (!card) return;
                const languageName = card.querySelector('.card-header h4').textContent;
                await this.searchLanguage(languageName);
            });
        });
    }

    setupSearch() {
        const searchForm = document.querySelector('form[action="/query"]');
        if (searchForm) {
            searchForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const language = formData.get('language');
                await this.searchLanguage(language);
            });
        }
    }

    async searchLanguage(languageName) {
        try {
            const result = await this.getLanguageDetails(languageName);
            if (result.success) {
                this.showLanguageDetails(result.data);
            } else {
                alert(result.error);
            }
        } catch (err) {
            console.error(err);
            alert("Erro ao buscar detalhes da linguagem.");
        }
    }

    showLanguageDetails(data) {
        const modal = this.createLanguageModal(data);
        document.body.appendChild(modal);
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();

        modal.addEventListener('hidden.bs.modal', () => modal.remove());
    }

    createLanguageModal(data) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.setAttribute('tabindex', '-1');
        modal.innerHTML = `
            <div class="modal-dialog modal-lg modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header" style="background: linear-gradient(to right, ${data.color}, #1a1a1a); color: white;">
                        <h5 class="modal-title"><i class="${data.icon}"></i> ${data.name} - Detalhes</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p><strong>Versão:</strong> ${data.version}</p>
                        <p><strong>Descrição:</strong> ${data.description}</p>
                        <p><strong>Paradigmas:</strong> ${data.paradigms.join(', ')}</p>
                        <p><strong>Gerenciador de Pacotes:</strong> ${data.package_manager}</p>
                        <p><strong>Casos de Uso:</strong> ${data.use_cases.join(', ')}</p>
                        <p><strong>Curva de Aprendizado:</strong> ${data.learning_curve}</p>
                        <p><strong>Popularidade:</strong> Rank #${data.popularity_rank}</p>
                        <p><strong>Mercado de Trabalho:</strong> ${data.job_market}</p>
                        <pre><code>${data.syntax_example}</code></pre>
                        <p><strong>Criador:</strong> ${data.creator} (${data.created_year})</p>
                        <div class="mt-4">
                            <h6>Linguagens Relacionadas:</h6>
                            <ul>
                                ${data.related_languages
                                    .map(rl => `<li>${rl.name} (score: ${rl.similarity_score})</li>`)
                                    .join('')}
                            </ul>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <small class="text-muted">Consulta: ${new Date(data.query_timestamp).toLocaleString()}</small>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                    </div>
                </div>
            </div>
        `;
        return modal;
    }
}