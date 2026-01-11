import React, { useState, useRef } from 'react';
import { Trash2, Type, Image as ImageIcon } from 'lucide-react';
import type { AnnexItem } from '../../types';

interface AnnexEditorProps {
    items: AnnexItem[];
    onChange: (items: AnnexItem[]) => void;
}

export const AnnexEditor: React.FC<AnnexEditorProps> = ({ items, onChange }) => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const canvasRef = useRef<HTMLDivElement>(null);

    const handleAddText = () => {
        const newItem: AnnexItem = {
            id: crypto.randomUUID(),
            type: 'text',
            content: 'Texto de ejemplo',
            x: 50,
            y: 50,
            width: 300,
            height: 100
        };
        onChange([...items, newItem]);
        setSelectedId(newItem.id);
    };

    const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                const newItem: AnnexItem = {
                    id: crypto.randomUUID(),
                    type: 'image',
                    content: reader.result as string,
                    x: 50,
                    y: 50,
                    width: 400,
                    height: 300
                };
                onChange([...items, newItem]);
                setSelectedId(newItem.id);
            });
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleRemoveItem = (id: string) => {
        onChange(items.filter(item => item.id !== id));
        if (selectedId === id) setSelectedId(null);
    };

    const updateItem = (id: string, updates: Partial<AnnexItem>) => {
        onChange(items.map(item => item.id === id ? { ...item, ...updates } : item));
    };

    const selectedItem = items.find(item => item.id === selectedId);

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={handleAddText}
                    className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                >
                    <Type size={16} />
                    Agregar Texto
                </button>
                <label className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer text-sm">
                    <ImageIcon size={16} />
                    Agregar Imagen
                    <input type="file" className="hidden" accept="image/*" onChange={handleAddImage} />
                </label>
            </div>

            <div
                ref={canvasRef}
                className="relative bg-white border-2 border-gray-300 rounded-lg overflow-hidden"
                style={{ minHeight: '1060px', width: '100%' }}
                onClick={(e) => {
                    if (e.target === canvasRef.current) {
                        setSelectedId(null);
                    }
                }}
            >
                {/* Visual Guide for PDF Page Limit (approx 960px for Letter size minus margins) */}
                <div
                    className="absolute left-0 right-0 border-b-2 border-red-300 border-dashed pointer-events-none z-0"
                    style={{ top: '960px' }}
                >
                    <span className="absolute right-2 -top-6 text-xs text-red-400 font-medium bg-white px-1 shadow-sm rounded border border-red-100">
                        Límite sugerido para PDF (Página 1)
                    </span>
                </div>

                {items.map((item) => (
                    <div
                        key={item.id}
                        className={`absolute group cursor-move border-2 transition-all ${selectedId === item.id ? 'border-blue-500 shadow-lg' : 'border-transparent hover:border-blue-300'
                            }`}
                        style={{
                            left: `${item.x}px`,
                            top: `${item.y}px`,
                            width: `${item.width}px`,
                            height: `${item.height}px`
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedId(item.id);
                        }}
                        onMouseEnter={() => setHoveredId(item.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        onMouseDown={(e) => {
                            if (e.button !== 0 || e.target !== e.currentTarget) return;
                            e.preventDefault();
                            const canvas = canvasRef.current;
                            if (!canvas) return;

                            const rect = canvas.getBoundingClientRect();
                            const startX = e.clientX - rect.left - item.x;
                            const startY = e.clientY - rect.top - item.y;

                            const handleMouseMove = (moveEvent: MouseEvent) => {
                                const newX = Math.max(0, Math.min(moveEvent.clientX - rect.left - startX, rect.width - item.width));
                                const newY = Math.max(0, Math.min(moveEvent.clientY - rect.top - startY, rect.height - item.height));
                                updateItem(item.id, { x: newX, y: newY });
                            };

                            const handleMouseUp = () => {
                                document.removeEventListener('mousemove', handleMouseMove);
                                document.removeEventListener('mouseup', handleMouseUp);
                            };

                            document.addEventListener('mousemove', handleMouseMove);
                            document.addEventListener('mouseup', handleMouseUp);
                        }}
                    >
                        {/* Delete button on hover */}
                        {(hoveredId === item.id || selectedId === item.id) && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveItem(item.id);
                                }}
                                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 z-10"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}

                        {/* Content */}
                        <div className="w-full h-full pointer-events-none">
                            {item.type === 'text' ? (
                                <div className="w-full h-full p-2 text-sm text-gray-700 whitespace-pre-wrap overflow-hidden">
                                    {item.content}
                                </div>
                            ) : (
                                <img src={item.content} alt="Annex" className="w-full h-full object-contain" />
                            )}
                        </div>

                        {/* Resize handles */}
                        {selectedId === item.id && (
                            <>
                                {/* Bottom-right corner resize */}
                                <div
                                    className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize"
                                    onMouseDown={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        const canvas = canvasRef.current;
                                        if (!canvas) return;

                                        const rect = canvas.getBoundingClientRect();
                                        const startWidth = item.width;
                                        const startHeight = item.height;
                                        const startMouseX = e.clientX;
                                        const startMouseY = e.clientY;

                                        const handleMouseMove = (moveEvent: MouseEvent) => {
                                            const deltaX = moveEvent.clientX - startMouseX;
                                            const deltaY = moveEvent.clientY - startMouseY;
                                            const newWidth = Math.max(50, Math.min(startWidth + deltaX, rect.width - item.x));
                                            const newHeight = Math.max(50, Math.min(startHeight + deltaY, rect.height - item.y));
                                            updateItem(item.id, { width: newWidth, height: newHeight });
                                        };

                                        const handleMouseUp = () => {
                                            document.removeEventListener('mousemove', handleMouseMove);
                                            document.removeEventListener('mouseup', handleMouseUp);
                                        };

                                        document.addEventListener('mousemove', handleMouseMove);
                                        document.addEventListener('mouseup', handleMouseUp);
                                    }}
                                />
                            </>
                        )}
                    </div>
                ))}
            </div>

            {selectedItem && selectedItem.type === 'text' && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Editar Texto</label>
                    <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        rows={3}
                        value={selectedItem.content}
                        onChange={(e) => updateItem(selectedItem.id, { content: e.target.value })}
                    />
                </div>
            )}
        </div>
    );
};
