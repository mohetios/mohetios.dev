export default defineAppConfig({
  ui: {
    colors: {
      primary: 'mohet',
      secondary: 'mohet-accent',
      neutral: 'mohet-neutral'
    },
    container: {
      // Gutters live on `.site-shell` only — do not stack UContainer padding on top.
      base: 'w-full max-w-none px-0 sm:px-0 lg:px-0'
    },
    button: {
      slots: {
        base: 'font-medium'
      }
    },
    pageHeader: {
      slots: {
        title: 'text-4xl font-semibold tracking-tight text-balance leading-snug text-highlighted sm:text-5xl',
        description: 'mt-3 text-lg leading-7 text-pretty text-muted'
      }
    },
    pageCard: {
      slots: {
        title: 'text-base font-semibold tracking-tight leading-snug text-highlighted',
        description: 'mt-2 text-base leading-7 text-muted'
      }
    }
  }
})
