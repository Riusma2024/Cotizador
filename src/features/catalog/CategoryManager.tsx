import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { storage } from '../../storage';
import { generateId } from '../../utils/id';
import type { Category } from '../../types';

interface CategoryManagerProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

export const CategoryManager = ({ isOpen, onClose, onUpdate }: CategoryManagerProps) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const activeCompanyId = storage.getActiveCompanyId();

    useEffect(() => {
        if (isOpen && activeCompanyId) {
            loadCategories();
        }
    }, [isOpen, activeCompanyId]);

    const loadCategories = () => {
        if (activeCompanyId) {
            setCategories(storage.getCategories(activeCompanyId));
        }
    };

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim() || !activeCompanyId) return;

        const newCategory: Category = {
            id: generateId(),
            companyId: activeCompanyId,
            name: newCategoryName.trim(),
        };

        storage.saveCategory(newCategory);
        setNewCategoryName('');
        loadCategories();
        onUpdate();
    };

    const handleDelete = (id: string) => {
        if (confirm('¿Estás seguro de eliminar esta categoría?')) {
            storage.deleteCategory(id);
            loadCategories();
            onUpdate();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">Gestionar Categorías</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    <form onSubmit={handleAdd} className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Nueva categoría..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={!newCategoryName.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Plus size={20} />
                        </button>
                    </form>

                    <div className="max-h-60 overflow-y-auto space-y-2">
                        {categories.length === 0 ? (
                            <p className="text-center text-gray-500 py-4">No hay categorías registradas.</p>
                        ) : (
                            categories.map((category) => (
                                <div key={category.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                                    <span className="text-gray-700">{category.name}</span>
                                    <button
                                        onClick={() => handleDelete(category.id)}
                                        className="text-red-500 hover:text-red-700 p-1"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
