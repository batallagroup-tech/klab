import React, { useState } from 'react';
import { QuickProduct } from '../types';
import { X, Plus, Trash2, Edit2, Check, Sparkles } from 'lucide-react';
import { triggerHaptic } from '../lib/soundbox';

interface ProductManagerModalProps {
  products: QuickProduct[];
  onSaveProducts: (products: QuickProduct[]) => void;
  onClose: () => void;
}

export const ProductManagerModal: React.FC<ProductManagerModalProps> = ({
  products,
  onSaveProducts,
  onClose,
}) => {
  const [items, setItems] = useState<QuickProduct[]>([...products]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState<string>('');
  const [newPrice, setNewPrice] = useState<string>('');
  const [newEmoji, setNewEmoji] = useState<string>('🌮');

  const popularEmojis = ['🌮', '🥪', '🧀', '🥤', '🧃', '☕', '🍱', '🍮', '🍔', '🍕', '🌭', '🥗', '🍦', '🍩', '🍺', '⚡'];

  const handleAddOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice) return;
    triggerHaptic();

    const priceNum = parseFloat(newPrice);
    if (isNaN(priceNum) || priceNum <= 0) return;

    if (editingId) {
      setItems((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? { ...p, name: newName, price: priceNum, emoji: newEmoji }
            : p
        )
      );
      setEditingId(null);
    } else {
      const newItem: QuickProduct = {
        id: `p_${Date.now()}`,
        name: newName,
        price: priceNum,
        emoji: newEmoji,
        color: '#10B981',
        category: 'Comida',
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

  const handleSaveAll = () => {
    triggerHaptic();
    onSaveProducts(items);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-lg mx-auto bg-[#0f121d] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800/80 flex items-center justify-between bg-[#131726]">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>⚡</span> Personalizar Botonera de Productos
          </h3>
          <button
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
          <form
            onSubmit={handleAddOrUpdate}
            className="bg-[#141829] border border-slate-800 rounded-2xl p-3.5 space-y-3"
          >
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{editingId ? 'Editar Botón' : 'Crear Nuevo Botón'}</span>
            </div>

            {/* Emoji Selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {popularEmojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    triggerHaptic();
                    setNewEmoji(emoji);
                  }}
                  className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center shrink-0 border transition active:scale-90 ${
                    newEmoji === emoji
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 space-y-1">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nombre (ej. Torta Cubana)"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#0a0c14] border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="col-span-1 space-y-1">
                <input
                  type="number"
                  step="0.5"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="Precio $"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#0a0c14] border border-slate-700 font-mono text-xs font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
            >
              {editingId ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{editingId ? 'Actualizar Botón' : 'Agregar a la Botonera'}</span>
            </button>
          </form>

          {/* Current Products List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Botones Activos ({items.length})
            </h4>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {items.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#131726] border border-slate-800"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{p.emoji}</span>
                    <div>
                      <div className="text-xs font-bold text-white">{p.name}</div>
                      <div className="text-xs font-mono font-bold text-emerald-400">${p.price}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleEdit(p)}
                      className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center active:scale-90 transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
                      className="w-7 h-7 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 flex items-center justify-center active:scale-90 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#131726] border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={handleSaveAll}
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition shadow-lg shadow-emerald-500/20"
          >
            <Check className="w-4 h-4" />
            <span>Guardar Botonera</span>
          </button>
        </div>
      </div>
    </div>
  );
};
