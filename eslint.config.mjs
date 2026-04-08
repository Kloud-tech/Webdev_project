import antfu from '@antfu/eslint-config'

export default antfu({
  unocss: true,
  vue: true,
}, {
  rules: {
    'style/brace-style': ['error', '1tbs'],
  },
})

antfu({
  vue: true,
  unocss: true,
}, {
  rules: {
    'style/brace-style': ['error', '1tbs'],
  },
})
