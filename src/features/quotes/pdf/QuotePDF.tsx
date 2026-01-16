import React from 'react';
import type { Quote, CompanyConfig } from '../../../types';
import { formatCurrency } from '../../../utils/calculations';
import clsx from 'clsx';

interface QuotePDFProps {
    quote: Quote;
    company: CompanyConfig;
    hideWatermark?: boolean;
}

const formatDate = (dateString: string) => {
    if (!dateString) return '';
    // Append time to ensure local date interpretation and avoid timezone issues
    const date = new Date(`${dateString}T00:00:00`);
    if (isNaN(date.getTime())) return dateString; // Fallback
    return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
};

const PDFHeader = ({ company, quote, noBg = false, pageInfo }: { company: CompanyConfig; quote: Quote; noBg?: boolean; pageInfo?: { current: number; total: number } }) => {
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
                        {pageInfo && (
                            <p className="text-[10px] text-gray-500 font-bold mt-0.5">
                                pág. <span className="text-gray-700">{pageInfo.current} de {pageInfo.total}</span>
                            </p>
                        )}
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
        <div className={`py-3 px-4 rounded-xl border border-gray-100 mb-4 ${noBg ? 'bg-white' : 'bg-gray-50'}`}>
            <div className="grid grid-cols-3 gap-6 items-start">
                {order.map((type, idx) => renderColumn(type, idx))}
            </div>
        </div>
    );
};

const PDFFooter = ({ quote, showSignatures, className = "" }: { quote: Quote; showSignatures?: boolean; className?: string }) => (
    <div className={`pt-4 pb-2 ${className}`}>
        {showSignatures && quote.showSignature && (
            <div className="mt-20 mb-6 flex justify-between gap-12 px-8">
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

export const QuotePDF = React.forwardRef<HTMLDivElement, QuotePDFProps>(({ quote, company, hideWatermark = false }, ref) => {
    // Logic for item distribution and page count - optimized for maximum space utilization
    const p1Limit = 18;
    const pNLimit = 25;
    const mainPages = quote.items.length <= p1Limit ? 1 : Math.ceil((quote.items.length - p1Limit) / pNLimit) + 1;
    const totalPages = mainPages + (quote.showAnnex && quote.annexItems && quote.annexItems.length > 0 ? 1 : 0);

    return (
        <div ref={ref} className="pdf-container bg-white text-gray-900 overflow-visible relative">
            <div
                className="quote-main-block relative flex flex-col pb-4 min-h-[23cm] flex-grow overflow-visible"
                style={{ display: 'flex', flexDirection: 'column' }}
            >
                {/* Tiled Watermarks - Precisely aligned to 11in pages */}
                <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
                    {[...Array(8)].map((_, i) => {
                        if (i >= mainPages) return null;
                        return (
                            <div
                                key={i}
                                className={clsx(
                                    "absolute left-0 right-0 flex items-center p-8",
                                    company.watermarkAlignment === 'left' ? 'justify-start' :
                                        company.watermarkAlignment === 'right' ? 'justify-end' : 'justify-center'
                                )}
                                style={{
                                    top: `${i * 11}in`,
                                    height: '11in',
                                }}
                            >
                                {company.watermarkUrl && !hideWatermark && (
                                    <img
                                        src={company.watermarkUrl}
                                        alt="Watermark"
                                        className="object-contain"
                                        style={{
                                            opacity: (company.watermarkOpacity || 8) / 100,
                                            width: company.watermarkSize === '100' ? '95%' :
                                                company.watermarkSize === '75' ? '75%' :
                                                    company.watermarkSize === '50' ? '50%' : '85%',
                                            maxHeight: '80%',
                                            transform: i === 0 ? 'translateY(1.2in)' : 'none'
                                        }}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="relative z-10">
                    <PDFHeader
                        company={company}
                        quote={quote}
                        pageInfo={{ current: 1, total: totalPages }}
                    />
                </div>

                <div className="px-1 relative z-10">
                    <div className="mb-4 bg-gray-50 px-4 py-3 rounded-lg border border-gray-100">
                        <div className="grid grid-cols-2 gap-x-12 gap-y-1 text-xs text-gray-700">
                            <p><span className="font-bold">Cliente:</span> {quote.customer.name}</p>
                            <p><span className="font-bold">Correo:</span> {quote.customer.email}</p>
                            <p className="col-span-1"><span className="font-bold">Dirección:</span> {quote.customer.address}</p>
                            <p><span className="font-bold">Teléfono:</span> {quote.customer.phone}</p>
                        </div>
                    </div>

                    <table className="w-full mb-4" style={{ tableLayout: 'fixed' }}>
                        <thead>
                            <tr className="border-b-2 border-gray-200 bg-gray-50">
                                <th style={{ width: '80px' }} className="text-center py-2 font-extrabold text-gray-800 uppercase text-[10px] tracking-wider">Cant.</th>
                                <th className="text-left py-2 px-2 font-extrabold text-gray-800 uppercase text-[10px] tracking-wider">Descripción</th>
                                <th style={{ width: '110px' }} className="text-right py-2 font-extrabold text-gray-800 uppercase text-[10px] tracking-wider">Precio Unit.</th>
                                <th style={{ width: '110px' }} className="text-right py-2 px-2 font-extrabold text-gray-800 uppercase text-[10px] tracking-wider">Importe</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(() => {
                                const rows: React.ReactNode[] = [];
                                quote.items.forEach((item, index) => {
                                    if (index > 0) {
                                        let needsBreak = false;
                                        let pNum = 1;
                                        if (index === p1Limit) {
                                            needsBreak = true;
                                            pNum = 2;
                                        } else if (index > p1Limit && (index - p1Limit) % pNLimit === 0) {
                                            needsBreak = true;
                                            pNum = Math.floor((index - p1Limit) / pNLimit) + 2;
                                        }

                                        if (needsBreak) {
                                            rows.push(
                                                <tr key={`break-${index}`} style={{ pageBreakBefore: 'always' }}>
                                                    <td colSpan={4} className="p-0 border-none px-1">
                                                        <div className="pt-8 pb-1 flex justify-between items-end border-b-2 border-gray-100 mb-4">
                                                            <div className="text-[10px] font-bold text-blue-900 uppercase">
                                                                Cotización: {quote.folio} | {company.name}
                                                            </div>
                                                            <div className="text-[10px] font-bold text-gray-500">
                                                                pág. {pNum} de {totalPages}
                                                            </div>
                                                        </div>
                                                        <div className="border-b-2 border-gray-200 bg-gray-50 flex py-2 font-extrabold text-gray-800 uppercase text-[10px] tracking-wider">
                                                            <div style={{ width: '80px' }} className="text-center">Cant.</div>
                                                            <div className="flex-grow px-2 text-left">Descripción</div>
                                                            <div style={{ width: '110px' }} className="text-right">Precio Unit.</div>
                                                            <div style={{ width: '110px' }} className="text-right px-2">Importe</div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    }
                                    rows.push(
                                        <tr key={item.id} className="border-b border-gray-100">
                                            <td className="text-center py-2 text-xs text-gray-700">{item.quantity}</td>
                                            <td className="py-2 px-2">
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
                                            <td className="text-right py-2 text-xs text-gray-700">{formatCurrency(item.unitPrice)}</td>
                                            <td className="text-right py-2 px-2 text-xs font-bold text-gray-900">{formatCurrency(item.subtotal)}</td>
                                        </tr>
                                    );
                                });
                                return rows;
                            })()}

                            <tr className="border-t-2 border-gray-100">
                                <td colSpan={2}></td>
                                <td className="text-right py-2 text-xs text-gray-600 font-medium">Subtotal:</td>
                                <td className="text-right py-2 px-2 text-xs text-gray-900 font-bold border-b border-gray-100">
                                    {formatCurrency(quote.subtotal)}
                                </td>
                            </tr>
                            {quote.showIva && (
                                <tr>
                                    <td colSpan={2}></td>
                                    <td className="text-right py-1 text-xs text-gray-600 font-medium">IVA (16%):</td>
                                    <td className="text-right py-1 px-2 text-xs text-gray-900 font-bold border-b border-gray-100">
                                        {formatCurrency(quote.iva)}
                                    </td>
                                </tr>
                            )}
                            <tr>
                                <td colSpan={2}></td>
                                <td className="text-right py-4 text-lg font-bold text-blue-900 uppercase">Total:</td>
                                <td className="text-right py-4 px-2 text-lg font-bold text-blue-900">
                                    {formatCurrency(quote.total)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="flex-grow min-h-[1.5cm]" style={{ flexGrow: 1 }}></div>

                <div className="mt-auto avoid-break relative z-10 w-full mb-2">
                    {quote.notes && (
                        <div className="mb-4 px-12">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 text-center">Notas Adicionales</p>
                            <p className="whitespace-pre-wrap font-medium italic leading-relaxed text-[10px] text-gray-600 text-center">{quote.notes}</p>
                        </div>
                    )}
                    <PDFFooter quote={quote} showSignatures={true} />
                </div>
            </div>

            {quote.showAnnex && quote.annexItems && quote.annexItems.length > 0 && (
                <div className="annex-section-wrapper">
                    <div className="annex-section bg-white min-h-[15cm]">
                        <PDFHeader
                            company={company}
                            quote={quote}
                            pageInfo={{ current: totalPages, total: totalPages }}
                        />
                        <div className="px-1">
                            <h3 className="text-md font-bold text-blue-900 mb-4 uppercase tracking-wide">
                                {quote.annexTitle || 'Anexo Técnico'}
                            </h3>
                            <div
                                className="relative mx-auto bg-white"
                                style={{
                                    width: '740px',
                                    height: `${Math.max(...(quote.annexItems || []).map(i => i.y + i.height), 300)}px`
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
                    </div>
                </div>
            )}

            <style>{`
                .annex-section-wrapper {
                    position: relative;
                    background-color: white !important;
                    z-index: 100 !important;
                    page-break-before: always !important;
                }
                @media print {
                    .hidden { display: none !important; }
                }
            `}</style>
        </div>
    );
});
