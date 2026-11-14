let formulario = document.querySelector("#form-conta");
let mensagem = document.querySelector("#mensagem-form");
let botao = formulario.querySelector("button");
let cadastro = formulario.dataset.modo === "cadastro";

function receberResposta(resposta, sucesso, falha) {
    let tipo = resposta.headers.get("content-type");

    if (tipo && tipo.indexOf("application/json") !== -1) {
        resposta.json().then(function (dados) {
            if (!dados || typeof dados !== "object") {
                falha("O servidor enviou uma resposta inválida. Tente novamente.");
            } else if (resposta.ok) {
                sucesso(dados);
            } else if (dados.mensagem) {
                falha(dados.mensagem);
            } else {
                falha("Não foi possível continuar. Tente novamente.");
            }
        }, function () {
            falha("O servidor enviou uma resposta inválida. Tente novamente.");
        });
    } else {
        resposta.text().then(function (texto) {
            if (!resposta.ok && texto && texto.indexOf("<") === -1) {
                falha(texto);
            } else {
                falha("O servidor está desatualizado. Reinicie a aplicação e tente novamente.");
            }
        }, function () {
            falha("Não foi possível ler a resposta do servidor.");
        });
    }
}

function mostrarErro(texto) {
    mensagem.className = "mensagem";
    mensagem.textContent = texto;
    botao.disabled = false;
}

function concluirLogin() {
    fetch("/usuarios/sessao", { cache: "no-store" }).then(function (resposta) {
        receberResposta(resposta, function () {
            window.location.href = "/quiz.html";
        }, mostrarErro);
    }, function () {
        mostrarErro("Não foi possível conectar. Tente novamente.");
    });
}

function concluirCadastro(dados) {
    formulario.reset();
    mensagem.className = "mensagem sucesso";
    mensagem.textContent = dados.mensagem;

    let linkLogin = document.createElement("a");
    linkLogin.href = "/login.html";
    linkLogin.textContent = " Ir para o login";
    mensagem.appendChild(linkLogin);
    botao.disabled = false;
}

function enviarFormulario(evento) {
    evento.preventDefault();

    let email = document.querySelector("#email").value.trim();
    let senha = document.querySelector("#senha").value;
    let nome = "";
    let endereco = "/usuarios/autenticar";

    if (cadastro) {
        nome = document.querySelector("#nome").value.trim();
        endereco = "/usuarios/cadastrar";

        if (senha !== document.querySelector("#confirmacao").value) {
            mostrarErro("As senhas precisam ser iguais.");
            return;
        }
    }

    botao.disabled = true;
    mensagem.textContent = "Aguarde…";

    fetch(endereco, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nomeServer: nome,
            emailServer: email,
            senhaServer: senha
        })
    }).then(function (resposta) {
        if (cadastro) {
            receberResposta(resposta, concluirCadastro, mostrarErro);
        } else {
            receberResposta(resposta, concluirLogin, mostrarErro);
        }
    }, function () {
        mostrarErro("Não foi possível conectar. Tente novamente.");
    });
}

formulario.onsubmit = enviarFormulario;
