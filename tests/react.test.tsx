import React from 'react';
import { render, screen, fireEvent, renderHook } from '@testing-library/react';
import { TranslitProvider, Translit, ScriptSwitcher, useScript, useTranslit } from '../src/react';

describe('react bindings', () => {
  it('useTranslit converts text', () => {
    const { result } = renderHook(() => useTranslit('Salom', 'cyrillic'));
    expect(result.current).toBe('Салом');
  });

  it('Translit follows the provider script and ScriptSwitcher changes it', () => {
    render(
      <TranslitProvider>
        <ScriptSwitcher />
        <Translit>
          <p>
            Oʻzbekiston <b>Respublikasi</b>
          </p>
        </Translit>
      </TranslitProvider>,
    );
    expect(screen.getByText('Respublikasi')).toBeTruthy();
    fireEvent.click(screen.getByText('Кирилл'));
    expect(screen.getByText('Республикаси')).toBeTruthy();
    expect(screen.getByText('Кирилл').getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(screen.getByText('Lotin'));
    expect(screen.getByText('Respublikasi')).toBeTruthy();
  });

  it('Translit `to` overrides the provider', () => {
    render(<Translit to="cyrillic">Toshkent</Translit>);
    expect(screen.getByText('Тошкент')).toBeTruthy();
  });

  it('useScript t() and toggleScript', () => {
    function Demo() {
      const { t, script, toggleScript } = useScript();
      return (
        <button onClick={toggleScript}>
          {script}:{t('Choy')}
        </button>
      );
    }
    render(
      <TranslitProvider defaultScript="cyrillic">
        <Demo />
      </TranslitProvider>,
    );
    expect(screen.getByRole('button').textContent).toBe('cyrillic:Чой');
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button').textContent).toBe('latin:Choy');
  });

  it('controlled provider and storageKey', () => {
    const onChange = jest.fn();
    const { rerender } = render(
      <TranslitProvider script="latin" onScriptChange={onChange}>
        <ScriptSwitcher />
      </TranslitProvider>,
    );
    fireEvent.click(screen.getByText('Кирилл'));
    expect(onChange).toHaveBeenCalledWith('cyrillic');
    expect(screen.getByText('Lotin').getAttribute('aria-pressed')).toBe('true');

    window.localStorage.setItem('uzt', 'cyrillic');
    rerender(
      <TranslitProvider storageKey="uzt" key="uncontrolled">
        <Translit>Salom</Translit>
      </TranslitProvider>,
    );
    expect(screen.getByText('Салом')).toBeTruthy();
  });
});
