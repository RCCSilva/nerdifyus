import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/I18n';

export default function NotFound() {
  const { locale, t } = useI18n();
  return (
    <section className="hero small">
      <h1>404</h1>
      <p>{t('ui.notFound')} <Link to={`/${locale}`}>{t('ui.nav.home')}</Link></p>
    </section>
  );
}
