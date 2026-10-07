// Language switch: animates the pill, remembers the choice, and suggests the
// other language when the browser prefers it. Never auto-redirects, so search
// engines index both versions through hreflang.
(function () {
  var KEY = "calinv-lang";
  var current = document.documentElement.lang.slice(0, 2);

  function save(lang) {
    try {
      localStorage.setItem(KEY, lang);
    } catch (e) {}
  }

  function saved() {
    try {
      return localStorage.getItem(KEY);
    } catch (e) {
      return null;
    }
  }

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll(".lang-switch").forEach(function (sw) {
    sw.addEventListener("click", function (event) {
      var link = event.target.closest("a[hreflang]");
      if (!link) return;
      var target = link.getAttribute("hreflang");
      save(target);
      if (target === current) {
        event.preventDefault();
        return;
      }
      if (reduceMotion || event.metaKey || event.ctrlKey || event.shiftKey) return;
      // Let the thumb slide before the page changes.
      event.preventDefault();
      sw.setAttribute("data-active", target);
      setTimeout(function () {
        window.location.href = link.href + window.location.hash;
      }, 220);
    });
  });

  // Suggest the other language once, only if the visitor never chose one.
  if (saved()) return;
  var browser = (navigator.languages && navigator.languages[0]) || navigator.language || "";
  var wanted = browser.toLowerCase().indexOf("es") === 0 ? "es" : "en";
  if (wanted === current) return;
  var other = document.querySelector('.lang-switch a[hreflang="' + wanted + '"]');
  if (!other) return;

  var text = wanted === "en"
    ? { msg: "This page is also available in English.", go: "View in English", close: "Keep Spanish" }
    : { msg: "Esta página también está en español.", go: "Ver en español", close: "Seguir en inglés" };

  var toast = document.createElement("div");
  toast.className = "lang-toast";
  toast.setAttribute("role", "status");
  toast.setAttribute("lang", wanted);
  toast.innerHTML =
    '<span></span><a class="lang-toast-go"></a><button type="button" class="lang-toast-close"></button>';
  toast.querySelector("span").textContent = text.msg;
  var go = toast.querySelector("a");
  go.textContent = text.go;
  go.href = other.href;
  go.addEventListener("click", function () {
    save(wanted);
  });
  var close = toast.querySelector("button");
  close.textContent = "×";
  close.setAttribute("aria-label", text.close);
  close.addEventListener("click", function () {
    save(current);
    toast.classList.remove("is-visible");
    setTimeout(function () {
      toast.remove();
    }, 250);
  });
  document.body.appendChild(toast);
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      toast.classList.add("is-visible");
    });
  });
})();
