import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Ruler, Box, Package, Clock } from 'lucide-react';
import type { Product, CalculationType, Category } from '../../types';
import { storage } from '../../storage';
import clsx from 'clsx';

export const ProductForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const activeCompanyId = storage.getActiveCompanyId();

    const [formData, setFormData] = useState<Product>({
        id: crypto.randomUUID(),
        companyId: activeCompanyId || '',
        sku: '',
        description: '',
        category: '',
        calculationType: 'fixed',
        unit: 'PZ',
        price: 0,
        hasIva: false,
        ivaRate: 0.16,
    });
    const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [categories, setCategories] = useState<Category[]>([]);

    // Load existing product or set active company
    useEffect(() => {
        if (!activeCompanyId) {
            navigate('/settings');
            return;
        }

        setCategories(storage.getCategories(activeCompanyId));

        if (id) {
            const products = storage.getProducts(activeCompanyId);
            const product = products.find(p => p.id === id);
            if (product) {
                setFormData(product);
            }
        } else {
            setFormData(prev => ({ ...prev, companyId: activeCompanyId }));
        }
    }, [id, activeCompanyId, navigate]);

    // Auto-generate SKU when Name or Category changes, but only for new products
    useEffect(() => {
        if (!id && formData.description && formData.category && activeCompanyId) {
            const namePrefix = formData.description.substring(0, 3).toUpperCase();
            const catPrefix = formData.category.substring(0, 3).toUpperCase();

            // Simple consecutive generation based on total products count + 1
            const products = storage.getProducts(activeCompanyId);
            const consecutive = (products.length + 1).toString().padStart(3, '0');

            const newSku = `${namePrefix}${catPrefix}-${consecutive}`;
            setFormData(prev => ({ ...prev, sku: newSku }));
        }
    }, [formData.description, formData.category, id, activeCompanyId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('saving');

        // Auto-save category if it doesn't exist
        if (activeCompanyId && formData.category) {
            const existingCategory = categories.find(c => c.name.toLowerCase() === formData.category.toLowerCase());
            if (!existingCategory) {
                storage.saveCategory({
                    id: crypto.randomUUID(),
                    companyId: activeCompanyId,
                    name: formData.category.trim()
                });
            }
        }

        storage.saveProduct(formData);
        setTimeout(() => {
            setStatus('saved');
            navigate('/catalog');
        }, 500);
    };

    const CalculationOption = ({ type, icon: Icon, label }: { type: CalculationType; icon: any; label: string }) => (
        <button
            type="button"
            onClick={() => {
                let unit = 'PZ';
                if (type === 'ml' || type === 'm2') unit = 'm';
                if (type === 'time') unit = 'hours';
                setFormData({ ...formData, calculationType: type, unit });
            }}
            className={clsx(
                'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                formData.calculationType === type
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-blue-200 text-gray-600'
            )}
        >
            <Icon size={24} />
            <span className="text-sm font-medium">{label}</span>
        </button>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/catalog')}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <h2 className="text-2xl font-bold text-gray-900">
                    {id ? 'Editar Producto' : 'Nuevo Producto'}
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Nombre del Producto</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Ej: Tubo PVC Hidráulico"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Categoría</label>
                        <input
                            type="text"
                            list="categories"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                            placeholder="Ej: Plomería"
                        />
                        <datalist id="categories">
                            {categories.map(c => (
                                <option key={c.id} value={c.name} />
                            ))}
                        </datalist>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">SKU / Clave (Automático)</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.sku}
                            onChange={e => setFormData({ ...formData, sku: e.target.value })}
                        />
                    </div>
                </div>

                {/* Calculation Type */}
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Tipo de Cálculo</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <CalculationOption type="fixed" icon={Package} label="Fijo / Unidad" />
                        <CalculationOption type="ml" icon={Ruler} label="Metro Lineal" />
                        <CalculationOption type="m2" icon={Box} label="Metro Cuadrado" />
                        <CalculationOption type="time" icon={Clock} label="Tiempo" />
                    </div>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Unidad de Medida (Base para el precio)</label>
                        {formData.calculationType === 'fixed' ? (
                            <input
                                type="text"
                                required
                                placeholder="Ej: PZ, Kit, Servicio"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.unit}
                                onChange={e => setFormData({ ...formData, unit: e.target.value })}
                            />
                        ) : (
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.unit}
                                onChange={e => setFormData({ ...formData, unit: e.target.value })}
                            >
                                {(formData.calculationType === 'ml' || formData.calculationType === 'm2') && (
                                    <>
                                        <option value="m">Metros (m)</option>
                                        <option value="cm">Centímetros (cm)</option>
                                        <option value="mm">Milímetros (mm)</option>
                                    </>
                                )}
                                {formData.calculationType === 'time' && (
                                    <>
                                        <option value="minutes">Minutos</option>
                                        <option value="hours">Horas</option>
                                        <option value="days">Días</option>
                                        <option value="months">Meses</option>
                                    </>
                                )}
                            </select>
                        )}
                        <p className="text-[10px] text-gray-500 italic">
                            * El precio ingresado corresponde a 1 unidad de esta medida.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Precio Unitario</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Impuestos</label>
                        <div className="flex items-center gap-4 h-[42px]">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    checked={formData.hasIva}
                                    onChange={e => setFormData({ ...formData, hasIva: e.target.checked })}
                                />
                                <span className="text-sm text-gray-700">Incluye IVA</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={status === 'saving'}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        <Save size={20} />
                        {status === 'saving' ? 'Guardando...' : 'Guardar Producto'}
                    </button>
                </div>
            </form>
        </div>
    );
};
