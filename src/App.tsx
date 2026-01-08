import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { CompanyList } from './features/company/CompanyList';
import { CompanyForm } from './features/company/CompanyForm';
import { ProductList } from './features/catalog/ProductList';
import { ProductForm } from './features/catalog/ProductForm';
import { QuoteList } from './features/quotes/QuoteList';
import { QuoteForm } from './features/quotes/QuoteForm';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/settings" replace />} />
          <Route path="settings">
            <Route index element={<CompanyList />} />
            <Route path="new" element={<CompanyForm />} />
            <Route path=":id" element={<CompanyForm />} />
          </Route>

          <Route path="catalog">
            <Route index element={<ProductList />} />
            <Route path="new" element={<ProductForm />} />
            <Route path=":id" element={<ProductForm />} />
          </Route>

          <Route path="quotes">
            <Route index element={<QuoteList />} />
            <Route path="new" element={<QuoteForm />} />
            <Route path=":id" element={<QuoteForm />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
