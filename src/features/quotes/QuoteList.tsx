import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FileText, Calendar, User } from 'lucide-react';
import type { Quote } from '../../types';
import { storage } from '../../storage';
import clsx from 'clsx';

export const QuoteList = () => {
    const navigate = useNavigate();
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const activeCompanyId = storage.getActiveCompanyId();

    useEffect(() => {
        if (activeCompanyId) {
            setQuotes(storage.getQuotes(activeCompanyId));
        }
    }, [activeCompanyId]);

    const filteredQuotes = quotes.filter(q =>
        q.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status: Quote['status']) => {
        switch (status) {
            case 'draft': return 'bg-gray-100 text-gray-800';
            case 'sent': return 'bg-blue-100 text-blue-800';
            case 'accepted': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: Quote['status']) => {
        switch (status) {
            case 'draft': return 'Borrador';
            case 'sent': return 'Enviada';
            case 'accepted': return 'Aceptada';
            case 'rejected': return 'Rechazada';
            default: return status;
        }
    };

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
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Cotizaciones</h2>
                <button
                    onClick={() => navigate('/quotes/new')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    Nueva Cotización
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Buscar por Folio o Cliente..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Folio</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredQuotes.map((quote) => (
                            <tr key={quote.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center gap-2">
                                    <FileText size={16} className="text-gray-400" />
                                    {quote.folio}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <User size={16} className="text-gray-400" />
                                        {quote.customer.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className="text-gray-400" />
                                        {new Date(quote.date).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={clsx(
                                        'px-2 py-1 rounded-full text-xs font-medium',
                                        getStatusColor(quote.status)
                                    )}>
                                        {getStatusLabel(quote.status)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-medium">
                                    ${quote.total.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => navigate(`/quotes/${quote.id}`)}
                                        className="text-blue-600 hover:text-blue-900"
                                    >
                                        Ver / Editar
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredQuotes.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    No se encontraron cotizaciones.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
