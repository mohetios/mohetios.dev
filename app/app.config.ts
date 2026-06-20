export default defineAppConfig({
  ui: {
    colors: {
      primary: 'golpich',
      secondary: 'leaf',
      neutral: 'mohstone',
      info: 'golpich',
      success: 'leaf',
      warning: 'tilegold',
      error: 'red'
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
    card: {
      variants: {
        variant: {
          outline: {
            root: 'bg-default ring-0 border-y border-default divide-y divide-default'
          },
          subtle: {
            root: 'bg-elevated/50 ring-0 border-y border-default divide-y divide-default'
          }
        }
      }
    },
    pageHeader: {
      slots: {
        title:
          'text-4xl font-semibold tracking-tight text-balance leading-snug text-highlighted sm:text-5xl',
        description: 'mt-3 text-lg leading-7 text-pretty text-muted'
      }
    },
    pageCard: {
      slots: {
        title: 'text-base font-semibold tracking-tight leading-snug text-highlighted',
        description: 'mt-2 text-base leading-7 text-muted'
      },
      variants: {
        variant: {
          outline: {
            root: 'bg-default ring-0 border-y border-default'
          },
          subtle: {
            root: 'bg-elevated/50 ring-0 border-y border-default'
          }
        }
      }
    }
  }
})
