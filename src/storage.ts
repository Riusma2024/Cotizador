import type { Customer, Company, Product, Quote, Employee } from './types';

const STORAGE_KEYS = {
    CUSTOMERS: 'calculator_customers',
    COMPANIES: 'calculator_companies',
    PRODUCTS: 'calculator_products',
    QUOTES: 'calculator_quotes',
    EMPLOYEES: 'calculator_employees',
};

// --- DATA INITIALIZATION ---
const defaultCompany: Company = {
    id: '1',
    name: 'Mi Empresa',
    address: 'Dirección de la empresa',
    phone: '555-000-0000',
    email: 'contacto@empresa.com',
    rfc: 'RFC000000000',
    logoUrl: '',
    bankInfo: 'Banco: Generico\nCuenta: 0000000000',
    active: true,
    pdfHeaderOrder: ['logo', 'info', 'folio'], // Default order
};

// Initialize with default company if empty
const initData = () => {
    const companies = localStorage.getItem(STORAGE_KEYS.COMPANIES);
    if (!companies) {
        localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify([defaultCompany]));
    }
    // Ensure styles are clean on init? No, purely data storage.
};

initData();

// --- GENERIC CRUD HELPERS ---
const getItems = <T>(key: string): T[] => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
};

const saveItems = <T>(key: string, items: T[]) => {
    localStorage.setItem(key, JSON.stringify(items));
};

const addItem = <T>(key: string, item: T) => {
    const items = getItems<T>(key);
    saveItems(key, [...items, item]);
};

const updateItem = <T extends { id: string }>(key: string, item: T) => {
    const items = getItems<T>(key);
    const index = items.findIndex((i) => i.id === item.id);
    if (index !== -1) {
        items[index] = item;
        saveItems(key, items);
    }
};

const deleteItem = <T extends { id: string }>(key: string, id: string) => {
    const items = getItems<T>(key);
    saveItems(key, items.filter((i) => i.id !== id));
};

// --- EXPORTED API ---
export const storage = {
    // Customers
    getCustomers: () => getItems<Customer>(STORAGE_KEYS.CUSTOMERS),
    addCustomer: (item: Customer) => addItem(STORAGE_KEYS.CUSTOMERS, item),
    updateCustomer: (item: Customer) => updateItem(STORAGE_KEYS.CUSTOMERS, item),
    deleteCustomer: (id: string) => deleteItem<Customer>(STORAGE_KEYS.CUSTOMERS, id),

    // Companies
    getCompanies: () => getItems<Company>(STORAGE_KEYS.COMPANIES),
    addCompany: (item: Company) => addItem(STORAGE_KEYS.COMPANIES, item),
    updateCompany: (item: Company) => updateItem(STORAGE_KEYS.COMPANIES, item),
    deleteCompany: (id: string) => deleteItem<Company>(STORAGE_KEYS.COMPANIES, id),
    getActiveCompany: () => {
        const companies = getItems<Company>(STORAGE_KEYS.COMPANIES);
        return companies.find((c) => c.active) || companies[0];
    },
    setActiveCompany: (id: string) => {
        const companies = getItems<Company>(STORAGE_KEYS.COMPANIES);
        const updated = companies.map(c => ({ ...c, active: c.id === id }));
        saveItems(STORAGE_KEYS.COMPANIES, updated);
    },

    // Products
    getProducts: () => getItems<Product>(STORAGE_KEYS.PRODUCTS),
    addProduct: (item: Product) => addItem(STORAGE_KEYS.PRODUCTS, item),
    updateProduct: (item: Product) => updateItem(STORAGE_KEYS.PRODUCTS, item),
    deleteProduct: (id: string) => deleteItem<Product>(STORAGE_KEYS.PRODUCTS, id),

    // Employees
    getEmployees: () => getItems<Employee>(STORAGE_KEYS.EMPLOYEES),
    addEmployee: (item: Employee) => addItem(STORAGE_KEYS.EMPLOYEES, item),
    updateEmployee: (item: Employee) => updateItem(STORAGE_KEYS.EMPLOYEES, item),
    deleteEmployee: (id: string) => deleteItem<Employee>(STORAGE_KEYS.EMPLOYEES, id),

    // Quotes
    getQuotes: () => getItems<Quote>(STORAGE_KEYS.QUOTES),
    addQuote: (item: Quote) => addItem(STORAGE_KEYS.QUOTES, item),
    updateQuote: (item: Quote) => updateItem(STORAGE_KEYS.QUOTES, item),
    deleteQuote: (id: string) => deleteItem<Quote>(STORAGE_KEYS.QUOTES, id),
    saveQuote: (quote: Quote) => {
        const quotes = getItems<Quote>(STORAGE_KEYS.QUOTES);
        const index = quotes.findIndex(q => q.id === quote.id);
        if (index >= 0) {
            quotes[index] = quote;
        } else {
            quotes.push(quote);
        }
        saveItems(STORAGE_KEYS.QUOTES, quotes);
    },

    // Export/Import
    exportData: () => {
        const data = {
            customers: getItems(STORAGE_KEYS.CUSTOMERS),
            companies: getItems(STORAGE_KEYS.COMPANIES),
            products: getItems(STORAGE_KEYS.PRODUCTS),
            quotes: getItems(STORAGE_KEYS.QUOTES),
            employees: getItems(STORAGE_KEYS.EMPLOYEES),
            timestamp: new Date().toISOString()
        };
        return JSON.stringify(data, null, 2);
    },

    importData: (json: string) => {
        try {
            const data = JSON.parse(json);
            if (data.customers) saveItems(STORAGE_KEYS.CUSTOMERS, data.customers);
            if (data.companies) saveItems(STORAGE_KEYS.COMPANIES, data.companies);
            if (data.products) saveItems(STORAGE_KEYS.PRODUCTS, data.products);
            if (data.quotes) saveItems(STORAGE_KEYS.QUOTES, data.quotes);
            if (data.employees) saveItems(STORAGE_KEYS.EMPLOYEES, data.employees);
            return true;
        } catch (e) {
            console.error('Import failed', e);
            return false;
        }
    }
};
