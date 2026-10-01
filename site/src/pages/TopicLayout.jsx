import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { useI18n } from '../i18n/I18n';
import { findTopic } from '../topics/registry';
import { slideIndex } from '../components/deck/Deck';
import NotFound from './NotFound';

/** Topic pages: a sidebar with every lesson (and every slide of live lessons) + the page itself. */
export default function TopicLayout() {
  const { topicId, lessonId } = useParams();
  const { locale, t } = useI18n();
  const [params] = useSearchParams();
  const { pathname, search } = useLocation();
  const [open, setOpen] = useState(false); // mobile drawer
  const activeRef = useRef(null);
  const sidebarRef = useRef(null);
  const topic = findTopic(topicId);

  useEffect(() => { setOpen(false); }, [pathname, search]);
  // Keep the current slide visible inside the sidebar (scrolls the sidebar only, never the page).
  useEffect(() => {
    const el = activeRef.current;
    const box = sidebarRef.current;
    if (!el || !box) return;
    const top = el.offsetTop - box.clientHeight / 3;
    if (el.offsetTop < box.scrollTop || el.offsetTop + el.offsetHeight > box.scrollTop + box.clientHeight) box.scrollTop = top;
  }, [lessonId, search]);

  if (!topic) return <NotFound />;
  const base = `/${locale}/${topic.id}`;

  return (
    <div className={`topic-layout ${open ? 'is-open' : ''}`}>
      <button className="sidebar-toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="sidebar">
        ☰ {t('ui.nav.contents')}
      </button>
      <div className="sidebar-scrim" onClick={() => setOpen(false)} aria-hidden="true" />

      <aside id="sidebar" className="sidebar" ref={sidebarRef} aria-label={t('ui.nav.contents')}>
        <Link to={base} className={`sidebar-topic ${!lessonId ? 'is-on' : ''}`}>{t(`${topic.id}.name`)}</Link>
        <ol className="sidebar-lessons">
          {topic.lessons.map((lesson, i) => {
            const title = t(`${topic.id}.lessons.${lesson.id}.title`);
            const level = <span className={`badge lvl-${lesson.level}`}>{t(`ui.topic.level.${lesson.level}`)}</span>;
            if (!lesson.slides) {
              return (
                <li key={lesson.id} className="sidebar-lesson is-soon">
                  <span className="sidebar-lesson-row">
                    <span className="sidebar-num">{i + 1}</span>
                    <span className="sidebar-lesson-title">{title}<small>{t('ui.topic.soon')}</small></span>
                    {level}
                  </span>
                </li>
              );
            }
            const here = lesson.id === lessonId;
            const current = here ? slideIndex(params, lesson.slides.length) : -1;
            return (
              <li key={lesson.id} className={`sidebar-lesson ${here ? 'is-here' : ''}`}>
                <Link to={`${base}/${lesson.id}`} className="sidebar-lesson-row">
                  <span className="sidebar-num">{i + 1}</span>
                  <span className="sidebar-lesson-title">{title}</span>
                  {level}
                </Link>
                <ol className="sidebar-slides">
                  {lesson.slides.map((slide, n) => (
                    <li key={slide.id}>
                      <Link
                        to={`${base}/${lesson.id}?s=${n + 1}`}
                        className={n === current ? 'is-on' : n < current ? 'is-done' : ''}
                        aria-current={n === current ? 'step' : undefined}
                        ref={n === current ? activeRef : undefined}
                      >
                        <span className="sidebar-slide-num">{n + 1}</span>
                        {t(`${topic.id}.slides.${slide.id}.title`)}
                      </Link>
                    </li>
                  ))}
                </ol>
              </li>
            );
          })}
        </ol>
      </aside>

      <div className="topic-main">
        <Outlet />
      </div>
    </div>
  );
}
