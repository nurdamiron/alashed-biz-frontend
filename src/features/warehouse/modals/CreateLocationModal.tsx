import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/shared/components';
import { api } from '@/shared/lib/api';
import toast from 'react-hot-toast';

const CreateLocationModal = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    zone: '',
    aisle: '',
    rack: '',
    shelf: '',
    capacity: '',
    description: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const zones = ['A', 'B', 'C', 'D', 'E', 'Приемка', 'Отгрузка'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) return;

    setIsSubmitting(true);
    try {
      await api.warehouse.createLocation({
        code: formData.code.toUpperCase(),
        name: formData.name || undefined,
        zone: formData.zone || undefined,
        aisle: formData.aisle || undefined,
        rack: formData.rack || undefined,
        shelf: formData.shelf || undefined,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        description: formData.description || undefined,
      });
      toast.success('Локация создана');
      navigate('/warehouse');
    } catch (error) {
      console.error('Failed to create location:', error);
      toast.error('Ошибка создания локации');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-generate code from zone, aisle, rack, shelf
  const generateCode = () => {
    const parts = [formData.zone, formData.aisle, formData.rack, formData.shelf].filter(Boolean);
    if (parts.length > 0) {
      setFormData({ ...formData, code: parts.join('-').toUpperCase() });
    }
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
      <header className="sticky top-0 z-20 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-xl px-6 py-4 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/warehouse')}
            className="h-10 w-10 rounded-xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 flex items-center justify-center active:scale-90 transition-all"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
          <h1 className="text-lg font-black text-slate-900 dark:text-white">
            Новая локация
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar px-6 py-6 pb-40">
        <div className="space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="h-24 w-24 rounded-3xl bg-primary/10 flex items-center justify-center shadow-xl">
              <Icon name="add_location" className="text-[48px] text-primary" />
            </div>
          </div>

          {/* Zone */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Зона
            </label>
            <div className="grid grid-cols-4 gap-2">
              {zones.map((zone) => (
                <button
                  key={zone}
                  type="button"
                  onClick={() => setFormData({ ...formData, zone })}
                  className={`py-3 rounded-xl text-xs font-bold transition-all ${
                    formData.zone === zone
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : 'bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {zone}
                </button>
              ))}
            </div>
          </div>

          {/* Aisle, Rack, Shelf */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                Ряд
              </label>
              <input
                type="text"
                value={formData.aisle}
                onChange={(e) => setFormData({ ...formData, aisle: e.target.value })}
                placeholder="01"
                className="w-full h-14 px-4 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-lg font-black text-center focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                Стеллаж
              </label>
              <input
                type="text"
                value={formData.rack}
                onChange={(e) => setFormData({ ...formData, rack: e.target.value })}
                placeholder="01"
                className="w-full h-14 px-4 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-lg font-black text-center focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                Полка
              </label>
              <input
                type="text"
                value={formData.shelf}
                onChange={(e) => setFormData({ ...formData, shelf: e.target.value })}
                placeholder="01"
                className="w-full h-14 px-4 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-lg font-black text-center focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Code */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Код локации *
              </label>
              <button
                type="button"
                onClick={generateCode}
                className="text-[10px] font-bold text-primary"
              >
                Сгенерировать
              </button>
            </div>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="A-01-01-01"
              className="w-full h-14 px-5 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-lg font-black text-center focus:outline-none focus:ring-2 focus:ring-primary/20 uppercase"
              required
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Название
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Стеллаж для электроники"
              className="w-full h-14 px-5 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Емкость (шт)
            </label>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              placeholder="100"
              min="0"
              className="w-full h-14 px-5 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Описание
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Дополнительная информация..."
              rows={3}
              className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>
        </div>
      </form>

      {/* Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-xl border-t border-gray-100 dark:border-white/5">
        <button
          onClick={handleSubmit}
          disabled={!formData.code.trim() || isSubmitting}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-base shadow-xl shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Icon name="add_location" className="text-[20px]" />
              Создать локацию
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CreateLocationModal;
