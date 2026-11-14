// PERSONALIZAR: ranking de exemplo. Edite a ordem, os jogadores e os motivos.
const favoritos = [
    { nome: "Judit Polgár", pais: "Hungria", motivo: "Gosto da coragem de buscar a iniciativa e de tornar uma posição complicada em uma oportunidade.", feito: "Em 2005, chegou ao oitavo lugar do ranking mundial absoluto." },
    { nome: "José Raúl Capablanca", pais: "Cuba", motivo: "A clareza dos seus planos me lembra que uma ideia simples também pode ser profunda.", feito: "Tornou-se campeão mundial em 1921, ao vencer Emanuel Lasker." },
    { nome: "Mikhail Tal", pais: "Letônia", motivo: "Sua criatividade me inspira a olhar além do lance mais óbvio e a imaginar possibilidades.", feito: "Conquistou o título mundial em 1960, contra Mikhail Botvinnik." },
    { nome: "Magnus Carlsen", pais: "Noruega", motivo: "Admiro a paciência de continuar procurando recursos em posições que parecem tranquilas.", feito: "Conquistou seu primeiro título mundial clássico em 2013." },
    { nome: "Hikaru Nakamura", pais: "Estados Unidos", motivo: "Admiro a rapidez com que encontra recursos e o jeito próximo e espontâneo de compartilhar o xadrez.", feito: "Conquistou o Campeonato Mundial de Fischer Random em 2022.", fonteFeito: "https://www.fide.com/new-us-world-champion-nakamura-follows-in-bobby-fischers-footsteps/" }
];
const fotosFavoritos = [
    { arquivo: "judit-polgar", autor: "Przemysław Jahr", fonte: "https://commons.wikimedia.org/wiki/File:Judit_Polg%C3%A1r_2013.jpg", licenca: "CC BY-SA 3.0", urlLicenca: "https://creativecommons.org/licenses/by-sa/3.0/" },
    { arquivo: "capablanca", autor: "Autor desconhecido / Keystone-France", fonte: "https://commons.wikimedia.org/wiki/File:Jos%C3%A9_Ra%C3%BAl_Capablanca_1931.jpg", licenca: "Domínio público" },
    { arquivo: "mikhail-tal", autor: "Harry Pot / Anefo", fonte: "https://commons.wikimedia.org/wiki/File:Mikhail_Tal_1962.jpg", licenca: "CC BY-SA 3.0 NL", urlLicenca: "https://creativecommons.org/licenses/by-sa/3.0/nl/" },
    { arquivo: "magnus-carlsen", autor: "Frans Peeters Photography", fonte: "https://commons.wikimedia.org/wiki/File:Magnus_Carlsen_Tata_2023_-_71_(cropped_v4).jpg", licenca: "CC BY-SA 2.0", urlLicenca: "https://creativecommons.org/licenses/by-sa/2.0/" },
    { arquivo: "hikaru-nakamura", autor: "ChessKelly", fonte: "https://commons.wikimedia.org/wiki/File:Hikaru_Nakamura_at_the_2026_Naroditsky_Memorial_Rapid_and_Blitz_(v2).jpg", licenca: "CC BY 4.0", urlLicenca: "https://creativecommons.org/licenses/by/4.0/" }
];
const ranking = document.querySelector("#ranking");
if (ranking) {
    for (let i = 0; i < favoritos.length; i++) {
        const jogador = favoritos[i];
        const artigo = document.createElement("article");
        artigo.className = "favorito";
        const posicao = document.createElement("span");
        posicao.className = "posicao";
        posicao.textContent = String(i + 1).padStart(2, "0");
        const foto = fotosFavoritos[i];
        const retrato = document.createElement("figure");
        retrato.className = "retrato-jogador";
        const imagem = document.createElement("img");
        imagem.src = "/assets/jogadores/" + foto.arquivo + ".jpg";
        imagem.alt = "Retrato de " + jogador.nome;
        imagem.width = 160;
        imagem.height = 200;
        imagem.loading = i === 0 ? "eager" : "lazy";
        imagem.decoding = "async";
        const credito = document.createElement("figcaption");
        const fonte = document.createElement("a");
        fonte.href = foto.fonte;
        fonte.textContent = foto.autor;
        const licenca = document.createElement("a");
        licenca.href = foto.urlLicenca || foto.fonte;
        licenca.textContent = foto.licenca;
        credito.append(fonte, document.createTextNode(" · "), licenca);
        retrato.append(imagem, credito);
        const identidade = document.createElement("div");
        const nome = document.createElement("h3");
        nome.textContent = jogador.nome;
        const pais = document.createElement("p");
        pais.className = "pais";
        pais.textContent = jogador.pais;
        identidade.append(nome, pais);
        const motivo = document.createElement("p");
        motivo.textContent = jogador.motivo;
        const feito = document.createElement("p");
        feito.className = "feito";
        const rotulo = document.createElement("strong");
        rotulo.textContent = "Para lembrar";
        feito.append(rotulo, document.createTextNode(jogador.feito));
        if (jogador.fonteFeito) {
            const referencia = document.createElement("a");
            referencia.href = jogador.fonteFeito;
            referencia.textContent = "Fonte: FIDE";
            feito.append(document.createTextNode(" "), referencia);
        }
        const comentario = document.createElement("div");
        comentario.className = "comentario-jogador";
        comentario.append(motivo, feito);
        artigo.append(posicao, retrato, identidade, comentario);
        ranking.append(artigo);
    }
}
async function atualizarConta() {
    try {
        const resposta = await fetch("/usuarios/sessao");
        if (!resposta.ok) return;
        const usuario = await resposta.json();
        document.querySelectorAll("[data-entrar]").forEach(item => { item.hidden = true; });
        document.querySelectorAll("[data-nome]").forEach(item => { item.textContent = usuario.nome; item.hidden = false; });
        document.querySelectorAll("[data-sair]").forEach(item => { item.hidden = false; });
    } catch { /* A home continua disponível mesmo sem conexão. */ }
}
document.querySelectorAll("[data-sair]").forEach(botao => {
    botao.addEventListener("click", async () => {
        botao.disabled = true;
        try {
            const resposta = await fetch("/usuarios/sair", { method: "POST" });
            if (!resposta.ok) throw new Error();
            sessionStorage.clear();
            window.location.assign("/");
        } catch {
            botao.disabled = false;
            botao.textContent = "Tentar sair novamente";
        }
    });
});
atualizarConta();
