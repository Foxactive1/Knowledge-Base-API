document.getElementById("submit-code").addEventListener("click", function() {
    const language = document.getElementById("language-select").value;
    const codeInput = document.getElementById("code-input").value;
    const outputArea = document.getElementById("output");

    if (codeInput.trim() === "") {
        outputArea.textContent = "Por favor, insira algum código.";
        return;
    }

    // Simulando uma resposta do assistente
    outputArea.textContent = `Processando código em ${language}...\n\nSugestões:\n- Verifique a indentação.\n- Use boas práticas de nomeação de variáveis.`;
});

