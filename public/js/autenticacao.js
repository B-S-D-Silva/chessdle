const formulario = document.querySelector("#form-conta");
async function lerResposta(resposta) {
    const texto = await resposta.text();
    const tipo = resposta.headers.get("content-type") || "";
    let resultado;
    if (tipo.includes("application/json")) {
        try {
            resultado = JSON.parse(texto);
        } catch {
            throw new Error("O servidor enviou uma resposta inválida. Atualize a página e tente novamente.");
        }
    } else {
        // A API antiga devolvia erros em texto com Content-Type text/html.
        const mensagemTexto = texto.trim();
        const mensagem = mensagemTexto && !/[<>]/.test(mensagemTexto)
            ? mensagemTexto.slice(0, 300)
            : "O servidor não respondeu como esperado. Reinicie a aplicação e tente novamente.";
        if (!resposta.ok) throw new Error(mensagem);
        throw new Error("O servidor está desatualizado. Reinicie a aplicação para usar o novo cadastro e login.");
    }
    if (!resultado || typeof resultado !== "object") {
        throw new Error("O servidor enviou uma resposta inválida. Tente novamente.");
    }
    if (!resposta.ok) throw new Error(resultado.mensagem || "Não foi possível continuar.");
    return resultado;
}
formulario.addEventListener("submit", async evento => {
    evento.preventDefault();
    const cadastro = formulario.dataset.modo === "cadastro";
    const mensagem = document.querySelector("#mensagem-form");
    const botao = formulario.querySelector("button");
    const dados = new FormData(formulario);
    mensagem.classList.remove("sucesso");
    if (cadastro && dados.get("senha") !== dados.get("confirmacao")) {
        mensagem.textContent = "As senhas precisam ser iguais.";
        document.querySelector("#confirmacao").focus();
        return;
    }
    botao.disabled = true;
    formulario.setAttribute("aria-busy", "true");
    mensagem.textContent = cadastro ? "Criando sua conta…" : "Conferindo seus dados…";
    try {
        const resposta = await fetch(cadastro ? "/usuarios/cadastrar" : "/usuarios/autenticar", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nomeServer: dados.get("nome"), emailServer: dados.get("email"), senhaServer: dados.get("senha") })
        });
        const resultado = await lerResposta(resposta);
        if (cadastro) {
            formulario.reset();
            mensagem.textContent = resultado.mensagem;
            mensagem.classList.add("sucesso");
            const link = document.createElement("a");
            link.href = "/login.html";
            link.textContent = " Ir para o login →";
            mensagem.append(link);
        } else {
            // Só abre o quiz depois de confirmar que o servidor reconheceu o cookie.
            const sessao = await fetch("/usuarios/sessao", { cache: "no-store", credentials: "same-origin" });
            await lerResposta(sessao);
            sessionStorage.clear();
            window.location.assign("/quiz.html");
        }
    } catch (erro) {
        mensagem.textContent = erro instanceof TypeError ? "Não foi possível conectar. Tente novamente." : erro.message;
    } finally {
        botao.disabled = false;
        formulario.removeAttribute("aria-busy");
    }
});
