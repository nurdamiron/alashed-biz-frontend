import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/shared/components';
import { useAppContext } from '@/shared/context/AppContext';

const CATEGORY_ICONS: Record<string, string> = {
  Все: 'grid_view',
  Наборы: 'Precision_manufacturing',
  Контроллеры: 'memory',
  Датчики: 'sensors',
  Моторы: 'settings_input_component',
  Корпуса: 'inventory_2',
};

const InventoryScreen = () => {
  const navigate = useNavigate();
  const { products, stats, formatPrice } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Все');
  const [showOnlyLowStock, setShowOnlyLowStock] = useState(false);

  const categories = ['Все', 'Наборы', 'Контроллеры', 'Датчики', 'Моторы', 'Корпуса'];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'Все' || p.category === activeCategory;
    const matchesLowStock = !showOnlyLowStock || p.stock <= p.minStock;
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark transition-colors duration-300">
      <header className="sticky top-0 z-30 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-xl border-b border-transparent dark:border-white/5 transition-colors">
        <div className="flex items-center justify-between px-6 pt-8 pb-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">
              Складской хаб
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              СКЛАД
            </h1>
          </div>
          <button className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 shadow-sm active:scale-90 transition-all">
            <Icon name="qr_code_scanner" className="text-[24px]" />
          </button>
        </div>

        <div className="px-6 pb-4 space-y-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
              <Icon name="search" className="text-[20px]" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-2xl border-none bg-white dark:bg-surface-dark py-4 pl-12 pr-4 text-sm font-bold text-slate-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary/50 shadow-sm transition-all"
              placeholder="Поиск по артикулу или названию..."
            />
          </div>

          <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-2 h-11 shrink-0 rounded-xl px-5 text-[10px] font-black uppercase tracking-widest transition-all border ${
                  activeCategory === cat
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/25'
                    : 'bg-white dark:bg-surface-dark text-gray-400 border-gray-100 dark:border-white/5'
                }`}
              >
                <Icon name={CATEGORY_ICONS[cat] || 'category'} className="text-[18px]" />
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar pb-40 p-6 space-y-4">
        <div className="flex items-center justify-between px-1 mb-2">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
            Список Товаров
          </h3>
          <button
            onClick={() => setShowOnlyLowStock(!showOnlyLowStock)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
              showOnlyLowStock
                ? 'bg-red-500 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-white/5 text-gray-400'
            }`}
          >
            <Icon name="warning" className="text-[14px]" />
            Дефицит: {stats.lowStockCount}
          </button>
        </div>

        {filteredProducts.map((product) => {
          const isLow = product.stock <= product.minStock;
          return (
            <div
              key={product.id}
              onClick={() => navigate(`/inventory/${product.id}`)}
              className="flex flex-col bg-white dark:bg-surface-dark rounded-[2.2rem] p-5 shadow-sm border border-gray-100 dark:border-white/5 active:scale-[0.98] transition-all hover:shadow-xl"
            >
              <div className="flex gap-5">
                <div className="h-20 w-20 rounded-2xl bg-gray-50 dark:bg-background-dark p-2 shrink-0 border border-gray-100 dark:border-white/5 shadow-inner">
                  <img
                    src={product.img}
                    alt=""
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white truncate pr-4">
                      {product.name}
                    </h4>
                    <div
                      className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-tighter ${
                        isLow ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
                      }`}
                    >
                      {isLow ? 'Дефицит' : 'ОК'}
                    </div>
                  </div>

                  <div className="flex items-end justify-between mt-4">
                    <div>
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
                        Цена продажи
                      </p>
                      <p className="text-sm font-black text-slate-900 dark:text-white">
                        {formatPrice(product.priceSell)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
                        На Складе
                      </p>
                      <p
                        className={`text-sm font-black ${
                          isLow ? 'text-red-500' : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {product.stock} {product.unit}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </main>

      <button
        onClick={() => navigate('/create-product')}
        className="fixed bottom-32 right-6 h-16 w-16 rounded-[2rem] bg-primary text-white shadow-2xl shadow-primary/40 flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-40 border-4 border-white dark:border-background-dark"
      >
        <Icon name="add_box" className="text-[32px]" />
      </button>
    </div>
  );
};

export default InventoryScreen;
