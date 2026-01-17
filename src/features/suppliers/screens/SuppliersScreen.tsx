import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/shared/components';
import { useAppContext } from '@/shared/context/AppContext';
import type { Supplier } from '@/shared/types';

const SuppliersScreen = () => {
  const navigate = useNavigate();
  const { suppliers, deleteSupplier } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  const filteredSuppliers = Array.isArray(suppliers) ? suppliers.filter((sup) => {
    const matchesSearch = sup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sup.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sup.tin?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesActive = showInactive ? true : sup.isActive !== false;
    return matchesSearch && matchesActive;
  }) : [];

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Деактивировать поставщика "${name}"?`)) {
      await deleteSupplier(id);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark transition-colors duration-300">
      <header className="sticky top-0 z-20 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-xl pt-8 px-6 pb-4 transition-colors">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">
              Supply Chain
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              ПОСТАВЩИКИ
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
            placeholder="Поиск по названию, БИН/ИИН..."
            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 border border-gray-100 dark:border-white/5">
            <p className="text-2xl font-black text-slate-900 dark:text-white">{Array.isArray(suppliers) ? suppliers.filter(s => s.isActive !== false).length : 0}</p>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Активных</p>
          </div>
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 border border-gray-100 dark:border-white/5">
            <p className="text-2xl font-black text-gray-400">{Array.isArray(suppliers) ? suppliers.filter(s => s.isActive === false).length : 0}</p>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Неактивных</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar px-6 pt-4 pb-40">
        <div className="space-y-4">
          {filteredSuppliers.map((supplier) => (
            <SupplierCard
              key={supplier.id}
              supplier={supplier}
              onEdit={() => navigate(`/suppliers/${supplier.id}/edit`)}
              onDelete={() => handleDelete(supplier.id, supplier.name)}
            />
          ))}
          {filteredSuppliers.length === 0 && (
            <div className="text-center py-20">
              <Icon name="local_shipping" className="text-[64px] text-gray-300 dark:text-gray-700 mb-4" />
              <p className="text-sm font-bold text-gray-400">Поставщики не найдены</p>
            </div>
          )}
        </div>
      </main>

      {/* FAB */}
      <button
        onClick={() => navigate('/suppliers/new')}
        className="fixed bottom-32 right-6 h-16 w-16 rounded-[2rem] bg-blue-500 text-white shadow-lg shadow-blue-500/30 flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-40 ring-4 ring-white dark:ring-slate-900"
      >
        <Icon name="add_business" className="text-[32px]" />
      </button>
    </div>
  );
};

const SupplierCard: React.FC<{
  supplier: Supplier;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ supplier, onEdit, onDelete }) => {
  return (
    <div className={`bg-white dark:bg-surface-dark rounded-[2rem] p-5 border border-gray-100 dark:border-white/5 shadow-sm ${supplier.isActive === false ? 'opacity-50' : ''}`}>
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Icon name="store" className="text-[28px] text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-black text-slate-900 dark:text-white truncate">
              {supplier.name}
            </h3>
            {supplier.isActive === false && (
              <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/5 text-[8px] font-bold text-gray-400 uppercase">
                Неактивен
              </span>
            )}
          </div>
          {supplier.tin && (
            <p className="text-xs font-medium text-gray-400 mb-2">
              БИН/ИИН: {supplier.tin}
            </p>
          )}
          {supplier.contactPerson && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Icon name="person" className="text-[14px]" />
              {supplier.contactPerson}
            </div>
          )}
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
            <Icon name="block" className="text-[18px]" />
          </button>
        </div>
      </div>

      {/* Contact Info */}
      {(supplier.phone || supplier.email || supplier.address) && (
        <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
          {supplier.phone && (
            <a href={`tel:${supplier.phone}`} className="flex items-center gap-2 text-xs text-gray-500 hover:text-primary">
              <Icon name="phone" className="text-[16px]" />
              {supplier.phone}
            </a>
          )}
          {supplier.email && (
            <a href={`mailto:${supplier.email}`} className="flex items-center gap-2 text-xs text-gray-500 hover:text-primary truncate">
              <Icon name="mail" className="text-[16px]" />
              {supplier.email}
            </a>
          )}
          {supplier.address && (
            <span className="flex items-center gap-2 text-xs text-gray-500">
              <Icon name="location_on" className="text-[16px]" />
              {supplier.address}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default SuppliersScreen;
