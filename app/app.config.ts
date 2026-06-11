export default defineAppConfig({
  ui: {
    colors: {
      primary: 'zinc',
      neutral: 'zinc'
    },
    container: {
      // Gutters live on `.site-shell` only — do not stack UContainer padding on top.
      base: 'w-full max-w-none px-0 sm:px-0 lg:px-0'
    }
  }
})
