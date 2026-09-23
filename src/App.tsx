import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { LanguageProvider } from './context/LanguageContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Layouts
import { PersonalLayout } from './layouts/PersonalLayout';
import { StudentLayout } from './layouts/StudentLayout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';

// Personal Pages
import { DashboardPage as PersonalDashboard } from './pages/personal/DashboardPage';
import { StudentsListPage } from './pages/personal/StudentsListPage';
import { StudentCreateEditPage } from './pages/personal/StudentCreateEditPage';
import { StudentDetailPage } from './pages/personal/StudentDetailPage';
import { ExercisesPage } from './pages/personal/ExercisesPage';
import { WorkoutTemplatesPage } from './pages/personal/WorkoutTemplatesPage';
import { WorkoutBuilderPage } from './pages/personal/WorkoutBuilderPage';
import { NutritionManagementPage } from './pages/personal/NutritionManagementPage';
import { EvolutionOverviewPage } from './pages/personal/EvolutionOverviewPage';
import { ReportsPage } from './pages/personal/ReportsPage';
import { SettingsPage } from './pages/personal/SettingsPage';
import { RankingManagementPage } from './pages/personal/RankingManagementPage';
import { AnamnesisDashboardPage } from './pages/personal/anamnesis/AnamnesisDashboardPage';
import { FormsListPage } from './pages/personal/anamnesis/FormsListPage';
import { FormEditorPage } from './pages/personal/anamnesis/FormEditorPage';
import { ApplicationsListPage } from './pages/personal/anamnesis/ApplicationsListPage';
import { ResponseViewerPage } from './pages/personal/anamnesis/ResponseViewerPage';

// Student Pages
import { StudentDashboardPage } from './pages/student/StudentDashboardPage';
import { StudentWorkoutsListPage } from './pages/student/StudentWorkoutsListPage';
import { StudentActiveWorkoutPage } from './pages/student/StudentActiveWorkoutPage';
import { StudentHistoryPage } from './pages/student/StudentHistoryPage';
import { StudentEvolutionPage } from './pages/student/StudentEvolutionPage';
import { StudentNutritionPage } from './pages/student/StudentNutritionPage';
import { StudentProfilePage } from './pages/student/StudentProfilePage';
import { StudentRankingPage } from './pages/student/StudentRankingPage';
import { StudentAnamnesisPage } from './pages/student/anamnesis/StudentAnamnesisPage';
import { StudentFillFormPage } from './pages/student/anamnesis/StudentFillFormPage';
import { StudentResponseDetailPage } from './pages/student/anamnesis/StudentResponseDetailPage';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';

const RootRedirect: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-bg">
        <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'personal') {
    return <Navigate to="/personal/dashboard" replace />;
  }

  return <Navigate to="/student/dashboard" replace />;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <BrowserRouter basename={import.meta.env.BASE_URL}>
              <Routes>

              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/home" element={<LandingPage />} />
              <Route path="/app" element={<RootRedirect />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Personal Trainer Routes */}
              <Route element={<ProtectedRoute requiredRole="personal" />}>
                <Route path="/personal" element={<PersonalLayout />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<PersonalDashboard />} />
                  <Route path="students" element={<StudentsListPage />} />
                  <Route path="students/new" element={<StudentCreateEditPage />} />
                  <Route path="students/:id" element={<StudentDetailPage />} />
                  <Route path="exercises" element={<ExercisesPage />} />
                  <Route path="templates" element={<WorkoutTemplatesPage />} />
                  <Route path="workouts/new" element={<WorkoutBuilderPage />} />
                  <Route path="nutrition" element={<NutritionManagementPage />} />
                  <Route path="evolution" element={<EvolutionOverviewPage />} />
                  <Route path="reports" element={<ReportsPage />} />
                  <Route path="ranking" element={<RankingManagementPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="anamnesis" element={<AnamnesisDashboardPage />} />
                  <Route path="anamnesis/forms" element={<FormsListPage />} />
                  <Route path="anamnesis/forms/new" element={<FormEditorPage />} />
                  <Route path="anamnesis/forms/:id/edit" element={<FormEditorPage />} />
                  <Route path="anamnesis/applications" element={<ApplicationsListPage />} />
                  <Route path="anamnesis/responses/:id" element={<ResponseViewerPage />} />
                </Route>
              </Route>

              {/* Student Routes */}
              <Route element={<ProtectedRoute requiredRole="student" />}>
                <Route path="/student" element={<StudentLayout />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<StudentDashboardPage />} />
                  <Route path="workouts" element={<StudentWorkoutsListPage />} />
                  <Route path="workout/today" element={<StudentActiveWorkoutPage />} />
                  <Route path="workout/active/:dayId" element={<StudentActiveWorkoutPage />} />
                  <Route path="ranking" element={<StudentRankingPage />} />
                  <Route path="anamnesis" element={<StudentAnamnesisPage />} />
                  <Route path="anamnesis/fill/:applicationId" element={<StudentFillFormPage />} />
                  <Route path="anamnesis/responses/:responseId" element={<StudentResponseDetailPage />} />
                  <Route path="chat" element={<StudentHistoryPage />} />
                  <Route path="history" element={<StudentHistoryPage />} />
                  <Route path="evolution" element={<StudentEvolutionPage />} />
                  <Route path="nutrition" element={<StudentNutritionPage />} />
                  <Route path="profile" element={<StudentProfilePage />} />
                </Route>
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </LanguageProvider>
  </ThemeProvider>
);
};

export default App;
