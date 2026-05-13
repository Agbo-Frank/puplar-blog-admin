import { Routes, Route, Navigate } from "react-router";
import { Toaster } from "sonner";
import { useStore } from "@/hooks/use-store";
import DashboardLayout from "./components/layout/dashboard";
import LoginPage from "./pages/login/index";
import OverviewPage from "./pages/overview/index";
import PostsPage from "./pages/posts/index";
import PostsKanbanPage from "./pages/posts/kanban";
import EditorPage from "./pages/posts/editor";
import MediaPage from "./pages/media/index";
import TaxonomyPage from "./pages/taxonomy/index";
import SchedulePage from "./pages/schedule/index";
import SettingsPage from "./pages/settings/index";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { auth, hydrated } = useStore();
  if (!hydrated) return null;
  if (!auth) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <>
    <Toaster
      position="bottom-right"
      richColors
      toastOptions={{ style: { fontFamily: 'inherit', fontSize: '13px' } }}
    />
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <AuthGuard>
            <DashboardLayout />
          </AuthGuard>
        }
      >
        <Route index element={<Navigate to="/posts" replace />} />
        <Route path="/overview"    element={<OverviewPage />} />
        <Route path="/posts"       element={<PostsPage />} />
        <Route path="/posts/kanban" element={<PostsKanbanPage />} />
        <Route path="/posts/new"   element={<EditorPage />} />
        <Route path="/posts/:id"   element={<EditorPage />} />
        <Route path="/media"       element={<MediaPage />} />
        <Route path="/taxonomy"    element={<TaxonomyPage />} />
        <Route path="/schedule"    element={<SchedulePage />} />
        <Route path="/settings"    element={<SettingsPage />} />
      </Route>
    </Routes>
    </>
  );
}
