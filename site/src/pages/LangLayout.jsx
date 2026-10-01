import { useEffect } from 'react';
import { Link, Navigate, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { LOCALES, detectLocale, isLocale } from '../i18n/config';
import { I18nProvider, useI18n } from '../i18n/I18n';

function LanguageSwitcher() {
  const { locale, t } = useI18n();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const change = (code) => {
    try { localStorage.setItem('locale', code); } catch { /* storage unavailable */ }
    navigate(pathname.replace(/^\/[^/]+/, `/${code}`) + search, { replace: true });
  };
  return (
    <div className="lang" role="group" aria-label={t('ui.nav.language')}>
      {LOCALES.map((l) => (
        <button
          key={l.code}
          lang={l.code}
          className={l.code === locale ? 'is-on' : ''}
          aria-pressed={l.code === locale}
          title={l.name}
          onClick={() => change(l.code)}
        >
          {l.short}
        </button>
      ))}
    </div>
  );
}

export default function LangLayout() {
  const { lang } = useParams();
  const { pathname } = useLocation();
  useEffect(() => { if (isLocale(lang)) document.documentElement.lang = lang; }, [lang]);
  // Braces matter: newer Chrome returns a Promise from scrollTo, and React would call it as a cleanup.
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  if (!isLocale(lang)) return <Navigate to={`/${detectLocale()}`} replace />;

  return (
    <I18nProvider locale={lang}>
      <header className="site-header">
        <Link to={`/${lang}`} className="brand">nerdify<span>us</span></Link>
        <LanguageSwitcher />
      </header>
      <main className="site-main">
        <Outlet />
      </main>
    </I18nProvider>
  );
}
