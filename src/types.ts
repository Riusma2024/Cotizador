export type DimensionUnit = 'm' | 'cm' | 'mm';
export type TimeUnit = 'minutes' | 'hours' | 'days' | 'months';
export type CalculationType = 'fixed' | 'ml' | 'm2' | 'time';

export interface Product {
    id: string;
    companyId: string;
    code: string;
    name: string; // "Product" or "Service" name
    description: string;
    unitPrice: number;
    unit: string; // Display unit e.g. "m", "pza", "hr"
    baseUnit?: 'm' | 'cm' | 'mm' | 'minutes' | 'hours' | 'days' | 'months'; // Internal base unit for conversion
    calculationType: CalculationType;
    category?: string;
}

export interface Customer {
    id: string;
    companyId: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    address: string;
    rfc: string;
}

export interface QuoteItem {
    id: string;
    productId: string;
    code: string;
    description: string;
    quantity: number;
    unitPrice: number;
    width?: number;
    height?: number;
    dimensionUnit?: DimensionUnit;
    timeAmount?: number;
    timeUnit?: TimeUnit;
    subtotal: number;
}

export interface AnnexItem {
    id: string;
    type: 'text' | 'image';
    content: string; // text content or base64 image
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Quote {
    id: string;
    companyId: string;
    employeeId: string; // ID of the employee who created the quote
    employeeName?: string; // Snapshot of name
    employeePosition?: string; // Snapshot of position
    folio: string;
    date: string;
    validityDate?: string; // Expiration date of the quote
    customer: Customer;
    items: QuoteItem[];
    annexItems?: AnnexItem[]; // New technical annex items
    notes: string;
    subtotal: number;
    vatAlert?: boolean; // If true, adds 16% VAT
    vat: number;
    total: number;
    status: 'draft' | 'sent' | 'approved' | 'rejected';
    showSignature?: boolean; // Toggle for signature block
}

export interface Company {
    id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    rfc: string;
    logoUrl: string;
    bankInfo: string;
    active: boolean;
    watermarkUrl?: string; // New field for watermark image URL
    watermarkAlignment?: 'left' | 'center' | 'right'; // Alignment preference
    pdfHeaderOrder?: ('logo' | 'info' | 'folio')[]; // Order of header elements
}

export interface Employee {
    id: string;
    companyId: string;
    name: string;
    position: string;
    email: string;
    phone: string;
    active: boolean;
}
