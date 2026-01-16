
import { Download, Upload, AlertTriangle } from 'lucide-react';
import { storage } from '../../storage';
import { useState } from 'react';

export const DataManagement = () => {
    const [importError, setImportError] = useState<string | null>(null);
    const [importSuccess, setImportSuccess] = useState(false);

    const handleExport = () => {
        try {
            const data = storage.exportData();
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `quoterpro_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error('Export failed:', e);
            alert('Error al generar el respaldo. Revisa la consola para más detalles.');
        }
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            if (storage.importData(content)) {
                setImportSuccess(true);
                setImportError(null);
                // Reload after a short delay to see changes
                setTimeout(() => window.location.reload(), 1500);
            } else {
                setImportError('Error al importar el archivo. Asegúrate de que es un formato válido.');
                setImportSuccess(false);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mt-8">
            <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                        <Download size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Gestión de Datos (Backup)</h3>
                        <p className="text-sm text-gray-500">Exporta o importa toda la información del sistema (clientes, productos, cotizaciones).</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-100">
                    <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg h-full flex flex-col">
                            <h4 className="text-sm font-bold text-blue-900 mb-1 uppercase tracking-tight">Exportar Todo</h4>
                            <p className="text-xs text-blue-700 mb-4 flex-grow">Descarga un archivo JSON con toda tu base de datos actual para respaldarla o compartirla.</p>
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium w-fit"
                            >
                                <Download size={16} />
                                Descargar Respaldo JSON
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-amber-50 p-4 rounded-lg h-full flex flex-col">
                            <h4 className="text-sm font-bold text-amber-900 mb-1 uppercase tracking-tight">Importar Datos</h4>
                            <p className="text-xs text-amber-700 mb-4 flex-grow">Carga un archivo de respaldo previo. <span className="font-bold underline">Esto sobrescribirá tus datos actuales</span>.</p>
                            <label className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors text-sm font-medium cursor-pointer w-fit">
                                <Upload size={16} />
                                Seleccionar Archivo JSON
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleImport}
                                    className="hidden"
                                />
                            </label>

                            {importError && (
                                <div className="mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                                    <AlertTriangle size={14} />
                                    {importError}
                                </div>
                            )}

                            {importSuccess && (
                                <div className="mt-3 flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded">
                                    ¡Importación exitosa! Reiniciando...
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-red-50 p-4 rounded-lg h-full flex flex-col border border-red-100">
                            <h4 className="text-sm font-bold text-red-900 mb-1 uppercase tracking-tight">Zona de Peligro</h4>
                            <p className="text-xs text-red-700 mb-4 flex-grow">Borra permanentemente todos los datos del sistema. Esta acción no se puede deshacer.</p>
                            <button
                                onClick={() => {
                                    if (window.confirm('¿ESTÁS SEGURO? Esta acción eliminará permanentemente todas las empresas, clientes, productos y cotizaciones. No hay vuelta atrás.')) {
                                        storage.clearData();
                                        window.location.reload();
                                    }
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium w-fit"
                            >
                                <AlertTriangle size={16} />
                                Borrar Todos los Datos
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
