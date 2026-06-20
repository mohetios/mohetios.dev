const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'] as const

export function toPersianDigits(value: string | number) {
  return String(value).replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)] ?? digit)
}

export function formatLocalizedNumber(value: string | number, locale?: string) {
  return locale?.startsWith('fa') ? toPersianDigits(value) : String(value)
}

export function formatListNumber(index: number, locale?: string, width = 2) {
  return formatLocalizedNumber(String(index + 1).padStart(width, '0'), locale)
}
