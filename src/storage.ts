import type { CompanyConfig, Product, Customer, Quote, Category } from './types';

const KEYS = {
    COMPANIES: 'quoter_companies',
    ACTIVE_COMPANY: 'quoter_active_company_id',
    PRODUCTS: 'quoter_products',
    CUSTOMERS: 'quoter_customers',
    QUOTES: 'quoter_quotes',
};

export const storage = {
    // Companies
    getCompanies: (): CompanyConfig[] => {
        const data = localStorage.getItem(KEYS.COMPANIES);
        return data ? JSON.parse(data) : [];
    },
    saveCompany: (company: CompanyConfig) => {
        const companies = storage.getCompanies();
        const index = companies.findIndex(c => c.id === company.id);
        if (index >= 0) {
            companies[index] = company;
        } else {
            companies.push(company);
        }
        localStorage.setItem(KEYS.COMPANIES, JSON.stringify(companies));
    },
    deleteCompany: (id: string) => {
        const companies = storage.getCompanies().filter(c => c.id !== id);
        localStorage.setItem(KEYS.COMPANIES, JSON.stringify(companies));
    },
    getActiveCompanyId: (): string | null => {
        return localStorage.getItem(KEYS.ACTIVE_COMPANY);
    },
    setActiveCompanyId: (id: string) => {
        localStorage.setItem(KEYS.ACTIVE_COMPANY, id);
    },

    // Categories
    getCategories: (companyId?: string): Category[] => {
        const data = localStorage.getItem('quoter_categories');
        const allCategories: Category[] = data ? JSON.parse(data) : [];
        if (companyId) {
            return allCategories.filter(c => c.companyId === companyId);
        }
        return allCategories;
    },
    saveCategory: (category: Category) => {
        const categories = storage.getCategories();
        const index = categories.findIndex(c => c.id === category.id);
        if (index >= 0) {
            categories[index] = category;
        } else {
            categories.push(category);
        }
        localStorage.setItem('quoter_categories', JSON.stringify(categories));
    },
    deleteCategory: (id: string) => {
        const categories = storage.getCategories().filter(c => c.id !== id);
        localStorage.setItem('quoter_categories', JSON.stringify(categories));
    },

    // Products
    getProducts: (companyId?: string): Product[] => {
        const data = localStorage.getItem(KEYS.PRODUCTS);
        const allProducts: Product[] = data ? JSON.parse(data) : [];
        if (companyId) {
            return allProducts.filter(p => p.companyId === companyId);
        }
        return allProducts;
    },
    saveProduct: (product: Product) => {
        const products = storage.getProducts();
        const index = products.findIndex(p => p.id === product.id);
        if (index >= 0) {
            products[index] = product;
        } else {
            products.push(product);
        }
        localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
    },
    deleteProduct: (id: string) => {
        const products = storage.getProducts().filter(p => p.id !== id);
        localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
    },

    // Customers
    getCustomers: (): Customer[] => {
        const data = localStorage.getItem(KEYS.CUSTOMERS);
        return data ? JSON.parse(data) : [];
    },
    saveCustomer: (customer: Customer) => {
        const customers = storage.getCustomers();
        const index = customers.findIndex(c => c.id === customer.id);
        if (index >= 0) {
            customers[index] = customer;
        } else {
            customers.push(customer);
        }
        localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(customers));
    },

    // Quotes
    getQuotes: (companyId?: string): Quote[] => {
        const data = localStorage.getItem(KEYS.QUOTES);
        const allQuotes: Quote[] = data ? JSON.parse(data) : [];
        if (companyId) {
            return allQuotes.filter(q => q.companyId === companyId);
        }
        return allQuotes;
    },
    saveQuote: (quote: Quote) => {
        const quotes = storage.getQuotes();
        const index = quotes.findIndex(q => q.id === quote.id);
        if (index >= 0) {
            quotes[index] = quote;
        } else {
            quotes.push(quote);
        }
        localStorage.setItem(KEYS.QUOTES, JSON.stringify(quotes));
    },
};
