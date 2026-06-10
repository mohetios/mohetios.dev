import { renderMermaidDiagrams } from '~/utils/mermaid'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      mermaid: {
        render: renderMermaidDiagrams
      }
    }
  }
})
