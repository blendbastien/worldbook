# Worldbook — `last-horizon-worldbook`

Worldbook (Atlas + 9 mondes) ouvert dans une fenêtre. API `open(monde)`.

Code de la version **1.9.0** (dernière release), pour Foundry VTT v13.

## Liens avec la suite Manhwa

La suite compte un système (Fiche - Manhwa) et 11 modules. La Fiche est le centre : les données partagées y vivent et les modules les lisent via `globalThis.MANHWA`.

- Ouvert depuis la Carte Stellaire.
- Règle commune : un module ne plante jamais si un autre est absent (vérifier `game.modules.get(id)?.active` avant d'appeler son API).

## À savoir

`app/worldbook.html` est le fichier livré. `src/build.py` est l'outil qui l'a produit pour la 1.7.0 ; il lit une ancienne copie qui n'est pas dans ce dépôt.

## Livraison

1. Augmenter `version` dans `module.json` (jamais deux livraisons au même numéro).
2. Construire le zip, qui doit contenir le dossier `last-horizon-worldbook/` :
   ```bash
   mkdir -p build/last-horizon-worldbook && git archive HEAD | tar -x -C build/last-horizon-worldbook
   cd build && zip -qr last-horizon-worldbook.zip last-horizon-worldbook
   ```
3. Créer la release GitHub `vX.Y.Z` avec **exactement 2 fichiers** : `module.json` et `last-horizon-worldbook.zip`. Le manifeste pointe vers `releases/latest/download/…`.
4. The Forge : Bazaar → *Install From Manifest* avec l'URL versionnée `https://github.com/blendbastien/worldbook/releases/download/vX.Y.Z/module.json`. Ne jamais utiliser *Update All Packages*.
5. Redémarrer le monde de test, vérifier la version installée et tester.
