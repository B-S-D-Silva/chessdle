document.querySelectorAll(".logout-button").forEach(function(botao) {
  botao.addEventListener("click", function() {
    var destino = botao.getAttribute("data-redirect");
    sessionStorage.clear();
    window.location.replace(destino);
  });
});
