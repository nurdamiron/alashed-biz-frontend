import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/shared/components';
import { useAppContext } from '@/shared/context/AppContext';

const CreateStaffModal = () => {
  const navigate = useNavigate();
  const { addEmployee } = useAppContext();

  const [formData, setFormData] = useState({
    name: '',
    position: '',
    department: '',
    phone: '',
    email: '',
    role: 'staff',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const departments = ['Продажи', 'Склад', 'Доставка', 'Бухгалтерия', 'IT', 'Управление'];
  const roles = [
    { value: 'admin', label: 'Администратор' },
    { value: 'manager', label: 'Менеджер' },
    { value: 'staff', label: 'Сотрудник' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      await addEmployee({
        name: formData.name,
        position: formData.position,
        department: formData.department,
        phone: formData.phone,
        email: formData.email,
        role: formData.role,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=135bec&color=fff`,
        activeTasks: 0,
        isActive: true,
      });
      navigate('/staff');
    } catch (error) {
      console.error('Failed to create employee:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
      <header className="sticky top-0 z-20 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-xl px-6 py-4 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/staff')}
            className="h-10 w-10 rounded-xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 flex items-center justify-center active:scale-90 transition-all"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
          <h1 className="text-lg font-black text-slate-900 dark:text-white">
            Новый сотрудник
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar px-6 py-6 pb-40">
        <div className="space-y-6">
          {/* Avatar Preview */}
          <div className="flex justify-center">
            <div className="relative">
              <img
                src={formData.name
                  ? `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=135bec&color=fff&size=128`
                  : 'https://ui-avatars.com/api/?name=?&background=94a3b8&color=fff&size=128'
                }
                alt="Avatar"
                className="h-24 w-24 rounded-3xl object-cover shadow-xl"
              />
              <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg">
                <Icon name="camera_alt" className="text-[16px]" />
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              ФИО *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Иванов Иван Иванович"
              className="w-full h-14 px-5 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          {/* Position */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Должность
            </label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              placeholder="Менеджер по продажам"
              className="w-full h-14 px-5 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Отдел
            </label>
            <div className="grid grid-cols-3 gap-2">
              {departments.map((dept) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => setFormData({ ...formData, department: dept })}
                  className={`py-3 rounded-xl text-xs font-bold transition-all ${
                    formData.department === dept
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : 'bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Роль в системе
            </label>
            <div className="grid grid-cols-3 gap-2">
              {roles.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: role.value })}
                  className={`py-3 rounded-xl text-xs font-bold transition-all ${
                    formData.role === role.value
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : 'bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </div>
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
              placeholder="ivanov@company.kz"
              className="w-full h-14 px-5 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
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
              <Icon name="person_add" className="text-[20px]" />
              Добавить сотрудника
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CreateStaffModal;
