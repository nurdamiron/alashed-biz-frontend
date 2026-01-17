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
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
      <header className="sticky top-0 z-20 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-xl px-6 py-4 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/suppliers')}
            className="h-10 w-10 rounded-xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 flex items-center justify-center active:scale-90 transition-all"
          >
            <Icon name="arrow_back" className="text-[20px]" />
          </button>
          <h1 className="text-lg font-black text-slate-900 dark:text-white">
            Редактирование
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar px-6 py-6 pb-40">
        <div className="space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="h-24 w-24 rounded-3xl bg-primary/10 flex items-center justify-center shadow-xl">
              <Icon name="store" className="text-[48px] text-primary" />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Название компании *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="ТОО Поставщик"
              className="w-full h-14 px-5 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          {/* TIN */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              БИН/ИИН
            </label>
            <input
              type="text"
              value={formData.tin}
              onChange={(e) => setFormData({ ...formData, tin: e.target.value })}
              placeholder="123456789012"
              maxLength={12}
              className="w-full h-14 px-5 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Contact Person */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Контактное лицо
            </label>
            <input
              type="text"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              placeholder="Иванов Иван"
              className="w-full h-14 px-5 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Телефон
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+7 (700) 123-45-67"
              className="w-full h-14 px-5 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="info@supplier.kz"
              className="w-full h-14 px-5 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Адрес
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="г. Алматы, ул. Примерная, 123"
              className="w-full h-14 px-5 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Примечания
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Дополнительная информация о поставщике..."
              rows={3}
              className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          {/* Supplier Info */}
          {supplier.createdAt && (
            <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                Информация
              </p>
              <p className="text-xs text-gray-500">
                Добавлен: {new Date(supplier.createdAt).toLocaleDateString('ru-RU')}
              </p>
            </div>
          )}
        </div>
      </form>

      {/* Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-xl border-t border-gray-100 dark:border-white/5">
        <button
          onClick={handleSubmit}
          disabled={!formData.name.trim() || isSubmitting}
          className="w-full h-14 rounded-2xl bg-blue-500 text-white font-bold text-base shadow-xl shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Icon name="save" className="text-[20px]" />
              Сохранить изменения
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default EditSupplierModal;
