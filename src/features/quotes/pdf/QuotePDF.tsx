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
        <div ref={ref} className="bg-white text-gray-900 overflow-visible">
            <table className="w-full">
                {/* Repetitive Header */}
                <thead className="table-header-group">
                    <tr>
                        <td>
                            <div className="p-12 pb-6">
                                <div className="grid grid-cols-3 gap-6 mb-4 items-start border-b border-gray-100 pb-6">
                                    {/* Columna 1: Logo y Etiqueta */}
                                    <div className="flex flex-col">
                                        {company.logoUrl ? (
                                            <img
                                                src={company.logoUrl}
                                                alt="Logo"
                                                className="h-16 mb-1 object-contain self-start"
                                            />
                                        ) : (
                                            <div className="h-16 mb-1 flex items-center text-blue-900 font-bold text-lg uppercase tracking-wider">
                                                {company.name.substring(0, 3)}
                                            </div>
                                        )}
                                        {company.headerLabel1 && (
                                            <span className="text-[9px] text-gray-500 uppercase font-medium tracking-tight">
                                                {company.headerLabel1}
                                            </span>
                                        )}
                                    </div>

                                    {/* Columna 2: Info Empresa y Etiqueta */}
                                    <div className="flex flex-col text-center">
                                        <h1 className="text-md font-bold text-gray-800 uppercase leading-tight">{company.name}</h1>
                                        <p className="text-[10px] text-gray-600 mt-0.5">{company.address}</p>
                                        <p className="text-[10px] text-gray-500 mt-0.5">{company.phone} | {company.email}</p>
                                        {company.headerLabel2 && (
                                            <span className="text-[9px] text-gray-500 uppercase font-medium mt-1 tracking-tight">
                                                {company.headerLabel2}
                                            </span>
                                        )}
                                    </div>

                                    {/* Columna 3: Folio/Fecha y Etiqueta */}
                                    <div className="flex flex-col text-right">
                                        <div className="bg-blue-50 py-1 px-2 rounded border border-blue-100 mb-1 inline-block self-end text-right">
                                            <p className="text-xs font-bold text-blue-900 uppercase tracking-tighter">Folio: {quote.folio}</p>
                                        </div>
                                        <p className="text-[10px] text-gray-600 font-medium">
                                            Fecha: <span className="text-gray-900">{formatDate(quote.date)}</span>
                                        </p>
                                        <p className="text-[10px] text-gray-600 font-medium">
                                            Vigencia: <span className="text-gray-900">{formatDate(quote.validityDate)}</span>
                                        </p>
                                        {company.headerLabel3 && (
                                            <span className="text-[9px] text-gray-500 uppercase font-medium mt-1 tracking-tight">
                                                {company.headerLabel3}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                </thead>

                {/* Main Content */}
                <tbody className="table-row-group">
                    <tr>
                        <td>
                            <div className="px-12 py-2">
                                {/* Customer */}
                                <div className="mb-8 bg-gray-50 px-6 py-4 rounded-lg border border-gray-100 break-inside-avoid">
                                    <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-xs text-gray-700">
                                        <p><span className="font-bold">Cliente:</span> {quote.customer.name}</p>
                                        <p><span className="font-bold">Correo:</span> {quote.customer.email}</p>
                                        <p className="col-span-1"><span className="font-bold">Dirección:</span> {quote.customer.address}</p>
                                        <p><span className="font-bold">Teléfono:</span> {quote.customer.phone}</p>
                                    </div>
                                </div>

                                {/* Items */}
                                <table className="w-full mb-6">
                                    <thead>
                                        <tr className="border-b-2 border-gray-200">
                                            <th className="text-center py-2 font-bold text-gray-600 uppercase text-[10px] tracking-wider w-20">Cant.</th>
                                            <th className="text-left py-2 font-bold text-gray-600 uppercase text-[10px] tracking-wider">Descripción</th>
                                            <th className="text-right py-2 font-bold text-gray-600 uppercase text-[10px] tracking-wider w-28">Precio Unit.</th>
                                            <th className="text-right py-2 font-bold text-gray-600 uppercase text-[10px] tracking-wider w-28">Importe</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {quote.items.map((item) => (
                                            <tr key={item.id} className="border-b border-gray-100">
                                                <td className="text-center py-3 text-xs text-gray-700">{item.quantity}</td>
                                                <td className="py-3 pr-4">
                                                    <p className="text-xs font-medium text-gray-900">{item.description}</p>
                                                    {(item.width || item.height) && (
                                                        <p className="text-[10px] text-gray-500 mt-1">
                                                            Dimensiones: {item.width}{item.dimensionUnit || 'm'} {item.height ? `x ${item.height}${item.dimensionUnit || 'm'}` : ''}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="text-right py-3 text-xs text-gray-700">{formatCurrency(item.unitPrice)}</td>
                                                <td className="text-right py-3 text-xs font-medium text-gray-900">{formatCurrency(item.subtotal)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Totals & Signatures Container - Keep Together */}
                                <div className="break-inside-avoid">
                                    {/* Totals */}
                                    <div className="flex justify-end mb-6">
                                        <div className="w-64">
                                            <div className="flex justify-between py-1 text-xs text-gray-600 border-b border-gray-100">
                                                <span>Subtotal:</span>
                                                <span>{formatCurrency(quote.subtotal)}</span>
                                            </div>
                                            {quote.showIva && (
                                                <div className="flex justify-between py-1 text-xs text-gray-600 border-b border-gray-100">
                                                    <span>IVA (16%):</span>
                                                    <span>{formatCurrency(quote.iva)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between py-2 text-lg font-bold text-blue-900 mt-1">
                                                <span>Total:</span>
                                                <span>{formatCurrency(quote.total)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    {quote.notes && (
                                        <div className="mb-10 border-t border-gray-100 pt-4">
                                            <h4 className="text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-tight">Notas Adicionales:</h4>
                                            <p className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed">{quote.notes}</p>
                                        </div>
                                    )}

                                    {/* Signature Area */}
                                    {quote.showSignature && (
                                        <div className="mt-12 mb-8 flex justify-between gap-12">
                                            <div className="flex-1 border-t border-gray-400 pt-2 text-center">
                                                <p className="text-[9px] font-bold text-gray-700 uppercase">Realizó la Cotización</p>
                                                <p className="text-xs mt-2 font-medium text-gray-900">{quote.employeeName || 'Persona Responsable'}</p>
                                                <p className="text-[9px] text-gray-500 uppercase">{quote.employeePosition || 'Puesto'}</p>
                                            </div>
                                            <div className="flex-1 border-t border-gray-400 pt-2 text-center">
                                                <p className="text-[9px] font-bold text-gray-700 uppercase">Aceptación del Cliente</p>
                                                <div className="h-6"></div>
                                                <p className="text-[9px] text-gray-400 mt-1 italic font-serif">Acepto de Conformidad</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </td>
                    </tr>
                </tbody>

                {/* Annex Content - Separated to handle page breaks better */}
                {quote.annexItems && quote.annexItems.length > 0 && (
                    <tbody className="table-row-group annex-section">
                        <tr>
                            <td>
                                <div className="px-12 py-2">
                                    <h3 className="text-md font-bold text-blue-900 mb-4 uppercase tracking-wide border-b pb-2">Anexo Técnico</h3>
                                    <div
                                        className="relative bg-white"
                                        style={{
                                            height: `${Math.max(...quote.annexItems.map(i => i.y + i.height), 200)}px`,
                                            width: '100%'
                                        }}
                                    >
                                        {quote.annexItems.map((item) => (
                                            <div
                                                key={item.id}
                                                className="absolute overflow-hidden"
                                                style={{
                                                    left: `${item.x}px`,
                                                    top: `${item.y}px`,
                                                    width: `${item.width}px`,
                                                    height: `${item.height}px`
                                                }}
                                            >
                                                {item.type === 'text' ? (
                                                    <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed w-full h-full">
                                                        {item.content}
                                                    </div>
                                                ) : (
                                                    <img
                                                        src={item.content}
                                                        alt="Annex Item"
                                                        className="w-full h-full object-contain"
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                )}

                {/* Repetitive Footer */}
                <tfoot className="table-footer-group">
                    <tr>
                        <td>
                            <div className="px-12 py-8 border-t border-gray-200">
                                <div className="text-sm text-gray-500 text-center">
                                    <p className="font-medium text-gray-900 mb-1">Gracias por su preferencia</p>
                                    <p className="text-[11px]">Esta cotización vincula únicamente los ítems descritos. Sujeta a términos y condiciones de la empresa.</p>
                                    <div className="flex justify-between items-end mt-4 text-[10px] text-gray-400">
                                        <p>Generado por QuoterPro - {company.name}</p>
                                        <p className="page-number-label"></p>
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                </tfoot>
            </table>

            {/* Print Styles */}
            <style>{`
                @media print {
                    @page {
                        margin: 1cm 0;
                        size: auto;
                    }
                    body {
                        margin: 0;
                        -webkit-print-color-adjust: exact;
                        counter-reset: page;
                    }
                    .table-header-group { display: table-header-group; }
                    .table-footer-group { display: table-footer-group; }
                    .break-inside-avoid {
                        break-inside: avoid;
                    }
                    .annex-section {
                        page-break-before: always !important;
                    }
                    .page-number-label:after {
                        counter-increment: page;
                        content: "Página " counter(page);
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        table-layout: fixed;
                    }
                }
            `}</style>
        </div>
    );
});
