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

const PDFHeader = ({ company, quote }: { company: CompanyConfig; quote: Quote }) => {
    const order = company.headerColumnOrder || ['logo', 'info', 'folio'];

    const renderColumn = (type: string, index: number) => {
        const isFirst = index === 0;
        const isMiddle = index === 1;

        const alignmentClass = isFirst ? 'text-left' : isMiddle ? 'text-center' : 'text-right';
        const itemsClass = isFirst ? 'items-start' : isMiddle ? 'items-center' : 'items-end';
        const selfClass = isFirst ? 'self-start' : isMiddle ? 'self-center' : 'self-end';

        switch (type) {
            case 'logo':
                return (
                    <div key="logo" className={`flex flex-col ${itemsClass} ${alignmentClass}`}>
                        {company.logoUrl ? (
                            <img
                                src={company.logoUrl}
                                alt="Logo"
                                className={`h-24 mb-1 object-contain ${selfClass}`}
                            />
                        ) : (
                            <div className={`h-24 mb-1 flex items-center text-blue-900 font-bold text-lg uppercase tracking-wider ${alignmentClass}`}>
                                {company.name.substring(0, 3)}
                            </div>
                        )}
                        {(quote.customHeaderLabel1 !== undefined ? quote.customHeaderLabel1 : company.headerLabel1) && (
                            <span className="text-[9px] text-gray-500 uppercase font-medium tracking-tight">
                                {quote.customHeaderLabel1 !== undefined ? quote.customHeaderLabel1 : company.headerLabel1}
                            </span>
                        )}
                    </div>
                );
            case 'info':
                return (
                    <div key="info" className={`flex flex-col ${itemsClass} ${alignmentClass}`}>
                        <h1 className="text-md font-bold text-gray-800 uppercase leading-tight">{company.name}</h1>
                        <p className="text-[10px] text-gray-600 mt-0.5">{company.address}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{company.phone} | {company.email}</p>
                        {(quote.customHeaderLabel2 !== undefined ? quote.customHeaderLabel2 : company.headerLabel2) && (
                            <span className="text-[9px] text-gray-500 uppercase font-medium mt-1 tracking-tight">
                                {quote.customHeaderLabel2 !== undefined ? quote.customHeaderLabel2 : company.headerLabel2}
                            </span>
                        )}
                    </div>
                );
            case 'folio':
                return (
                    <div key="folio" className={`flex flex-col ${itemsClass} ${alignmentClass}`}>
                        <div className={`bg-blue-50 py-1 px-2 rounded border border-blue-100 mb-1 inline-block ${selfClass} ${alignmentClass}`}>
                            <p className="text-xs font-bold text-blue-900 uppercase tracking-tighter">Folio: {quote.folio}</p>
                        </div>
                        <p className="text-[10px] text-gray-600 font-medium">
                            Fecha: <span className="text-gray-900">{formatDate(quote.date)}</span>
                        </p>
                        <p className="text-[10px] text-gray-600 font-medium">
                            Vigencia: <span className="text-gray-900">{formatDate(quote.validityDate)}</span>
                        </p>
                        {(quote.customHeaderLabel3 !== undefined ? quote.customHeaderLabel3 : company.headerLabel3) && (
                            <span className="text-[9px] text-gray-500 uppercase font-medium mt-1 tracking-tight">
                                {quote.customHeaderLabel3 !== undefined ? quote.customHeaderLabel3 : company.headerLabel3}
                            </span>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <thead className="table-header-group relative z-20">
            <tr>
                <td>
                    <div className="py-1">
                        <div className="grid grid-cols-3 gap-6 items-start">
                            {order.map((type, idx) => renderColumn(type, idx))}
                        </div>
                    </div>
                </td>
            </tr>
        </thead>
    );
};

const PDFFooter = ({ quote, showSignatures, className = "" }: { quote: Quote; showSignatures?: boolean; className?: string }) => (
    <div className={`pt-4 pb-2 border-t border-gray-100 ${className}`}>
        {/* Signatures Area - Only if showSignatures is true */}
        {showSignatures && quote.showSignature && (
            <div className="mb-6 flex justify-between gap-12 px-8">
                <div className="flex-1 border-t border-gray-400 pt-2 text-center">
                    <p className="text-[9px] font-bold text-gray-700 uppercase">Realizó la Cotización</p>
                    <p className="text-xs mt-1 font-medium text-gray-900">{quote.employeeName || 'Persona Responsable'}</p>
                    <p className="text-[9px] text-gray-500 uppercase">{quote.employeePosition || 'Puesto'}</p>
                </div>
                <div className="flex-1 border-t border-gray-400 pt-2 text-center">
                    <p className="text-[10px] font-bold text-gray-700 uppercase">Aceptación del Cliente</p>
                    <div className="h-5"></div>
                    <p className="text-[9px] text-gray-400 mt-1 italic font-serif">Acepto de Conformidad</p>
                </div>
            </div>
        )}
    </div>
);

export const QuotePDF = React.forwardRef<HTMLDivElement, QuotePDFProps>(({ quote, company }, ref) => {
    return (
        <div ref={ref} className="bg-white text-gray-900 overflow-visible relative">
            {/* Watermark - Fixed to background, hidden on annex pages */}
            {company.watermarkUrl && (
                <div
                    className={`watermark-container fixed left-0 right-0 bottom-0 flex items-center z-0 pointer-events-none print:fixed print:left-0 print:right-0 print:bottom-0 ${company.watermarkAlignment === 'left' ? 'justify-start pl-20' :
                        company.watermarkAlignment === 'right' ? 'justify-end pr-20' :
                            'justify-center'
                        }`}
                    style={{
                        // Start below customer info (approx 320px) and take remaining height
                        top: '320px',
                        height: 'auto'
                    }}
                >
                    <img
                        src={company.watermarkUrl}
                        alt="Watermark"
                        className={`object-contain ${company.watermarkSize === '75' ? 'max-w-[75%] max-h-[75%]' :
                            company.watermarkSize === '50' ? 'max-w-[50%] max-h-[50%]' :
                                'max-w-[80%] max-h-[80%]'
                            }`}
                        style={{ opacity: (company.watermarkOpacity || 8) / 100 }}
                    />
                </div>
            )}
            {/* Block 1: Main Quote Content */}
            <div className="quote-main-block relative z-10 flex flex-col justify-between pb-4" style={{ minHeight: '18cm' }}>
                <table className="w-full">
                    <PDFHeader company={company} quote={quote} />
                    <tbody className="table-row-group">
                        <tr>
                            <td>
                                <div className="pt-4 pb-2">
                                    {/* Customer */}
                                    <div className="mb-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100 break-inside-avoid">
                                        <div className="grid grid-cols-2 gap-x-12 gap-y-1 text-xs text-gray-700">
                                            <p><span className="font-bold">Cliente:</span> {quote.customer.name}</p>
                                            <p><span className="font-bold">Correo:</span> {quote.customer.email}</p>
                                            <p className="col-span-1"><span className="font-bold">Dirección:</span> {quote.customer.address}</p>
                                            <p><span className="font-bold">Teléfono:</span> {quote.customer.phone}</p>
                                        </div>
                                    </div>

                                    {/* Items table with fixed layout for perfect alignment */}
                                    <table className="w-full relative z-10 mb-2" style={{ tableLayout: 'fixed', backgroundColor: 'transparent' }}>
                                        <thead style={{ backgroundColor: 'transparent' }}>
                                            <tr className="border-b-2 border-gray-200" style={{ backgroundColor: 'transparent' }}>
                                                <th style={{ width: '80px', backgroundColor: '#F9FAFB' }} className="text-center py-2 font-extrabold text-gray-800 uppercase text-[10px] tracking-wider">Cant.</th>
                                                <th style={{ backgroundColor: '#F9FAFB' }} className="text-left py-2 font-extrabold text-gray-800 uppercase text-[10px] tracking-wider">Descripción</th>
                                                <th style={{ width: '110px', backgroundColor: '#F9FAFB' }} className="text-right py-2 font-extrabold text-gray-800 uppercase text-[10px] tracking-wider">Precio Unit.</th>
                                                <th style={{ width: '110px', backgroundColor: '#F9FAFB' }} className="text-right py-2 font-extrabold text-gray-800 uppercase text-[10px] tracking-wider">Importe</th>
                                            </tr>
                                        </thead>
                                        <tbody style={{ backgroundColor: 'transparent' }}>
                                            {quote.items.map((item) => (
                                                <tr key={item.id} className="border-b border-gray-100" style={{ backgroundColor: 'transparent' }}>
                                                    <td className="text-center py-1.5 text-xs text-gray-700" style={{ backgroundColor: 'transparent' }}>{item.quantity}</td>
                                                    <td className="py-1.5 pr-4" style={{ backgroundColor: 'transparent' }}>
                                                        <p className="text-xs font-medium text-gray-900">{item.description}</p>
                                                        {(item.width || item.height) && (
                                                            <p className="text-[10px] text-gray-500 mt-1">
                                                                Dimensiones: {item.width}{item.dimensionUnit || 'm'} {item.height ? `x ${item.height}${item.dimensionUnit || 'm'}` : ''}
                                                            </p>
                                                        )}
                                                        {item.timeAmount !== undefined && item.timeAmount > 0 && (
                                                            <p className="text-[10px] text-gray-500 mt-1">
                                                                Tiempo: {item.timeAmount} {
                                                                    item.timeUnit === 'minutes' ? 'Minutos' :
                                                                        item.timeUnit === 'hours' ? 'Horas' :
                                                                            item.timeUnit === 'days' ? 'Días' :
                                                                                item.timeUnit === 'months' ? 'Meses' : ''
                                                                }
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="text-right py-1.5 text-xs text-gray-700 px-2" style={{ backgroundColor: 'transparent' }}>{formatCurrency(item.unitPrice)}</td>
                                                    <td className="text-right py-1.5 text-xs font-bold text-gray-900 px-2" style={{ backgroundColor: 'transparent' }}>{formatCurrency(item.subtotal)}</td>
                                                </tr>
                                            ))}

                                            {/* Totals integrated into the SAME table - Perfectly aligned vertically */}
                                            <tr className="border-t-2 border-gray-100">
                                                <td colSpan={2}></td>
                                                <td className="text-right py-2 text-xs text-gray-600 font-medium px-2">Subtotal:</td>
                                                <td className="text-right py-2 text-xs text-gray-900 font-bold border-b border-gray-100 px-2">
                                                    {formatCurrency(quote.subtotal)}
                                                </td>
                                            </tr>
                                            {quote.showIva && (
                                                <tr>
                                                    <td colSpan={2}></td>
                                                    <td className="text-right py-1 text-xs text-gray-600 font-medium px-2">IVA (16%):</td>
                                                    <td className="text-right py-1 text-xs text-gray-900 font-bold border-b border-gray-100 px-2">
                                                        {formatCurrency(quote.iva)}
                                                    </td>
                                                </tr>
                                            )}
                                            <tr>
                                                <td colSpan={2}></td>
                                                <td className="text-right py-4 text-lg font-bold text-blue-900 uppercase px-2">Total:</td>
                                                <td className="text-right py-4 text-lg font-bold text-blue-900 px-2">
                                                    {formatCurrency(quote.total)}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div className="mt-auto break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
                    <div className="text-xs text-gray-500 text-center px-12 break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
                        {quote.notes && (
                            <div className="space-y-1">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5 text-center">Notas Adicionales</p>
                                <p className="whitespace-pre-wrap font-medium italic leading-relaxed text-[10px] text-gray-600 text-center">{quote.notes}</p>
                            </div>
                        )}
                    </div>

                    <PDFFooter
                        quote={quote}
                        showSignatures={true}
                    />
                </div>
            </div>



            {quote.annexItems && quote.annexItems.length > 0 && (
                <div className="annex-section-wrapper pt-10">
                    <div className="annex-section">
                        <table className="w-full relative z-10 bg-white">
                            <PDFHeader company={company} quote={quote} />
                            <tbody className="table-row-group">
                                <tr className="relative">
                                    <td className="relative bg-white">
                                        {/* Robust mask for watermark on annex: only spreads downwards and sideways */}
                                        <div
                                            className="absolute top-0 left-0 right-0 h-1 bg-white z-[5] pointer-events-none print:block hidden"
                                            style={{ boxShadow: '0 100cm 0 100cm white' }}
                                        />
                                        <div className="py-2 relative z-10 bg-white">
                                            <h3 className="text-md font-bold text-blue-900 mb-4 uppercase tracking-wide border-b pb-2">Anexo Técnico</h3>
                                            <div
                                                className="relative"
                                                style={{
                                                    minHeight: '200px',
                                                    height: `${Math.max(...(quote.annexItems || []).map(i => i.y + i.height), 200)}px`
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
                        </table>
                    </div>
                    <PDFFooter
                        quote={quote}
                        showSignatures={false}
                        className="relative z-20 border-t-0"
                    />
                </div>
            )}

            {/* Print Styles */}
            <style>{`
                @media print {
                    @page {
                        margin: 1cm 1.5cm;
                        size: auto;
                    }
                    body {
                        margin: 0;
                        -webkit-print-color-adjust: exact;
                        counter-reset: page;
                    }
                    .table-header-group { display: table-header-group; }
                    .table-footer-group { 
                        display: table-footer-group; 
                    }
                    .flex-col {
                        display: flex;
                        flex-direction: column;
                    }
                    .mt-auto {
                        margin-top: auto;
                    }
                    .quote-main-block {
                        display: flex !important;
                        flex-direction: column !important;
                    }
                    .annex-section-wrapper {
                        display: block !important;
                        page-break-before: always !important;
                        break-before: page !important;
                        padding-top: 1cm;
                    }
                }
            `}</style>
        </div >
    );
});
