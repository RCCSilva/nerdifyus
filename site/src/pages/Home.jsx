import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/I18n';
import { TOPICS } from '../topics/registry';
import Field from '../components/field/Field';

export default function Home() {
  const { locale, t } = useI18n();
  return (
    <>
      <section className="hero">
        <h1>{t('ui.tagline')}</h1>
        <p>{t('ui.home.lead')}</p>
      </section>
      <h2 className="section-title">{t('ui.home.topics')}</h2>
      <div className="cards">
        {TOPICS.map((topic) => (
          <Link key={topic.id} to={`/${locale}/${topic.id}`} className="card topic-card">
            <div className="card-art"><Field /></div>
            <div className="card-body">
              <h3>{t(`${topic.id}.name`)}</h3>
              <p>{t(`${topic.id}.blurb`)}</p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
