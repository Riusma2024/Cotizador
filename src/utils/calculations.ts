import type { CalculationType } from '../types';

interface CalculationParams {
    price: number;
    quantity: number;
    width?: number;
    height?: number;
    dimensionUnit?: 'm' | 'cm' | 'mm'; // New parameter for dimension unit from quote item
    timeAmount?: number;
    timeUnit?: 'minutes' | 'hours' | 'days' | 'months';
    productUnit?: string; // e.g. "m", "cm", "Hora", "Día"
}

const LENGTH_FACTORS: Record<string, number> = {
    'm': 1,
    'cm': 0.01,
    'mm': 0.001
};

const TIME_FACTORS: Record<string, number> = {
    'minutes': 1 / 60,
    'hours': 1,
    'days': 24,
    'months': 24 * 30
};

// Map display names to internal standardized units
const UNIT_MAP: Record<string, string> = {
    'm': 'm',
    'metro': 'm',
    'metros': 'm',
    'ml': 'm',
    'cm': 'cm',
    'centímetro': 'cm',
    'centímetros': 'cm',
    'minuto': 'minutes',
    'minutos': 'minutes',
    'hora': 'hours',
    'horas': 'hours',
    'día': 'days',
    'dia': 'days',
    'días': 'days',
    'mes': 'months',
    'meses': 'months'
};

const getStandardUnit = (unit: string): string => {
    const lower = unit.toLowerCase().trim();
    return UNIT_MAP[lower] || lower;
};

export const calculateSubtotal = (type: CalculationType, params: CalculationParams): number => {
    const { price, quantity, width = 0, height = 0, dimensionUnit = 'm', timeAmount = 0, timeUnit = 'hours', productUnit = '' } = params;

    const stdProductUnit = getStandardUnit(productUnit);

    switch (type) {
        case 'fixed':
            return price * quantity;

        case 'ml': {
            const itemFactor = LENGTH_FACTORS[dimensionUnit] || 1;
            const productFactor = LENGTH_FACTORS[stdProductUnit] || 1;
            return price * (width * itemFactor / productFactor) * quantity;
        }

        case 'm2': {
            const itemFactor = LENGTH_FACTORS[dimensionUnit] || 1;
            const productFactor = (LENGTH_FACTORS[stdProductUnit] || 1) ** 2; // Square the factor for Area
            return price * (width * itemFactor * height * itemFactor / productFactor) * quantity;
        }

        case 'time': {
            const itemFactor = TIME_FACTORS[timeUnit] || 1;
            const productFactor = TIME_FACTORS[stdProductUnit] || 1;
            return price * (timeAmount * itemFactor / productFactor) * quantity;
        }

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
