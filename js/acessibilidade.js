/* ==========================================================================
   JavaScript - Central de Acessibilidade (Padrão Grandes Portais + eMAG/WCAG)
   ========================================================================== */

(function () {
  "use strict";

  const KEYS = {
    contrast: "a11y_high_contrast",
    darkMode: "a11y_dark_mode",
    fontSize: "a11y_font_size",
    dyslexia: "a11y_dyslexia_spacing",
    highlightLinks: "a11y_highlight_links",
    reduceMotion: "a11y_reduce_motion",
    readingRuler: "a11y_reading_ruler",
    readingMask: "a11y_reading_mask",
    colorSim: "a11y_color_sim"
  };

  let currentFontPercent = parseInt(localStorage.getItem(KEYS.fontSize) || "100", 10);

  function announce(message) {
    const region = document.getElementById("a11y-announcer");
    if (!region) return;
    region.textContent = "";
    window.setTimeout(() => {
      region.textContent = message;
    }, 50);
  }

  function setPressed(id, value) {
    const el = document.getElementById(id);
    if (el) el.setAttribute("aria-pressed", String(value));
  }

  function applyPreferences() {
    const html = document.documentElement;
    const isHighContrast = localStorage.getItem(KEYS.contrast) === "true";
    const isDarkMode = localStorage.getItem(KEYS.darkMode) === "true";
    const isDyslexia = localStorage.getItem(KEYS.dyslexia) === "true";
    const isHighlightLinks = localStorage.getItem(KEYS.highlightLinks) === "true";
    const isReduceMotion = localStorage.getItem(KEYS.reduceMotion) === "true";
    const isReadingRuler = localStorage.getItem(KEYS.readingRuler) === "true";
    const isReadingMask = localStorage.getItem(KEYS.readingMask) === "true";
    const colorSim = localStorage.getItem(KEYS.colorSim) || "none";

    html.classList.toggle("high-contrast", isHighContrast);
    html.classList.toggle("dark-mode", isDarkMode && !isHighContrast);
    html.classList.toggle("dyslexia-spacing", isDyslexia);
    html.classList.toggle("highlight-links", isHighlightLinks);
    html.classList.toggle("reduce-motion", isReduceMotion);
    html.classList.toggle("reading-ruler-on", isReadingRuler);
    html.classList.toggle("reading-mask-on", isReadingMask);
    html.style.setProperty("--font-size-base", currentFontPercent + "%");

    html.classList.remove("cvd-protanopia", "cvd-tritanopia", "cvd-monochromacy");
    if (colorSim === "protanopia") html.classList.add("cvd-protanopia");
    if (colorSim === "tritanopia") html.classList.add("cvd-tritanopia");
    if (colorSim === "monochromacy") html.classList.add("cvd-monochromacy");

    setPressed("btn-contrast", isHighContrast);
    setPressed("btn-dark-mode", isDarkMode);
    setPressed("btn-dyslexia", isDyslexia);
    setPressed("btn-highlight-links", isHighlightLinks);
    setPressed("btn-reduce-motion", isReduceMotion);
    setPressed("btn-reading-ruler", isReadingRuler);
    setPressed("btn-reading-mask", isReadingMask);

    const selectColor = document.getElementById("select-color-sim");
    if (selectColor) selectColor.value = colorSim;
  }

  function setupReadingOverlays() {
    const ruler = document.createElement("div");
    ruler.id = "reading-guide-ruler";
    ruler.setAttribute("aria-hidden", "true");

    const maskTop = document.createElement("div");
    maskTop.id = "reading-mask-top";
    maskTop.setAttribute("aria-hidden", "true");

    const maskBottom = document.createElement("div");
    maskBottom.id = "reading-mask-bottom";
    maskBottom.setAttribute("aria-hidden", "true");

    document.body.appendChild(ruler);
    document.body.appendChild(maskTop);
    document.body.appendChild(maskBottom);

    function updatePosition(clientY) {
      ruler.style.top = Math.max(0, clientY - 7) + "px";
      const windowHeight = window.innerHeight;
      const bandHalf = 65;
      const topH = Math.max(0, clientY - bandHalf);
      const bottomH = Math.max(0, windowHeight - (clientY + bandHalf));
      maskTop.style.height = topH + "px";
      maskBottom.style.height = bottomH + "px";
    }

    window.addEventListener("mousemove", (e) => updatePosition(e.clientY), { passive: true });
    updatePosition(window.innerHeight / 2);
  }

  function setupToolbarAndDrawer() {
    applyPreferences();

    const drawerToggle = document.getElementById("btn-a11y-drawer");
    const drawer = document.getElementById("a11y-drawer");
    const drawerClose = document.getElementById("btn-a11y-close");

    function toggleDrawer(forceState) {
      if (!drawer || !drawerToggle) return;
      const willOpen = typeof forceState === "boolean" ? forceState : drawer.hidden;
      drawer.hidden = !willOpen;
      drawerToggle.setAttribute("aria-expanded", String(willOpen));
      announce(willOpen ? "Painel de recursos assistivos aberto." : "Painel de recursos assistivos fechado.");
    }

    if (drawerToggle && drawer) {
      drawerToggle.addEventListener("click", () => toggleDrawer());
    }
    if (drawerClose) {
      drawerClose.addEventListener("click", () => {
        toggleDrawer(false);
        if (drawerToggle) drawerToggle.focus();
      });
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && drawer && !drawer.hidden) {
        toggleDrawer(false);
        if (drawerToggle) drawerToggle.focus();
      }
    });

    function bindToggle(btnId, storageKey, onMsg, offMsg) {
      const btn = document.getElementById(btnId);
      if (!btn) return;
      btn.addEventListener("click", () => {
        const next = localStorage.getItem(storageKey) !== "true";
        localStorage.setItem(storageKey, String(next));
        if (storageKey === KEYS.contrast && next) {
          localStorage.setItem(KEYS.darkMode, "false");
        }
        if (storageKey === KEYS.darkMode && next) {
          localStorage.setItem(KEYS.contrast, "false");
        }
        applyPreferences();
        announce(next ? onMsg : offMsg);
      });
    }

    bindToggle("btn-contrast", KEYS.contrast, "Modo de alto contraste ativado.", "Modo de alto contraste desativado.");
    bindToggle("btn-dark-mode", KEYS.darkMode, "Modo escuro ativado.", "Modo claro restaurado.");
    bindToggle("btn-dyslexia", KEYS.dyslexia, "Espaçamento ampliado de leitura ativado.", "Espaçamento padrão restaurado.");
    bindToggle("btn-highlight-links", KEYS.highlightLinks, "Destaque visual de links ativado.", "Destaque visual de links desativado.");
    bindToggle("btn-reduce-motion", KEYS.reduceMotion, "Animações e transições pausadas.", "Animações restauradas.");
    bindToggle("btn-reading-ruler", KEYS.readingRuler, "Régua guia de leitura ativada.", "Régua guia de leitura desativada.");
    bindToggle("btn-reading-mask", KEYS.readingMask, "Máscara de foco de leitura ativada.", "Máscara de foco de leitura desativada.");

    const btnFontUp = document.getElementById("btn-font-up");
    const btnFontDown = document.getElementById("btn-font-down");
    const btnFontReset = document.getElementById("btn-font-reset");

    if (btnFontUp) {
      btnFontUp.addEventListener("click", () => {
        if (currentFontPercent < 140) {
          currentFontPercent += 10;
          localStorage.setItem(KEYS.fontSize, String(currentFontPercent));
          applyPreferences();
          announce("Fonte aumentada para " + currentFontPercent + " por cento.");
        } else {
          announce("Tamanho máximo de fonte atingido.");
        }
      });
    }

    if (btnFontDown) {
      btnFontDown.addEventListener("click", () => {
        if (currentFontPercent > 80) {
          currentFontPercent -= 10;
          localStorage.setItem(KEYS.fontSize, String(currentFontPercent));
          applyPreferences();
          announce("Fonte reduzida para " + currentFontPercent + " por cento.");
        } else {
          announce("Tamanho mínimo de fonte atingido.");
        }
      });
    }

    if (btnFontReset) {
      btnFontReset.addEventListener("click", () => {
        currentFontPercent = 100;
        localStorage.setItem(KEYS.fontSize, "100");
        applyPreferences();
        announce("Fonte restaurada para 100 por cento.");
      });
    }

    const selectColor = document.getElementById("select-color-sim");
    if (selectColor) {
      selectColor.addEventListener("change", () => {
        localStorage.setItem(KEYS.colorSim, selectColor.value);
        applyPreferences();
        announce("Filtro de percepção de cores atualizado.");
      });
    }

    const btnResetAll = document.getElementById("btn-reset-a11y");
    if (btnResetAll) {
      btnResetAll.addEventListener("click", () => {
        Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
        currentFontPercent = 100;
        applyPreferences();
        announce("Todas as preferências visuais de acessibilidade foram restauradas para o padrão.");
      });
    }
  }

  function setupSectionSpeech() {
    if (!("speechSynthesis" in window)) return;
    const sections = document.querySelectorAll("main .article-section");
    sections.forEach((sec, idx) => {
      const heading = sec.querySelector("h2, h3");
      const titleText = heading ? heading.textContent.trim() : `Seção ${idx + 1}`;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "section-speak-btn";
      btn.setAttribute("aria-label", `Ouvir leitura em voz alta da seção: ${titleText}`);
      btn.textContent = "Ouvir esta seção";

      btn.addEventListener("click", () => {
        const clone = sec.cloneNode(true);
        clone.querySelectorAll("button, .back-top, details").forEach((el) => el.remove());
        const text = clone.textContent.replace(/\s+/g, " ").trim();
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = "pt-BR";
        window.speechSynthesis.speak(utter);
        announce(`Lendo em voz alta: ${titleText}`);
      });

      sec.appendChild(btn);
    });
  }

  function setupGlossaryFilter() {
    const input = document.getElementById("glossary-search");
    const items = document.querySelectorAll(".glossary-item");
    const count = document.getElementById("glossary-count");
    if (!input || !items.length) return;

    function filterTerms() {
      const q = input.value.trim().toLowerCase();
      let visible = 0;
      items.forEach((item) => {
        const ok = !q || item.textContent.toLowerCase().includes(q);
        item.style.display = ok ? "" : "none";
        if (ok) visible++;
      });
      if (count) {
        count.textContent = `Exibindo ${visible} de ${items.length} termos no glossário.`;
      }
    }

    input.addEventListener("input", filterTerms);
    filterTerms();
  }

  function setupAccessibleForm() {
    const form = document.getElementById("relato-form");
    if (!form) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const nome = document.getElementById("nome");
      const email = document.getElementById("email");
      const localCotidiano = document.getElementById("local-cotidiano");
      const mensagem = document.getElementById("mensagem");
      const feedback = document.getElementById("form-feedback");

      const fields = [
        {
          el: nome,
          errId: "err-nome",
          valid: () => nome.value.trim().length >= 3,
          msg: "Informe seu nome completo (mínimo de 3 caracteres)."
        },
        {
          el: email,
          errId: "err-email",
          valid: () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()),
          msg: "Informe um endereço de e-mail válido, por exemplo: nome@dominio.com."
        },
        {
          el: localCotidiano,
          errId: "err-local",
          valid: () => localCotidiano.value !== "",
          msg: "Selecione o ambiente da vida cotidiana onde a situação ocorreu."
        },
        {
          el: mensagem,
          errId: "err-mensagem",
          valid: () => mensagem.value.trim().length >= 15,
          msg: "Descreva seu relato ou experiência com pelo menos 15 caracteres."
        }
      ];

      let firstInvalid = null;

      fields.forEach((item) => {
        const errSpan = document.getElementById(item.errId);
        if (!item.valid()) {
          item.el.setAttribute("aria-invalid", "true");
          errSpan.textContent = item.msg;
          if (!firstInvalid) firstInvalid = item.el;
        } else {
          item.el.removeAttribute("aria-invalid");
          errSpan.textContent = "";
        }
      });

      if (firstInvalid) {
        feedback.className = "status-box error";
        feedback.textContent = "Existem campos obrigatórios com erro. O foco foi movido para o primeiro campo que precisa de correção.";
        firstInvalid.focus();
        return;
      }

      feedback.className = "status-box success";
      feedback.textContent = `Obrigado, ${nome.value.trim()}! Seu relato sobre "${localCotidiano.options[localCotidiano.selectedIndex].text}" foi registrado com sucesso.`;
      form.reset();
      feedback.focus();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    setupReadingOverlays();
    setupToolbarAndDrawer();
    setupSectionSpeech();
    setupGlossaryFilter();
    setupAccessibleForm();
  });
})();
