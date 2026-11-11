/* The Last Horizon — Worldbook (Foundry v12/v13) */
const MOD = "last-horizon-worldbook";
const { ApplicationV2 } = foundry.applications.api;

class WorldbookApp extends ApplicationV2 {
  static DEFAULT_OPTIONS = {
    id: "lh-worldbook",
    classes: ["lh-frame", "ms-fsable", "ms-fs-band"],
    window: { title: "Worldbook", subtitle: "Atlas des mondes", icon: "fa-solid fa-globe", resizable: true, minimizable: true },
    position: { width: 1400, height: 880 }
  };
  async _prepareContext() { return {}; }
  async _renderHTML() {
    const f = document.createElement("iframe");
    f.className = "lh-iframe";
    const w = this._lhWorld ? `&w=${encodeURIComponent(this._lhWorld)}` : "";
    f.src = `modules/${MOD}/app/worldbook.html?v=${game.modules.get(MOD)?.version ?? ""}${w}`;
    f.setAttribute("allow", "clipboard-write; fullscreen");
    f.addEventListener("load", () => { f._lhLoaded = true; });
    f.allowFullscreen = true;
    return f;
  }
  _replaceHTML(result, content) { content.replaceChildren(result); }
}

let app = null;
/* Plein écran : si le navigateur refuse le plein écran depuis l'iframe, la page demande à l'hôte
   d'agrandir la fenêtre Foundry sur tout l'écran (classe .lh-maxi). */
window.addEventListener("message", (ev) => {
  const d = ev.data;
  if (!d || d.type !== "wb-full" || !app?.element) return;
  if (ev.source !== app.element.querySelector("iframe.lh-iframe")?.contentWindow) return;
  const el = app.element;
  if (d.on) {
    app._lhPos = { ...app.position };
    el.classList.add("lh-maxi");
    el.requestFullscreen?.().catch(() => {});
  } else {
    el.classList.remove("lh-maxi");
    if (document.fullscreenElement === el) document.exitFullscreen().catch(() => {});
    if (app._lhPos) app.setPosition(app._lhPos);
  }
});
/* 1.7.0 : open(monde) ouvre directement la fiche d'un monde (utilisé par Carte Stellaire Manhwa) */
function openWorldbook(world) {
  const w = typeof world === "string" ? world : null;
  if (!app) { app = new WorldbookApp(); app._lhWorld = w; app.render({ force: true }); return app; }
  if (app.rendered) {
    if (w) { app._lhWorld = w; const fr = app.element?.querySelector("iframe.lh-iframe");
      if (fr?._lhLoaded) fr.contentWindow?.postMessage({ type: "wb-show", w }, "*");
      else if (fr) fr.src = `modules/${MOD}/app/worldbook.html?v=${game.modules.get(MOD)?.version ?? ""}&w=${encodeURIComponent(w)}`; }
    if (app.minimized) app.maximize?.();
    app.bringToFront?.();
  } else { app._lhWorld = w; app.render({ force: true }); }
  return app;
}

Hooks.once("init", () => {
  game.modules.get(MOD).api = { open: openWorldbook };
  game.settings.register(MOD, "playersCanOpen", {
    name: "Les joueurs peuvent ouvrir le Worldbook",
    hint: "Si désactivé, seul le MJ voit le bouton.",
    scope: "world", config: true, type: Boolean, default: true
  });
  game.settings.register(MOD, "sidebarButtons", { name: "Boutons dans la barre latérale", hint: "Affiche un bouton d'ouverture du Worldbook en haut de l'onglet Journal et/ou Objets. Désactivé par défaut (le contrôle de scène reste).", scope: "world", config: true, type: String, choices: { none: "Masqués (défaut)", journal: "Onglet Journal", items: "Onglet Objets", both: "Journal et Objets" }, default: "none", onChange: () => { ui.journal?.render(); ui.items?.render(); } });
  /* 1.7.0 : la carte stellaire est partie dans le module « Carte Stellaire Manhwa » */
  if (false) game.settings.register(MOD, "mapAutoFull", {
    name: "Carte stellaire : plein écran automatique",
    hint: "Quand on ouvre la carte stellaire depuis l'atlas, elle passe d'elle-même en plein écran (Échap pour revenir). Chaque joueur peut aussi changer ce réglage depuis la barre d'outils de la carte (bouton AUTO PLEIN ÉCRAN).",
    scope: "client", config: true, type: Boolean, default: true
  });
});

/* Bouton dans les contrôles de scène (v13 : objets ; v12 : tableaux) */
Hooks.on("getSceneControlButtons", (controls) => {
  if (!game.user.isGM && !game.settings.get(MOD, "playersCanOpen")) return;
  const tool = {
    name: "lh-worldbook",
    title: "Worldbook — The Last Horizon",
    icon: "fa-solid fa-globe",
    button: true,
    order: 99,
    onChange: () => openWorldbook(),
    onClick: () => openWorldbook()
  };
  if (Array.isArray(controls)) {               // v12
    const notes = controls.find(c => c.name === "notes") || controls[0];
    notes.tools.push(tool);
  } else {                                      // v13
    const notes = controls.notes || controls.tokens;
    if (notes) notes.tools["lh-worldbook"] = tool;
  }
});

/* 1.5.3 : l'ancien bouton inconditionnel de l'onglet Journal est retiré — seul le réglage « Boutons dans la barre latérale » décide */
/* Bouton facultatif dans la barre latérale (réglage « Boutons dans la barre latérale », masqué par défaut) */
const lhSidebarBtn = (dir, html, where) => {
  const mode = game.settings.get(MOD, "sidebarButtons") || "none"; if (mode !== "both" && mode !== where) return;
  if (!game.user.isGM && !game.settings.get(MOD, "playersCanOpen")) return;
  const root = html instanceof HTMLElement ? html : html[0]; if (root.querySelector(".lh-wb-btn")) return;
  const b = document.createElement("button"); b.type = "button"; b.className = "lh-wb-btn"; b.innerHTML = '<i class="fa-solid fa-globe"></i> Worldbook'; b.addEventListener("click", () => openWorldbook());
  (root.querySelector(".directory-header") || root.querySelector("header") || root).appendChild(b);
};
Hooks.on("renderJournalDirectory", (dir, html) => lhSidebarBtn(dir, html, "journal"));
Hooks.on("renderItemDirectory", (dir, html) => lhSidebarBtn(dir, html, "items"));
/* 1.6.0 : l'iframe et universe.json portent la version (?v=) pour éviter le cache après mise à jour */
