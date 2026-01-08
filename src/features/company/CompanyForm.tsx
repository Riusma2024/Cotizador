import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import type { CompanyConfig } from '../../types';
import { storage } from '../../storage';

export const CompanyForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [formData, setFormData] = useState<CompanyConfig>({
        id: crypto.randomUUID(),
        name: '',
        address: '',
        phone: '',
        email: '',
        folioPrefix: 'COT-',
        currentFolio: 1,
    });
    const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    useEffect(() => {
        if (id) {
            const companies = storage.getCompanies();
            const company = companies.find(c => c.id === id);
            if (company) {
                setFormData(company);
            }
        }
    }, [id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('saving');
        storage.saveCompany(formData);

        // If this is the first company, make it active automatically
        const companies = storage.getCompanies();
        if (companies.length === 1) {
            storage.setActiveCompanyId(formData.id);
        }

        setTimeout(() => {
            setStatus('saved');
            navigate('/settings');
        }, 500);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/settings')}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <h2 className="text-2xl font-bold text-gray-900">
                    {id ? 'Editar Empresa' : 'Nueva Empresa'}
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Nombre de la Empresa</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Teléfono de Contacto</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Dirección Comercial</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Prefijo de Folio</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.folioPrefix}
                            onChange={e => setFormData({ ...formData, folioPrefix: e.target.value })}
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={status === 'saving'}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        <Save size={20} />
                        {status === 'saving' ? 'Guardando...' : 'Guardar Empresa'}
                    </button>
                </div>
            </form>
        </div>
    );
};
