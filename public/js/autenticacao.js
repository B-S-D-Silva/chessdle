let formulario = document.forms[0];
let cadastro = formulario.dataset.modo === "cadastro";

function enviarFormulario(evento) {
    evento.preventDefault();
    if (formulario.botao.disabled) {
        return;
    }

    let email = formulario.email.value.trim();
    let senha = formulario.senha.value;
    let nome = "";
    let endereco = "/usuarios/autenticar";

    if (cadastro) {
        nome = formulario.nome.value.trim();
        endereco = "/usuarios/cadastrar";

        if (senha !== formulario.confirmacao.value) {
            formulario.mensagem.textContent = "As senhas precisam ser iguais.";
            return;
        }
    }

    formulario.botao.disabled = true;
    formulario.mensagem.className = "mensagem";
    formulario.mensagem.textContent = "Aguarde…";

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
            formulario.botao.disabled = false;

            if (!resposta.ok) {
                formulario.mensagem.textContent = dados.mensagem;
            } else if (cadastro) {
                formulario.reset();
                formulario.mensagem.className = "mensagem sucesso";
                formulario.mensagem.textContent = "Conta criada. Agora entre pelo link Entrar.";
            } else {
                window.location.href = "/quiz.html";
            }
        });
    }).catch(function () {
        formulario.botao.disabled = false;
        formulario.mensagem.textContent = "Não foi possível concluir. Tente novamente.";
    });
}

formulario.onsubmit = enviarFormulario;
