import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";

import AppLayout from "./layouts/AppLayout";
import AppDashboard from "./pages/AppDashboard";
import Lessons from "./pages/Lessons";
import LessonPlayer from "./pages/LessonPlayer";
import Journal from "./pages/Journal";
import Games from "./pages/Games";

import Profile from "./pages/profile/Profile";
import ProfileMainTab from "./pages/profile/ProfileMainTab";
import ProfileActivityTab from "./pages/profile/ProfileActivityTab";
import ProfileJournalTab from "./pages/profile/ProfileJournalTab";
import ProfileSettings from "./pages/profile/ProfileSettings";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminCategoryForm from "./pages/admin/AdminCategoryForm";
import AdminLessons from "./pages/admin/AdminLessons";
import AdminLessonForm from "./pages/admin/AdminLessonForm";
import AdminStoryReview from "./pages/admin/AdminStoryReview";
import AdminSafetyAlerts from "./pages/admin/AdminSafetyAlerts";
import AdminGames from "./pages/admin/AdminGames";
import AdminGameForm from "./pages/admin/AdminGameForm";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signin" element={<Register />} />

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="lessons" replace />} />

            <Route path="categories" element={<AdminCategories />} />
            <Route path="categories/new" element={<AdminCategoryForm />} />
            <Route path="categories/:id/edit" element={<AdminCategoryForm />} />

            <Route path="lessons" element={<AdminLessons />} />
            <Route path="lessons/new" element={<AdminLessonForm />} />
            <Route path="lessons/:id/edit" element={<AdminLessonForm />} />

            <Route path="games" element={<AdminGames />} />
            <Route path="games/new" element={<AdminGameForm />} />
            <Route path="games/:id/edit" element={<AdminGameForm />} />

            <Route path="stories-review" element={<AdminStoryReview />} />
            <Route path="safety-alerts" element={<AdminSafetyAlerts />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/app" element={<AppDashboard />} />
            <Route path="/app/lessons" element={<Lessons />} />
            <Route
              path="/app/lesson/:categoryId/:index"
              element={<LessonPlayer />}
            />
            <Route path="/app/journal" element={<Journal />} />
            <Route path="/app/games" element={<Games />} />

            <Route path="/app/profile/settings" element={<ProfileSettings />} />

            <Route path="/app/profile/:username" element={<Profile />}>
              <Route index element={<Navigate to="realizari" replace />} />
              <Route path="realizari" element={<ProfileMainTab />} />
              <Route path="statistici" element={<ProfileActivityTab />} />
              <Route path="jurnal" element={<ProfileJournalTab />} />
            </Route>

            <Route path="*" element={<Navigate to="/app/lessons" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}