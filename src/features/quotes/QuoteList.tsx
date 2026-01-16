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
                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-gray-200">
                    {filteredQuotes.map((quote) => (
                        <div key={quote.id} className="p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors" onClick={() => navigate(`/quotes/${quote.id}`)}>
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <FileText size={16} className="text-gray-400" />
                                    <span className="font-bold text-gray-900">{quote.folio}</span>
                                </div>
                                <span className={clsx(
                                    'px-2 py-0.5 rounded-full text-[10px] font-medium',
                                    getStatusColor(quote.status)
                                )}>
                                    {getStatusLabel(quote.status)}
                                </span>
                            </div>
                            <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <User size={14} className="text-gray-400" />
                                        <span className="truncate max-w-[150px]">{quote.customer.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <Calendar size={14} />
                                        {new Date(quote.date).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-400 mb-0.5">Total</p>
                                    <p className="text-base font-bold text-gray-900">
                                        ${quote.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                                <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center gap-2">
                                        <FileText size={16} className="text-gray-400 shrink-0" />
                                        {quote.folio}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <User size={16} className="text-gray-400 shrink-0" />
                                            <span>{quote.customer.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} className="text-gray-400 shrink-0" />
                                            {new Date(quote.date).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={clsx(
                                            'px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap',
                                            getStatusColor(quote.status)
                                        )}>
                                            {getStatusLabel(quote.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-bold">
                                        ${quote.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => navigate(`/quotes/${quote.id}`)}
                                            className="inline-flex items-center justify-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                                        >
                                            Editar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredQuotes.length === 0 && (
                    <div className="px-6 py-12 text-center text-gray-500">
                        No se encontraron cotizaciones.
                    </div>
                )}
            </div>
        </div>
    );
};
