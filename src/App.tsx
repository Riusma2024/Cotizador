import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { CustomerManager } from './features/customers/CustomerManager';
import { CompanyList } from './features/company/CompanyList';
import { EmployeeManager } from './features/employees/EmployeeManager';
import { ProductList } from './features/catalog/ProductList';
import { QuoteList } from './features/quotes/QuoteList';
import { QuoteForm } from './features/quotes/QuoteForm';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/quotes" replace />} />
          <Route path="quotes" element={<QuoteList />} />
          <Route path="quotes/new" element={<QuoteForm />} />
          <Route path="quotes/:id/edit" element={<QuoteForm />} />
          <Route path="customers" element={<CustomerManager />} />
          <Route path="employees" element={<EmployeeManager />} />
          <Route path="catalog" element={<ProductList />} />
          <Route path="settings" element={<CompanyList />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
