import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@/shared/components';
import { useAppContext } from '@/shared/context/AppContext';

const EditSupplierModal = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { suppliers, updateSupplier } = useAppContext();

  const supplier = suppliers.find((s) => s.id === id);

  const [formData, setFormData] = useState({
    name: '',
    tin: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name,
        tin: supplier.tin || '',
        contactPerson: supplier.contactPerson || '',
        phone: supplier.phone || '',
        email: supplier.email || '',
        address: supplier.address || '',
        notes: supplier.notes || '',
      });
    }
  }, [supplier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !id) return;

    setIsSubmitting(true);
    try {
      await updateSupplier(id, {
        name: formData.name,
        tin: formData.tin,
        contactPerson: formData.contactPerson,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        notes: formData.notes,
      });
      navigate('/suppliers');
    } catch (error) {
      console.error('Failed to update supplier:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!supplier) {
    return (
      <div className="flex items-center justify-center h-full bg-background-light dark:bg-background-dark">
        <p className="text-gray-400">Поставщик не найден</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden">
      {/* Pill indicator */}
      <div className="flex-none pt-3 pb-1 flex justify-center">
        <div className="h-1.5 w-14 rounded-full bg-gray-200 dark:bg-white/10"></div>
      </div>

      <header className="flex-none flex items-center justify-between px-6 pb-4 pt-2">
        <button
          onClick={() => navigate('/suppliers')}
          className="flex items-center justify-center w-10 h-10 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 shadow-sm text-gray-400 active:scale-90 transition-all"
        >
          <Icon name="close" className="text-[20px]" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">
            Редактирование
          </span>
          <h1 className="text-slate-900 dark:text-white text-lg font-black tracking-tight uppercase">
            Поставщик
          </h1>
        </div>
        <div className="w-10" />
      </header>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar px-6 py-4 pb-48">
        <div className="space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="h-24 w-24 rounded-3xl bg-primary/10 flex items-center justify-center shadow-xl">
              <Icon name="store" className="text-[48px] text-primary" />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
              Название компании *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="ТОО Поставщик"
              className="w-full h-14 px-5 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-base font-medium text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          {/* TIN */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
              БИН/ИИН
            </label>
            <input
              type="text"
              value={formData.tin}
              onChange={(e) => setFormData({ ...formData, tin: e.target.value })}
              placeholder="123456789012"
              maxLength={12}
              className="w-full h-14 px-5 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-base font-medium text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Contact Person */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
              Контактное лицо
            </label>
            <input
              type="text"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              placeholder="Иванов Иван"
              className="w-full h-14 px-5 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-base font-medium text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
              Телефон
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+7 (700) 123-45-67"
              className="w-full h-14 px-5 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-base font-medium text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="info@supplier.kz"
              className="w-full h-14 px-5 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-base font-medium text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
              Адрес
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="г. Алматы, ул. Примерная, 123"
              className="w-full h-14 px-5 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-base font-medium text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
              Примечания
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Дополнительная информация о поставщике..."
              rows={3}
              className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-base font-medium text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          {/* Supplier Info */}
          {supplier.createdAt && (
            <div className="bg-white dark:bg-surface-dark rounded-[2rem] p-5 border border-gray-100 dark:border-white/5">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
                Информация
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Добавлен: {new Date(supplier.createdAt).toLocaleDateString('ru-RU')}
              </p>
            </div>
          )}
        </div>
      </form>

      {/* Submit Button */}
      <div className="flex-none p-6 pb-12 z-10">
        <button
          onClick={handleSubmit}
          disabled={!formData.name.trim() || isSubmitting}
          className="group relative flex w-full items-center justify-center h-16 rounded-[2rem] bg-primary overflow-hidden shadow-2xl shadow-primary/40 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="text-base font-black text-white uppercase tracking-widest">
                Сохранение...
              </span>
            </div>
          ) : (
            <div className="relative flex items-center gap-3">
              <span className="text-base font-black text-white uppercase tracking-widest">
                Сохранить изменения
              </span>
              <Icon name="save" className="text-[24px] text-white" />
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default EditSupplierModal;
