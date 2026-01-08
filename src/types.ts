export type CalculationType = 'fixed' | 'ml' | 'm2';

export interface CompanyConfig {
    id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    logoUrl?: string;
    folioPrefix: string;
    currentFolio: number;
}

export interface Category {
    id: string;
    companyId: string;
    name: string;
}

export interface Product {
    id: string;
    companyId: string;
    sku: string;
    description: string;
    category: string;
    calculationType: CalculationType;
    unit: string;
    price: number;
    hasIva: boolean;
    ivaRate: number;
}

export interface Customer {
    id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
}

export interface QuoteItem {
    id: string;
    productId: string;
    description: string;
    quantity: number;
    width?: number;
    height?: number;
    dimensionUnit?: 'm' | 'cm';
    unitPrice: number;
    subtotal: number;
}

export interface Quote {
    id: string;
    companyId: string;
    folio: string;
    date: string;
    customer: Customer;
    items: QuoteItem[];
    subtotal: number;
    discount: number;
    iva: number;
    total: number;
    status: 'draft' | 'sent' | 'accepted' | 'rejected';
    employeeName: string;
    employeePosition: string;
    validityDate: string;
    showIva: boolean;
    notes?: string;
}
