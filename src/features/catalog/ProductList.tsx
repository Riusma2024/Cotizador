import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Package, Ruler, Box, Trash2, Settings, Clock } from 'lucide-react';
import type { Product } from '../../types';
import { storage } from '../../storage';
import { CategoryManager } from './CategoryManager';
import { formatCurrency } from '../../utils/calculations';

const CalculationIcon = ({ type }: { type: Product['calculationType'] }) => {
    switch (type) {
        case 'ml': return <Ruler size={16} className="text-blue-500" />;
        case 'm2': return <Box size={16} className="text-purple-500" />;
        case 'time': return <Clock size={16} className="text-orange-500" />;
        default: return <Package size={16} className="text-gray-500" />;
    }
};

const CalculationLabel = ({ type }: { type: Product['calculationType'] }) => {
    switch (type) {
        case 'ml': return 'Metro Lineal';
        case 'm2': return 'Metro Cuadrado';
        case 'time': return 'Tiempo';
        default: return 'Fijo / Unidad';
    }
};

export const ProductList = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
    const activeCompanyId = storage.getActiveCompanyId();

    const loadProducts = () => {
        if (activeCompanyId) {
            setProducts(storage.getProducts(activeCompanyId));
        }
    };

    useEffect(() => {
        loadProducts();
    }, [activeCompanyId]);

    const handleDelete = (id: string) => {
        if (confirm('¿Estás seguro de eliminar este producto?')) {
            storage.deleteProduct(id);
            loadProducts();
        }
    };

    const filteredProducts = products.filter(p =>
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!activeCompanyId) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Por favor selecciona una empresa primero.</p>
                <button
                    onClick={() => navigate('/settings')}
                    className="mt-4 text-blue-600 hover:underline"
                >
                    Ir a Configuración
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-900">Catálogo de Productos</h2>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setIsCategoryManagerOpen(true)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                        <Settings size={20} />
                        Categorías
                    </button>
                    <button
                        onClick={() => navigate('/catalog/new')}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={20} />
                        Nuevo Producto
                    </button>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Buscar por SKU, descripción o categoría..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-gray-200">
                    {filteredProducts.map((product) => (
                        <div key={product.id} className="p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{product.sku}</span>
                                    <h3 className="font-bold text-gray-900">{product.description}</h3>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate(`/catalog/${product.id}`)}
                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                    >
                                        <Settings size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mb-3">
                                <span className="px-2 py-0.5 bg-gray-100 rounded-full text-[10px] font-medium text-gray-600">
                                    {product.category || 'Sin Categoría'}
                                </span>
                            </div>

                            <div className="flex justify-between items-center bg-gray-50 -mx-4 -mb-4 px-4 py-3 mt-4 border-t border-gray-100">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <CalculationIcon type={product.calculationType} />
                                    <span className="text-xs"><CalculationLabel type={product.calculationType} /></span>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-tighter">Precio Unitario</p>
                                    <p className="text-lg font-bold text-gray-900 leading-none">
                                        {formatCurrency(product.price)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo Cálculo</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.sku}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{product.description}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                                            {product.category || 'Sin Categoría'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <CalculationIcon type={product.calculationType} />
                                            <span className="text-sm"><CalculationLabel type={product.calculationType} /></span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-bold">
                                        {formatCurrency(product.price)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => navigate(`/catalog/${product.id}`)}
                                                className="text-blue-600 hover:text-blue-900 p-1"
                                                title="Editar"
                                            >
                                                <Settings size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="text-red-600 hover:text-red-900 p-1"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredProducts.length === 0 && (
                    <div className="px-6 py-12 text-center text-gray-500">
                        No se encontraron productos.
                    </div>
                )}
            </div>

            <CategoryManager
                isOpen={isCategoryManagerOpen}
                onClose={() => setIsCategoryManagerOpen(false)}
                onUpdate={() => {
                    // Optional: Refresh products if categories affect them directly
                    loadProducts();
                }}
            />
        </div>
    );
};
