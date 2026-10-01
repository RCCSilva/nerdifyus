import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { detectLocale } from './i18n/config';
import LangLayout from './pages/LangLayout';
import Home from './pages/Home';
import TopicHub from './pages/TopicHub';
import LessonPage from './pages/LessonPage';
import TopicLayout from './pages/TopicLayout';
import NotFound from './pages/NotFound';

// Hash routing keeps the build fully static: no server rewrites needed on any host.
// URLs look like #/es/nfl/basics?s=3
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to={`/${detectLocale()}`} replace />} />
        <Route path="/:lang" element={<LangLayout />}>
          <Route index element={<Home />} />
          <Route path=":topicId" element={<TopicLayout />}>
            <Route index element={<TopicHub />} />
            <Route path=":lessonId" element={<LessonPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
