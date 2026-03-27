import { createBrowserRouter, Navigate, Outlet } from "react-router";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { Toaster } from "./components/ui/sonner";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { MainApp } from "./pages/MainApp";

function LoadingScreen() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-cyan-500/30 border-t-cyan-500 animate-spin" />
        <p className="text-sm text-gray-500">{t.loading}</p>
      </div>
    </div>
  );
}

// Root layout: provides language + auth context and toaster
function RootLayout() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Outlet />
        <Toaster />
      </AuthProvider>
    </LanguageProvider>
  );
}

// Redirect authenticated users away from auth pages
function PublicOnlyLayout() {
  const { session, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (session) return <Navigate to="/app" replace />;
  return <Outlet />;
}

// Redirect unauthenticated users to login
function ProtectedLayout() {
  const { session, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!session) return <Navigate to="/login" replace />;
  return <Outlet />;
}

// Root index — redirect based on auth state
function IndexRedirect() {
  const { session, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return <Navigate to={session ? "/app" : "/login"} replace />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: IndexRedirect },
      {
        Component: PublicOnlyLayout,
        children: [
          { path: "login", Component: LoginPage },
          { path: "register", Component: RegisterPage },
          { path: "forgot-password", Component: ForgotPasswordPage },
        ],
      },
      { path: "reset-password", Component: ResetPasswordPage },
      {
        Component: ProtectedLayout,
        children: [
          { path: "app", Component: MainApp },
        ],
      },
      { path: "*", Component: IndexRedirect },
    ],
  },
]);