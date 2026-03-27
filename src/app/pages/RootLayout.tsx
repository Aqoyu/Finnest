import { Outlet } from "react-router";
import { AuthProvider } from "../context/AuthContext";
import { Toaster } from "../components/ui/sonner";

export function RootLayout() {
  return (
    <AuthProvider>
      <Outlet />
      <Toaster />
    </AuthProvider>
  );
}
