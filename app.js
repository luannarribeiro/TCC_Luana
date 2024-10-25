const express = require('express');
const path = require('path');
const sql = require('mssql');  // Conexão com o SQL Server
const cors = require('cors'); // Pacote CORS
const app = express();

// Middleware para lidar com JSON no corpo da requisição
app.use(express.json());
app.use(cors()); // Habilitar CORS

// Configuração de conexão para o SQL Server
const dbConfig = {
    user: 'rds',
    password: 'rds',
    server: 'localhost',
    database: 'monitoramento_saude',
    options: {
        encrypt: false,
        trustServerCertificate: true,
    }
};

// Função para formatar a data no formato dd/mm/aaaa
function formatDate(date) {
    const d = new Date(date);
    const day = d.getUTCDate().toString().padStart(2, '0');
    const month = (d.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = d.getUTCFullYear();
    return `${day}/${month}/${year}`;
}

// Função para formatar o horário no formato hh:mm
function formatTime(time) {
    const d = new Date(time);
    const hours = d.getUTCHours().toString().padStart(2, '0');
    const minutes = d.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

// Testar a conexão com o banco de dados
sql.connect(dbConfig).then(pool => {
    console.log('Conexão bem-sucedida com o SQL Server');
    return pool.request().query('SELECT 1');
}).catch(err => {
    console.error('Erro ao conectar no SQL Server:', err);
});

// Rota para listar todos os idosos
app.get('/api/listar-idosos', (req, res) => {
    sql.connect(dbConfig).then(pool => {
        return pool.request().query('SELECT id, nome, idade, relato, observacoes FROM idosos');
    }).then(result => {
        console.log('Idosos encontrados:', result.recordset);
        res.json(result.recordset);
    }).catch(err => {
        console.error('Erro ao buscar idosos:', err);
        res.status(500).send('Erro ao buscar idosos');
    });
});

// Rota para listar cuidados de um idoso
app.get('/api/listar-cuidados/:id', (req, res) => {
    const { id } = req.params;
    sql.connect(dbConfig).then(pool => {
        return pool.request()
            .input('id', sql.Int, id)
            .query('SELECT anamnese, observacoes, data_assistencia, nome_cuidador, horario_inicio, horario_fim FROM cuidados WHERE idoso_id = @id');
    }).then(result => {
        res.json(result.recordset.map(cuidado => ({
            ...cuidado,
            data_assistencia: formatDate(cuidado.data_assistencia),
            horario_inicio: formatTime(cuidado.horario_inicio),
            horario_fim: formatTime(cuidado.horario_fim)
        })));
    }).catch(err => {
        console.error('Erro ao listar cuidados:', err);
        res.status(500).send('Erro ao listar cuidados');
    });
});

// Rota para cadastrar um idoso
app.post('/api/cadastro-idoso', (req, res) => {
    const { nome, idade, relato, observacoes } = req.body;
    console.log('Dados recebidos para cadastro:', req.body);
    sql.connect(dbConfig).then(pool => {
        return pool.request()
            .input('nome', sql.VarChar, nome)
            .input('idade', sql.Int, idade)
            .input('relato', sql.VarChar, relato)
            .input('observacoes', sql.VarChar, observacoes)
            .query('INSERT INTO idosos (nome, idade, relato, observacoes) VALUES (@nome, @idade, @relato, @observacoes)');
    }).then(result => {
        console.log('Idoso cadastrado com sucesso');
        res.json({ message: 'Idoso cadastrado com sucesso!' });
    }).catch(err => {
        console.error('Erro ao cadastrar idoso:', err);
        res.status(500).send('Erro ao cadastrar idoso');
    });
});

// Rota para obter detalhes de um idoso
app.get('/api/detalhes-idoso/:id', (req, res) => {
    const { id } = req.params;
    console.log('Buscando detalhes do idoso com ID:', id);
    sql.connect(dbConfig).then(pool => {
        return pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM idosos WHERE id = @id');
    }).then(result => {
        if (result.recordset.length > 0) {
            console.log('Detalhes do idoso:', result.recordset[0]);
            res.json(result.recordset[0]);
        } else {
            console.log('Idoso não encontrado');
            res.status(404).send('Idoso não encontrado');
        }
    }).catch(err => {
        console.error('Erro ao buscar detalhes do idoso:', err);
        res.status(500).send('Erro ao buscar detalhes do idoso');
    });
});

// Rota para salvar cuidados de home care
app.post('/api/salvar-cuidados/:id', (req, res) => {
    const { anamnese, data_assistencia, nome_cuidador, horario_inicio, horario_fim } = req.body;
    const { id } = req.params;

    console.log('Dados recebidos para salvar cuidados:', req.body);

    // Validação dos campos
    if (!anamnese || !data_assistencia || !nome_cuidador || !horario_inicio || !horario_fim) {
        console.log('Erro: Todos os campos são obrigatórios');
        return res.status(400).send('Todos os campos são obrigatórios!');
    }

    // Garantir que o ID é um número inteiro
    const idosoId = parseInt(id);
    if (isNaN(idosoId)) {
        console.log('Erro: ID do idoso inválido');
        return res.status(400).send('ID do idoso inválido');
    }

    // Garantir que os formatos de data e hora estejam corretos
    const formattedDate = new Date(data_assistencia).toISOString().split('T')[0]; // Formato YYYY-MM-DD

    // Ajustar o formato dos horários para garantir que estejam no formato HH:MM:SS
    const formattedHorarioInicio = horario_inicio.length === 5 ? `${horario_inicio}:00` : horario_inicio;
    const formattedHorarioFim = horario_fim.length === 5 ? `${horario_fim}:00` : horario_fim;

    sql.connect(dbConfig).then(pool => {
        return pool.request()
            .input('id', sql.Int, idosoId)
            .input('anamnese', sql.VarChar(500), anamnese)
            .input('data_assistencia', sql.Date, formattedDate)
            .input('nome_cuidador', sql.VarChar(255), nome_cuidador)
            .input('horario_inicio', sql.VarChar(8), formattedHorarioInicio)
            .input('horario_fim', sql.VarChar(8), formattedHorarioFim)
            .query('INSERT INTO cuidados (idoso_id, anamnese, data_assistencia, nome_cuidador, horario_inicio, horario_fim) VALUES (@id, @anamnese, @data_assistencia, @nome_cuidador, @horario_inicio, @horario_fim)');
    }).then(result => {
        console.log('Cuidados salvos com sucesso');
        res.json({ message: 'Cuidados salvos com sucesso!' });
    }).catch(err => {
        console.error('Erro ao salvar cuidados:', err);
        res.status(500).send('Erro ao salvar cuidados');
    });
});

// Rota para buscar cuidados filtrando pelo nome do idoso e pela data
app.get('/api/buscar-cuidados', (req, res) => {
    const { nome, data } = req.query; // Receber parâmetros pela query string

    if (!nome || !data) {
        return res.status(400).send('Nome do idoso e data são obrigatórios!');
    }

    console.log(`Buscando cuidados para o idoso com nome: ${nome} e data: ${data}`);

    sql.connect(dbConfig).then(pool => {
        return pool.request()
            .input('nome', sql.VarChar, nome)
            .input('data_assistencia', sql.Date, data)
            .query('SELECT cuidados.*, idosos.nome AS nome_idoso FROM cuidados INNER JOIN idosos ON cuidados.idoso_id = idosos.id WHERE idosos.nome = @nome AND cuidados.data_assistencia = @data_assistencia');
    }).then(result => {
        console.log('Dados encontrados:', result.recordset);
        res.json(result.recordset.map(cuidado => ({
            ...cuidado,
            data_assistencia: formatDate(cuidado.data_assistencia),
            horario_inicio: formatTime(cuidado.horario_inicio),
            horario_fim: formatTime(cuidado.horario_fim)
        })));
    }).catch(err => {
        console.error('Erro ao buscar cuidados:', err);
        res.status(500).send('Erro ao buscar cuidados');
    });
});

// Rota para obter o nome do idoso pelo ID
app.get('/api/nome-idoso/:id', (req, res) => {
    const { id } = req.params;
    sql.connect(dbConfig).then(pool => {
        return pool.request()
            .input('id', sql.Int, id)
            .query('SELECT nome FROM idosos WHERE id = @id');
    }).then(result => {
        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).send('Idoso não encontrado');
        }
    }).catch(err => {
        console.error('Erro ao buscar nome do idoso:', err);
        res.status(500).send('Erro ao buscar nome do idoso');
    });
});

// Servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Rota para a página centralizadora
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'central.html'));
});

app.get('/consulta.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'consulta.html'));
});

app.get('/cadastro.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cadastro.html'));
});

app.get('/buscar-cuidados.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'buscar-cuidados.html'));
});

app.get('/detalhes-idoso.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'detalhes-idoso.html'));
});

// Iniciar o servidor
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
