import type { MaybeRefOrGetter } from 'vue'
import type { MohetiosSeoInput } from '~/composables/useMohetiosSeo'
import { getSeoSiteName } from '~/utils/seo'

export type ContentSeoInput = Omit<MohetiosSeoInput, 'type' | 'ogComponent'> & {
  category?: MaybeRefOrGetter<string | undefined>
}

export function useContentSeo(input: ContentSeoInput) {
  const { t } = useI18n()

  const ogComponent = toValue(input.image)
    ? undefined
    : ({
        name: 'ContentOgImage' as const,
        props: {
          title: String(toValue(input.title) || ''),
          description: toValue(input.description),
          category: toValue(input.category),
          locale: toValue(input.locale),
          siteName: getSeoSiteName(t),
          tagline: t('site.tagline')
        }
      } as const)

  return useMohetiosSeo({
    ...input,
    type: 'article',
    ogComponent
  })
}
