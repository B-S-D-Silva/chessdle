var conquistas = [
    {
        codigo: "primeira-partida",
        nome: "Primeira partida",
        descricao: "Conclua seu primeiro desafio diário.",
        icone: "peao",
        verificar: function(dados) { return dados.partidas >= 1; }
    },
    {
        codigo: "acertou-de-primeira",
        nome: "Acertou de primeira",
        descricao: "Acerte qualquer desafio na primeira tentativa.",
        icone: "alvo",
        verificar: function(dados) { return dados.acertosDePrimeira >= 1; }
    },
    {
        codigo: "sem-erro",
        nome: "Sem erro",
        descricao: "Acerte cinco desafios em até duas tentativas.",
        icone: "escudo",
        verificar: function(dados) { return dados.acertosEmAteDuas >= 5; }
    },
    {
        codigo: "sequencia-7",
        nome: "7 dias de sequência",
        descricao: "Jogue ao menos um desafio por sete dias seguidos.",
        icone: "chama",
        verificar: function(dados) { return dados.maiorSequencia >= 7; }
    },
    {
        codigo: "sequencia-30",
        nome: "30 dias de sequência",
        descricao: "Jogue ao menos um desafio por 30 dias seguidos.",
        icone: "coroa",
        verificar: function(dados) { return dados.maiorSequencia >= 30; }
    },
    {
        codigo: "aberturas-10",
        nome: "10 aberturas acertadas",
        descricao: "Acerte dez desafios de Adivinhe a abertura.",
        icone: "torre",
        verificar: function(dados) { return dados.aberturasAcertadas >= 10; }
    },
    {
        codigo: "citacoes-10",
        nome: "Fã de citações",
        descricao: "Acerte dez desafios do modo Citação.",
        icone: "citacao",
        verificar: function(dados) { return dados.citacoesAcertadas >= 10; }
    },
    {
        codigo: "jogadores-10",
        nome: "Detetive",
        descricao: "Acerte dez desafios de Adivinhe o jogador.",
        icone: "lupa",
        verificar: function(dados) { return dados.jogadoresAcertados >= 10; }
    },
    {
        codigo: "mestre-tres-modos",
        nome: "Mestre dos três modos",
        descricao: "Acerte os três desafios do mesmo dia.",
        icone: "tres-pecas",
        verificar: function(dados) { return dados.diasPerfeitos >= 1; }
    },
    {
        codigo: "persistente",
        nome: "Persistente",
        descricao: "Acerte um desafio exatamente na sexta tentativa.",
        icone: "trofeu",
        verificar: function(dados) { return dados.acertosNaSexta >= 1; }
    }
];

module.exports = conquistas;
