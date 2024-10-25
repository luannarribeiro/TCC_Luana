document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('buscar-cuidados-form');
    const resultado = document.getElementById('resultado');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const nome = document.getElementById('nome').value;
        const data = document.getElementById('data').value;

        try {
            const response = await fetch(`/api/buscar-cuidados?nome=${encodeURIComponent(nome)}&data=${encodeURIComponent(data)}`);
            if (!response.ok) {
                throw new Error('Erro ao buscar cuidados');
            }

            const cuidados = await response.json();
            resultado.innerHTML = '';

            if (cuidados.length === 0) {
                resultado.innerHTML = '<p>Nenhum cuidado encontrado para os critérios informados.</p>';
                return;
            }

            // Exibir cuidados registrados em formato de tabela
            const tabela = document.createElement('table');
            tabela.classList.add('table', 'table-bordered', 'mt-4');
            tabela.innerHTML = `
                <thead>
                    <tr>
                        <th>Anamnese</th>
                        <th>Data</th>
                        <th>Nome do Cuidador</th>
                        <th>Horário de Início</th>
                        <th>Horário de Fim</th>
                        <th>Observações</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;

            const tbody = tabela.querySelector('tbody');

            cuidados.forEach(cuidado => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${cuidado.anamnese || 'Não informado'}</td>
                    <td>${cuidado.data_assistencia || 'Não informado'}</td>
                    <td>${cuidado.nome_cuidador || 'Não informado'}</td>
                    <td>${cuidado.horario_inicio || 'Não informado'}</td>
                    <td>${cuidado.horario_fim || 'Não informado'}</td>
                    <td>${cuidado.observacoes || 'Não informado'}</td>
                `;
                tbody.appendChild(row);
            });

            resultado.appendChild(tabela);
        } catch (error) {
            resultado.innerHTML = `<div class="alert alert-danger">Erro ao buscar cuidados: ${error.message}</div>`;
        }
    });
});
