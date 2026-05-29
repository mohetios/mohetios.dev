export default defineEventHandler((event) => {
  const path = event.path?.split('?')[0] ?? ''

  if (!path.startsWith('/_nuxt/')) {
    return
  }

  const assetExtensionPattern = /\.(?:js|mjs|css|json|map|wasm|woff2?|ttf|otf|png|jpe?g|webp|svg|ico)$/i

  if (!assetExtensionPattern.test(path)) {
    return
  }

  setResponseStatus(event, 404)
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  setHeader(event, 'Cache-Control', 'no-store')

  return 'Not found'
})
