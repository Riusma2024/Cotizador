
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Building2, Edit, Check } from 'lucide-react';
import type { CompanyConfig } from '../../types';
import { storage } from '../../storage';
import { DataManagement } from './DataManagement';
import clsx from 'clsx';

export const CompanyList = () => {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState<CompanyConfig[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);

    useEffect(() => {
        setCompanies(storage.getCompanies());
        setActiveId(storage.getActiveCompanyId());
    }, []);

    const handleSetActive = (id: string) => {
        storage.setActiveCompanyId(id);
        setActiveId(id);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Mis Empresas / Giros</h2>
                <button
                    onClick={() => navigate('/settings/new')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    Nueva Empresa
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companies.map((company) => {
                    const isActive = company.id === activeId;
                    return (
                        <div
                            key={company.id}
                            className={clsx(
                                'bg-white rounded-lg border p-6 transition-all',
                                isActive ? 'border-blue-500 ring-2 ring-blue-100 shadow-md' : 'border-gray-200 hover:border-blue-300'
                            )}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-0.5 bg-blue-50 rounded-lg text-blue-600 w-12 h-12 flex items-center justify-center overflow-hidden border border-blue-100">
                                    {company.logoUrl ? (
                                        <img
                                            src={company.logoUrl}
                                            alt={company.name}
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <Building2 size={24} />
                                    )}
                                </div>
                                {isActive && (
                                    <span className="flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
                                        <Check size={12} />
                                        Activa
                                    </span>
                                )}
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{company.name}</h3>
                            <p className="text-sm text-gray-500 mb-4">{company.address || 'Sin dirección'}</p>

                            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => handleSetActive(company.id)}
                                    disabled={isActive}
                                    className={clsx(
                                        'flex-1 text-sm font-medium py-2 rounded-md transition-colors',
                                        isActive
                                            ? 'bg-gray-100 text-gray-400 cursor-default'
                                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                    )}
                                >
                                    {isActive ? 'Seleccionada' : 'Seleccionar'}
                                </button>
                                <button
                                    onClick={() => navigate(`/settings/${company.id}`)}
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                                    title="Editar"
                                >
                                    <Edit size={18} />
                                </button>
                            </div>
                        </div>
                    );
                })}

                {companies.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No hay empresas registradas</h3>
                        <p className="text-gray-500 mb-6">Comienza registrando tu primera empresa o giro de negocio.</p>
                        <button
                            onClick={() => navigate('/settings/new')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Registrar Empresa
                        </button>
                    </div>
                )}
            </div>

            <DataManagement />
        </div>
    );
};
