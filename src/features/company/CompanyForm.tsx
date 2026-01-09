import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Upload, Trash2 } from 'lucide-react';
import type { CompanyConfig } from '../../types';
import { storage } from '../../storage';
import { LogoCropper } from './LogoCropper';

export const CompanyForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [formData, setFormData] = useState<CompanyConfig>({
        id: crypto.randomUUID(),
        name: '',
        address: '',
        phone: '',
        email: '',
        logoUrl: '',
        folioPrefix: 'COT-',
        currentFolio: 1,
    });
    const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            const companies = storage.getCompanies();
            const company = companies.find(c => c.id === id);
            if (company) {
                setFormData(company);
            }
        }
    }, [id]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setSelectedImage(reader.result as string);
            });
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleCropComplete = (croppedImage: string) => {
        setFormData({ ...formData, logoUrl: croppedImage });
        setSelectedImage(null);
    };

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

            {selectedImage && (
                <LogoCropper
                    image={selectedImage}
                    onCropComplete={handleCropComplete}
                    onCancel={() => setSelectedImage(null)}
                />
            )}

            <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 space-y-8">
                {/* Logo Section */}
                <div className="flex flex-col items-center sm:flex-row gap-8 pb-8 border-b border-gray-100">
                    <div className="relative group">
                        <div className="w-32 h-32 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden transition-colors group-hover:border-blue-400">
                            {formData.logoUrl ? (
                                <img src={formData.logoUrl} alt="Logo preview" className="w-full h-full object-contain" />
                            ) : (
                                <Upload size={32} className="text-gray-400" />
                            )}
                        </div>
                        {formData.logoUrl && (
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, logoUrl: '' })}
                                className="absolute -top-2 -right-2 p-1.5 bg-red-100 text-red-600 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                        <h4 className="font-semibold text-gray-900 mb-1">Logotipo de la Empresa</h4>
                        <p className="text-sm text-gray-500 mb-4">Se recomienda una imagen cuadrada de alta calidad. El logo se mostrará en todas las cotizaciones.</p>
                        <label className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">
                            <Upload size={16} className="mr-2 text-gray-400" />
                            {formData.logoUrl ? 'Cambiar Logotipo' : 'Subir Logotipo'}
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                    </div>
                </div>

                {/* Watermark Section */}
                <div className="flex flex-col items-center sm:flex-row gap-8 pb-8 border-b border-gray-100">
                    <div className="relative group">
                        <div className="w-32 h-32 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden transition-colors group-hover:border-blue-400">
                            {formData.watermarkUrl ? (
                                <img src={formData.watermarkUrl} alt="Watermark preview" className="w-full h-full object-contain opacity-50" />
                            ) : (
                                <span className="text-gray-400 text-xs text-center px-2">Sin Marca de Agua</span>
                            )}
                        </div>
                        {formData.watermarkUrl && (
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, watermarkUrl: '' })}
                                className="absolute -top-2 -right-2 p-1.5 bg-red-100 text-red-600 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                        <h4 className="font-semibold text-gray-900 mb-1">Marca de Agua para PDF</h4>
                        <p className="text-sm text-gray-500 mb-4">Esta imagen aparecerá como fondo en la tabla de productos de tus cotizaciones.</p>
                        <label className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">
                            <Upload size={16} className="mr-2 text-gray-400" />
                            {formData.watermarkUrl ? 'Cambiar Marca de Agua' : 'Subir Marca de Agua'}
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                        const reader = new FileReader();
                                        reader.addEventListener('load', () => {
                                            setFormData({ ...formData, watermarkUrl: reader.result as string });
                                        });
                                        reader.readAsDataURL(e.target.files[0]);
                                    }
                                }}
                            />
                        </label>
                    </div>
                </div>

                {formData.watermarkUrl && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8 border-b border-gray-100">
                        <div className="space-y-4">
                            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                                <p className="text-xs text-center text-gray-500 mb-2">Vista Previa de Opacidad</p>
                                <div className="relative h-32 w-full bg-gray-50 rounded border border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                                    <div className="absolute inset-0 z-0 grid grid-cols-6 grid-rows-4 opacity-10 pointer-events-none">
                                        {Array.from({ length: 24 }).map((_, i) => (
                                            <div key={i} className="border-r border-b border-gray-900"></div>
                                        ))}
                                    </div>
                                    <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
                                        <img
                                            src={formData.watermarkUrl}
                                            alt="Opacity Preview"
                                            className={`object-contain transition-all duration-300 ${(formData.watermarkSize === '75') ? 'w-[75%] h-[75%]' :
                                                    (formData.watermarkSize === '50') ? 'w-[50%] h-[50%]' :
                                                        'w-full h-full'
                                                }`}
                                            style={{ opacity: (formData.watermarkOpacity || 8) / 100 }}
                                        />
                                    </div>
                                    <div className="absolute bottom-1 right-1 bg-white/80 px-1.5 py-0.5 rounded text-[10px] text-gray-600 font-mono border border-gray-200">
                                        {formData.watermarkOpacity || 8}%
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ajustar Opacidad</label>
                                <input
                                    type="range"
                                    min="1"
                                    max="100"
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    value={formData.watermarkOpacity || 8}
                                    onChange={e => setFormData({ ...formData, watermarkOpacity: parseInt(e.target.value) })}
                                />
                                <div className="flex justify-between text-xs text-gray-400 px-1 mt-1">
                                    <span>1%</span>
                                    <span>50%</span>
                                    <span>100%</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Alineación Horizontal</label>
                            <div className="flex flex-col gap-2">
                                {(['left', 'center', 'right'] as const).map((align) => (
                                    <label key={align} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${(formData.watermarkAlignment || 'center') === align
                                        ? 'bg-blue-50 border-blue-200'
                                        : 'bg-white border-gray-200 hover:bg-gray-50'
                                        }`}>
                                        <input
                                            type="radio"
                                            name="watermarkAlignment"
                                            value={align}
                                            checked={(formData.watermarkAlignment || 'center') === align}
                                            onChange={() => setFormData({ ...formData, watermarkAlignment: align })}
                                            className="text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="capitalize text-sm font-medium text-gray-900 border-l border-gray-200 pl-3 ml-1">
                                            {align === 'left' ? 'Izquierda' : align === 'center' ? 'Centro' : 'Derecha'}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Size Controls */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Tamaño</label>
                            <div className="flex flex-col gap-2">
                                {(['100', '75', '50'] as const).map((size) => (
                                    <label key={size} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${(formData.watermarkSize || '100') === size
                                        ? 'bg-blue-50 border-blue-200'
                                        : 'bg-white border-gray-200 hover:bg-gray-50'
                                        }`}>
                                        <input
                                            type="radio"
                                            name="watermarkSize"
                                            value={size}
                                            checked={(formData.watermarkSize || '100') === size}
                                            onChange={() => setFormData({ ...formData as any, watermarkSize: size })}
                                            className="text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-900 border-l border-gray-200 pl-3 ml-1">
                                            {size}%
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

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

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Etiqueta Columna 1 (bajo logo)</label>
                        <input
                            type="text"
                            placeholder="Ej: Certificado ISO 9001"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.headerLabel1 || ''}
                            onChange={e => setFormData({ ...formData, headerLabel1: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Etiqueta Columna 2 (bajo contacto)</label>
                        <input
                            type="text"
                            placeholder="Ej: Contacto: 55-xxxx-xxxx"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.headerLabel2 || ''}
                            onChange={e => setFormData({ ...formData, headerLabel2: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Etiqueta Columna 3 (bajo folio)</label>
                        <input
                            type="text"
                            placeholder="Ej: Vigencia 30 días"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.headerLabel3 || ''}
                            onChange={e => setFormData({ ...formData, headerLabel3: e.target.value })}
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
