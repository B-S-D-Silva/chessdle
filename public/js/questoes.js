let questoes = [
    {
        enunciado: "Qual é o objetivo principal do xadrez?",
        alternativas: [
            "Capturar todas as peças",
            "Dar xeque-mate no rei adversário",
            "Chegar primeiro ao outro lado"
        ],
        respostaCorreta: 1,
        explicacao: "Xeque-mate é um ataque ao rei do qual ele não consegue escapar."
    },
    {
        enunciado: "Qual peça pode saltar sobre outras peças?",
        alternativas: [
            "Bispo",
            "Torre",
            "Cavalo"
        ],
        respostaCorreta: 2,
        explicacao: "O cavalo salta e se move em L: duas casas em uma direção e uma perpendicular."
    },
    {
        enunciado: "Como o bispo se move?",
        alternativas: [
            "Pelas diagonais",
            "Somente uma casa para frente",
            "Na horizontal e na vertical"
        ],
        respostaCorreta: 0,
        explicacao: "O bispo percorre diagonais livres e permanece na mesma cor de casa."
    },
    {
        enunciado: "Quando o roque é permitido?",
        alternativas: [
            "Mesmo com o rei em xeque",
            "Quando rei e torre nunca se moveram, o caminho está livre e o rei não está, passa ou termina em xeque",
            "Sempre que o rei e a torre estiverem na mesma fileira"
        ],
        respostaCorreta: 1,
        explicacao: "Além do caminho livre e das peças ainda não movidas, o rei não pode estar em xeque, atravessar nem terminar em casa atacada."
    },
    {
        enunciado: "Quando é possível capturar en passant?",
        alternativas: [
            "Em qualquer turno após o avanço",
            "Quando uma torre captura um peão",
            "No turno imediatamente seguinte ao avanço de duas casas de um peão que termina ao lado do seu"
        ],
        respostaCorreta: 2,
        explicacao: "Seu peão precisa estar na quinta fileira a partir do seu lado. A captura trata o avanço adversário como se tivesse sido de uma casa."
    },
    {
        enunciado: "O que acontece com um peão que chega à última fileira?",
        alternativas: [
            "É promovido a dama, torre, bispo ou cavalo",
            "Vira obrigatoriamente um rei",
            "Sai do jogo"
        ],
        respostaCorreta: 0,
        explicacao: "Você escolhe dama, torre, bispo ou cavalo, mesmo que já tenha outras peças desse tipo."
    },
    {
        enunciado: "Como o peão captura normalmente?",
        alternativas: [
            "Para trás",
            "Uma casa na diagonal à frente",
            "Duas casas em linha reta"
        ],
        respostaCorreta: 1,
        explicacao: "O peão avança em linha reta, mas captura uma casa na diagonal à frente."
    },
    {
        enunciado: "Qual lado faz o primeiro movimento?",
        alternativas: [
            "As pretas",
            "Quem ganhou a partida anterior",
            "As brancas"
        ],
        respostaCorreta: 2,
        explicacao: "As brancas começam. Depois, os turnos se alternam."
    }
];

if (typeof module !== "undefined") {
    module.exports = questoes;
}
