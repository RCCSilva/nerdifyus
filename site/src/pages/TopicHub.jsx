import { Link, useParams } from 'react-router-dom';
import { useI18n } from '../i18n/I18n';
import { findTopic } from '../topics/registry';
import NotFound from './NotFound';

export default function TopicHub() {
  const { topicId } = useParams();
  const { locale, t } = useI18n();
  const topic = findTopic(topicId);
  if (!topic) return <NotFound />;

  return (
    <>
      <section className="hero small">
        <p className="crumbs"><Link to={`/${locale}`}>{t('ui.nav.home')}</Link> /</p>
        <h1>{t(`${topic.id}.name`)}</h1>
        <p>{t(`${topic.id}.blurb`)}</p>
      </section>
      <h2 className="section-title">{t('ui.topic.lessons')}</h2>
      <ol className="lessons">
        {topic.lessons.map((lesson, i) => {
          const live = Boolean(lesson.slides);
          const inner = (
            <>
              <span className="lesson-num">{i + 1}</span>
              <span className="lesson-main">
                <strong>{t(`${topic.id}.lessons.${lesson.id}.title`)}</strong>
                <span>{t(`${topic.id}.lessons.${lesson.id}.summary`)}</span>
              </span>
              <span className={`badge lvl-${lesson.level}`}>{t(`ui.topic.level.${lesson.level}`)}</span>
              <span className="lesson-meta">
                {live ? t('ui.topic.slides', { n: lesson.slides.length }) : t('ui.topic.soon')}
              </span>
            </>
          );
          return (
            <li key={lesson.id}>
              {live
                ? <Link className="lesson" to={`/${locale}/${topic.id}/${lesson.id}`}>{inner}</Link>
                : <div className="lesson is-soon">{inner}</div>}
            </li>
          );
        })}
      </ol>
    </>
  );
}
