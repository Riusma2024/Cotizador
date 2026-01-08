import type { CalculationType } from '../types';

interface CalculationParams {
    price: number;
    quantity: number;
    width?: number;
    height?: number;
}

export const calculateSubtotal = (type: CalculationType, params: CalculationParams): number => {
    const { price, quantity, width = 0, height = 0 } = params;

    switch (type) {
        case 'fixed':
            return price * quantity;
        case 'ml':
            return price * quantity * width;
        case 'm2':
            return price * quantity * width * height;
        default:
            return 0;
    }
};

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
    }).format(amount);
};
