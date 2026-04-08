<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  hint: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <article class="metric-card">
    <p class="metric-card__label">{{ label }}</p>
    <p class="metric-card__value">{{ value }}</p>
    <p v-if="hint" class="metric-card__hint">{{ hint }}</p>
  </article>
</template>
