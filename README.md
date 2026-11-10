# uz-translit

[![npm version](https://img.shields.io/npm/v/uz-translit.svg)](https://www.npmjs.com/package/uz-translit)
[![npm downloads](https://img.shields.io/npm/dm/uz-translit.svg)](https://www.npmjs.com/package/uz-translit)
[![bundle size](https://img.shields.io/bundlephobia/minzip/uz-translit)](https://bundlephobia.com/package/uz-translit)
[![CI](https://github.com/FeruzDev/uz-translit/actions/workflows/ci.yml/badge.svg)](https://github.com/FeruzDev/uz-translit/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/uz-translit.svg)](./LICENSE)

**Oʻzbek tili uchun Lotin ↔ Kirill transliteratsiyasi** — JavaScript/TypeScript funksiyalari va React uchun tayyor hook va komponentlar.

> Uzbek Latin ↔ Cyrillic transliteration for JavaScript/TypeScript with React bindings. Zero dependencies, fully typed, ESM + CJS.

- 🔤 Toʻgʻri qoidalar: `oʻ/gʻ`, `sh/ch`, `ya/yo/yu/ye`, `e → э/е`, tutuq belgisi `ʼ → ъ`, `sʼh → сҳ`, `ц → s/ts`
- ✍️ Har xil apostroflarni tushunadi: `'` `‘` `’` `ʻ` `ʼ` `` ` ``
- 🔠 Harf registrini saqlaydi: `Shahar → Шаҳар`, `SHAHAR → ШАҲАР`
- 📖 Oʻz istisnolar lugʻatingizni qoʻshish mumkin (`sirk → цирк`)
- ⚛️ React: `TranslitProvider`, `<Translit>`, `useScript`, `useTranslit`, `<ScriptSwitcher>`
- 🟦 TypeScript, 0 ta dependency, React ixtiyoriy

## Oʻrnatish

```bash
npm install uz-translit
```

## Funksiyalar

```ts
import { toCyrillic, toLatin, transliterate, detectScript, toggleScript } from 'uz-translit';

toCyrillic("Oʻzbekiston Respublikasi");  // "Ўзбекистон Республикаси"
toCyrillic("yo'l, ma'no, Is'hoq");       // "йўл, маъно, Исҳоқ"

toLatin('Тошкент шаҳри');                // "Toshkent shahri"
toLatin('Ўзбекистон', { apostrophe: 'ascii' }); // "O'zbekiston"

transliterate('Salom', 'cyrillic');      // "Салом"
detectScript('Салом дунё');              // "cyrillic"
toggleScript('Салом дунё');              // "Salom dunyo"
```

| Funksiya | Tavsif |
| --- | --- |
| `toCyrillic(text, options?)` | Lotin → Kirill. Kirill harflari oʻzgarmaydi. |
| `toLatin(text, options?)` | Kirill → Lotin. Lotin harflari oʻzgarmaydi. |
| `transliterate(text, to, options?)` | `to`: `'latin'` yoki `'cyrillic'` |
| `detectScript(text)` | `'latin' \| 'cyrillic' \| 'unknown'` — qaysi alifbo koʻproq |
| `toggleScript(text, options?)` | Matnni qarama-qarshi alifboga oʻtkazadi |

Aralash matn bilan ham ishlaydi: `toCyrillic` faqat lotin harflarini, `toLatin` esa faqat kirill harflarini oʻzgartiradi, shuning uchun bir matnni ikki marta oʻtkazish xavfsiz.

### Options

| Option | Turi | Default | Tavsif |
| --- | --- | --- | --- |
| `apostrophe` | `'unicode' \| 'ascii'` | `'unicode'` | Lotin natijadagi apostrof: rasmiy `oʻ gʻ` (U+02BB) va `ʼ` (U+02BC), yoki oddiy `'` |
| `exceptions` | `Record<string, string>` | – | Butun soʻz boʻyicha almashtirish (registrga qaramaydi) |

```ts
const options = { exceptions: { sirk: 'цирк', sement: 'цемент' } };
toCyrillic('Sirk va sement', options); // "Цирк ва цемент"
```

## React

```tsx
import { TranslitProvider, Translit, ScriptSwitcher } from 'uz-translit/react';

export default function App() {
  return (
    <TranslitProvider defaultScript="latin" storageKey="script">
      <header>
        <ScriptSwitcher />
      </header>

      <Translit>
        <h1>Oʻzbekiston Respublikasi</h1>
        <p>
          Poytaxti — <b>Toshkent</b> shahri.
        </p>
      </Translit>
    </TranslitProvider>
  );
}
```

Foydalanuvchi **Кирилл** tugmasini bossa, `<Translit>` ichidagi barcha matnlar kirillga oʻtadi. `storageKey` berilsa, tanlov `localStorage`da eslab qolinadi.

### `useScript()`

```tsx
import { useScript } from 'uz-translit/react';

function Title() {
  const { script, setScript, toggleScript, t } = useScript();
  return (
    <>
      <h1>{t('Bosh sahifa')}</h1>
      <input placeholder={t('Qidirish...')} /> {/* atributlar uchun t() ishlating */}
      <button onClick={toggleScript}>{script === 'latin' ? 'Кирилл' : 'Lotin'}</button>
    </>
  );
}
```

### `useTranslit(text, to, options?)`

```tsx
const title = useTranslit('Yangiliklar', 'cyrillic'); // "Янгиликлар"
```

### API

| Komponent / hook | Props | Tavsif |
| --- | --- | --- |
| `TranslitProvider` | `script?`, `defaultScript?` (`'latin'`), `onScriptChange?`, `options?`, `storageKey?` | Ilova boʻyicha faol alifbo. Controlled va uncontrolled rejimlar. |
| `Translit` | `to?`, `options?` | Ichidagi barcha matn tugunlarini oʻtkazadi. `to` berilsa, providerdan ustun. |
| `ScriptSwitcher` | `labels?` + `div` atributlari | Stilsiz ikki tugmali almashtirgich. Klasslar: `uzt-switcher`, `uzt-switcher__button`, `uzt-switcher__button--active` |
| `useScript()` | – | `{ script, setScript, toggleScript, t }`. Providersiz ham ishlaydi (lotin). |
| `useTranslit()` | `text, to, options?` | Memo qilingan konvertatsiya |

## Qoidalar

**Lotin → Kirill**

| Lotin | Kirill | Misol |
| --- | --- | --- |
| `oʻ`, `gʻ` | `ў`, `ғ` | oʻgʻil → ўғил |
| `sh`, `ch` | `ш`, `ч` | choʻpon → чўпон |
| `ya`, `yo`, `yu`, `ye` | `я`, `ё`, `ю`, `е` | yangi → янги, yer → ер |
| `yoʻ` | `йў` | yoʻl → йўл |
| `e` (soʻz boshida / unlidan keyin) | `э` | ekin → экин, aeroport → аэропорт |
| `e` (boshqa holatda) | `е` | keldi → келди |
| `ʼ` (tutuq belgisi) | `ъ` | maʼno → маъно |
| `sʼh` | `сҳ` | Isʼhoq → Исҳоқ |
| `h`, `q`, `x` | `ҳ`, `қ`, `х` | xalq → халқ |

**Kirill → Lotin**

| Kirill | Lotin | Misol |
| --- | --- | --- |
| `е` (soʻz boshida, unli / `ъ` / `ь` dan keyin) | `ye` | ер → yer, поезд → poyezd |
| `ц` (soʻz boshida / undoshdan keyin) | `s` | цирк → sirk |
| `ц` (unlidan keyin) | `ts` | милиция → militsiya |
| `ъ` | `ʼ` | маъно → maʼno |
| `ь` | – (tushib qoladi) | компьютер → kompyuter |
| `сҳ` | `sʼh` | Исҳоқ → Isʼhoq |
| `щ`, `ы` | `sh`, `i` | rus tilidan oʻzlashgan soʻzlar |

### Cheklovlar

Lotin yozuvida baʼzi maʼlumotlar yoʻqoladi, shuning uchun ayrim rus tilidan oʻzlashgan soʻzlar lotindan kirillga avtomatik toʻgʻri oʻtmaydi: `sirk` (цирк), `sentabr` (сентябрь), `kompyuter` (компьютер). Bunday soʻzlar uchun `exceptions` optionidan foydalaning.

## Release (maintainerlar uchun)

1. Versiyani oshiring: `npm version patch` (yoki `minor` / `major`).
2. Teglar bilan push qiling: `git push --follow-tags`.
3. **Release** GitHub Action testlar va buildni bajarib, npm'ga provenance bilan yuklaydi ([Trusted Publishing](https://docs.npmjs.com/trusted-publishers) yoki `NPM_TOKEN` secret orqali).

## Ishlab chiqish

```bash
npm install
npm test          # jest
npm run typecheck # tsc
npm run build     # tsup -> dist/
```

## Hissa qoʻshish

Xatolar va takliflar uchun: [github.com/FeruzDev/uz-translit/issues](https://github.com/FeruzDev/uz-translit/issues)

## Litsenziya

MIT
