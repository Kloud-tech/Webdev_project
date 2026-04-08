# Conventions Git

## Messages de validation (commit)

- Utiliser des messages de commit clairs et descriptifs.
- Utiliser la convention [Conventionnal Commits](https://www.conventionalcommits.org/en/v1.0.0/)
- Exemple : `feat: ✨ add user authentication module` ou `fix: 🐛 resolve issue with data parsing`.
- Préférer les verbes à l’impératif pour les messages de commit en anglais ou à la troisième personne pour les messages en français.
- Exemple en français : `feat: ✨ ajoute le module d'authentification utilisateur` ou `fix: 🐛 résout le problème de parsing des données`.
- Utiliser des emojis pour indiquer le type de changement (optionnel mais recommandé).
- Exemple : `✨` pour les nouvelles fonctionnalités, `🐛` pour les corrections d’anomalies

## Nommage des branches

- Nommer les branches avec un des préfixes suivants :
  - `tech` (tâche technique qui n’a pas d’effet pour l’utilisateur final de l’application)
  - `fix` pour une correction d’anomalies
  - `feat` pour l’ajout de fonctionnalité
- puis un slash et ensuite un résumé de l’intention de la branche. Exemples :
  - `tech/modification-config-linter`
  - `fix/correction-contraste-bouton`
  - `feat/ajout-authentification`
