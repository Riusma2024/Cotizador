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
    headerLabel1?: string; // Etiqueta debajo del logo
    headerLabel2?: string; // Etiqueta debajo de info empresa
    headerLabel3?: string; // Etiqueta debajo de folio/fecha
    watermarkUrl?: string; // URL de la marca de agua
    watermarkOpacity?: number; // Opacidad de la marca de agua (0-100)
    watermarkAlignment?: 'left' | 'center' | 'right'; // Alineación
    watermarkSize?: '100' | '75' | '50'; // Tamaño en porcentaje
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
    companyId: string;
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

export interface AnnexItem {
    id: string;
    type: 'text' | 'image';
    content: string;
    x: number;
    y: number;
    width: number;
    height: number;
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
    showSignature?: boolean;
    annexItems?: AnnexItem[];
    customHeaderLabel1?: string;
    customHeaderLabel2?: string;
    customHeaderLabel3?: string;
}
