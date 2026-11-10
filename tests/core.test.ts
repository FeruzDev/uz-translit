import { toCyrillic, toLatin, transliterate, detectScript, toggleScript } from '../src';

describe('toCyrillic', () => {
  it.each([
    ['Oʻzbekiston Respublikasi', 'Ўзбекистон Республикаси'],
    ["O'zbekiston", 'Ўзбекистон'],
    ['O‘zbekiston', 'Ўзбекистон'],
    ['shahar', 'шаҳар'],
    ['Shahar', 'Шаҳар'],
    ['SHAHAR', 'ШАҲАР'],
    ['choy', 'чой'],
    ['gʻisht', 'ғишт'],
    ['qoʻl', 'қўл'],
    ['yoʻl', 'йўл'],
    ["yo'q", 'йўқ'],
    ['yoz', 'ёз'],
    ['yangi', 'янги'],
    ['yulduz', 'юлдуз'],
    ['yer', 'ер'],
    ['kuyov', 'куёв'],
    ['ekin', 'экин'],
    ['aeroport', 'аэропорт'],
    ['keldi', 'келди'],
    ['maʼno', 'маъно'],
    ["ma'no", 'маъно'],
    ['Isʼhoq', 'Исҳоқ'],
    ['xalq', 'халқ'],
    ['hayot', 'ҳаёт'],
    ['tong', 'тонг'],
    ['Salom, dunyo!', 'Салом, дунё!'],
    ['2026-yil', '2026-йил'],
    ["'salom'", "'салом'"],
  ])('%s -> %s', (input, expected) => {
    expect(toCyrillic(input)).toBe(expected);
  });

  it('leaves Cyrillic and other characters untouched', () => {
    expect(toCyrillic('Салом 123 ★')).toBe('Салом 123 ★');
  });
});

describe('toLatin', () => {
  it.each([
    ['Ўзбекистон Республикаси', 'Oʻzbekiston Respublikasi'],
    ['ЎЗБЕКИСТОН', 'OʻZBEKISTON'],
    ['ғишт', 'gʻisht'],
    ['шаҳар', 'shahar'],
    ['Шаҳар', 'Shahar'],
    ['ШАҲАР', 'SHAHAR'],
    ['Чой', 'Choy'],
    ['Ёз', 'Yoz'],
    ['ер', 'yer'],
    ['поезд', 'poyezd'],
    ['келди', 'keldi'],
    ['маъно', 'maʼno'],
    ['Исҳоқ', 'Isʼhoq'],
    ['цирк', 'sirk'],
    ['милиция', 'militsiya'],
    ['компьютер', 'kompyuter'],
    ['съезд', 'sʼyezd'],
    ['Салом, дунё!', 'Salom, dunyo!'],
  ])('%s -> %s', (input, expected) => {
    expect(toLatin(input)).toBe(expected);
  });

  it('supports ascii apostrophes', () => {
    expect(toLatin('Ўзбекистон', { apostrophe: 'ascii' })).toBe("O'zbekiston");
    expect(toLatin('маъно', { apostrophe: 'ascii' })).toBe("ma'no");
  });

  it('leaves Latin untouched', () => {
    expect(toLatin('Salom 123')).toBe('Salom 123');
  });
});

describe('round trip', () => {
  it.each([
    'Oʻzbekiston Respublikasi poytaxti — Toshkent shahri.',
    'Yoshlar yangi yoʻllarni qidirmoqda, ular gʻayratli va mehnatkash.',
    'Isʼhoq maʼruza qildi: ekologiya va aeroport haqida.',
  ])('%s', (text) => {
    expect(toLatin(toCyrillic(text))).toBe(text);
  });
});

describe('helpers', () => {
  it('transliterate', () => {
    expect(transliterate('Salom', 'cyrillic')).toBe('Салом');
    expect(transliterate('Салом', 'latin')).toBe('Salom');
  });

  it('detectScript', () => {
    expect(detectScript('Salom dunyo')).toBe('latin');
    expect(detectScript('Салом дунё')).toBe('cyrillic');
    expect(detectScript('123 !?')).toBe('unknown');
  });

  it('toggleScript', () => {
    expect(toggleScript('Salom')).toBe('Салом');
    expect(toggleScript('Салом')).toBe('Salom');
  });

  it('exceptions', () => {
    expect(toCyrillic('Sirk keldi', { exceptions: { sirk: 'цирк' } })).toBe('Цирк келди');
    expect(toLatin('ЦИРК', { exceptions: { цирк: 'sirk' } })).toBe('SIRK');
  });

  it('handles empty input', () => {
    expect(toCyrillic('')).toBe('');
    expect(toLatin('')).toBe('');
  });
});
