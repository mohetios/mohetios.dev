/** Shared public layout widths — CSS variables in `app/assets/css/main.css`. */
export const LAYOUT_WIDTHS = {
  shell: '72rem',
  content: '72rem',
  article: '46rem',
  articleWide: '64rem'
} as const

/** Site shell (`LAYOUT_WIDTHS.shell` + gutters). Class defined in `app/assets/css/main.css`. */
export const PUBLIC_SITE_SHELL_CLASS = 'site-shell'

/** Centered article reading column (`LAYOUT_WIDTHS.article`). Class defined in `app/assets/css/main.css`. */
export const PUBLIC_ARTICLE_READING_CLASS = 'article-reading-column'

/** Full-viewport breakout for immersive heroes. Class defined in `app/assets/css/main.css`. */
export const PUBLIC_VIEWPORT_BLEED_CLASS = 'viewport-bleed'
