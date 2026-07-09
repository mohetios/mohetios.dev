const RTL_SCRIPT_RE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/
const LETTER_RE = /\p{L}/u

export function detectTextDirection(text: string): 'ltr' | 'rtl' {
  let rtlCount = 0
  let letterCount = 0

  for (const char of text) {
    if (!LETTER_RE.test(char)) {
      continue
    }

    letterCount++

    if (RTL_SCRIPT_RE.test(char)) {
      rtlCount++
    }
  }

  if (letterCount === 0) {
    return 'ltr'
  }

  return rtlCount / letterCount >= 0.2 ? 'rtl' : 'ltr'
}
