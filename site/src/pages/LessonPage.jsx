import { Link, useParams } from 'react-router-dom';
import { useI18n } from '../i18n/I18n';
import { findTopic } from '../topics/registry';
import Deck from '../components/deck/Deck';
import NotFound from './NotFound';

export default function LessonPage() {
  const { topicId, lessonId } = useParams();
  const { locale, t } = useI18n();
  const topic = findTopic(topicId);
  const lesson = topic?.lessons.find((l) => l.id === lessonId && l.slides);
  if (!lesson) return <NotFound />;

  const topicName = t(`${topic.id}.name`);
  return (
    <>
      <h1 className="lesson-title">{t(`${topic.id}.lessons.${lesson.id}.title`)}</h1>
      <Deck
        slides={lesson.slides}
        textPath={`${topic.id}.slides`}
        resolveRef={topic.resolveRef}
        footer={<Link className="pill-link" to={`/${locale}/${topic.id}`}>{t('ui.deck.back', { topic: topicName })}</Link>}
      />
    </>
  );
}
