# Trading Journal

Mini-projet ESILV 2026 réalisé à partir du starter du cours.

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

Le projet permet à un utilisateur de :

- créer un compte et valider son adresse email
- enregistrer ses trades avec les informations utiles de setup et d’exécution
- suivre ses statistiques principales
- relire ses décisions et ses résultats dans le temps

## Ce que fait le site

### Authentification

- inscription avec `email`, `username` et `password`
- validation d’email par lien à usage unique
- renvoi du lien de validation
- connexion par cookie JWT HTTP only
- déconnexion

### Journal de trading

- création d’un trade
- modification d’un trade
- suppression d’un trade
- historique filtrable par recherche, statut et direction
- saisie des éléments de review :
  - actif
  - marché
  - side
  - stratégie
  - session
  - timeframe
  - prix d’entrée, stop, objectif, sortie
  - quantité
  - risque
  - PnL réalisé
  - tags
  - capture / URL
  - notes de setup
  - notes post-trade

### Tableau de bord

- nombre total de trades
- nombre de trades ouverts, planifiés et clôturés
- win rate
- PnL net
- R moyen
- meilleur trade
- pire trade
- derniers trades

## Stack technique

### Front

- Vue 3
- Vue Router
- Pinia
- Vite
- Vitest
- Playwright

### Back

- Node.js
- Fastify
- Mongoose
- JWT
- cookies HTTP only
- Nodemailer

### Base de données

- MongoDB dans un conteneur Docker

## Structure du projet

Le dépôt suit une structure monorepo :

- `client/` : application front-end Vue
- `server/` : API Fastify
- `mongo-init/` : initialisation de MongoDB pour le conteneur local

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

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/resend-verification-email`

### Utilisateurs

- `GET /users/verify-email`
- `GET /users/me`
- `GET /users`
- `GET /users/:id`
- `DELETE /users/:id`

### Trades

- `GET /trades/stats/overview`
- `GET /trades`
- `GET /trades/:id`
- `POST /trades`
- `PATCH /trades/:id`
- `DELETE /trades/:id`

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

- en développement local, si le SMTP n’est pas configuré, le lien de validation d’email est renvoyé dans la réponse d’inscription
- MongoDB local est attendu dans Docker, conformément au starter fourni
