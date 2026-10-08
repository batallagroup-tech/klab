import React, { useState } from 'react';
import { QuickProduct, BusinessCategory } from '../types';
import { X, Plus, Trash2, Edit2, Check, Sparkles, RotateCcw } from 'lucide-react';
import { CATEGORY_TEMPLATES } from '../lib/storage';
import { triggerHaptic } from '../lib/soundbox';

interface ProductManagerModalProps {
  products: QuickProduct[];
  category?: BusinessCategory;
  onSaveProducts: (products: QuickProduct[]) => void;
  onClose: () => void;
}

export const ProductManagerModal: React.FC<ProductManagerModalProps> = ({
  products,
  category = 'comida',
  onSaveProducts,
  onClose,
}) => {
  const [items, setItems] = useState<QuickProduct[]>([...products]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState<string>('');
  const [newPrice, setNewPrice] = useState<string>('');
  const [newEmoji, setNewEmoji] = useState<string>('🏷️');

  const popularEmojis = ['🏷️', '🥪', '🌮', '🧀', '🥤', '🧃', '☕', '🍲', '💈', '✂️', '💅', '👕', '👖', '👟', '🔧', '⚙️', '📱', '🔌', '📦', '⭐'];

  const handleAddOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPrice) return;
    triggerHaptic();

    const priceNum = parseFloat(newPrice);
    if (isNaN(priceNum) || priceNum <= 0) return;

    if (editingId) {
      setItems((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? { ...p, name: newName.trim(), price: priceNum, emoji: newEmoji }
            : p
        )
      );
      setEditingId(null);
    } else {
      const newItem: QuickProduct = {
        id: `p_${Date.now()}`,
        name: newName.trim(),
        price: priceNum,
        emoji: newEmoji,
        category: 'General',
      };
      setItems((prev) => [...prev, newItem]);
    }

    setNewName('');
    setNewPrice('');
  };

  const handleEdit = (p: QuickProduct) => {
    triggerHaptic();
    setEditingId(p.id);
    setNewName(p.name);
    setNewPrice(p.price.toString());
    setNewEmoji(p.emoji);
  };

  const handleDelete = (id: string) => {
    triggerHaptic();
    setItems((prev) => prev.filter((p) => p.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setNewName('');
      setNewPrice('');
    }
  };

  const handleLoadCategoryPresets = () => {
    triggerHaptic();
    const tmpl = CATEGORY_TEMPLATES[category]?.products || [];
    setItems(tmpl);
  };

  const handleSaveAll = () => {
    triggerHaptic();
    onSaveProducts(items);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-lg mx-auto bg-[#0d111a] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-[#111624]">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>⚡</span> Catálogo de Botones Rápidos
          </h3>
          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center active:scale-95 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Add / Edit Form */}
          <form onSubmit={handleAddOrUpdate} className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-3">
            <span className="text-[11px] font-bold uppercase text-slate-400 block">
              {editingId ? 'Editar Botón' : 'Agregar Nuevo Botón'}
            </span>

            <div className="grid grid-cols-4 gap-2">
              <div className="col-span-1">
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Emoji</label>
                <select
                  value={newEmoji}
                  onChange={(e) => setNewEmoji(e.target.value)}
                  className="w-full px-2 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-base focus:outline-none"
                >
                  {popularEmojis.map((em) => (
                    <option key={em} value={em}>
                      {em}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej. Torta Especial"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="col-span-1">
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Precio $</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="45"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition"
              >
                {editingId ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                <span>{editingId ? 'Actualizar Botón' : 'Agregar a la Botonera'}</span>
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setNewName('');
                    setNewPrice('');
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>

          {/* List of current products */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-slate-400">
                Botones Configurados ({items.length})
              </span>
              {category !== 'general' && (
                <button
                  type="button"
                  onClick={handleLoadCategoryPresets}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Cargar sugeridos de {CATEGORY_TEMPLATES[category].label}
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-500">
                No hay botones configurados. Puedes agregar los tuyos arriba.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{item.emoji}</span>
                      <div>
                        <div className="text-xs font-bold text-white">{item.name}</div>
                        <div className="text-[11px] font-mono font-bold text-emerald-400">
                          ${item.price.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center active:scale-95"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 flex items-center justify-center active:scale-95"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleSaveAll}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm active:scale-95 transition"
          >
            Guardar y Volver a la Terminal
          </button>
        </div>
      </div>
    </div>
  );
};
