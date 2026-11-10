export type Script = 'latin' | 'cyrillic';

export interface TranslitOptions {
  /**
   * Apostrophe style for Latin output.
   * - `'unicode'` (default): official characters — `oʻ`, `gʻ` (U+02BB) and tutuq `ʼ` (U+02BC)
   * - `'ascii'`: plain `'` everywhere (`o'`, `g'`, `ma'no`)
   */
  apostrophe?: 'unicode' | 'ascii';
  /**
   * Custom whole-word replacements, applied before the rules.
   * Keys are matched case-insensitively against words of the source text,
   * e.g. `{ sirk: 'цирк', 'sentabr': 'сентябрь' }`.
   */
  exceptions?: Record<string, string>;
}

/** Every character used as an apostrophe in Uzbek Latin texts. */
const APOSTROPHES = new Set(["'", '‘', '’', 'ʻ', 'ʼ', '`']);
const isApostrophe = (ch: string | undefined): boolean => ch !== undefined && APOSTROPHES.has(ch);

const WORD_RE = /\p{L}[\p{L}'‘’ʻʼ`]*/gu;
const LATIN_LETTER_RE = /[a-z]/i;
const CYRILLIC_LETTER_RE = /[Ѐ-ӿ]/;

const isUpper = (ch: string) => ch !== ch.toLowerCase() && ch === ch.toUpperCase();
const withCase = (source: string, target: string) => (isUpper(source) ? target.toUpperCase() : target);

/* ------------------------------------------------------------------ */
/* Latin -> Cyrillic                                                   */
/* ------------------------------------------------------------------ */

const LATIN_SINGLE: Record<string, string> = {
  a: 'а', b: 'б', d: 'д', f: 'ф', g: 'г', h: 'ҳ', i: 'и', j: 'ж', k: 'к', l: 'л',
  m: 'м', n: 'н', o: 'о', p: 'п', q: 'қ', r: 'р', s: 'с', t: 'т', u: 'у', v: 'в',
  x: 'х', y: 'й', z: 'з',
};

const Y_VOWELS: Record<string, string> = { a: 'я', u: 'ю', o: 'ё', e: 'е' };
const LATIN_VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);

function wordToCyrillic(word: string): string {
  let out = '';
  for (let i = 0; i < word.length; i++) {
    const ch = word[i];
    const lower = ch.toLowerCase();
    const next = word[i + 1];
    const nextLower = next?.toLowerCase();

    // oʻ / gʻ
    if ((lower === 'o' || lower === 'g') && isApostrophe(next)) {
      out += withCase(ch, lower === 'o' ? 'ў' : 'ғ');
      i++;
      continue;
    }

    if (lower === 'y' && nextLower !== undefined && Y_VOWELS[nextLower]) {
      // "yoʻ" is й + ў (yoʻl -> йўл), not ё + ъ
      if (nextLower === 'o' && isApostrophe(word[i + 2])) {
        out += withCase(ch, 'й');
        continue;
      }
      out += withCase(ch, Y_VOWELS[nextLower]);
      i++;
      continue;
    }

    if (lower === 's' && nextLower === 'h') {
      out += withCase(ch, 'ш');
      i++;
      continue;
    }

    if (lower === 'c' && nextLower === 'h') {
      out += withCase(ch, 'ч');
      i++;
      continue;
    }

    // sʼh -> сҳ (Isʼhoq -> Исҳоқ): the tutuq only separates s and h
    if (lower === 's' && isApostrophe(next) && word[i + 2]?.toLowerCase() === 'h') {
      out += withCase(ch, 'с');
      i++;
      continue;
    }

    if (lower === 'e') {
      const prev = word[i - 1]?.toLowerCase();
      const startOrAfterVowel = i === 0 || (prev !== undefined && LATIN_VOWELS.has(prev));
      out += withCase(ch, startOrAfterVowel ? 'э' : 'е');
      continue;
    }

    if (isApostrophe(ch)) {
      // tutuq belgisi between letters -> ъ ; anything else (quotes) stays
      const betweenLetters = i > 0 && next !== undefined && !isApostrophe(next);
      out += betweenLetters ? 'ъ' : ch;
      continue;
    }

    const mapped = LATIN_SINGLE[lower];
    out += mapped ? withCase(ch, mapped) : ch;
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Cyrillic -> Latin                                                   */
/* ------------------------------------------------------------------ */

const CYRILLIC_VOWELS = new Set(['а', 'е', 'ё', 'и', 'о', 'у', 'э', 'ю', 'я', 'ў']);

function wordToLatin(word: string, apostrophe: 'unicode' | 'ascii'): string {
  const okina = apostrophe === 'ascii' ? "'" : 'ʻ';
  const tutuq = apostrophe === 'ascii' ? "'" : 'ʼ';

  const map: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', ё: 'yo', ж: 'j', з: 'z', и: 'i', й: 'y',
    к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u',
    ф: 'f', х: 'x', ч: 'ch', ш: 'sh', щ: 'sh', ы: 'i', э: 'e', ю: 'yu', я: 'ya',
    ў: 'o' + okina, қ: 'q', ғ: 'g' + okina, ҳ: 'h', ъ: tutuq, ь: '',
  };

  const letters = word.replace(/[^\p{L}]/gu, '');
  const allCaps = letters.length > 1 && letters === letters.toUpperCase() && letters !== letters.toLowerCase();

  const applyCase = (source: string, target: string) => {
    if (!isUpper(source) || target === '') return target;
    if (allCaps) return target.toUpperCase();
    return target.charAt(0).toUpperCase() + target.slice(1);
  };

  let out = '';
  for (let i = 0; i < word.length; i++) {
    const ch = word[i];
    const lower = ch.toLowerCase();
    const prev = word[i - 1]?.toLowerCase();

    if (lower === 'е') {
      const ye = i === 0 || prev === 'ъ' || prev === 'ь' || (prev !== undefined && CYRILLIC_VOWELS.has(prev));
      out += applyCase(ch, ye ? 'ye' : 'e');
      continue;
    }

    if (lower === 'ц') {
      const afterVowel = prev !== undefined && CYRILLIC_VOWELS.has(prev);
      out += applyCase(ch, afterVowel ? 'ts' : 's');
      continue;
    }

    // сҳ -> sʼh, so it is not read as "sh"
    if (lower === 'с' && word[i + 1]?.toLowerCase() === 'ҳ') {
      out += applyCase(ch, 's') + tutuq;
      continue;
    }

    const mapped = map[lower];
    out += mapped !== undefined ? applyCase(ch, mapped) : ch;
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

const normalizeKey = (word: string) => word.toLowerCase().replace(/['‘’ʻʼ`]/g, "'");

function matchCase(source: string, target: string): string {
  const letters = source.replace(/[^\p{L}]/gu, '');
  if (letters.length > 1 && letters === letters.toUpperCase()) return target.toUpperCase();
  if (isUpper(source.charAt(0))) return target.charAt(0).toUpperCase() + target.slice(1);
  return target;
}

function convert(text: string, wordFn: (word: string) => string, options: TranslitOptions = {}): string {
  if (!text) return text;
  const exceptions = options.exceptions
    ? Object.fromEntries(Object.entries(options.exceptions).map(([k, v]) => [normalizeKey(k), v]))
    : undefined;

  return text.replace(WORD_RE, (word) => {
    if (exceptions) {
      const hit = exceptions[normalizeKey(word)];
      if (hit !== undefined) return matchCase(word, hit);
    }
    return wordFn(word);
  });
}

/** Converts Uzbek Latin text to Cyrillic. Cyrillic characters are left untouched. */
export function toCyrillic(text: string, options?: TranslitOptions): string {
  return convert(text, wordToCyrillic, options);
}

/** Converts Uzbek Cyrillic text to Latin. Latin characters are left untouched. */
export function toLatin(text: string, options?: TranslitOptions): string {
  const apostrophe = options?.apostrophe ?? 'unicode';
  return convert(text, (word) => wordToLatin(word, apostrophe), options);
}

/** Converts text to the given script. Text already in that script is returned as is. */
export function transliterate(text: string, to: Script, options?: TranslitOptions): string {
  return to === 'cyrillic' ? toCyrillic(text, options) : toLatin(text, options);
}

/** Detects the dominant script of a text by counting letters. */
export function detectScript(text: string): Script | 'unknown' {
  let latin = 0;
  let cyrillic = 0;
  for (const ch of text) {
    if (LATIN_LETTER_RE.test(ch)) latin++;
    else if (CYRILLIC_LETTER_RE.test(ch)) cyrillic++;
  }
  if (latin === 0 && cyrillic === 0) return 'unknown';
  return cyrillic > latin ? 'cyrillic' : 'latin';
}

/** Converts text to the opposite of its detected script. */
export function toggleScript(text: string, options?: TranslitOptions): string {
  return detectScript(text) === 'cyrillic' ? toLatin(text, options) : toCyrillic(text, options);
}
