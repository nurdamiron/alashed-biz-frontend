import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/shared/components';
import { useAppContext } from '@/shared/context/AppContext';
import type { Employee } from '@/shared/types';

const StaffScreen = () => {
  const navigate = useNavigate();
  const { employees, deleteEmployee } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.position?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesActive = showInactive ? true : emp.isActive !== false;
    return matchesSearch && matchesActive;
  });

  const departments = [...new Set(employees.map(e => e.department).filter(Boolean))];

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Деактивировать сотрудника "${name}"?`)) {
      await deleteEmployee(id);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark transition-colors duration-300">
      <header className="sticky top-0 z-20 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-xl pt-8 px-6 pb-4 transition-colors">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">
              Team Management
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              СОТРУДНИКИ
            </h1>
          </div>
          <button
            onClick={() => setShowInactive(!showInactive)}
            className={`flex items-center justify-center w-12 h-12 rounded-2xl border shadow-sm active:scale-90 transition-all ${
              showInactive
                ? 'bg-primary text-white border-primary'
                : 'bg-white dark:bg-surface-dark border-gray-100 dark:border-white/5 text-slate-900 dark:text-white'
            }`}
          >
            <Icon name={showInactive ? 'visibility' : 'visibility_off'} className="text-[22px]" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по имени, должности..."
            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 border border-gray-100 dark:border-white/5">
            <p className="text-2xl font-black text-slate-900 dark:text-white">{employees.filter(e => e.isActive !== false).length}</p>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Активных</p>
          </div>
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 border border-gray-100 dark:border-white/5">
            <p className="text-2xl font-black text-primary">{departments.length}</p>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Отделов</p>
          </div>
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 border border-gray-100 dark:border-white/5">
            <p className="text-2xl font-black text-emerald-500">{employees.reduce((sum, e) => sum + e.activeTasks, 0)}</p>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Задач</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar px-6 pt-4 pb-40">
        <div className="space-y-4">
          {filteredEmployees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onEdit={() => navigate(`/staff/${employee.id}/edit`)}
              onDelete={() => handleDelete(employee.id, employee.name)}
            />
          ))}
          {filteredEmployees.length === 0 && (
            <div className="text-center py-20">
              <Icon name="groups" className="text-[64px] text-gray-300 dark:text-gray-700 mb-4" />
              <p className="text-sm font-bold text-gray-400">Сотрудники не найдены</p>
            </div>
          )}
        </div>
      </main>

      {/* FAB */}
      <button
        onClick={() => navigate('/staff/new')}
        className="fixed bottom-32 right-6 h-16 w-16 rounded-[2rem] bg-primary text-white shadow-2xl shadow-primary/40 flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-40 border-4 border-white dark:border-background-dark"
      >
        <Icon name="person_add" className="text-[32px]" />
      </button>
    </div>
  );
};

const EmployeeCard: React.FC<{
  employee: Employee;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ employee, onEdit, onDelete }) => {
  return (
    <div className={`bg-white dark:bg-surface-dark rounded-[2rem] p-5 border border-gray-100 dark:border-white/5 shadow-sm ${employee.isActive === false ? 'opacity-50' : ''}`}>
      <div className="flex items-start gap-4">
        <div className="relative">
          <img
            src={employee.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=135bec&color=fff`}
            alt={employee.name}
            className="h-16 w-16 rounded-2xl object-cover"
          />
          {employee.isActive !== false && (
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-white dark:border-surface-dark" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-black text-slate-900 dark:text-white truncate">
              {employee.name}
            </h3>
            {employee.isActive === false && (
              <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/5 text-[8px] font-bold text-gray-400 uppercase">
                Неактивен
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            {employee.position || employee.role}
          </p>
          <div className="flex items-center gap-3 text-xs">
            {employee.department && (
              <span className="px-2 py-1 rounded-lg bg-primary/10 text-primary font-bold">
                {employee.department}
              </span>
            )}
            <span className="text-gray-400">
              <Icon name="task" className="text-[14px] inline mr-1" />
              {employee.activeTasks} задач
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={onEdit}
            className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 hover:text-primary active:scale-90 transition-all"
          >
            <Icon name="edit" className="text-[18px]" />
          </button>
          <button
            onClick={onDelete}
            className="h-10 w-10 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-100 active:scale-90 transition-all"
          >
            <Icon name="person_off" className="text-[18px]" />
          </button>
        </div>
      </div>

      {/* Contact Info */}
      {(employee.phone || employee.email) && (
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
          {employee.phone && (
            <a href={`tel:${employee.phone}`} className="flex items-center gap-2 text-xs text-gray-500 hover:text-primary">
              <Icon name="phone" className="text-[16px]" />
              {employee.phone}
            </a>
          )}
          {employee.email && (
            <a href={`mailto:${employee.email}`} className="flex items-center gap-2 text-xs text-gray-500 hover:text-primary truncate">
              <Icon name="mail" className="text-[16px]" />
              {employee.email}
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default StaffScreen;
