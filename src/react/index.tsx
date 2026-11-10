import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { transliterate } from '../core';
import type { Script, TranslitOptions } from '../core';

export type { Script, TranslitOptions } from '../core';

/** Converts a string with memoization. */
export function useTranslit(text: string, to: Script, options?: TranslitOptions): string {
  const optionsKey = options ? JSON.stringify(options) : '';
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => transliterate(text, to, options), [text, to, optionsKey]);
}

export interface TranslitContextValue {
  /** Active script of the UI. */
  script: Script;
  /** Change the active script. */
  setScript: (script: Script) => void;
  /** Switch between latin and cyrillic. */
  toggleScript: () => void;
  /** Convert any text (Latin or Cyrillic) to the active script. */
  t: (text: string) => string;
}

const TranslitContext = createContext<TranslitContextValue | null>(null);

export interface TranslitProviderProps {
  children?: React.ReactNode;
  /** Controlled active script. */
  script?: Script;
  /** Initial script in uncontrolled mode. @default 'latin' */
  defaultScript?: Script;
  /** Called when the script changes. */
  onScriptChange?: (script: Script) => void;
  /** Options passed to every conversion. */
  options?: TranslitOptions;
  /** Remember the user's choice in localStorage under this key (uncontrolled mode only). */
  storageKey?: string;
}

const readStorage = (key: string): Script | null => {
  try {
    const value = window.localStorage.getItem(key);
    return value === 'latin' || value === 'cyrillic' ? value : null;
  } catch {
    return null;
  }
};

const writeStorage = (key: string, value: Script) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage unavailable (private mode, SSR) */
  }
};

/** Holds the active script (Latin / Cyrillic) for the whole app. */
export function TranslitProvider({
  children,
  script: scriptProp,
  defaultScript = 'latin',
  onScriptChange,
  options,
  storageKey,
}: TranslitProviderProps) {
  const isControlled = scriptProp !== undefined;
  const [internal, setInternal] = useState<Script>(defaultScript);
  const script = isControlled ? scriptProp : internal;

  // Read the stored choice after mount so server and client markup match.
  useEffect(() => {
    if (!storageKey || isControlled) return;
    const stored = readStorage(storageKey);
    if (stored) setInternal(stored);
  }, [storageKey, isControlled]);

  const onChangeRef = useRef(onScriptChange);
  onChangeRef.current = onScriptChange;

  const setScript = useCallback(
    (next: Script) => {
      if (!isControlled) setInternal(next);
      if (storageKey && !isControlled) writeStorage(storageKey, next);
      onChangeRef.current?.(next);
    },
    [isControlled, storageKey],
  );

  const optionsKey = options ? JSON.stringify(options) : '';
  const value = useMemo<TranslitContextValue>(
    () => ({
      script,
      setScript,
      toggleScript: () => setScript(script === 'latin' ? 'cyrillic' : 'latin'),
      t: (text: string) => transliterate(text, script, options),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [script, setScript, optionsKey],
  );

  return <TranslitContext.Provider value={value}>{children}</TranslitContext.Provider>;
}

const fallback: TranslitContextValue = {
  script: 'latin',
  setScript: () => undefined,
  toggleScript: () => undefined,
  t: (text) => transliterate(text, 'latin'),
};

/** Access the active script and the `t` converter. Works without a provider (defaults to Latin). */
export function useScript(): TranslitContextValue {
  return useContext(TranslitContext) ?? fallback;
}

function convertChildren(children: React.ReactNode, convert: (text: string) => string): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (typeof child === 'string') return convert(child);
    if (typeof child === 'number') return child;
    if (React.isValidElement<{ children?: React.ReactNode }>(child) && child.props.children !== undefined) {
      return React.cloneElement(child, undefined, convertChildren(child.props.children, convert));
    }
    return child;
  });
}

export interface TranslitProps {
  children?: React.ReactNode;
  /** Target script. Defaults to the provider's active script. */
  to?: Script;
  /** Conversion options (override the provider's). */
  options?: TranslitOptions;
}

/**
 * Converts every text node inside it to the target script.
 *
 * ```tsx
 * <Translit>Oʻzbekiston Respublikasi</Translit>  // -> "Ўзбекистон Республикаси" when script is cyrillic
 * ```
 */
export function Translit({ children, to, options }: TranslitProps) {
  const ctx = useScript();
  const convert = useCallback(
    (text: string) => (to || options ? transliterate(text, to ?? ctx.script, options) : ctx.t(text)),
    [to, options, ctx],
  );
  return <>{convertChildren(children, convert)}</>;
}

export interface ScriptSwitcherProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Button labels. @default { latin: 'Lotin', cyrillic: 'Кирилл' } */
  labels?: Partial<Record<Script, React.ReactNode>>;
}

/**
 * Unstyled two-button switch between Latin and Cyrillic.
 * Class names: `uzt-switcher`, `uzt-switcher__button`, `uzt-switcher__button--active`.
 */
export function ScriptSwitcher({ labels, className, ...rest }: ScriptSwitcherProps) {
  const { script, setScript } = useScript();
  const text = { latin: 'Lotin', cyrillic: 'Кирилл', ...labels };
  const scripts: Script[] = ['latin', 'cyrillic'];

  return (
    <div role="group" aria-label="Alifbo" className={['uzt-switcher', className].filter(Boolean).join(' ')} {...rest}>
      {scripts.map((s) => (
        <button
          key={s}
          type="button"
          aria-pressed={script === s}
          className={['uzt-switcher__button', script === s && 'uzt-switcher__button--active'].filter(Boolean).join(' ')}
          onClick={() => setScript(s)}
        >
          {text[s]}
        </button>
      ))}
    </div>
  );
}
