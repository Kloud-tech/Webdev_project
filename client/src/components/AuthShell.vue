<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="auth-shell">
    <section class="auth-hero">
      <p class="auth-kicker">Trading Journal</p>
      <h1>{{ title }}</h1>
      <p>{{ subtitle }}</p>
    </section>

    <section class="auth-card">
      <slot />
    </section>
  </div>
</template>
