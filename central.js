document.addEventListener('DOMContentLoaded', () => {
    // Simulação: Definindo um tipo de usuário, que pode ser obtido de uma sessão, localStorage ou API.
    const tipoUsuario = localStorage.getItem('tipoUsuario') || 'visitante';

    // Controle de exibição dos botões baseado no tipo de usuário
    if (tipoUsuario === 'admin') {
        // Exibir todos os botões para o administrador
        document.querySelectorAll('.btn').forEach(btn => btn.style.display = 'block');
    } else if (tipoUsuario === 'cuidador') {
        // Exibir apenas botões específicos para cuidadores
        document.querySelectorAll('.btn').forEach(btn => {
            if (btn.classList.contains('btn-warning')) {
                btn.style.display = 'none'; // Esconder o botão 'Detalhes do Idoso'
            } else {
                btn.style.display = 'block';
            }
        });
    } else {
        // Visitante só tem acesso limitado
        document.querySelectorAll('.btn').forEach(btn => {
            if (btn.classList.contains('btn-primary') || btn.classList.contains('btn-success')) {
                btn.style.display = 'block'; // Mostrar consulta e cadastro
            } else {
                btn.style.display = 'none'; // Esconder outras opções
            }
        });
    }

    // Lógica de redirecionamento pós-login
    const loginButton = document.getElementById('login-button');
    if (loginButton) {
        loginButton.addEventListener('click', () => {
            // Após o login, definir o tipo de usuário e redirecionar para a tela central
            localStorage.setItem('tipoUsuario', 'cuidador'); // Ajustar conforme o usuário logado
            window.location.href = '/';
        });
    }
});
