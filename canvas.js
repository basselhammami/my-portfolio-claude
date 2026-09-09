/* ==========================================================================
   Canvas homepage

   Three pieces: a pan/zoom board, the connectors drawn between cards, and
   the window a case study opens into. Everything degrades: with JS off the
   cards are still readable in document order and each case link is an
   ordinary link to its own page.
   ========================================================================== */

(function () {
  "use strict";

  var body = document.body;
  var stage = document.getElementById("stage");
  var world = document.getElementById("world");
  var nodes = document.getElementById("cv-content");
  var wires = document.getElementById("wires");
  var hint = document.getElementById("hint");
  var zoomLabel = document.getElementById("zoom-level");
  var yearEl = document.getElementById("cv-year");

  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // UI strings the script writes itself. Each page sets window.CV_STRINGS
  // before loading this file; these are the fallbacks.
  var T = Object.assign(
    {
      dialogLabel: "Case study",
      loading: "Loading\u2026",
      openFull: "Open full page",
      close: "Close case study",
    },
    window.CV_STRINGS || {}
  );

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var MIN_SCALE = 0.25;
  var MAX_SCALE = 2;

  var view = { x: 0, y: 0, k: 1 };

  /* ── Transform ─────────────────────────────────────────────────────── */

  function apply(animate) {
    if (animate && !reduced) {
      world.classList.add("is-animating");
      window.setTimeout(function () {
        world.classList.remove("is-animating");
      }, 460);
    }
    world.style.transform =
      "translate(" + view.x + "px," + view.y + "px) scale(" + view.k + ")";
    if (zoomLabel) zoomLabel.textContent = Math.round(view.k * 100) + "%";
  }

  // Bounding box of the cards in world coordinates.
  function contentBox() {
    var cards = nodes.querySelectorAll(".cv-card");
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i];
      var l = c.offsetLeft, t = c.offsetTop;
      minX = Math.min(minX, l);
      minY = Math.min(minY, t);
      maxX = Math.max(maxX, l + c.offsetWidth);
      maxY = Math.max(maxY, t + c.offsetHeight);
    }
    if (minX === Infinity) return { x: 0, y: 0, w: 0, h: 0 };
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  }

  function fit(animate) {
    var box = contentBox();
    if (!box.w || !box.h) return;
    var padX = 80;
    var padY = 110; // room for the fixed bar and docks
    var k = Math.min(
      (stage.clientWidth - padX * 2) / box.w,
      (stage.clientHeight - padY * 2) / box.h
    );
    k = Math.max(MIN_SCALE, Math.min(MAX_SCALE, k));
    view.k = k;
    view.x = (stage.clientWidth - box.w * k) / 2 - box.x * k;
    view.y = (stage.clientHeight - box.h * k) / 2 - box.y * k;
    apply(animate);
  }

  // Zoom about a fixed point in screen space, so the thing under the
  // cursor stays under the cursor.
  function zoomAt(sx, sy, nextK, animate) {
    nextK = Math.max(MIN_SCALE, Math.min(MAX_SCALE, nextK));
    var wx = (sx - view.x) / view.k;
    var wy = (sy - view.y) / view.k;
    view.k = nextK;
    view.x = sx - wx * nextK;
    view.y = sy - wy * nextK;
    apply(animate);
  }

  function zoomByStep(factor) {
    zoomAt(stage.clientWidth / 2, stage.clientHeight / 2, view.k * factor, true);
  }

  /* ── Connectors ────────────────────────────────────────────────────── */

  function drawWires() {
    if (!wires) return;
    while (wires.firstChild) wires.removeChild(wires.firstChild);

    var box = contentBox();
    var w = box.x + box.w + 40;
    var h = box.y + box.h + 40;
    wires.setAttribute("width", w);
    wires.setAttribute("height", h);
    wires.setAttribute("viewBox", "0 0 " + w + " " + h);

    var linked = nodes.querySelectorAll("[data-link-to]");
    for (var i = 0; i < linked.length; i++) {
      var el = linked[i];
      var target = document.getElementById("node-" + el.getAttribute("data-link-to"));
      if (!target) continue;

      var a = { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight };
      var b = { x: target.offsetLeft, y: target.offsetTop, w: target.offsetWidth, h: target.offsetHeight };

      // Leave from the side of the card that faces the hub.
      var fromRight = a.x + a.w / 2 < b.x + b.w / 2;
      var x1 = fromRight ? a.x + a.w : a.x;
      var y1 = a.y + a.h / 2;
      var x2 = fromRight ? b.x : b.x + b.w;
      var y2 = b.y + b.h / 2;

      var bend = Math.max(40, Math.abs(x2 - x1) * 0.45);
      var c1 = fromRight ? x1 + bend : x1 - bend;
      var c2 = fromRight ? x2 - bend : x2 + bend;

      var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("class", "cv-wire");
      path.setAttribute(
        "d",
        "M" + x1 + "," + y1 + " C" + c1 + "," + y1 + " " + c2 + "," + y2 + " " + x2 + "," + y2
      );
      wires.appendChild(path);

      [[x1, y1], [x2, y2]].forEach(function (p) {
        var dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        dot.setAttribute("class", "cv-wire-dot");
        dot.setAttribute("cx", p[0]);
        dot.setAttribute("cy", p[1]);
        dot.setAttribute("r", 3);
        wires.appendChild(dot);
      });
    }
  }

  /* ── Pan & zoom input ──────────────────────────────────────────────── */

  var pointers = new Map();
  var panning = false;
  var moved = false;
  var start = { x: 0, y: 0, vx: 0, vy: 0 };
  var pinch = null;

  function isCanvas() {
    return !body.classList.contains("is-list");
  }

  stage.addEventListener("pointerdown", function (e) {
    if (!isCanvas()) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size === 2) {
      var pts = Array.from(pointers.values());
      pinch = {
        d: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y),
        k: view.k,
        cx: (pts[0].x + pts[1].x) / 2,
        cy: (pts[0].y + pts[1].y) / 2,
      };
      panning = false;
      return;
    }

    panning = true;
    moved = false;
    start.x = e.clientX;
    start.y = e.clientY;
    start.vx = view.x;
    start.vy = view.y;
    stage.classList.add("is-panning");
    hideHint();
  });

  stage.addEventListener("pointermove", function (e) {
    if (!isCanvas()) return;
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pinch && pointers.size === 2) {
      var pts = Array.from(pointers.values());
      var d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if (pinch.d > 0) zoomAt(pinch.cx, pinch.cy, pinch.k * (d / pinch.d), false);
      return;
    }

    if (!panning) return;
    var dx = e.clientX - start.x;
    var dy = e.clientY - start.y;
    if (!moved && Math.hypot(dx, dy) > 4) moved = true;
    view.x = start.vx + dx;
    view.y = start.vy + dy;
    apply(false);
  });

  function endPointer(e) {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch = null;
    if (pointers.size === 0) {
      panning = false;
      stage.classList.remove("is-panning");
    }
  }
  stage.addEventListener("pointerup", endPointer);
  stage.addEventListener("pointercancel", endPointer);

  // A drag that ended on a link should not also follow it.
  stage.addEventListener(
    "click",
    function (e) {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    },
    true
  );

  stage.addEventListener(
    "wheel",
    function (e) {
      if (!isCanvas()) return;
      e.preventDefault();
      hideHint();
      // Trackpad pinch and ⌘/ctrl-scroll arrive with ctrlKey set.
      if (e.ctrlKey || e.metaKey) {
        zoomAt(e.clientX, e.clientY, view.k * Math.pow(0.995, e.deltaY), false);
      } else {
        view.x -= e.deltaX;
        view.y -= e.deltaY;
        apply(false);
      }
    },
    { passive: false }
  );

  function hideHint() {
    if (hint && !hint.classList.contains("is-gone")) hint.classList.add("is-gone");
  }

  // Tabbing through the board pans the focused card into view. Only tabbing:
  // a pointer also focuses what it presses, and panning then slides the link
  // out from under the pointer before it is released, so the click lands on
  // nothing and the link never opens.
  var focusFromKeyboard = false;
  document.addEventListener(
    "keydown",
    function (e) {
      if (e.key === "Tab") focusFromKeyboard = true;
    },
    true
  );
  document.addEventListener(
    "pointerdown",
    function () {
      focusFromKeyboard = false;
    },
    true
  );

  nodes.addEventListener("focusin", function (e) {
    if (!isCanvas() || !focusFromKeyboard) return;
    var card = e.target.closest(".cv-card");
    if (!card) return;
    var cx = card.offsetLeft + card.offsetWidth / 2;
    var cy = card.offsetTop + card.offsetHeight / 2;
    view.x = stage.clientWidth / 2 - cx * view.k;
    view.y = stage.clientHeight / 2 - cy * view.k;
    apply(true);
  });

  document.getElementById("zoom-in").addEventListener("click", function () {
    zoomByStep(1.25);
  });
  document.getElementById("zoom-out").addEventListener("click", function () {
    zoomByStep(0.8);
  });
  document.getElementById("zoom-fit").addEventListener("click", function () {
    fit(true);
  });

  /* ── View switch ───────────────────────────────────────────────────── */

  var btnCanvas = document.getElementById("view-canvas");
  var btnList = document.getElementById("view-list");
  var STORE = "cv:view";

  // The chosen view is remembered for the visit, not forever. Persisting it
  // across visits meant one tap on List pinned a browser to the plain view
  // permanently, so a returning visitor never saw the board again. Session
  // storage keeps the choice while browsing — the language switch reloads the
  // page — and lets every fresh visit open on the default for the screen.
  try { localStorage.removeItem(STORE); } catch (err) { /* private mode */ }

  function setView(mode, remember) {
    var list = mode === "list";
    body.classList.toggle("is-list", list);
    btnCanvas.setAttribute("aria-pressed", String(!list));
    btnList.setAttribute("aria-pressed", String(list));
    if (remember) {
      try { sessionStorage.setItem(STORE, mode); } catch (err) { /* private mode */ }
    }
    if (!list) {
      requestAnimationFrame(function () {
        drawWires();
        fit(false);
      });
    }
  }

  btnCanvas.addEventListener("click", function () { setView("canvas", true); });
  btnList.addEventListener("click", function () { setView("list", true); });

  function initialView() {
    var stored = null;
    try { stored = sessionStorage.getItem(STORE); } catch (err) { /* private mode */ }
    if (stored === "canvas" || stored === "list") return stored;
    // The board on the web, the list on phones, where panning a board is a
    // worse version of a scroll.
    if (window.matchMedia("(max-width: 720px)").matches) return "list";
    return "canvas";
  }

  /* ── Case window ───────────────────────────────────────────────────── */

  var backdrop = null;
  var frame = null;
  var titleEl = null;
  var fullLink = null;
  var lastFocus = null;

  function buildWindow() {
    backdrop = document.createElement("div");
    backdrop.className = "cv-window-backdrop";
    backdrop.setAttribute("role", "dialog");
    backdrop.setAttribute("aria-modal", "true");
    backdrop.setAttribute("aria-label", T.dialogLabel);
    backdrop.innerHTML =
      '<div class="cv-window">' +
        '<div class="cv-window-bar">' +
          '<span class="cv-window-title">' +
            '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>' +
            '<b></b>' +
          '</span>' +
          '<span class="cv-window-actions">' +
            '<a class="cv-window-full" target="_blank" rel="noopener">' + T.openFull + ' <span aria-hidden="true">↗</span></a>' +
            '<button type="button" class="cv-icon-btn" data-close aria-label="' + T.close + '">' +
              '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>' +
            '</button>' +
          '</span>' +
        '</div>' +
        '<div class="cv-window-body">' +
          '<span class="cv-window-loading">' + T.loading + '</span>' +
          '<iframe class="cv-window-frame" title="Case study"></iframe>' +
        '</div>' +
      '</div>';
    document.body.appendChild(backdrop);

    frame = backdrop.querySelector(".cv-window-frame");
    titleEl = backdrop.querySelector(".cv-window-title b");
    fullLink = backdrop.querySelector(".cv-window-full");

    backdrop.addEventListener("click", function (e) {
      if (e.target === backdrop || e.target.closest("[data-close]")) closeWindow();
    });

    frame.addEventListener("load", function () { trim(); });
  }

  // The case page carries its own header and Back link, which are noise
  // inside a window that already has a title bar and a close button. The
  // page files stay untouched; the trim is injected into the frame.
  //
  // This deliberately does not wait for the frame's load event: that waits on
  // every subresource, so one slow webfont would leave the header showing for
  // the whole load. Injecting as soon as a document exists trims it before it
  // is ever painted.
  function trim() {
    var doc;
    try {
      doc = frame.contentDocument;
    } catch (err) {
      return true; // Different origin — nothing to do, stop asking.
    }
    if (!doc || !doc.head || doc.URL === "about:blank") return false;
    if (doc.documentElement.getAttribute("data-cv-trim") === frame.src) return true;

    var style = doc.createElement("style");
    style.textContent =
      ".site-header,.back-link{display:none!important}" +
      ".n-page{padding-top:2rem!important}";
    doc.head.appendChild(style);
    doc.documentElement.setAttribute("data-cv-trim", frame.src);

    var loading = backdrop.querySelector(".cv-window-loading");
    if (loading) loading.style.display = "none";
    return true;
  }

  var trimTimer = null;
  function trimUntilDone() {
    window.clearInterval(trimTimer);
    var tries = 0;
    trimTimer = window.setInterval(function () {
      if (trim() || ++tries > 150) window.clearInterval(trimTimer);
    }, 40);
  }

  function openWindow(href, label) {
    if (!backdrop) buildWindow();
    lastFocus = document.activeElement;
    titleEl.textContent = label;
    fullLink.href = href;
    var loading = backdrop.querySelector(".cv-window-loading");
    if (loading) loading.style.display = "";
    frame.src = href;
    trimUntilDone();
    body.classList.add("cv-locked");
    requestAnimationFrame(function () { backdrop.classList.add("is-open"); });
    backdrop.querySelector("[data-close]").focus();
  }

  function closeWindow() {
    if (!backdrop || !backdrop.classList.contains("is-open")) return;
    backdrop.classList.remove("is-open");
    body.classList.remove("cv-locked");
    window.clearInterval(trimTimer);
    window.setTimeout(function () {
      if (!backdrop.classList.contains("is-open")) frame.src = "about:blank";
    }, 300);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    if (location.hash) {
      history.pushState("", document.title, location.pathname + location.search);
    }
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeWindow();
  });

  // Keep tab focus inside the window while it is open.
  document.addEventListener("focusin", function (e) {
    if (!backdrop || !backdrop.classList.contains("is-open")) return;
    if (!backdrop.contains(e.target)) {
      backdrop.querySelector("[data-close]").focus();
    }
  });

  var caseLinks = nodes.querySelectorAll(".cv-case-link");
  for (var i = 0; i < caseLinks.length; i++) {
    caseLinks[i].addEventListener("click", function (e) {
      // Leave modified clicks alone so "open in new tab" still works.
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      var link = e.currentTarget;
      var titleNode = link.querySelector(".cv-case-title");
      openWindow(link.getAttribute("href"), titleNode ? titleNode.textContent : T.dialogLabel);
    });
  }

  window.addEventListener("popstate", closeWindow);

  /* ── Boot ──────────────────────────────────────────────────────────── */

  function relayout() {
    drawWires();
    if (isCanvas()) fit(false);
  }

  setView(initialView(), false);
  drawWires();
  if (isCanvas()) fit(false);

  // Card heights settle once images and webfonts land.
  window.addEventListener("load", relayout);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(relayout).catch(function () {});
  }

  var resizeTimer;
  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(relayout, 150);
  });

  window.setTimeout(hideHint, 6000);
})();
