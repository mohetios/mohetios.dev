export function useSiteNavigation() {
  const { t } = useI18n()
  const localePath = useLocalePath()
  const route = useRoute()

  const navigation = computed(() => [
    { label: t('nav.home'), to: localePath('/') },
    { label: t('pages.notebook.kicker'), to: localePath('/blog') },
    { label: t('nav.lab'), to: localePath('/lab') },
    { label: t('pages.systems.kicker'), to: localePath('/projects') },
    { label: t('pages.tagsIndex.kicker'), to: localePath('/tags') },
    { label: t('nav.about'), to: localePath('/about') },
    { label: t('nav.contact'), to: localePath('/contact') }
  ])

  function isActive(to: string) {
    const currentPath = stripLocalePrefix(toPublicPath(route.path))
    const targetPath = stripLocalePrefix(toPublicPath(to))

    if (targetPath === '/') {
      return currentPath === '/'
    }

    return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`)
  }

  return {
    navigation,
    isActive
  }
}
