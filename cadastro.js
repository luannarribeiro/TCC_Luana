document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('cadastro-idoso-form');
    const resultado = document.getElementById('resultado');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const nome = document.getElementById('nome').value;
        const idade = document.getElementById('idade').value;
        const relato = document.getElementById('relato').value;
        const observacoes = document.getElementById('observacoes').value;

        const idoso = { nome, idade, relato, observacoes };

        try {
            const response = await fetch('/api/cadastro-idoso', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(idoso),
            });

            if (response.ok) {
                const result = await response.json();
                resultado.innerHTML = `<div class="alert alert-success">${result.message}</div>`;
                form.reset(); // Limpar o formulário após o cadastro
            } else {
                throw new Error('Erro ao cadastrar idoso');
            }
        } catch (error) {
            resultado.innerHTML = `<div class="alert alert-danger">Erro ao cadastrar idoso. Tente novamente.</div>`;
        }
    });
});
