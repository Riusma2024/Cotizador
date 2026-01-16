import React, { useState, useEffect } from 'react';
import { Plus, User, Edit2, Trash2, X, Save, FileText, Calendar, TrendingUp } from 'lucide-react';
import { storage } from '../../storage';
import { formatCurrency } from '../../utils/calculations';
import type { Employee, Quote } from '../../types';
import { generateId } from '../../utils/id';

export const EmployeeManager: React.FC = () => {
    const activeCompanyId = storage.getActiveCompanyId();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [activeTab, setActiveTab] = useState<'employees' | 'reports'>('employees');

    const [formData, setFormData] = useState({
        name: '',
        position: ''
    });

    // Filtros de reportes
    const [filterEmployee, setFilterEmployee] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    useEffect(() => {
        loadData();
    }, [activeCompanyId]);

    const loadData = () => {
        if (activeCompanyId) {
            setEmployees(storage.getEmployees(activeCompanyId));
            setQuotes(storage.getQuotes(activeCompanyId));
        }
    };

    const handleOpenForm = (employee?: Employee) => {
        if (employee) {
            setEditingEmployee(employee);
            setFormData({
                name: employee.name,
                position: employee.position
            });
        } else {
            setEditingEmployee(null);
            setFormData({
                name: '',
                position: ''
            });
        }
        setIsFormOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeCompanyId) return;

        const employee: Employee = {
            id: editingEmployee?.id || generateId(),
            companyId: activeCompanyId,
            ...formData
        };

        storage.saveEmployee(employee);
        setIsFormOpen(false);
        loadData();
    };

    const handleDelete = (id: string) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este empleado?')) {
            storage.deleteEmployee(id);
            loadData();
        }
    };

    // Lógica de reportes
    const filteredQuotes = quotes.filter(q => {
        const matchesEmployee = filterEmployee === 'all' || q.employeeId === filterEmployee;
        const matchesDateFrom = !dateFrom || q.date >= dateFrom;
        const matchesDateTo = !dateTo || q.date <= dateTo;
        return matchesEmployee && matchesDateFrom && matchesDateTo;
    }).sort((a, b) => b.date.localeCompare(a.date));

    const totalStats = filteredQuotes.reduce((acc, q) => ({
        count: acc.count + 1,
        total: acc.total + q.total
    }), { count: 0, total: 0 });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900">Personal y Reportes</h2>
                <div className="flex bg-gray-100 p-1 rounded-lg w-full sm:w-auto">
                    <button
                        onClick={() => setActiveTab('employees')}
                        className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'employees' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                        Empleados
                    </button>
                    <button
                        onClick={() => setActiveTab('reports')}
                        className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'reports' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                        Reportes
                    </button>
                </div>
            </div>

            {activeTab === 'employees' ? (
                <div className="space-y-4">
                    <div className="flex justify-start sm:justify-end">
                        <button
                            onClick={() => handleOpenForm()}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            <Plus size={20} />
                            Nuevo Empleado
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {employees.map((employee) => (
                            <div key={employee.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                                        <User size={24} />
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleOpenForm(employee)}
                                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(employee.id)}
                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="font-bold text-gray-900 text-lg">{employee.name}</h3>
                                <p className="text-gray-500 text-sm uppercase tracking-wider font-medium">{employee.position}</p>
                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400">
                                    <FileText size={14} />
                                    <span>{quotes.filter(q => q.employeeId === employee.id).length} cotizaciones generadas</span>
                                </div>
                            </div>
                        ))}
                        {employees.length === 0 && (
                            <div className="col-span-full py-12 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                <User className="mx-auto text-gray-300 mb-3" size={40} />
                                <p className="text-gray-500">No hay empleados registrados todavía.</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Filtros de Reportes */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Por Empleado</label>
                            <select
                                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                value={filterEmployee}
                                onChange={(e) => setFilterEmployee(e.target.value)}
                            >
                                <option value="all">Todos los empleados</option>
                                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Desde</label>
                            <input
                                type="date"
                                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Hasta</label>
                            <input
                                type="date"
                                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setFilterEmployee('all'); setDateFrom(''); setDateTo(''); }}
                                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                            >
                                Limpiar
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-blue-600 p-6 rounded-xl text-white shadow-lg shadow-blue-100 flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-xs font-medium uppercase tracking-wider mb-1">Monto Total</p>
                                <h3 className="text-xl md:text-2xl font-bold">{formatCurrency(totalStats.total)}</h3>
                            </div>
                            <div className="bg-white/20 p-2 md:p-3 rounded-lg">
                                <TrendingUp size={24} />
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Total Cotizaciones</p>
                                <h3 className="text-xl md:text-2xl font-bold text-gray-900">{totalStats.count}</h3>
                            </div>
                            <div className="bg-gray-50 p-2 md:p-3 rounded-lg text-gray-600">
                                <FileText size={24} />
                            </div>
                        </div>
                    </div>

                    {/* Tabla de Resultados / Card View */}
                    <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                        {/* Mobile Card View */}
                        <div className="md:hidden divide-y divide-gray-200">
                            {filteredQuotes.map((quote) => (
                                <div key={quote.id} className="p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="space-y-0.5">
                                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{quote.folio}</span>
                                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                                <Calendar size={12} />
                                                {quote.date}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-gray-400 uppercase tracking-tighter">Monto</p>
                                            <p className="text-base font-bold text-gray-900 leading-none">
                                                {formatCurrency(quote.total)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 mt-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] uppercase text-gray-400 font-bold w-12 shrink-0">Cliente</span>
                                            <span className="text-sm text-gray-900 font-medium truncate">{quote.customer.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] uppercase text-gray-400 font-bold w-12 shrink-0">Personal</span>
                                            <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] text-gray-700 font-medium border border-gray-200">
                                                {quote.employeeName}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3">Folio</th>
                                        <th className="px-6 py-3">Fecha</th>
                                        <th className="px-6 py-3">Cliente</th>
                                        <th className="px-6 py-3">Empleado</th>
                                        <th className="px-6 py-3 text-right">Monto</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredQuotes.map((quote) => (
                                        <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-blue-600 text-sm">{quote.folio}</td>
                                            <td className="px-6 py-4 text-gray-600 text-sm">
                                                <div className="flex items-center gap-2 whitespace-nowrap">
                                                    <Calendar size={14} />
                                                    {quote.date}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-900 font-medium text-sm">{quote.customer.name}</td>
                                            <td className="px-6 py-4">
                                                <span className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-700 font-medium border border-gray-200 whitespace-nowrap">
                                                    {quote.employeeName}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-gray-900 text-sm">
                                                {formatCurrency(quote.total)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {filteredQuotes.length === 0 && (
                            <div className="px-6 py-12 text-center text-gray-500 italic">
                                No se encontraron cotizaciones con los filtros seleccionados.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal de Formulario de Empleado */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}
                            </h3>
                            <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cargo / Puesto</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.position}
                                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-bold"
                                >
                                    <Save size={18} />
                                    {editingEmployee ? 'Actualizar' : 'Guardar Empleado'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
