document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('login-form');
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Processar login localmente
        if (email === "admin@example.com" && password === "admin123") {
            alert("Login bem-sucedido!");
            window.location.href = "central.html"; // Redireciona para a tela centralizadora
        } else {
            alert("Credenciais inválidas, tente novamente.");
        }
    });
});
