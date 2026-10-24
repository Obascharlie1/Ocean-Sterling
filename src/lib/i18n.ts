/*
 * Whole-app translation via the Google Translate website widget.
 * Changing language sets the `googtrans` cookie and reloads; the widget
 * (loaded in the root layout) then translates every page automatically.
 */

export interface Language { code: string; name: string; flag: string }

export const LANGUAGES: Language[] = [
  { code: 'en',    name: 'English',    flag: '🇺🇸' },
  { code: 'es',    name: 'Español',    flag: '🇪🇸' },
  { code: 'fr',    name: 'Français',   flag: '🇫🇷' },
  { code: 'de',    name: 'Deutsch',    flag: '🇩🇪' },
  { code: 'pt',    name: 'Português',  flag: '🇵🇹' },
  { code: 'it',    name: 'Italiano',   flag: '🇮🇹' },
  { code: 'nl',    name: 'Nederlands', flag: '🇳🇱' },
  { code: 'ru',    name: 'Русский',    flag: '🇷🇺' },
  { code: 'ar',    name: 'العربية',    flag: '🇸🇦' },
  { code: 'zh-CN', name: '中文',        flag: '🇨🇳' },
  { code: 'ja',    name: '日本語',      flag: '🇯🇵' },
  { code: 'ko',    name: '한국어',       flag: '🇰🇷' },
  { code: 'hi',    name: 'हिन्दी',       flag: '🇮🇳' },
  { code: 'bn',    name: 'বাংলা',       flag: '🇧🇩' },
  { code: 'ur',    name: 'اردو',        flag: '🇵🇰' },
  { code: 'tr',    name: 'Türkçe',     flag: '🇹🇷' },
  { code: 'pl',    name: 'Polski',     flag: '🇵🇱' },
  { code: 'uk',    name: 'Українська', flag: '🇺🇦' },
  { code: 'ro',    name: 'Română',     flag: '🇷🇴' },
  { code: 'el',    name: 'Ελληνικά',   flag: '🇬🇷' },
  { code: 'sv',    name: 'Svenska',    flag: '🇸🇪' },
  { code: 'vi',    name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'th',    name: 'ไทย',        flag: '🇹🇭' },
  { code: 'id',    name: 'Indonesia',  flag: '🇮🇩' },
  { code: 'ms',    name: 'Melayu',     flag: '🇲🇾' },
  { code: 'fil',   name: 'Filipino',   flag: '🇵🇭' },
  { code: 'fa',    name: 'فارسی',       flag: '🇮🇷' },
  { code: 'he',    name: 'עברית',       flag: '🇮🇱' },
  { code: 'sw',    name: 'Kiswahili',  flag: '🇰🇪' },
  { code: 'yo',    name: 'Yorùbá',     flag: '🇳🇬' },
  { code: 'ha',    name: 'Hausa',      flag: '🇳🇬' },
  { code: 'am',    name: 'አማርኛ',       flag: '🇪🇹' },
]

export const LANG_CODES = LANGUAGES.map(l => l.code)

export function getLanguage(code: string | null | undefined): Language {
  return LANGUAGES.find(l => l.code === code) ?? LANGUAGES[0]
}

export function storedLang(): string {
  try { return localStorage.getItem('app-language') || 'en' } catch { return 'en' }
}

/** Set the translation cookie (and saved choice) without reloading. */
export function setLangCookie(code: string) {
  try { localStorage.setItem('app-language', code) } catch { /* ignore */ }
  const host = typeof window !== 'undefined' ? window.location.hostname : ''
  const expired = 'expires=Thu, 01 Jan 1970 00:00:00 GMT'
  for (const d of ['', `domain=${host};`, `domain=.${host};`]) {
    document.cookie = `googtrans=; path=/; ${d} ${expired}`
  }
  if (code && code !== 'en') {
    const val = `/en/${code}`
    for (const d of ['', `domain=${host};`, `domain=.${host};`]) {
      document.cookie = `googtrans=${val}; path=/; ${d}`
    }
  }
}

/** Switch the whole app to a language (sets cookie, then reloads to translate). */
export function applyLanguage(code: string) {
  setLangCookie(code)
  window.location.reload()
}
