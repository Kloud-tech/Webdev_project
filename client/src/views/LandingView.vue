<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="landing-page">
    <header class="landing-header">
      <RouterLink class="brand-link" to="/">
        <span class="brand-mark">TJ</span>
        <span>Trading Journal</span>
      </RouterLink>

      <nav class="landing-nav">
        <RouterLink class="button button--ghost" to="/login">Connexion</RouterLink>
        <RouterLink class="button" to="/register">Créer un compte</RouterLink>
      </nav>
    </header>

    <section class="landing-hero">
      <div class="landing-hero__copy">
        <p class="landing-kicker">Projet web ESILV</p>
        <h1>Un journal de trading simple pour noter ses trades et revoir ses résultats.</h1>
        <p>
          Le but du site est de pouvoir enregistrer ses positions, ajouter des notes et
          retrouver facilement l’historique de ses trades.
        </p>

        <div class="landing-actions">
          <RouterLink class="button" to="/register">Commencer</RouterLink>
          <RouterLink class="button button--ghost" to="/login">J’ai déjà un compte</RouterLink>
        </div>
      </div>

      <div class="landing-panel">
        <div class="landing-panel__metric">
          <span>Ce qu’on peut faire</span>
          <strong>Ajouter un trade avec ses infos principales</strong>
        </div>
        <div class="landing-panel__metric">
          <span>Suivi</span>
          <strong>Voir le PnL, le win rate et les derniers trades</strong>
        </div>
        <div class="landing-panel__metric">
          <span>Review</span>
          <strong>Relire les notes et comparer les trades gagnants ou perdants</strong>
        </div>
      </div>
    </section>
  </div>
</template>
