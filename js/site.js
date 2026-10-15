// Alpha Vitta Consultoria — interações do site
(function () {
  "use strict";

  var WHATS = "5511978260281";
  var reduzMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("js");

  function linkWhats(texto) {
    return "https://wa.me/" + WHATS + "?text=" + encodeURIComponent(texto);
  }

  // Tema claro/escuro: cada clique alterna e a escolha fica salva
  var raiz = document.documentElement;
  var temaBtn = document.querySelector("[data-tema-btn]");
  var metaCor = document.querySelector('meta[name="theme-color"]');
  function aplicarTema(tema) {
    raiz.setAttribute("data-tema", tema);
    var escuro = tema === "escuro";
    if (temaBtn) temaBtn.setAttribute("aria-pressed", String(escuro));
    if (metaCor) metaCor.setAttribute("content", escuro ? "#0a1430" : "#132a57");
  }
  aplicarTema(raiz.getAttribute("data-tema") === "escuro" ? "escuro" : "claro");
  if (temaBtn) {
    temaBtn.addEventListener("click", function () {
      var novo = raiz.getAttribute("data-tema") === "escuro" ? "claro" : "escuro";
      try { localStorage.setItem("av-tema", novo); } catch (e) {}
      if (document.startViewTransition && !reduzMovimento) {
        document.startViewTransition(function () { aplicarTema(novo); });
      } else {
        aplicarTema(novo);
      }
    });
  }

  // Faixa de operadoras: as logos passam sozinhas (pausa no hover, no foco ou pelo botão)
  var faixa = document.querySelector("[data-faixa]");
  var faixaPausa = document.querySelector("[data-faixa-pausa]");
  var montarFaixa = function () {
    var trilho = faixa.querySelector(".faixa__trilho");
    var originais = Array.prototype.slice.call(trilho.children);
    var copiar = function () {
      originais.forEach(function (li) {
        var c = li.cloneNode(true);
        c.setAttribute("aria-hidden", "true");
        trilho.appendChild(c);
      });
    };
    faixa.classList.add("is-rolando");
    // repete o conjunto até cobrir a tela e depois duplica tudo, para o laço não ter emenda
    var largura = function () { return trilho.scrollWidth; };
    var umaVolta = largura();
    var voltas = Math.min(6, Math.max(1, Math.ceil(faixa.clientWidth / Math.max(umaVolta, 1))));
    for (var i = 1; i < voltas; i++) copiar();
    var metade = trilho.children.length;
    for (var j = 0; j < metade; j++) {
      var c = trilho.children[j].cloneNode(true);
      c.setAttribute("aria-hidden", "true");
      trilho.appendChild(c);
    }
    faixa.style.setProperty("--faixa-dur", Math.round(largura() / 2 / 45) + "s");
    if (faixaPausa) {
      faixaPausa.hidden = false;
      faixaPausa.addEventListener("click", function () {
        var pausada = faixa.classList.toggle("is-pausada");
        faixaPausa.setAttribute("aria-pressed", String(pausada));
        faixaPausa.querySelector("span").textContent = pausada ? "Retomar logos" : "Pausar logos";
        faixaPausa.querySelector("use").setAttribute("href", pausada ? "#i-play" : "#i-pausa");
      });
    }
  };
  if (faixa && !reduzMovimento) {
    if (document.readyState === "complete") montarFaixa();
    else window.addEventListener("load", montarFaixa);
  }

  // Cabeçalho: as opções saem uma a uma (da última para a primeira) para a sidebar quando falta espaço
  var cabEl = document.querySelector("[data-cab]");
  var cabIn = cabEl && cabEl.querySelector(".cab__in");
  var itensBarra = Array.prototype.slice.call(document.querySelectorAll(".nav__lista li"));
  var ctaBarra = document.querySelector(".nav__cta");
  var gaveta = document.querySelector("[data-gaveta]");
  var itensGaveta = gaveta ? Array.prototype.slice.call(gaveta.querySelectorAll(".gaveta__lista li")) : [];
  var menuBtn = document.querySelector("[data-menu-btn]");
  var focoAntes = null;

  function fecharGaveta(devolverFoco) {
    if (!gaveta) return;
    gaveta.classList.remove("is-aberta");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.querySelector(".sr").textContent = "Abrir menu";
    document.body.style.overflow = "";
    if (devolverFoco !== false && focoAntes && focoAntes.focus) focoAntes.focus();
  }
  function abrirGaveta() {
    focoAntes = document.activeElement;
    gaveta.classList.add("is-aberta");
    menuBtn.setAttribute("aria-expanded", "true");
    menuBtn.querySelector(".sr").textContent = "Fechar menu";
    document.body.style.overflow = "hidden";
    setTimeout(function () { gaveta.querySelector(".gaveta__fechar").focus(); }, 30);
  }

  var encaixar = function () {
    if (!cabIn) return;
    itensBarra.forEach(function (li) { li.hidden = false; });
    if (ctaBarra) ctaBarra.hidden = false;
    cabEl.classList.remove("tem-gaveta");
    var sobra = function () { return cabIn.scrollWidth > cabIn.clientWidth + 1; };
    var saiu = 0;
    if (sobra()) {
      cabEl.classList.add("tem-gaveta");
      for (var i = itensBarra.length - 1; i >= 0 && sobra(); i--) { itensBarra[i].hidden = true; saiu++; }
      if (sobra() && ctaBarra) ctaBarra.hidden = true;
    }
    itensGaveta.forEach(function (li, i) { li.hidden = !(itensBarra[i] && itensBarra[i].hidden); });
    if (!saiu && gaveta && gaveta.classList.contains("is-aberta")) fecharGaveta(false);
  };

  if (gaveta && menuBtn) {
    menuBtn.addEventListener("click", function () {
      if (gaveta.classList.contains("is-aberta")) fecharGaveta(); else abrirGaveta();
    });
    gaveta.addEventListener("click", function (e) {
      if (e.target.closest("[data-gaveta-fechar]")) fecharGaveta();
      else if (e.target.closest("a")) fecharGaveta(false);
    });
    document.addEventListener("keydown", function (e) {
      if (!gaveta.classList.contains("is-aberta")) return;
      if (e.key === "Escape") { fecharGaveta(); return; }
      if (e.key === "Tab") {
        var focaveis = Array.prototype.filter.call(gaveta.querySelectorAll("a[href], button"), function (el) { return el.offsetParent !== null; });
        var primeiro = focaveis[0], ultimo = focaveis[focaveis.length - 1];
        if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
        else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
      }
    });
  }
  if (cabIn) {
    encaixar();
    if ("ResizeObserver" in window) new ResizeObserver(encaixar).observe(cabIn);
    else window.addEventListener("resize", encaixar);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(encaixar);
  }

  // Cabeçalho com sombra ao rolar e WhatsApp flutuante depois do hero
  var cab = document.querySelector("[data-cab]");
  var flutuante = document.querySelector(".whats-flutuante");
  var hero = document.querySelector(".hero");
  function aoRolar() {
    var y = window.scrollY;
    if (cab) cab.classList.toggle("is-rolado", y > 8);
    if (flutuante && hero) flutuante.classList.toggle("is-visivel", y > hero.offsetHeight * 0.75);
  }
  window.addEventListener("scroll", aoRolar, { passive: true });
  aoRolar();

  // Link ativo no menu conforme a seção visível
  var linksMenu = Array.prototype.slice.call(document.querySelectorAll(".nav__lista a, .gaveta__lista a"));
  if ("IntersectionObserver" in window && linksMenu.length) {
    var mapa = {};
    linksMenu.forEach(function (a) { var id = a.getAttribute("href").slice(1); (mapa[id] = mapa[id] || []).push(a); });
    var obsSecao = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        var a = mapa[en.target.id];
        if (!a) return;
        if (en.isIntersecting) {
          linksMenu.forEach(function (l) { l.removeAttribute("aria-current"); });
          a.forEach(function (l) { l.setAttribute("aria-current", "true"); });
        } else {
          a.forEach(function (l) { l.removeAttribute("aria-current"); });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(mapa).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) obsSecao.observe(el);
    });
  }

  // Cotador do hero: o botão reescreve a mensagem conforme a escolha
  var cotador = document.querySelector("[data-cotador]");
  if (cotador) {
    var link = cotador.querySelector("[data-cotador-link]");
    var rotulo = cotador.querySelector("[data-cotador-rotulo]");
    var rotulos = {
      "só para mim": "Ver planos para mim no WhatsApp",
      "para minha família": "Ver planos para a família no WhatsApp",
      "para uma gestante": "Ver planos para gestante no WhatsApp",
      "para alguém com 60 anos ou mais": "Ver planos 60+ no WhatsApp",
      "para minha empresa": "Cotar para a empresa no WhatsApp"
    };
    var atualizar = function (animar) {
      var marcado = cotador.querySelector("input[name=perfil]:checked");
      var valor = marcado ? marcado.value : "só para mim";
      link.href = linkWhats("Olá! Vim pelo site da Alpha Vitta e quero orientação sobre um plano de saúde " + valor + ".");
      var novo = rotulos[valor] || "Ver minhas opções no WhatsApp";
      if (!animar || reduzMovimento) { rotulo.textContent = novo; return; }
      link.classList.add("is-trocando");
      setTimeout(function () {
        rotulo.textContent = novo;
        link.classList.remove("is-trocando");
      }, 180);
    };
    cotador.addEventListener("change", function () { atualizar(true); });
    cotador.addEventListener("submit", function (e) { e.preventDefault(); link.click(); });
    atualizar(false);
  }

  // Abas de planos (padrão WAI-ARIA)
  var abas = document.querySelector("[data-abas]");
  if (abas) {
    var botoes = Array.prototype.slice.call(abas.querySelectorAll("[role=tab]"));
    var lista = abas.querySelector("[role=tablist]");
    var marcador = document.createElement("span");
    marcador.className = "abas__marcador";
    marcador.setAttribute("aria-hidden", "true");
    lista.insertBefore(marcador, lista.firstChild);
    abas.classList.add("is-marcador");
    var posicionar = function () {
      var atual = abas.querySelector("[role=tab][aria-selected=true]");
      if (!atual) return;
      marcador.style.width = atual.offsetWidth + "px";
      marcador.style.transform = "translateX(" + atual.offsetLeft + "px)";
    };
    posicionar();
    requestAnimationFrame(function () { abas.classList.add("is-deslizando"); });
    window.addEventListener("resize", posicionar);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(posicionar);

    var selecionar = function (botao, focar) {
      var antes = botoes.indexOf(abas.querySelector("[role=tab][aria-selected=true]"));
      var dir = botoes.indexOf(botao) >= antes ? 1 : -1;
      botoes.forEach(function (b) {
        var ativo = b === botao;
        b.setAttribute("aria-selected", String(ativo));
        b.tabIndex = ativo ? 0 : -1;
        var painel = document.getElementById(b.getAttribute("aria-controls"));
        painel.style.setProperty("--dir", dir);
        painel.hidden = !ativo;
      });
      posicionar();
      if (focar) botao.focus();
      botao.scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduzMovimento ? "auto" : "smooth" });
    };
    botoes.forEach(function (b, i) {
      b.addEventListener("click", function () { selecionar(b, false); });
      b.addEventListener("keydown", function (e) {
        var alvo = null;
        if (e.key === "ArrowRight") alvo = botoes[(i + 1) % botoes.length];
        if (e.key === "ArrowLeft") alvo = botoes[(i - 1 + botoes.length) % botoes.length];
        if (e.key === "Home") alvo = botoes[0];
        if (e.key === "End") alvo = botoes[botoes.length - 1];
        if (alvo) { e.preventDefault(); selecionar(alvo, true); }
      });
    });
  }

  // Números: contam ao entrar na tela (o valor final já está no HTML)
  var numeros = document.querySelectorAll("[data-contar]");
  if (!reduzMovimento && "IntersectionObserver" in window && numeros.length) {
    var formato = new Intl.NumberFormat("pt-BR");
    var obsNum = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (!en.isIntersecting) return;
        obsNum.unobserve(en.target);
        var el = en.target;
        var fim = Number(el.getAttribute("data-contar"));
        var inicio = performance.now();
        var dur = 1400;
        var passo = function (t) {
          var p = Math.min(1, (t - inicio) / dur);
          var e = 1 - Math.pow(2, -10 * p);
          el.textContent = formato.format(Math.round(fim * (p === 1 ? 1 : e)));
          if (p < 1) requestAnimationFrame(passo);
        };
        requestAnimationFrame(passo);
      });
    }, { threshold: 0.6 });
    numeros.forEach(function (n) { obsNum.observe(n); });
  }

  // Formulário: valida e abre o WhatsApp com a mensagem pronta
  var form = document.querySelector("[data-form]");
  if (form) {
    var ok = form.querySelector("[data-form-ok]");
    var okLink = form.querySelector("[data-form-ok-link]");
    var tel = form.querySelector("#f-tel");

    tel.addEventListener("input", function () {
      var d = tel.value.replace(/\D/g, "").slice(0, 11);
      var f = d;
      if (d.length > 2) f = "(" + d.slice(0, 2) + ") " + d.slice(2);
      if (d.length > 7) f = "(" + d.slice(0, 2) + ") " + d.slice(2, d.length - 4) + "-" + d.slice(-4);
      tel.value = f;
    });

    var regras = {
      nome: function (v) { return v.trim().length >= 2 ? "" : "Digite seu nome para sabermos como chamar você."; },
      telefone: function (v) { var d = v.replace(/\D/g, ""); return d.length >= 10 ? "" : "Digite o WhatsApp com DDD, por exemplo (11) 91234-5678."; },
      email: function (v) { return !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Este e-mail parece incompleto. Confira ou deixe em branco."; },
      perfil: function (v) { return v ? "" : "Escolha para quem é o plano."; }
    };
    var validar = function (campo) {
      var regra = regras[campo.name];
      if (!regra) return true;
      var msg = regra(campo.value);
      var erro = document.getElementById(campo.getAttribute("aria-describedby"));
      campo.setAttribute("aria-invalid", msg ? "true" : "false");
      if (erro) erro.textContent = msg;
      return !msg;
    };
    form.addEventListener("blur", function (e) {
      if (e.target.name && e.target.value) validar(e.target);
    }, true);
    form.addEventListener("input", function (e) {
      if (e.target.getAttribute("aria-invalid") === "true") validar(e.target);
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var campos = ["nome", "telefone", "email", "perfil"].map(function (n) { return form.elements[n]; });
      var invalidos = campos.filter(function (c) { return !validar(c); });
      if (invalidos.length) { invalidos[0].focus(); return; }
      var d = form.elements;
      var texto = "Olá! Vim pelo site da Alpha Vitta.\n" +
        "Nome: " + d.nome.value.trim() + "\n" +
        "WhatsApp: " + d.telefone.value.trim() + "\n" +
        (d.email.value.trim() ? "E-mail: " + d.email.value.trim() + "\n" : "") +
        "Plano: " + d.perfil.value + "\n" +
        (d.mensagem.value.trim() ? "Detalhes: " + d.mensagem.value.trim() : "");
      var url = linkWhats(texto.trim());
      okLink.href = url;
      ok.hidden = false;
      window.open(url, "_blank", "noopener");
    });
  }

  var ano = document.querySelector("[data-ano]");
  if (ano) ano.textContent = new Date().getFullYear();
})();
