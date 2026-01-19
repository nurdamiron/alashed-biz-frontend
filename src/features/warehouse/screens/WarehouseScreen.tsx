import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, PullToRefresh } from '@/shared/components';
import { api } from '@/shared/lib/api';
import toast from 'react-hot-toast';

interface WarehouseLocation {
  id: number;
  code: string;
  name?: string;
  zone?: string;
  aisle?: string;
  rack?: string;
  shelf?: string;
  capacity?: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

const WarehouseScreen = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<WarehouseLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadLocations();
  }, [showInactive]);

  const loadLocations = async () => {
    setIsLoading(true);
    try {
      const data = await api.warehouse.getLocations(showInactive ? undefined : true);
      setLocations(data);
    } catch (error) {
      console.error('Failed to load locations:', error);
      toast.error('Ошибка загрузки локаций');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLocations = locations.filter((loc) =>
    loc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.zone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedByZone = filteredLocations.reduce((acc, loc) => {
    const zone = loc.zone || 'Без зоны';
    if (!acc[zone]) acc[zone] = [];
    acc[zone].push(loc);
    return acc;
  }, {} as Record<string, WarehouseLocation[]>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-background-light dark:bg-background-dark">
        <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark transition-colors duration-300">
      <header className="sticky top-0 z-20 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-xl pt-8 px-6 pb-4 transition-colors">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">
              Warehouse
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              СКЛАД
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowInactive(!showInactive)}
              className={`h-12 w-12 rounded-2xl border shadow-sm active:scale-90 transition-all ${
                showInactive
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white dark:bg-surface-dark border-gray-100 dark:border-white/5 text-slate-900 dark:text-white'
              }`}
            >
              <Icon name={showInactive ? 'visibility' : 'visibility_off'} className="text-[22px]" />
            </button>
            <button
              onClick={loadLocations}
              className="h-12 w-12 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 flex items-center justify-center active:scale-90 transition-all"
            >
              <Icon name="refresh" className="text-[22px]" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по коду, названию, зоне..."
            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 border border-gray-100 dark:border-white/5">
            <p className="text-2xl font-black text-slate-900 dark:text-white">{locations.filter(l => l.isActive).length}</p>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Активных</p>
          </div>
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 border border-gray-100 dark:border-white/5">
            <p className="text-2xl font-black text-primary">{Object.keys(groupedByZone).length}</p>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Зон</p>
          </div>
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 border border-gray-100 dark:border-white/5">
            <p className="text-2xl font-black text-emerald-500">{locations.reduce((sum, l) => sum + (l.capacity || 0), 0)}</p>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Емкость</p>
          </div>
        </div>
      </header>

      <PullToRefresh onRefresh={loadLocations} className="flex-1 overflow-y-auto no-scrollbar px-6 pt-4 pb-40">
        <div className="space-y-6">
          {Object.entries(groupedByZone).map(([zone, locs]) => (
            <div key={zone}>
              <div className="flex items-center gap-2 mb-3">
                <Icon name="grid_view" className="text-[18px] text-primary" />
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase">{zone}</h2>
                <span className="text-xs text-gray-400">({locs.length})</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {locs.map((loc) => (
                  <LocationCard key={loc.id} location={loc} />
                ))}
              </div>
            </div>
          ))}
          {filteredLocations.length === 0 && (
            <div className="text-center py-20">
              <Icon name="warehouse" className="text-[64px] text-gray-300 dark:text-gray-700 mb-4" />
              <p className="text-sm font-bold text-gray-400">Локации не найдены</p>
            </div>
          )}
        </div>
      </PullToRefresh>

      {/* FAB */}
      <button
        onClick={() => navigate('/warehouse/new')}
        className="fixed bottom-32 right-6 h-16 w-16 rounded-[2rem] bg-blue-500 text-white shadow-lg shadow-blue-500/30 flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-40 ring-4 ring-white dark:ring-slate-900"
      >
        <Icon name="add_location" className="text-[32px]" />
      </button>
    </div>
  );
};

const LocationCard: React.FC<{ location: WarehouseLocation }> = ({ location }) => {
  return (
    <div className={`bg-white dark:bg-surface-dark rounded-2xl p-4 border border-gray-100 dark:border-white/5 ${!location.isActive ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon name="location_on" className="text-[20px] text-primary" />
        </div>
        {!location.isActive && (
          <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/5 text-[8px] font-bold text-gray-400 uppercase">
            Неактивна
          </span>
        )}
      </div>
      <h3 className="text-base font-black text-slate-900 dark:text-white mb-1">{location.code}</h3>
      {location.name && (
        <p className="text-xs text-gray-500 mb-2">{location.name}</p>
      )}
      <div className="flex flex-wrap gap-1">
        {location.aisle && (
          <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-500/10 text-[10px] font-bold text-blue-500">
            Ряд {location.aisle}
          </span>
        )}
        {location.rack && (
          <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-500/10 text-[10px] font-bold text-amber-500">
            Стеллаж {location.rack}
          </span>
        )}
        {location.shelf && (
          <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-[10px] font-bold text-emerald-500">
            Полка {location.shelf}
          </span>
        )}
      </div>
      {location.capacity && (
        <p className="text-[10px] text-gray-400 mt-2">Емкость: {location.capacity}</p>
      )}
    </div>
  );
};

export default WarehouseScreen;
