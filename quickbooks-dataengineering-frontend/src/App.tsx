import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";

const HomePage = lazy(() =>
  import("@/features/home/HomePage").then((m) => ({ default: m.HomePage })),
);
const InvoicesPage = lazy(() =>
  import("@/features/invoices/InvoicesPage").then((m) => ({
    default: m.InvoicesPage,
  })),
);
const CustomersPage = lazy(() =>
  import("@/features/customers/CustomersPage").then((m) => ({
    default: m.CustomersPage,
  })),
);
const TrendsPage = lazy(() =>
  import("@/features/trends/TrendsPage").then((m) => ({
    default: m.TrendsPage,
  })),
);

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<HomePage />} />
            <Route path="invoices" element={<InvoicesPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="trends" element={<TrendsPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
