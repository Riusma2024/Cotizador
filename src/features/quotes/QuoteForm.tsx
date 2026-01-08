import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Plus, Trash2, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { QuotePDF } from './pdf/QuotePDF';
import type { Quote, QuoteItem, Product, Customer } from '../../types';
import { storage } from '../../storage';
import { calculateSubtotal, formatCurrency } from '../../utils/calculations';

export const QuoteForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const activeCompanyId = storage.getActiveCompanyId();

    const componentRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Cotizacion`,
    });

    const [products, setProducts] = useState<Product[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);

    const [formData, setFormData] = useState<Quote>({
        id: crypto.randomUUID(),
        companyId: activeCompanyId || '',
        folio: '',
        date: new Date().toISOString().split('T')[0],
        customer: {
            id: crypto.randomUUID(),
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
        notes: ''
    });

    const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    useEffect(() => {
        if (!activeCompanyId) {
            navigate('/settings');
            return;
        }

        setProducts(storage.getProducts(activeCompanyId));
        setCustomers(storage.getCustomers());

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
                setFormData(prev => ({ ...prev, companyId: activeCompanyId, folio: nextFolio }));
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
            id: crypto.randomUUID(),
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
                    const widthInMeters = updatedItem.dimensionUnit === 'cm' ? (updatedItem.width || 0) / 100 : (updatedItem.width || 0);
                    const heightInMeters = updatedItem.dimensionUnit === 'cm' ? (updatedItem.height || 0) / 100 : (updatedItem.height || 0);

                    updatedItem.subtotal = calculateSubtotal(product.calculationType, {
                        price: updatedItem.unitPrice,
                        quantity: updatedItem.quantity,
                        width: widthInMeters,
                        height: heightInMeters
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

        storage.saveCustomer(formData.customer);

        if (!id) {
            const company = storage.getCompanies().find(c => c.id === activeCompanyId);
            if (company) {
                company.currentFolio += 1;
                storage.saveCompany(company);
            }
        }

        storage.saveQuote(formData);

        setTimeout(() => {
            setStatus('saved');
            navigate('/quotes');
        }, 500);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/quotes')}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <h2 className="text-2xl font-bold text-gray-900">
                    {id ? `Editar Cotización ${formData.folio}` : 'Nueva Cotización'}
                </h2>
                <div className="flex-1" />
                {id && (
                    <button
                        type="button"
                        onClick={() => handlePrint()}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                        <Printer size={20} />
                        Imprimir / PDF
                    </button>
                )}
            </div>

            <div style={{ display: 'none' }}>
                {activeCompanyId && (
                    <QuotePDF
                        ref={componentRef}
                        quote={formData}
                        company={storage.getCompanies().find(c => c.id === activeCompanyId)!}
                    />
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Header Info */}
                <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Información General</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Fecha</label>
                            <input
                                type="date"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Vigencia (Fecha Límite)</label>
                            <input
                                type="date"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={formData.validityDate}
                                onChange={e => setFormData({ ...formData, validityDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Elaboró (Empleado)</label>
                            <input
                                type="text"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={formData.employeeName}
                                onChange={e => setFormData({ ...formData, employeeName: e.target.value })}
                                placeholder="Nombre del empleado"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Puesto</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={formData.employeePosition}
                                onChange={e => setFormData({ ...formData, employeePosition: e.target.value })}
                                placeholder="Ej. Ventas"
                            />
                        </div>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Datos del Cliente</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre / Razón Social</label>
                            <input
                                type="text"
                                list="customers"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={formData.customer.name}
                                onChange={e => {
                                    const name = e.target.value;
                                    const existingCustomer = customers.find(c => c.name === name);
                                    setFormData({
                                        ...formData,
                                        customer: existingCustomer ? { ...existingCustomer } : { ...formData.customer, name }
                                    });
                                }}
                            />
                            <datalist id="customers">
                                {customers.map(c => (
                                    <option key={c.id} value={c.name} />
                                ))}
                            </datalist>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={formData.customer.email}
                                onChange={e => setFormData({
                                    ...formData,
                                    customer: { ...formData.customer, email: e.target.value }
                                })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                            <input
                                type="tel"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={formData.customer.phone}
                                onChange={e => setFormData({
                                    ...formData,
                                    customer: { ...formData.customer, phone: e.target.value }
                                })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Dirección</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Partidas</h3>
                    <div className="space-y-4">
                        {formData.items.map((item) => {
                            const product = products.find(p => p.id === item.productId);
                            const isML = product?.calculationType === 'ml';
                            const isM2 = product?.calculationType === 'm2';

                            return (
                                <div key={item.id} className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="flex-1 grid grid-cols-12 gap-4">
                                        <div className="col-span-2">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Cantidad</label>
                                            <input
                                                type="number"
                                                min="1"
                                                className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                                                value={item.quantity}
                                                onChange={e => updateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                                            />
                                        </div>

                                        <div className="col-span-3">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Producto</label>
                                            <input
                                                type="text"
                                                list={`products-${item.id}`}
                                                className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                                                value={item.description}
                                                onChange={e => updateItem(item.id, { description: e.target.value })}
                                                placeholder="Buscar o escribir..."
                                            />
                                            <datalist id={`products-${item.id}`}>
                                                {products.map(p => (
                                                    <option key={p.id} value={p.description} />
                                                ))}
                                            </datalist>
                                        </div>

                                        {(isML || isM2) && (
                                            <div className="col-span-3 flex gap-2">
                                                <div className="flex-1">
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                                        {isML ? 'Largo' : 'Ancho'}
                                                    </label>
                                                    <input
                                                        type="number"
                                                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                                                        value={item.width || ''}
                                                        onChange={e => updateItem(item.id, { width: parseFloat(e.target.value) || 0 })}
                                                    />
                                                </div>
                                                {isM2 && (
                                                    <div className="flex-1">
                                                        <label className="block text-xs font-medium text-gray-500 mb-1">Alto</label>
                                                        <input
                                                            type="number"
                                                            className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                                                            value={item.height || ''}
                                                            onChange={e => updateItem(item.id, { height: parseFloat(e.target.value) || 0 })}
                                                        />
                                                    </div>
                                                )}
                                                <div className="w-16">
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Unidad</label>
                                                    <select
                                                        className="w-full px-1 py-1 border border-gray-300 rounded-md text-sm"
                                                        value={item.dimensionUnit || 'm'}
                                                        onChange={e => updateItem(item.id, { dimensionUnit: e.target.value as 'm' | 'cm' })}
                                                    >
                                                        <option value="m">m</option>
                                                        <option value="cm">cm</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )}

                                        <div className="col-span-2 text-right">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Precio Unit.</label>
                                            <input
                                                type="number"
                                                className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm text-right"
                                                value={item.unitPrice}
                                                onChange={e => updateItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                                            />
                                        </div>

                                        <div className="col-span-2 text-right">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Importe</label>
                                            <div className="py-1 text-sm font-medium text-gray-900">
                                                {formatCurrency(item.subtotal)}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleRemoveItem(item.id)}
                                        className="mt-6 text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 size={18} />
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
                <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Notas Adicionales</h3>
                    <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows={3}
                        value={formData.notes || ''}
                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Condiciones de pago, tiempo de entrega, etc."
                    />
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
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                        <Save size={20} />
                        {status === 'saving' ? 'Guardando...' : 'Guardar Cotización'}
                    </button>
                </div>
            </form>
        </div>
    );
};
