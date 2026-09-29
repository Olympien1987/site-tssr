# Mise en ligne sur GitHub Pages avec ton nom de domaine

1. Crée un dépôt public sur GitHub (ex. `memo-tssr`) et dépose à la racine : `index.html` (accueil), `diag.html`, `commandes.html`, `revision.html`, `examen.html`, `memo.html`, `robots.txt` **et le dossier `assets/`** (style, scripts et données : sans lui, les pages ne fonctionnent pas).
2. Dépôt > **Settings > Pages** : Source = *Deploy from a branch*, branche `main`, dossier `/ (root)`.
3. Toujours dans Pages, champ **Custom domain** : saisis ton domaine (ex. `memo.tondomaine.fr` ou `tondomaine.fr`). GitHub crée le fichier `CNAME`.
4. Chez ton registrar (zone DNS) :
   - sous-domaine (`memo.tondomaine.fr`) : enregistrement **CNAME** `memo` → `tonpseudo.github.io`
   - domaine nu (`tondomaine.fr`) : 4 enregistrements **A** → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
5. Attends la propagation (quelques minutes à quelques heures), puis coche **Enforce HTTPS**.

## Avant le 8 octobre
- Ouvre la page depuis un PC du centre (le réseau peut filtrer certains sites).
- Teste un bouton « Copier » et la saisie des variables.
- Imprime la page en PDF (Ctrl+P > Enregistrer en PDF) et garde-le sur ton téléphone en secours.
- Option filet de sécurité : dépose aussi tout le site (pages + `assets/`) sur ton VPS (autre sous-domaine) comme miroir.
- Le site fonctionne aussi hors ligne : copie le dossier sur une clé USB et ouvre `index.html`.
- La progression (flashcards, QCM, examens) est enregistrée dans le navigateur utilisé : elle ne suit pas d'un PC à l'autre.
