# Trading Journal

Mini-projet ESILV 2026 réalisé à partir du starter du cours.

Projet de Alexandre KOCH et Romain BERNARD-MASSIAS

## Lancement rapide

### 1. Installer les dépendances

Depuis la racine du projet :

```bash
npm install
```

### 2. Configurer le back

Créer le fichier `server/.env.development.local` à partir de `server/.env-example`.

Exemple :

```env
HOST=0.0.0.0
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://stan:stan@localhost:35115/myapp?authSource=myapp
APP_BASE_URL="http://localhost:5173"
ALLOWED_ORIGINS="http://localhost:5173"
JWT_SECRET="change-me-in-development"
JWT_COOKIE_NAME="token"
SMTP_HOST=""
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=""
SMTP_PASS=""
MAIL_FROM="no-reply@example.com"
```

### 3. Lancer MongoDB dans Docker

Depuis la racine du projet :

```bash
docker compose up -d mongodb
```

### 4. Lancer le backend

Depuis la racine du projet :

```bash
npm run dev --workspace=server
```

Le backend sera disponible sur `http://localhost:3000`.

### 5. Lancer le frontend

Dans un autre terminal, depuis la racine du projet :

```bash
npm run dev --workspace=client
```

Le frontend sera disponible sur `http://localhost:5173`.

Le projet permet à un utilisateur de créer un compte, de valider son adresse email, d’enregistrer ses trades avec les informations importantes de setup et d’exécution, puis de retrouver ses statistiques et son historique dans une interface simple.

## Ce que fait le site

Le site contient une partie authentification avec inscription, validation d’email, connexion et déconnexion. Une fois connecté, l’utilisateur peut accéder à son espace personnel et consulter uniquement ses propres données.

La partie journal de trading permet de créer, modifier et supprimer un trade. Le formulaire contient les champs principaux nécessaires pour suivre une position, comme l’actif, le marché, le sens du trade, la stratégie, la session, le timeframe, les prix, la quantité, le risque, le PnL, les notes et une éventuelle capture d’écran.

Le tableau de bord affiche ensuite une synthèse des données enregistrées. On y retrouve le nombre total de trades, la répartition par statut, le PnL net, le win rate, le R moyen ainsi qu’un aperçu des derniers trades.

## Choix techniques

Le projet suit la structure du starter fourni dans le cours avec une séparation claire entre le client et le serveur. Le frontend a été développé avec Vue 3 et Vite pour rester cohérent avec la consigne et avec la base du projet. Le backend utilise Node.js et Fastify afin d’exposer une API REST simple, lisible et facile à faire évoluer.

MongoDB est utilisé pour la persistance des données, avec un conteneur Docker comme demandé dans le starter. Ce choix permet de conserver les données entre les redémarrages et de garder un environnement local proche de ce qui est demandé dans l’énoncé. L’authentification repose sur un cookie JWT HTTP only, ce qui évite de stocker le token dans le front et garde une séparation simple entre l’interface et la logique serveur.

Le sujet du journal de trading a été retenu parce qu’il exploite bien à la fois les formulaires, le stockage de données, l’affichage dynamique, les statistiques et la séparation front/back. C’est un sujet simple à comprendre, mais suffisamment complet pour couvrir les objectifs du mini-projet.

## Flux applicatif

Le flux principal est le suivant. Un utilisateur arrive sur la landing page, crée un compte puis valide son email. Une fois connecté, il accède à son tableau de bord et peut ouvrir le formulaire de création de trade. Les données envoyées par le formulaire passent par le frontend Vue, sont transmises au backend Fastify via des requêtes HTTP, puis sont validées et enregistrées dans MongoDB.

Quand l’utilisateur revient sur le dashboard ou sur la page des trades, le frontend appelle de nouveau l’API pour récupérer les informations sauvegardées. Le serveur lit les données dans la base, calcule les statistiques utiles pour le tableau de bord, puis renvoie une réponse JSON au client. L’interface met alors à jour l’affichage avec les vraies données du compte connecté.

## Stack technique

Le frontend repose sur Vue 3, Vue Router, Pinia et Vite. Les tests front utilisent Vitest et Playwright. Le backend repose sur Node.js, Fastify et Mongoose. L’authentification utilise JWT avec des cookies HTTP only et l’envoi d’email passe par Nodemailer. La base de données utilisée est MongoDB dans un conteneur Docker.

## Structure du projet

Le dépôt suit une structure monorepo. Le dossier `client/` contient l’application front-end Vue. Le dossier `server/` contient l’API Fastify. Le dossier `mongo-init/` contient l’initialisation de MongoDB pour le conteneur local.

## Scripts utiles

### Racine

```bash
npm run dev
npm run lint
```

### Front

```bash
npm run lint --workspace=client
npm run build --workspace=client
npm run test:unit --workspace=client -- --run
npm run test:e2e --workspace=client
```

### Back

```bash
npm run lint --workspace=server
```

## API principale

L’API contient les routes d’authentification `POST /auth/register`, `POST /auth/login`, `POST /auth/logout` et `POST /auth/resend-verification-email`. La partie utilisateur contient notamment `GET /users/verify-email`, `GET /users/me`, `GET /users`, `GET /users/:id` et `DELETE /users/:id`. La partie métier des trades contient `GET /trades/stats/overview`, `GET /trades`, `GET /trades/:id`, `POST /trades`, `PATCH /trades/:id` et `DELETE /trades/:id`.

## Déploiement

Le frontend est prévu pour être déployé sur Netlify et le backend sur Render, conformément à la consigne. La base de données doit être déplacée sur MongoDB Atlas pour la version en ligne.

Pour le backend, le plus simple est de créer un Web Service Render en prenant le dossier `server` comme racine. Le build command est `npm install` et le start command est `npm start`. Le fichier `render.yaml` présent à la racine peut servir de base si vous voulez garder une configuration versionnée.

Sur Render, il faut définir au minimum les variables `HOST=0.0.0.0`, `NODE_ENV=production`, `MONGODB_URI`, `APP_BASE_URL`, `ALLOWED_ORIGINS`, `JWT_SECRET` et `JWT_COOKIE_NAME`. Si vous voulez envoyer de vrais mails de validation, il faut aussi renseigner `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` et `MAIL_FROM`. En production, `APP_BASE_URL` et `ALLOWED_ORIGINS` doivent contenir l’URL Netlify du frontend.

Pour le frontend, le plus simple est de créer un site Netlify en prenant `client` comme base directory. La commande de build est `npm run build` et le dossier publié est `dist`. Le fichier `netlify.toml` présent à la racine donne déjà cette configuration.

Sur Netlify, il faut ajouter la variable `VITE_API_BASE_URL` avec l’URL publique du backend Render. Le frontend utilise cette variable pour appeler l’API distante tout en gardant les cookies de session.

MongoDB Atlas est utilisé pour la version déployée. Il faut créer un cluster, créer un utilisateur avec mot de passe, autoriser l’accès réseau puis récupérer la chaîne de connexion pour la mettre dans `MONGODB_URI` sur Render.

## Vérifications réalisées

Les vérifications suivantes passent sur l’état actuel du projet :

```bash
npm run lint --workspace=server
npm run lint --workspace=client
npm run build --workspace=client
npm run test:unit --workspace=client -- --run
```

Le test end-to-end nécessite l’installation locale des navigateurs Playwright :

```bash
npx playwright install
```

## Remarques

En développement local, si le SMTP n’est pas configuré, le lien de validation d’email est renvoyé dans la réponse d’inscription. MongoDB local est attendu dans Docker, conformément au starter fourni.

Le projet peut aussi fonctionner sans SMTP en ligne pour une démo. Dans ce cas, le backend ne tente pas d’envoyer un vrai mail et renvoie directement le lien de validation dans la réponse de l’API.
