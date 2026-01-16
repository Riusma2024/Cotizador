import type { CompanyConfig, Product, Customer, Quote, Category, Employee } from './types';

const KEYS = {
    COMPANIES: 'quoter_companies',
    ACTIVE_COMPANY: 'quoter_active_company_id',
    PRODUCTS: 'quoter_products',
    CUSTOMERS: 'quoter_customers',
    QUOTES: 'quoter_quotes',
    EMPLOYEES: 'quoter_employees',
    CATEGORIES: 'quoter_categories',
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
        const data = localStorage.getItem(KEYS.CATEGORIES);
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
        localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
    },
    deleteCategory: (id: string) => {
        const categories = storage.getCategories().filter(c => c.id !== id);
        localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
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
    getCustomers: (companyId?: string): Customer[] => {
        const data = localStorage.getItem(KEYS.CUSTOMERS);
        const allCustomers: Customer[] = data ? JSON.parse(data) : [];
        if (companyId) {
            return allCustomers.filter(c => c.companyId === companyId);
        }
        return allCustomers;
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
    deleteCustomer: (id: string) => {
        const customers = storage.getCustomers().filter(c => c.id !== id);
        localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(customers));
    },

    // Employees
    getEmployees: (companyId?: string): Employee[] => {
        const data = localStorage.getItem(KEYS.EMPLOYEES);
        const allEmployees: Employee[] = data ? JSON.parse(data) : [];
        if (companyId) {
            return allEmployees.filter(e => e.companyId === companyId);
        }
        return allEmployees;
    },
    saveEmployee: (employee: Employee) => {
        const employees = storage.getEmployees();
        const index = employees.findIndex(e => e.id === employee.id);
        if (index >= 0) {
            employees[index] = employee;
        } else {
            employees.push(employee);
        }
        localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(employees));
    },
    deleteEmployee: (id: string) => {
        const employees = storage.getEmployees().filter(e => e.id !== id);
        localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(employees));
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

    // Export / Import
    exportData: () => {
        const data: Record<string, any> = {};
        Object.values(KEYS).forEach(key => {
            const val = localStorage.getItem(key);
            if (val) {
                try {
                    data[key] = JSON.parse(val);
                } catch (e) {
                    // Fallback for non-JSON strings
                    data[key] = val;
                }
            }
        });
        return JSON.stringify(data, null, 2);
    },
    importData: (jsonString: string) => {
        try {
            const data = JSON.parse(jsonString);
            Object.entries(data).forEach(([key, value]) => {
                if (Object.values(KEYS).includes(key)) {
                    // special handling for active company id which is a bare string
                    if (key === KEYS.ACTIVE_COMPANY && typeof value === 'string') {
                        localStorage.setItem(key, value);
                    } else {
                        localStorage.setItem(key, JSON.stringify(value));
                    }
                }
            });
            return true;
        } catch (e) {
            console.error('Error importing data:', e);
            return false;
        }
    },
    clearData: () => {
        Object.values(KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    },
};
