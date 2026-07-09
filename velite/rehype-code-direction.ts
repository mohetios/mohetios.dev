import type { Element, Root } from 'hast'
import { visit } from 'unist-util-visit'
import { detectTextDirection } from '../shared/utils/text-direction'

function getTextContent(node: Element): string {
  return node.children
    .map((child) => {
      if (child.type === 'text') {
        return child.value
      }

      if (child.type === 'element') {
        return getTextContent(child)
      }

      return ''
    })
    .join('')
}

/**
 * Set `dir` on code blocks from their source text so Persian and English
 * snippets align correctly without relying on page locale.
 */
export function rehypeCodeDirection() {
  return (tree: Root) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'pre') {
        return
      }

      const code = node.children.find(
        (child): child is Element => child.type === 'element' && child.tagName === 'code'
      )

      if (!code) {
        return
      }

      const direction = detectTextDirection(getTextContent(code))

      node.properties = {
        ...node.properties,
        dir: direction
      }

      code.properties = {
        ...code.properties,
        dir: direction
      }
    })
  }
}
