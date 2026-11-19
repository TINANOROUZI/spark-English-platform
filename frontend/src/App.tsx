import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { I18nProvider } from "./i18n/I18nContext";
import HomePage from "./pages/HomePage";

const AdminPage = lazy(() => import("./pages/admin/AdminPage"));
const queryClient = new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false } } });

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<div className="admin-gate" role="status">Loading…</div>}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="*" element={<HomePage />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}
