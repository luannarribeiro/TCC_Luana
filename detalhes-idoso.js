document.addEventListener('DOMContentLoaded', function () {
    const detalhesIdoso = document.getElementById('detalhes-idoso');
    const formCuidados = document.getElementById('cuidados-form');
    const resultado = document.getElementById('resultado');
    const listaCuidados = document.getElementById('lista-cuidados');

    // Obtém o ID do idoso da URL (exemplo: /detalhes-idoso.html?id=1)
    const urlParams = new URLSearchParams(window.location.search);
    const idosoId = urlParams.get('id');

    // Carregar os detalhes do idoso
    const carregarDetalhes = async () => {
        try {
            const response = await fetch(`/api/detalhes-idoso/${idosoId}`);
            if (!response.ok) {
                throw new Error('Erro ao carregar os detalhes do idoso');
            }
            const idoso = await response.json();

            // Exibir os detalhes
            document.getElementById('nome').innerText = idoso.nome || 'Não informado';
            document.getElementById('idade').innerText = idoso.idade || 'Não informado';
            document.getElementById('relato').innerText = idoso.relato || 'Não informado';
            document.getElementById('observacoes').innerText = idoso.observacoes || 'Não informado';
        } catch (error) {
            detalhesIdoso.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
        }
    };

    // Enviar formulário de cuidados
    formCuidados.addEventListener('submit', async function (e) {
        e.preventDefault();

        const anamnese = document.getElementById('anamnese').value;
        const data_assistencia = document.getElementById('data-assistencia').value;
        const nome_cuidador = document.getElementById('nome-cuidador').value;
        const horario_inicio = document.getElementById('horario-inicio').value;
        const horario_fim = document.getElementById('horario-fim').value;
        const observacoes = document.getElementById('observacoes').value;

        try {
            const response = await fetch(`/api/salvar-cuidados/${idosoId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    anamnese,
                    data_assistencia,
                    nome_cuidador,
                    horario_inicio,
                    horario_fim,
                    observacoes
                }),
            });

            if (!response.ok) {
                throw new Error('Erro ao salvar os cuidados');
            }

            const result = await response.json();
            resultado.innerHTML = `<div class="alert alert-success">${result.message}</div>`;
            formCuidados.reset();
            carregarCuidados();  // Recarregar a lista de cuidados após salvar
        } catch (error) {
            resultado.innerHTML = `<div class="alert alert-danger">Erro ao salvar cuidados: ${error.message}</div>`;
        }
    });

    // Carregar os cuidados já registrados
    const carregarCuidados = async () => {
        try {
            const response = await fetch(`/api/listar-cuidados/${idosoId}`);
            if (!response.ok) {
                throw new Error('Erro ao carregar os cuidados');
            }
            const cuidados = await response.json();
            listaCuidados.innerHTML = '';
            if (cuidados.length === 0) {
                listaCuidados.innerHTML = '<p>Nenhum cuidado registrado ainda.</p>';
                return;
            }
            cuidados.forEach(cuidado => {
                const formattedDate = new Date(cuidado.data_assistencia).toLocaleDateString('pt-BR'); // Formatar data para DD/MM/AAAA
                const formattedInicio = cuidado.horario_inicio.slice(0, 5); // Formatar horário HH:MM
                const formattedFim = cuidado.horario_fim.slice(0, 5); // Formatar horário HH:MM

                const item = document.createElement('li');
                item.classList.add('list-group-item');
                item.innerHTML = `
                    <strong>Anamnese:</strong> ${cuidado.anamnese || 'Não informado'}<br>
                    <strong>Data:</strong> ${formattedDate || 'Não informado'}<br>
                    <strong>Nome do Cuidador:</strong> ${cuidado.nome_cuidador || 'Não informado'}<br>
                    <strong>Horário de Início:</strong> ${formattedInicio || 'Não informado'}<br>
                    <strong>Horário de Fim:</strong> ${formattedFim || 'Não informado'}<br>
                    <strong>Observações:</strong> ${cuidado.observacoes || 'Não informado'}
                `;
                listaCuidados.appendChild(item);
            });
        } catch (error) {
            listaCuidados.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
        }
    };

    carregarDetalhes(); // Carrega os detalhes ao abrir a página
    carregarCuidados(); // Carrega os cuidados ao abrir a página
});
