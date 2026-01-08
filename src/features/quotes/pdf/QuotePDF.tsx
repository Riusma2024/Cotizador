import React from 'react';
import type { Quote, CompanyConfig } from '../../../types';
import { formatCurrency } from '../../../utils/calculations';

interface QuotePDFProps {
    quote: Quote;
    company: CompanyConfig;
}

const formatDate = (dateString: string) => {
    if (!dateString) return '';
    // Append time to ensure local date interpretation and avoid timezone issues
    const date = new Date(`${dateString}T00:00:00`);
    if (isNaN(date.getTime())) return dateString; // Fallback
    return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
};

export const QuotePDF = React.forwardRef<HTMLDivElement, QuotePDFProps>(({ quote, company }, ref) => {
    return (
        <div ref={ref} className="p-12 max-w-4xl mx-auto bg-white text-gray-900 print:p-8 flex flex-col min-h-screen">
            <div className="flex-grow">
                {/* Header */}
                <div className="flex justify-between items-start mb-12">
                    <div className="flex-1">
                        {company.logoUrl && (
                            <img
                                src={company.logoUrl}
                                alt="Logo"
                                className="h-24 mb-4 object-contain"
                            />
                        )}
                        <h1 className="text-2xl font-bold text-blue-900">{company.name}</h1>
                        <p className="text-sm text-gray-600 whitespace-pre-line mt-2">{company.address}</p>
                        <div className="text-sm text-gray-600 mt-1">
                            <p>{company.phone}</p>
                            <p>{company.email}</p>
                        </div>
                    </div>
                    <div className="text-right flex-1">
                        <p className="text-xl font-bold text-gray-700">Folio: #{quote.folio}</p>
                        <p className="text-gray-500 mt-1">
                            Fecha: {formatDate(quote.date)}
                        </p>
                        <p className="text-gray-500 mt-1">
                            Vigencia: {formatDate(quote.validityDate)}
                        </p>
                    </div>
                </div>

                {/* Customer */}
                <div className="mb-12 bg-gray-50 p-6 rounded-lg border border-gray-100">
                    <div className="grid grid-cols-1 gap-2 text-sm text-gray-700">
                        <p><span className="font-bold">Cliente:</span> {quote.customer.name}</p>
                        <p><span className="font-bold">Dirección:</span> {quote.customer.address}</p>
                        <p><span className="font-bold">Correo:</span> {quote.customer.email}</p>
                        <p><span className="font-bold">Teléfono:</span> {quote.customer.phone}</p>
                    </div>
                </div>

                {/* Items */}
                <table className="w-full mb-8">
                    <thead>
                        <tr className="border-b-2 border-gray-200">
                            <th className="text-center py-3 font-bold text-gray-600 uppercase text-xs tracking-wider w-24">Cant.</th>
                            <th className="text-left py-3 font-bold text-gray-600 uppercase text-xs tracking-wider">Descripción</th>
                            <th className="text-right py-3 font-bold text-gray-600 uppercase text-xs tracking-wider w-32">Precio Unit.</th>
                            <th className="text-right py-3 font-bold text-gray-600 uppercase text-xs tracking-wider w-32">Importe</th>
                        </tr>
                    </thead>
                    <tbody>
                        {quote.items.map((item) => (
                            <tr key={item.id} className="border-b border-gray-100">
                                <td className="text-center py-4 text-gray-700">{item.quantity}</td>
                                <td className="py-4 pr-4">
                                    <p className="font-medium text-gray-900">{item.description}</p>
                                    {(item.width || item.height) && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Dimensiones: {item.width}{item.dimensionUnit || 'm'} {item.height ? `x ${item.height}${item.dimensionUnit || 'm'}` : ''}
                                        </p>
                                    )}
                                </td>
                                <td className="text-right py-4 text-gray-700">{formatCurrency(item.unitPrice)}</td>
                                <td className="text-right py-4 font-medium text-gray-900">{formatCurrency(item.subtotal)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end mb-8">
                    <div className="w-72">
                        <div className="flex justify-between py-2 text-gray-600 border-b border-gray-100">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(quote.subtotal)}</span>
                        </div>
                        {quote.showIva && (
                            <div className="flex justify-between py-2 text-gray-600 border-b border-gray-100">
                                <span>IVA (16%):</span>
                                <span>{formatCurrency(quote.iva)}</span>
                            </div>
                        )}
                        <div className="flex justify-between py-3 text-xl font-bold text-blue-900 mt-2">
                            <span>Total:</span>
                            <span>{formatCurrency(quote.total)}</span>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {quote.notes && (
                    <div className="mb-12 border-t border-gray-100 pt-6">
                        <h4 className="text-sm font-bold text-gray-700 mb-2">Notas Adicionales:</h4>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{quote.notes}</p>
                    </div>
                )}
            </div>

            {/* Footer / Terms */}
            <div className="border-t border-gray-200 pt-8 text-sm text-gray-500 text-center mt-auto">
                <p className="font-medium text-gray-900 mb-2">Gracias por su preferencia</p>
                <p>Esta cotización tiene una vigencia de 15 días. Precios sujetos a cambio sin previo aviso.</p>
                <div className="flex justify-between items-end mt-4">
                    <p className="text-xs text-gray-400">Generado por QuoterPro</p>
                    {/* Pagination Placeholder - CSS counters would be handled in print styles */}
                    <p className="text-xs text-gray-400 print:block hidden after:content-['Página_'counter(page)_'_de_'_counter(pages)]"></p>
                </div>
            </div>

            {/* Print Styles for Pagination */}
            <style>{`
                @media print {
                    @page {
                        margin: 2cm;
                        counter-increment: page;
                    }
                    body {
                        counter-reset: page;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
            `}</style>
        </div>
    );
});
