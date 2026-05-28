import { createContext, useContext, useState, useCallback } from 'react';
import fr from '../translations/fr';
import en from '../translations/en';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'fr');
  const t = lang === 'fr' ? fr : en;

  const toggle = useCallback(() => {
    setLang((prev) => {
      const next = prev === 'fr' ? 'en' : 'fr';
      localStorage.setItem('lang', next);
      return next;
    });
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used inside LanguageProvider');
  return ctx;
};
