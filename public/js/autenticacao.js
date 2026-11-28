let formulario = document.querySelector("#form-conta");
let mensagem = document.querySelector("#mensagem-form");
let botao = formulario.querySelector("button");
let campoNome = document.querySelector("#nome");

function enviarFormulario(evento) {
    evento.preventDefault();
    if (botao.disabled) {
        return;
    }

    let email = document.querySelector("#email").value.trim();
    let senha = document.querySelector("#senha").value;
    let nome = "";
    let endereco = "/usuarios/autenticar";

    if (campoNome) {
        nome = document.querySelector("#nome").value.trim();
        endereco = "/usuarios/cadastrar";

        if (senha !== document.querySelector("#confirmacao").value) {
            mensagem.textContent = "As senhas precisam ser iguais.";
            return;
        }
    }

    botao.disabled = true;
    mensagem.className = "mensagem";
    mensagem.textContent = "Aguarde…";

    let dados = {
        nomeServer: nome,
        emailServer: email,
        senhaServer: senha
    };

    fetch(endereco, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    }).then(function (resposta) {
        return resposta.json().then(function (dados) {
            botao.disabled = false;

            if (!resposta.ok) {
                mensagem.textContent = dados.mensagem;
            } else if (campoNome) {
                formulario.reset();
                mensagem.className = "mensagem sucesso";
                mensagem.textContent = "Conta criada. Agora entre pelo link Entrar.";
            } else {
                window.location.href = "/quiz.html";
            }
        });
    }).catch(function () {
        botao.disabled = false;
        mensagem.textContent = "Não foi possível concluir. Tente novamente.";
    });
}

formulario.onsubmit = enviarFormulario;
