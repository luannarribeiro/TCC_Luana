document.addEventListener('DOMContentLoaded', function () {
    const lista = document.getElementById('idosos-lista');

    // Função para carregar os idosos
    const carregarIdosos = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/listar-idosos'); // Certifique-se de que o caminho da API está correto
            if (!response.ok) {
                throw new Error('Erro ao carregar a lista de idosos');
            }

            const idosos = await response.json();

            // Verificar se há idosos cadastrados
            if (idosos.length === 0) {
                lista.innerHTML = '<p>Nenhum idoso cadastrado.</p>';
                return;
            }

            // Criar os cards para cada idoso
            lista.innerHTML = ''; // Limpar a lista antes de preencher
            idosos.forEach(idoso => {
                const div = document.createElement('div');
                div.classList.add('card', 'mb-3');
                div.innerHTML = `
                    <div class="card-body">
                        <h5 class="card-title">${idoso.nome}</h5>
                        <p class="card-text"><strong>Idade:</strong> ${idoso.idade}</p>
                        <p class="card-text"><strong>Relato:</strong> ${idoso.relato}</p>
                        <p class="card-text"><strong>Observações:</strong> ${idoso.observacoes}</p>
                        <a href="detalhes-idoso.html?id=${idoso.id}" class="btn btn-primary">Ver Detalhes</a>
                    </div>
                `;
                lista.appendChild(div);
            });
        } catch (error) {
            lista.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
        }
    };

    // Carregar a lista ao iniciar
    carregarIdosos();
});
