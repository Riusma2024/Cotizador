import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Plus, Trash2, Printer, Check, Clock, Download } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { QuotePDF } from './pdf/QuotePDF';
import { AnnexEditor } from './AnnexEditor';
import type { Quote, QuoteItem, Product, Customer, Employee } from '../../types';
import { storage } from '../../storage';
import { calculateSubtotal, formatCurrency } from '../../utils/calculations';
import { generateId } from '../../utils/id';
import clsx from 'clsx';

export const QuoteForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const activeCompanyId = storage.getActiveCompanyId();

    const componentRef = useRef<HTMLDivElement>(null);
    const handleGeneratePDF = async (mode: 'download' | 'print') => {
        const company = storage.getCompanies().find(c => c.id === activeCompanyId);
        const format = company?.pdfFilenameFormat || '{folio}';

        const filename = format
            .replace('{folio}', formData.folio)
            .replace('{customer}', formData.customer.name)
            .replace('{phone}', formData.customer.phone || '')
            .replace('{date}', formData.date)
            .replace(/[<>:"/\\|?*]/g, '_') // Remove invalid filename chars
            .replace(/\s+/g, ' ') // Clean extra spaces
            .trim() + '.pdf';

        const element = componentRef.current;
        if (!element) return;

        const opt: any = {
            margin: [1, 1.5, 1, 1.5], // Exactly matching the CSS @page margin in cm
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                letterRendering: true,
                logging: false,
                windowWidth: 816
            },
            jsPDF: { unit: 'cm', format: 'letter', orientation: 'portrait' },
            pagebreak: {
                mode: 'css',
                before: '.html2pdf__page-break',
                avoid: ['tr', '.avoid-break']
            },
        };

        if (mode === 'download') {
            html2pdf().set(opt).from(element).save();
        } else {
            const pdf = html2pdf().set(opt).from(element);
            const blob = await pdf.output('blob');
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        }

        // Activate "Sent" status automatically
        if (formData.status === 'draft') {
            const updatedData = { ...formData, status: 'sent' as const };
            setFormData(updatedData);
            storage.saveQuote(updatedData);
        }
    };

    const handlePrint = () => handleGeneratePDF('print');
    const handleDownloadPDF = () => handleGeneratePDF('download');

    const [products, setProducts] = useState<Product[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);

    const [formData, setFormData] = useState<Quote>({
        id: generateId(),
        companyId: activeCompanyId || '',
        employeeId: '',
        folio: '',
        date: new Date().toISOString().split('T')[0],
        customer: {
            id: generateId(),
            companyId: activeCompanyId || '',
            name: '',
            address: '',
            phone: '',
            email: ''
        },
        items: [],
        subtotal: 0,
        discount: 0,
        iva: 0,
        total: 0,
        status: 'draft',
        employeeName: '',
        employeePosition: '',
        validityDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        showIva: false,
        notes: '',
        showSignature: false,
        showAnnex: true,
        annexTitle: 'Anexo Técnico',
        annexItems: []
    });

    const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [customLabelsEnabled, setCustomLabelsEnabled] = useState(false);

    useEffect(() => {
        if (!activeCompanyId) {
            navigate('/settings');
            return;
        }

        setProducts(storage.getProducts(activeCompanyId));
        setCustomers(storage.getCustomers());
        setEmployees(storage.getEmployees(activeCompanyId));

        if (id) {
            const quotes = storage.getQuotes(activeCompanyId);
            const quote = quotes.find(q => q.id === id);
            if (quote) {
                setFormData(quote);
            }
        } else {
            const company = storage.getCompanies().find(c => c.id === activeCompanyId);
            if (company) {
                const nextFolio = `${company.folioPrefix}-${company.currentFolio}`;
                setFormData(prev => ({
                    ...prev,
                    companyId: activeCompanyId,
                    folio: nextFolio,
                    customer: { ...prev.customer, companyId: activeCompanyId }
                }));
            }
        }
    }, [id, activeCompanyId, navigate]);

    useEffect(() => {
        const subtotal = formData.items.reduce((sum, item) => sum + item.subtotal, 0);
        const iva = formData.showIva ? subtotal * 0.16 : 0;
        const total = subtotal + iva;

        setFormData(prev => ({ ...prev, subtotal, iva, total }));
    }, [formData.items, formData.showIva]);

    const handleAddItem = () => {
        const newItem: QuoteItem = {
            id: generateId(),
            productId: '',
            description: '',
            quantity: 1,
            unitPrice: 0,
            subtotal: 0,
            dimensionUnit: 'm'
        };
        setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
    };

    const handleRemoveItem = (itemId: string) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter(item => item.id !== itemId)
        }));
    };

    const updateItem = (itemId: string, updates: Partial<QuoteItem>) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.map(item => {
                if (item.id !== itemId) return item;

                const updatedItem = { ...item, ...updates };

                if (updates.productId) {
                    const product = products.find(p => p.id === updates.productId);
                    if (product) {
                        updatedItem.description = product.description;
                        updatedItem.unitPrice = product.price;
                    }
                }

                if (updates.description) {
                    const product = products.find(p => p.description.toLowerCase() === updates.description?.toLowerCase());
                    if (product) {
                        updatedItem.productId = product.id;
                        updatedItem.unitPrice = product.price;
                    } else {
                        updatedItem.productId = '';
                    }
                }

                const product = products.find(p => p.id === updatedItem.productId);
                if (product) {
                    updatedItem.subtotal = calculateSubtotal(product.calculationType, {
                        price: updatedItem.unitPrice,
                        quantity: updatedItem.quantity,
                        width: updatedItem.width,
                        height: updatedItem.height,
                        dimensionUnit: updatedItem.dimensionUnit,
                        timeAmount: updatedItem.timeAmount,
                        timeUnit: updatedItem.timeUnit,
                        productUnit: product.unit
                    });
                } else {
                    updatedItem.subtotal = updatedItem.quantity * updatedItem.unitPrice;
                }

                return updatedItem;
            })
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('saving');

        // Asegurar que el cliente se guarde o actualice correctamente
        if (formData.customer.name && activeCompanyId) {
            const existingCustomer = customers.find(c => c.name.toLowerCase() === formData.customer.name.toLowerCase());

            // Forzar el companyId actual antes de guardar
            const customerToSave = {
                ...formData.customer,
                companyId: activeCompanyId,
                id: existingCustomer ? existingCustomer.id : formData.customer.id
            };

            storage.saveCustomer(customerToSave);
        }

        if (!id) {
            const company = storage.getCompanies().find(c => c.id === activeCompanyId);
            if (company) {
                company.currentFolio += 1;
                storage.saveCompany(company);
            }
        }

        // Guardar empleado si es nuevo
        if (formData.employeeName && activeCompanyId) {
            const existingEmployee = employees.find(e => e.name.toLowerCase() === formData.employeeName.toLowerCase());
            if (!existingEmployee) {
                const newEmployee: Employee = {
                    id: generateId(),
                    companyId: activeCompanyId,
                    name: formData.employeeName,
                    position: formData.employeePosition
                };
                storage.saveEmployee(newEmployee);
            } else if (formData.employeeId !== existingEmployee.id) {
                // Si el nombre coincide pero el ID no es el mismo, actualizamos el ID en el form
                formData.employeeId = existingEmployee.id;
            }
        }

        storage.saveQuote(formData);

        setTimeout(() => {
            setStatus('saved');
            // Quitamos el navigate automático para que el usuario pueda seguir editando
            setTimeout(() => setStatus('idle'), 2000);
        }, 500);
    };

    const handleSaveAndClose = () => {
        handleSubmit({ preventDefault: () => { } } as React.FormEvent);
        setTimeout(() => navigate('/quotes'), 600);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Evitar que Enter envíe el formulario accidentalmente (excepto en textareas)
        if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
            e.preventDefault();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/quotes')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                    >
                        <ArrowLeft size={20} className="text-gray-600" />
                    </button>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 overflow-hidden">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                            {id ? `Editar Cotización ${formData.folio}` : 'Nueva Cotización'}
                        </h2>
                        {id && (
                            <div className="flex">
                                <span className={clsx(
                                    'px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-sm border whitespace-nowrap',
                                    formData.status === 'draft' ? 'bg-gray-100 text-gray-700 border-gray-200' :
                                        formData.status === 'sent' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                            formData.status === 'accepted' ? 'bg-green-100 text-green-700 border-green-200' :
                                                'bg-red-100 text-red-700 border-red-200'
                                )}>
                                    {formData.status === 'draft' ? 'Borrador' :
                                        formData.status === 'sent' ? 'Enviada' :
                                            formData.status === 'accepted' ? 'Aceptada' : 'Rechazada'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {id && (
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={() => handleDownloadPDF()}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-sm sm:text-base font-medium"
                        >
                            <Download size={18} />
                            <span className="hidden xs:inline">Descargar PDF</span>
                            <span className="xs:hidden">Descargar</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handlePrint()}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm sm:text-base font-medium"
                        >
                            <Printer size={18} />
                            <span>Imprimir</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Hidden QuotePDF for printing/downloading - Use absolute positioning off-screen instead of display:none for better html2pdf rendering */}
            <div className="auto-pdf-capture" style={{ position: 'absolute', left: '-9999px', top: '0', width: '816px', height: 'auto', overflow: 'visible', backgroundColor: 'white', transform: 'translate(0,0)' }}>
                {activeCompanyId && (
                    <QuotePDF
                        ref={componentRef}
                        quote={formData}
                        company={storage.getCompanies().find(c => c.id === activeCompanyId)!}
                        hideWatermark={false}
                    />
                )}
            </div>

            <form
                onSubmit={handleSubmit}
                onKeyDown={handleKeyDown}
                className="space-y-4"
            >
                {/* Header Info */}
                <div className="bg-white shadow-sm rounded-xl border border-gray-300 p-5 mb-6 transition-all hover:shadow-md">
                    <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                        <Clock size={18} className="text-blue-500" />
                        Información General
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                            <input
                                type="date"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vigencia (Fecha Límite)</label>
                            <input
                                type="date"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={formData.validityDate}
                                onChange={e => setFormData({ ...formData, validityDate: e.target.value })}
                            />
                        </div>
                        <div className="sm:col-span-2 md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Elaboró (Empleado)</label>
                            <input
                                type="text"
                                list="employees-list"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={formData.employeeName}
                                onChange={e => {
                                    const name = e.target.value;
                                    const emp = employees.find(emp => emp.name === name);
                                    setFormData({
                                        ...formData,
                                        employeeName: name,
                                        employeeId: emp?.id || '',
                                        employeePosition: emp?.position || formData.employeePosition
                                    });
                                }}
                                placeholder="Nombre completo"
                            />
                            <datalist id="employees-list">
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.name} />
                                ))}
                            </datalist>
                        </div>
                        <div className="sm:col-span-2 md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Puesto</label>
                            <input
                                type="text"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={formData.employeePosition}
                                onChange={e => setFormData({ ...formData, employeePosition: e.target.value })}
                                placeholder="Ej. Ventas"
                            />
                        </div>
                        <div className="sm:col-span-2 md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1 font-bold">Estado</label>
                            <select
                                className={clsx(
                                    "w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold",
                                    formData.status === 'draft' ? 'bg-gray-50 border-gray-300 text-gray-700' :
                                        formData.status === 'sent' ? 'bg-blue-50 border-blue-300 text-blue-700' :
                                            formData.status === 'accepted' ? 'bg-green-50 border-green-300 text-green-700' :
                                                'bg-red-50 border-red-300 text-red-700'
                                )}
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                            >
                                <option value="draft">Borrador</option>
                                <option value="sent">Enviada</option>
                                <option value="accepted">Aceptada</option>
                                <option value="rejected">Rechazada</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="bg-white shadow-sm rounded-xl border border-gray-300 p-5 mb-6 transition-all hover:shadow-md">
                    <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                        <Check size={18} className="text-blue-500" />
                        Datos del Cliente
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre / Razón Social</label>
                            <input
                                type="text"
                                list="customers"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={formData.customer.name}
                                onChange={e => {
                                    const name = e.target.value;
                                    const existingCustomer = customers.find(c => c.name.toLowerCase() === name.toLowerCase());

                                    if (existingCustomer) {
                                        setFormData({ ...formData, customer: { ...existingCustomer } });
                                    } else {
                                        const idIsKnown = customers.some(c => c.id === formData.customer.id);
                                        const newId = idIsKnown ? crypto.randomUUID() : formData.customer.id;

                                        setFormData({
                                            ...formData,
                                            customer: { ...formData.customer, id: newId, name }
                                        });
                                    }
                                }}
                            />
                            <datalist id="customers">
                                {customers.map(c => (
                                    <option key={c.id} value={c.name} />
                                ))}
                            </datalist>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={formData.customer.email}
                                onChange={e => setFormData({
                                    ...formData,
                                    customer: { ...formData.customer, email: e.target.value }
                                })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                            <input
                                type="tel"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={formData.customer.phone}
                                onChange={e => setFormData({
                                    ...formData,
                                    customer: { ...formData.customer, phone: e.target.value }
                                })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={formData.customer.address}
                                onChange={e => setFormData({
                                    ...formData,
                                    customer: { ...formData.customer, address: e.target.value }
                                })}
                            />
                        </div>
                    </div>
                </div>

                {/* Items */}
                <div className="bg-white shadow-sm rounded-xl border border-gray-300 p-5 mb-6">
                    <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                        <Plus size={18} className="text-blue-500" />
                        Partidas
                    </h3>
                    <div className="space-y-3">
                        {formData.items.map((item) => {
                            const product = products.find(p => p.id === item.productId);
                            const isML = product?.calculationType === 'ml';
                            const isM2 = product?.calculationType === 'm2';

                            return (
                                <div key={item.id} className="relative p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-200 group transition-all hover:shadow-md hover:border-blue-200">
                                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Cant.</label>
                                            <input
                                                type="number"
                                                min="1"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                value={item.quantity}
                                                onChange={e => updateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                                            />
                                        </div>

                                        <div className="sm:col-span-4">
                                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Producto / Descripción</label>
                                            <input
                                                type="text"
                                                list={`products-${item.id}`}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                value={item.description}
                                                onChange={e => updateItem(item.id, { description: e.target.value })}
                                                placeholder="Buscar o escribir descripción..."
                                            />
                                            <datalist id={`products-${item.id}`}>
                                                {products.map(p => (
                                                    <option key={p.id} value={p.description} />
                                                ))}
                                            </datalist>
                                        </div>

                                        {(isML || isM2) && (
                                            <div className="sm:col-span-4 flex gap-2">
                                                <div className="flex-1">
                                                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                                                        {isML ? 'Largo' : 'Ancho'}
                                                    </label>
                                                    <input
                                                        type="number"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                        value={item.width || ''}
                                                        onChange={e => updateItem(item.id, { width: parseFloat(e.target.value) || 0 })}
                                                    />
                                                </div>
                                                {isM2 && (
                                                    <div className="flex-1">
                                                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Alto</label>
                                                        <input
                                                            type="number"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                            value={item.height || ''}
                                                            onChange={e => updateItem(item.id, { height: parseFloat(e.target.value) || 0 })}
                                                        />
                                                    </div>
                                                )}
                                                <div className="w-20">
                                                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Unid.</label>
                                                    <select
                                                        className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
                                                        value={item.dimensionUnit || 'm'}
                                                        onChange={e => updateItem(item.id, { dimensionUnit: e.target.value as any })}
                                                    >
                                                        <option value="m">m</option>
                                                        <option value="cm">cm</option>
                                                        <option value="mm">mm</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )}

                                        {product?.calculationType === 'time' && (
                                            <div className="sm:col-span-4 flex gap-2">
                                                <div className="flex-1">
                                                    <label className="flex items-center gap-1 text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                                                        <Clock size={12} />
                                                        Tiempo
                                                    </label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="number"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                            value={item.timeAmount || ''}
                                                            onChange={e => updateItem(item.id, { timeAmount: parseFloat(e.target.value) || 0 })}
                                                            placeholder="Cant."
                                                        />
                                                        <select
                                                            className="w-28 px-2 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
                                                            value={item.timeUnit || 'hours'}
                                                            onChange={e => updateItem(item.id, { timeUnit: e.target.value as any })}
                                                        >
                                                            <option value="minutes">Minutos</option>
                                                            <option value="hours">Horas</option>
                                                            <option value="days">Días</option>
                                                            <option value="months">Meses</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="sm:col-span-3 lg:col-span-2">
                                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider sm:text-right">Precio Unit.</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                                                <input
                                                    type="number"
                                                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md text-sm text-right focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                                                    value={item.unitPrice}
                                                    onChange={e => updateItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                                                />
                                            </div>
                                        </div>

                                        <div className="sm:col-span-3 lg:col-span-2">
                                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider text-right">Importe</label>
                                            <div className="py-2 text-base font-bold text-gray-900 text-right">
                                                {formatCurrency(item.subtotal)}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleRemoveItem(item.id)}
                                        className="absolute -top-2 -right-2 md:opacity-0 group-hover:opacity-100 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all z-10"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            );
                        })}

                        <button
                            type="button"
                            onClick={handleAddItem}
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                        >
                            <Plus size={20} />
                            Agregar Partida
                        </button>
                    </div>
                </div>

                {/* Notes */}
                <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Notas Adicionales</h3>
                    <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows={3}
                        value={formData.notes || ''}
                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Condiciones de pago, tiempo de entrega, etc."
                    />
                </div>

                {/* Custom Header Labels */}
                <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">Etiquetas Personalizadas del Encabezado</h3>
                            <p className="text-sm text-gray-500 mt-1">Personaliza las etiquetas para esta cotización</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={customLabelsEnabled}
                                onChange={e => {
                                    setCustomLabelsEnabled(e.target.checked);
                                    if (!e.target.checked) {
                                        setFormData({
                                            ...formData,
                                            customHeaderLabel1: undefined,
                                            customHeaderLabel2: undefined,
                                            customHeaderLabel3: undefined
                                        });
                                    }
                                }}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    {customLabelsEnabled && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-gray-100">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Etiqueta Columna 1 (bajo logo)</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    value={formData.customHeaderLabel1 || ''}
                                    onChange={e => setFormData({ ...formData, customHeaderLabel1: e.target.value })}
                                    placeholder="Ej: Certificación ISO"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Etiqueta Columna 2 (bajo contacto)</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    value={formData.customHeaderLabel2 || ''}
                                    onChange={e => setFormData({ ...formData, customHeaderLabel2: e.target.value })}
                                    placeholder="Ej: Distribuidor Autorizado"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Etiqueta Columna 3 (bajo folio)</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    value={formData.customHeaderLabel3 || ''}
                                    onChange={e => setFormData({ ...formData, customHeaderLabel3: e.target.value })}
                                    placeholder="Ej: Soporte 24/7"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Signature Settings */}
                <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">Espacio para Firmas</h3>
                            <p className="text-sm text-gray-500 mt-1">Incluir espacio para firmas de aceptación en el PDF</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={formData.showSignature || false}
                                onChange={e => setFormData({ ...formData, showSignature: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>

                {/* Technical Annex */}
                <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">Anexo Técnico</h3>
                            <p className="text-sm text-gray-500 mt-1">Agrega imágenes o texto adicional que se mostrará en una página separada al final.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={formData.showAnnex ?? true}
                                onChange={e => setFormData({ ...formData, showAnnex: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    {formData.showAnnex && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Título del Anexo</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    value={formData.annexTitle || ''}
                                    onChange={e => setFormData({ ...formData, annexTitle: e.target.value })}
                                    placeholder="Ej: Anexo Técnico, Especificaciones, etc."
                                />
                            </div>
                            <AnnexEditor
                                items={formData.annexItems || []}
                                onChange={annexItems => setFormData({ ...formData, annexItems })}
                            />
                        </div>
                    )}
                </div>

                {/* Totals */}
                <div className="flex justify-end">
                    <div className="w-64 space-y-2 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-sm text-gray-700">Incluir IVA</label>
                            <input
                                type="checkbox"
                                checked={formData.showIva}
                                onChange={e => setFormData({ ...formData, showIva: e.target.checked })}
                                className="h-4 w-4 text-blue-600 rounded border-gray-300"
                            />
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(formData.subtotal)}</span>
                        </div>
                        {formData.showIva && (
                            <div className="flex justify-between text-gray-600">
                                <span>IVA (16%):</span>
                                <span>{formatCurrency(formData.iva)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                            <span>Total:</span>
                            <span>{formatCurrency(formData.total)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/quotes')}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={status === 'saving'}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-all"
                    >
                        {status === 'saved' ? (
                            <>
                                <Check size={20} />
                                ¡Guardado!
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                {status === 'saving' ? 'Guardando...' : 'Guardar y Seguir'}
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={handleSaveAndClose}
                        disabled={status === 'saving'}
                        className="flex items-center gap-2 px-6 py-2 bg-gray-800 text-white rounded-md hover:bg-black disabled:opacity-50 transition-all font-bold"
                    >
                        <Save size={20} />
                        Guardar y Salir
                    </button>
                </div>
            </form >
        </div >
    );
};
