import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/shared/components';
import { useAppContext } from '@/shared/context/AppContext';

const CreateStaffModal = () => {
  const navigate = useNavigate();
  const { addEmployee } = useAppContext();

  const [formData, setFormData] = useState({
    name: '',
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
        department: formData.department,
        phone: formData.phone,
        email: formData.email,
        role: formData.role,
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
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden">
      {/* Pill indicator */}
      <div className="flex-none pt-3 pb-1 flex justify-center">
        <div className="h-1.5 w-14 rounded-full bg-gray-200 dark:bg-white/10"></div>
      </div>

      <header className="flex-none flex items-center justify-between px-6 pb-4 pt-2">
        <button
          onClick={() => navigate('/staff')}
          className="flex items-center justify-center w-10 h-10 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 shadow-sm text-gray-400 active:scale-90 transition-all"
        >
          <Icon name="close" className="text-[20px]" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">
            Новый процесс
          </span>
          <h1 className="text-slate-900 dark:text-white text-lg font-black tracking-tight uppercase">
            Сотрудник
          </h1>
        </div>
        <div className="w-10" />
      </header>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar px-6 py-4 pb-48">
        <div className="space-y-6">
          {/* Avatar Preview */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-xl">
                <span className="text-white font-black text-3xl">
                  {formData.name
                    ? formData.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                    : '?'
                  }
                </span>
              </div>
              <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg">
                <Icon name="camera_alt" className="text-[16px]" />
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
              ФИО *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Иванов Иван Иванович"
              className="w-full h-14 px-5 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-base font-medium text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
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
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
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
              placeholder="ivanov@company.kz"
              className="w-full h-14 px-5 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-base font-medium text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
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
                Создание...
              </span>
            </div>
          ) : (
            <div className="relative flex items-center gap-3">
              <span className="text-base font-black text-white uppercase tracking-widest">
                Добавить сотрудника
              </span>
              <Icon name="person_add" className="text-[24px] text-white" />
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default CreateStaffModal;
