import type { Element, Root } from 'hast'
import { visit } from 'unist-util-visit'

function getClassNames(node: Element): string[] {
  const className = node.properties?.className

  if (Array.isArray(className)) {
    return className.map(String)
  }

  if (typeof className === 'string') {
    return className.split(/\s+/)
  }

  return []
}

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

function isMermaidCode(node: Element) {
  return getClassNames(node).some((name) => name === 'language-mermaid' || name === 'mermaid')
}

/**
 * Convert ```mermaid fences into client-renderable blocks before Shiki runs.
 * Shiki would otherwise syntax-highlight the diagram source as code.
 */
export function rehypeMermaidBlocks() {
  return (tree: Root) => {
    visit(tree, 'element', (node, index, parent) => {
      if (!parent || typeof index !== 'number' || node.tagName !== 'pre') {
        return
      }

      const code = node.children[0]

      if (!code || code.type !== 'element' || code.tagName !== 'code' || !isMermaidCode(code)) {
        return
      }

      const diagram = getTextContent(code).trim()

      parent.children[index] = {
        type: 'element',
        tagName: 'div',
        properties: {
          className: ['mermaid', 'mohetios-mermaid'],
          'data-diagram': diagram
        },
        children: [{ type: 'text', value: diagram }]
      }
    })
  }
}
