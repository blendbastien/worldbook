/* The Last Horizon — Worldbook (Foundry v12/v13) */
const MOD = "last-horizon-worldbook";
const { ApplicationV2 } = foundry.applications.api;

class WorldbookApp extends ApplicationV2 {
  static DEFAULT_OPTIONS = {
    id: "lh-worldbook",
    classes: ["lh-frame"],
    window: { title: "The Last Horizon — Worldbook", icon: "fa-solid fa-globe", resizable: true, minimizable: true },
    position: { width: 1400, height: 880 }
  };
  async _prepareContext() { return {}; }
  async _renderHTML() {
    const f = document.createElement("iframe");
    f.className = "lh-iframe";
    f.src = `modules/${MOD}/app/worldbook.html`;
    f.setAttribute("allow", "clipboard-write");
    return f;
  }
  _replaceHTML(result, content) { content.replaceChildren(result); }
}

let app = null;
function openWorldbook() {
  if (!app) app = new WorldbookApp();
  app.render({ force: true });
  return app;
}

Hooks.once("init", () => {
  game.modules.get(MOD).api = { open: openWorldbook };
  game.settings.register(MOD, "playersCanOpen", {
    name: "Les joueurs peuvent ouvrir le Worldbook",
    hint: "Si désactivé, seul le MJ voit le bouton.",
    scope: "world", config: true, type: Boolean, default: true
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

/* Bouton dans l'onglet Journal de la barre latérale */
Hooks.on("renderJournalDirectory", (dir, html) => {
  if (!game.user.isGM && !game.settings.get(MOD, "playersCanOpen")) return;
  const root = html instanceof HTMLElement ? html : html[0];
  if (root.querySelector(".lh-wb-btn")) return;
  const btn = document.createElement("button");
  btn.className = "lh-wb-btn";
  btn.innerHTML = '<i class="fa-solid fa-globe"></i> Worldbook — The Last Horizon';
  btn.addEventListener("click", openWorldbook);
  const header = root.querySelector(".directory-header") || root.querySelector("header");
  (header || root).appendChild(btn);
});
