# MonFit : installation sur iPhone

MonFit est une web app installable (PWA). Pour l'ajouter à ton iPhone, elle doit être en ligne
sur une adresse https. GitHub Pages fait ça gratuitement. Compte environ 10 minutes, sans Git ni terminal.

## 1. Mettre l'appli en ligne (depuis ton PC)

1. Va sur https://github.com et connecte-toi (ou crée un compte gratuit).
2. En haut à droite, clique sur **+ → New repository**.
   - Repository name : `monfit`
   - Visibilité : **Public** (obligatoire pour GitHub Pages gratuit ; seul le code est public,
     tes données restent sur ton téléphone).
   - Clique sur **Create repository**.
3. Sur la page du dépôt vide, clique sur le lien **uploading an existing file**.
4. Dézippe `monfit.zip`, ouvre le dossier `monfit` et **glisse tout son contenu** dans la page :
   `index.html`, `sw.js`, `manifest.webmanifest` et les dossiers `css`, `js`, `icons`, `img`.
   (Glisse le contenu du dossier, pas le dossier lui-même. Utilise Chrome ou Edge :
   ils gardent les sous-dossiers. Il y a moins de 100 fichiers, la limite de GitHub.)
5. Clique sur **Commit changes**.
6. Va dans **Settings → Pages**.
   - Source : **Deploy from a branch**
   - Branch : **main**, dossier **/ (root)** → **Save**
7. Attends 1 à 2 minutes puis recharge la page : ton adresse s'affiche,
   du type `https://TON-PSEUDO.github.io/monfit/`.

## 2. Installer sur l'iPhone

1. Ouvre cette adresse dans **Safari** (pas Chrome).
2. Touche le bouton **Partager** (carré avec une flèche vers le haut).
3. Choisis **« Sur l'écran d'accueil »** puis **Ajouter**.
4. Lance MonFit depuis l'icône : elle s'ouvre en plein écran, et marche même hors ligne
   (sauf la recherche d'aliments, qui a besoin d'internet).

## 3. Bon à savoir

- **Données** : tout est enregistré sur ton iPhone, dans l'appli installée. Fais régulièrement
  *Réglages → Exporter* (enregistre le fichier dans Fichiers ou iCloud Drive).
  Si tu supprimes l'icône de l'appli, iOS efface aussi ses données.
- **Mises à jour** : remplace les fichiers modifiés sur GitHub (*Add file → Upload files*).
  L'appli récupère la nouvelle version en arrière-plan ; elle apparaît au lancement suivant.
- **Minuteur de repos** : il bipe quand l'appli est ouverte. Écran verrouillé, iOS met l'appli
  en pause : le minuteur affiche le bon temps quand tu reviens, mais ne peut pas sonner.
  Le mode silencieux de l'iPhone coupe aussi le bip.
- **Démonstrations** : les photos d'exercices viennent de Free Exercise DB (domaine public).
  Touche l'animation pour la mettre en pause.
- **Aliments** : la base Open Food Facts est collaborative ; vérifie les valeurs d'un produit
  sur son étiquette en cas de doute.
- **Objectifs** : le calcul automatique (Mifflin-St Jeor × activité) donne une estimation de départ.
  Ajuste-la si ton poids évolue alors que tu voulais le stabiliser.
