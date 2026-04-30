import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { CustomersPage } from "@/features/customers/CustomersPage";
import { HomePage } from "@/features/home/HomePage";
import { InvoicesPage } from "@/features/invoices/InvoicesPage";
import { TrendsPage } from "@/features/trends/TrendsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="trends" element={<TrendsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
