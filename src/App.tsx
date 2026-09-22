import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
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
import { WorkoutBuilderPage } from './pages/personal/WorkoutBuilderPage';
import { NutritionManagementPage } from './pages/personal/NutritionManagementPage';
import { EvolutionOverviewPage } from './pages/personal/EvolutionOverviewPage';
import { ReportsPage } from './pages/personal/ReportsPage';
import { SettingsPage } from './pages/personal/SettingsPage';

// Student Pages
import { StudentDashboardPage } from './pages/student/StudentDashboardPage';
import { StudentWorkoutsListPage } from './pages/student/StudentWorkoutsListPage';
import { StudentActiveWorkoutPage } from './pages/student/StudentActiveWorkoutPage';
import { StudentHistoryPage } from './pages/student/StudentHistoryPage';
import { StudentEvolutionPage } from './pages/student/StudentEvolutionPage';
import { StudentNutritionPage } from './pages/student/StudentNutritionPage';
import { StudentProfilePage } from './pages/student/StudentProfilePage';

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
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <Routes>

              {/* Root redirect based on auth */}
              <Route path="/" element={<RootRedirect />} />
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
                  <Route path="workouts/new" element={<WorkoutBuilderPage />} />
                  <Route path="nutrition" element={<NutritionManagementPage />} />
                  <Route path="evolution" element={<EvolutionOverviewPage />} />
                  <Route path="reports" element={<ReportsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
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
    </ThemeProvider>
  );
};

export default App;
