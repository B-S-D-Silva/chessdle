let linksEntrar = document.querySelectorAll("[data-entrar]");
let nomesUsuario = document.querySelectorAll("[data-nome]");
let botoesSair = document.querySelectorAll("[data-sair]");

function mostrarUsuario(usuario) {
    for (let i = 0; i < linksEntrar.length; i++) {
        linksEntrar[i].hidden = true;
    }

    for (let i = 0; i < nomesUsuario.length; i++) {
        nomesUsuario[i].textContent = usuario.nome;
        nomesUsuario[i].hidden = false;
    }

    for (let i = 0; i < botoesSair.length; i++) {
        botoesSair[i].hidden = false;
    }
}

function sair() {
    fetch("/usuarios/sair", { method: "POST" }).then(function (resposta) {
        if (resposta.ok) {
            window.location.href = "/";
        } else {
            for (let i = 0; i < botoesSair.length; i++) {
                botoesSair[i].textContent = "Tentar sair novamente";
            }
        }
    }, function () {
        for (let i = 0; i < botoesSair.length; i++) {
            botoesSair[i].textContent = "Tentar sair novamente";
        }
    });
}

for (let i = 0; i < botoesSair.length; i++) {
    botoesSair[i].onclick = sair;
}

fetch("/usuarios/sessao", { cache: "no-store" }).then(function (resposta) {
    if (resposta.ok) {
        resposta.json().then(mostrarUsuario, function () {
        });
    }
}, function () {
});
