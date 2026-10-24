'use client'

import { useEffect } from 'react'
import { LANG_CODES } from '@/lib/i18n'

/* Loads the Google Translate widget once; the googtrans cookie drives it. */
export function GoogleTranslate() {
  useEffect(() => {
    if (document.getElementById('google-translate-script')) return

    const w = window as unknown as { googleTranslateElementInit?: () => void; google?: unknown }
    w.googleTranslateElementInit = () => {
      const g = (window as unknown as { google?: { translate?: { TranslateElement?: new (o: unknown, el: string) => void } } }).google
      const T = g?.translate?.TranslateElement
      if (T) new T({ pageLanguage: 'en', includedLanguages: LANG_CODES.join(','), autoDisplay: false }, 'google_translate_element')
    }

    const s = document.createElement('script')
    s.id = 'google-translate-script'
    s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
    s.async = true
    document.body.appendChild(s)
  }, [])

  return <div id="google_translate_element" aria-hidden className="hidden" />
}
