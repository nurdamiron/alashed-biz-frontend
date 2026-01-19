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

  const filteredEmployees = Array.isArray(employees) ? employees.filter((emp) => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesActive = showInactive ? true : emp.isActive !== false;
    return matchesSearch && matchesActive;
  }) : [];

  const departments = Array.isArray(employees) ? [...new Set(employees.map(e => e.department).filter(Boolean))] : [];

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
            placeholder="Поиск по имени, отделу..."
            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 border border-gray-100 dark:border-white/5">
            <p className="text-2xl font-black text-slate-900 dark:text-white">{Array.isArray(employees) ? employees.filter(e => e.isActive !== false).length : 0}</p>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Активных</p>
          </div>
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 border border-gray-100 dark:border-white/5">
            <p className="text-2xl font-black text-primary">{departments.length}</p>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Отделов</p>
          </div>
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 border border-gray-100 dark:border-white/5">
            <p className="text-2xl font-black text-emerald-500">{Array.isArray(employees) ? employees.reduce((sum, e) => sum + e.activeTasks, 0) : 0}</p>
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
        className="fixed bottom-32 right-6 h-16 w-16 rounded-[2rem] bg-blue-500 text-white shadow-lg shadow-blue-500/30 flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-40 ring-4 ring-white dark:ring-slate-900"
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
    <div className={`bg-white dark:bg-surface-dark rounded-xl p-4 border border-gray-200 dark:border-white/10 hover:shadow-md transition-all ${employee.isActive === false ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="h-14 w-14 rounded-xl overflow-hidden bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
            <span className="text-white font-black text-lg">
              {employee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </span>
          </div>
          {employee.isActive !== false && (
            <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white dark:border-surface-dark" />
          )}
        </div>

        {/* Info Section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
              {employee.name}
            </h3>
            {employee.isActive === false && (
              <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/5 text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Неактивен
              </span>
            )}
          </div>

          {/* Department and Tasks */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {employee.department && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10">
                <Icon name="business" className="text-[14px] text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                  {employee.department}
                </span>
              </div>
            )}

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5">
              <Icon name="task_alt" className="text-[14px] text-slate-600 dark:text-slate-400" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {employee.activeTasks} {employee.activeTasks === 1 ? 'задача' : 'задач'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-blue-600 dark:hover:text-blue-400 active:scale-95 transition-all"
          >
            <Icon name="edit" className="text-[18px]" />
          </button>
          <button
            onClick={onDelete}
            className="h-9 w-9 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 active:scale-95 transition-all"
          >
            <Icon name="person_off" className="text-[18px]" />
          </button>
        </div>
      </div>

      {/* Contact Info */}
      {(employee.phone || employee.email) && (
        <div className="flex items-center gap-4 mt-3.5 pt-3.5 border-t border-gray-100 dark:border-white/5">
          {employee.phone && (
            <a href={`tel:${employee.phone}`} className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <Icon name="phone" className="text-[15px]" />
              <span>{employee.phone}</span>
            </a>
          )}
          {employee.email && (
            <a href={`mailto:${employee.email}`} className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 truncate transition-colors">
              <Icon name="mail" className="text-[15px]" />
              <span className="truncate">{employee.email}</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default StaffScreen;
