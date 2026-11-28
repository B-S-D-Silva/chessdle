let entrar = document.querySelector("[data-entrar]");
let nomeUsuario = document.querySelector("[data-nome]");
let botaoSair = document.querySelector("[data-sair]");

function mostrarUsuario(usuario) {
    entrar.hidden = true;
    nomeUsuario.textContent = usuario.nome;
    nomeUsuario.hidden = false;
    botaoSair.hidden = false;
}

function sair() {
    botaoSair.disabled = true;

    fetch("/usuarios/sair", { method: "POST" }).then(function (resposta) {
        botaoSair.disabled = false;
        if (resposta.ok) {
            window.location.href = "/";
        } else {
            botaoSair.textContent = "Tentar sair novamente";
        }
    }).catch(function () {
        botaoSair.disabled = false;
        botaoSair.textContent = "Tentar sair novamente";
    });
}

function consultarConta() {
    fetch("/usuarios/sessao", { cache: "no-store" }).then(function (resposta) {
        if (resposta.ok) {
            return resposta.json().then(mostrarUsuario);
        } else if (resposta.status === 401) {
            if (window.location.pathname === "/quiz.html" || window.location.pathname === "/dashboard.html") {
                window.location.href = "/login.html";
            }
        }
    }).catch(function () {
        entrar.textContent = "Entrar novamente";
    });
}

botaoSair.onclick = sair;
consultarConta();
