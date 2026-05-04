import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/dashboard';
import LoginPage from './pages/login/index';
import OverviewPage from './pages/overview/index';
import PostsPage from './pages/posts/index';
import PostsKanbanPage from './pages/posts/kanban';
import EditorPage from './pages/posts/editor';
import MediaPage from './pages/media/index';
import TaxonomyPage from './pages/taxonomy/index';
import SchedulePage from './pages/schedule/index';

export default function App() {
  const [authed, setAuthed] = useState(false);

  if (!authed) {
    return <LoginPage onLogin={() => setAuthed(true)} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/posts" replace />} />
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/posts" element={<PostsPage />} />
          <Route path="/posts/kanban" element={<PostsKanbanPage />} />
          <Route path="/posts/new" element={<EditorPage />} />
          <Route path="/posts/:id" element={<EditorPage />} />
          <Route path="/media" element={<MediaPage />} />
          <Route path="/taxonomy" element={<TaxonomyPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
