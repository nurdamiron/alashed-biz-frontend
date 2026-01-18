import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/shared/components';
import { useAppContext } from '@/shared/context/AppContext';
import type { KitComponent } from '@/shared/types';

interface SpecSelectable {
  key: string;
  label: string;
  options: string[];
}

interface SpecInput {
  key: string;
  label: string;
  placeholder: string;
}

interface CategoryConfig {
  selectable?: SpecSelectable[];
  inputs: SpecInput[];
}

const CATEGORY_SPECS_CONFIG: Record<string, CategoryConfig> = {
  Наборы: {
    selectable: [
      { key: 'Возраст', label: 'Возрастная категория', options: ['6+', '10+', '12+', '14+', '18+'] },
      { key: 'Сложность', label: 'Уровень сложности', options: ['Легко', 'Средне', 'Профи'] },
    ],
    inputs: [],
  },
  Контроллеры: {
    inputs: [
      { key: 'Микроконтроллер', label: 'Чип', placeholder: 'ATmega328P' },
      { key: 'Питание', label: 'Напряжение питания', placeholder: '5V - 12V' },
    ],
  },
  Датчики: {
    inputs: [
      { key: 'Дистанция', label: 'Рабочая дистанция', placeholder: '2-400 см' },
      { key: 'Интерфейс', label: 'Интерфейс', placeholder: 'I2C / Digital' },
    ],
  },
  Моторы: {
    inputs: [
      { key: 'Угол', label: 'Угол поворота', placeholder: '180°' },
      { key: 'Усилие', label: 'Крутящий момент', placeholder: '1.6 кг/см' },
    ],
  },
};

const CreateProductModal = () => {
  const navigate = useNavigate();
  const { addProduct, products, formatPrice } = useAppContext();

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Наборы');
  const [unit, setUnit] = useState('шт');
  const [priceBuy, setPriceBuy] = useState('');
  const [priceSell, setPriceSell] = useState('');
  const [minStock, setMinStock] = useState('10');
  const [specs, setSpecs] = useState<Record<string, string>>({});
  const [kitItems, setKitItems] = useState<KitComponent[]>([]);
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const recommendedBuyPrice = useMemo(() => {
    if (category !== 'Наборы') return 0;
    return kitItems.reduce((acc, item) => {
      const prod = products.find((p) => p.id === item.productId);
      return acc + (prod ? prod.priceBuy * item.quantity : 0);
    }, 0);
  }, [kitItems, products, category]);

  useEffect(() => {
    if (category === 'Наборы' && kitItems.length > 0) {
      setPriceBuy(recommendedBuyPrice.toString());
    }
  }, [recommendedBuyPrice, category, kitItems.length]);

  const handleSave = () => {
    if (!name || !priceSell) return;
    addProduct({
      id: Date.now().toString(),
      name,
      sku: sku || `SKU-${Math.floor(Math.random() * 10000)}`,
      category,
      unit,
      stock: 0,
      minStock: parseInt(minStock) || 0,
      priceBuy: parseFloat(priceBuy) || 0,
      priceSell: parseFloat(priceSell) || 0,
      img: 'https://cdn-icons-png.flaticon.com/512/1006/1006771.png',
      specs,
      kitComponents: category === 'Наборы' ? kitItems : undefined,
    });
    navigate(-1);
  };

  const addItemToKit = (productId: string) => {
    setKitItems((prev) => {
      const exists = prev.find((i) => i.productId === productId);
      if (exists) return prev;
      return [...prev, { productId, quantity: 1 }];
    });
    setShowItemPicker(false);
  };

  const updateKitQty = (productId: string, delta: number) => {
    setKitItems((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            return { ...item, quantity: Math.max(0.1, item.quantity + delta) };
          }
          return item;
        })
        .filter((i) => i.quantity > 0)
    );
  };

  const filteredProducts = useMemo(() => {
    return Array.isArray(products) ? products.filter(
      (p) =>
        p.category !== 'Наборы' &&
        (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
    ) : [];
  }, [products, searchQuery]);

  const currentConfig: CategoryConfig = CATEGORY_SPECS_CONFIG[category] || { inputs: [] };

  return (
    <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark overflow-hidden transition-colors">
      <header className="flex-none flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-white/5 bg-white dark:bg-surface-dark">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-gray-400 hover:text-primary transition-colors"
        >
          <Icon name="close" className="text-[28px]" />
        </button>
        <div className="text-center">
          <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">
            Складской реестр
          </p>
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase">
            Новая единица
          </h2>
        </div>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8 pb-40">
        <section className="space-y-4">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
            Основные данные
          </label>
          <div className="bg-white dark:bg-surface-dark rounded-[2.5rem] p-6 shadow-sm border border-gray-100 dark:border-white/5 space-y-5">
            <div className="space-y-1">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Тип и категория
              </span>
              <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                {['Наборы', 'Контроллеры', 'Датчики', 'Моторы', 'Корпуса'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 ${
                      category === cat
                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                        : 'bg-gray-50 dark:bg-background-dark text-gray-400 border-transparent'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-5 flex items-center text-gray-400 group-focus-within:text-primary transition-colors">
                <Icon name="inventory" className="text-[20px]" />
              </div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-14 pl-14 pr-6 rounded-2xl bg-gray-50 dark:bg-background-dark border-none text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/40 transition-all shadow-inner"
                placeholder="Название товара..."
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1 space-y-1">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Артикул SKU
                </span>
                <input
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full h-12 px-5 rounded-2xl bg-gray-50 dark:bg-background-dark border-none text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/40 transition-all shadow-inner"
                  placeholder="Напр: ARD-01"
                />
              </div>
              <div className="w-24 space-y-1">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Ед. изм
                </span>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full h-12 px-4 rounded-2xl bg-gray-50 dark:bg-background-dark border-none text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/40 transition-all shadow-inner appearance-none"
                >
                  <option>шт</option>
                  <option>м</option>
                  <option>кг</option>
                  <option>упак</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {category === 'Наборы' && (
          <section className="space-y-4 animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center justify-between px-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Состав набора (BOM)
              </label>
              <button
                onClick={() => setShowItemPicker(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary rounded-xl text-[9px] font-black uppercase tracking-widest border border-primary/20 hover:bg-primary hover:text-white transition-all"
              >
                <Icon name="add_shopping_cart" className="text-[14px]" />
                <span>Добавить</span>
              </button>
            </div>

            <div className="bg-white dark:bg-surface-dark rounded-[2.5rem] p-4 shadow-sm border border-gray-100 dark:border-white/5 space-y-3">
              {kitItems.length > 0 ? (
                kitItems.map((item) => {
                  const prod = products.find((p) => p.id === item.productId);
                  if (!prod) return null;
                  return (
                    <div
                      key={item.productId}
                      className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-background-dark rounded-2xl border border-transparent dark:border-white/5 group"
                    >
                      <img src={prod.img} className="h-12 w-12 rounded-xl object-cover shadow-sm" alt="" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {prod.name}
                        </p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                          {formatPrice(prod.priceBuy)} / {prod.unit}
                        </p>
                      </div>
                      <div className="flex items-center bg-white dark:bg-surface-dark rounded-xl p-1 shadow-sm border border-gray-100 dark:border-white/5">
                        <button
                          onClick={() => updateKitQty(item.productId, -1)}
                          className="h-7 w-7 flex items-center justify-center text-gray-400 hover:text-red-500"
                        >
                          <Icon name="remove" className="text-[16px]" />
                        </button>
                        <span className="w-10 text-center text-xs font-black text-slate-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateKitQty(item.productId, 1)}
                          className="h-7 w-7 flex items-center justify-center text-primary"
                        >
                          <Icon name="add" className="text-[16px]" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-10 flex flex-col items-center justify-center text-gray-300 dark:text-gray-700 opacity-50">
                  <Icon name="inventory_2" className="text-4xl mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Набор пуст</p>
                </div>
              )}
            </div>
          </section>
        )}

        <section className="space-y-4 animate-in fade-in duration-500">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
            Характеристики ({category})
          </label>
          <div className="bg-white dark:bg-surface-dark rounded-[2.5rem] p-6 shadow-sm border border-gray-100 dark:border-white/5 space-y-6">
            {currentConfig.selectable &&
              currentConfig.selectable.map((sel) => (
                <div key={sel.key} className="space-y-2.5">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    {sel.label}
                  </span>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                    {sel.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setSpecs((prev) => ({ ...prev, [sel.key]: opt }))}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all shrink-0 ${
                          specs[sel.key] === opt
                            ? 'bg-indigo-500 text-white border-indigo-500 shadow-md'
                            : 'bg-gray-50 dark:bg-background-dark text-gray-400 border-transparent'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

            {currentConfig.inputs.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {currentConfig.inputs.map((inp) => (
                  <div key={inp.key} className="space-y-1.5">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      {inp.label}
                    </span>
                    <input
                      value={specs[inp.key] || ''}
                      onChange={(e) => setSpecs((prev) => ({ ...prev, [inp.key]: e.target.value }))}
                      className="w-full h-12 px-5 rounded-2xl bg-gray-50 dark:bg-background-dark border-none text-sm font-bold text-slate-900 dark:text-white transition-all shadow-inner focus:ring-2 focus:ring-primary/40"
                      placeholder={inp.placeholder}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
            Экономика
          </label>
          <div className="bg-white dark:bg-surface-dark rounded-[2.5rem] p-6 shadow-sm border border-gray-100 dark:border-white/5 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    Закуп (₸)
                  </span>
                  {category === 'Наборы' && recommendedBuyPrice > 0 && (
                    <span className="text-[8px] font-black text-emerald-500 uppercase">Реком.</span>
                  )}
                </div>
                <input
                  type="number"
                  value={priceBuy}
                  onChange={(e) => setPriceBuy(e.target.value)}
                  className={`w-full h-14 px-5 rounded-2xl bg-gray-50 dark:bg-background-dark border-2 text-sm font-black text-slate-900 dark:text-white transition-all shadow-inner ${
                    category === 'Наборы' && priceBuy !== recommendedBuyPrice.toString()
                      ? 'border-orange-500/20 ring-2 ring-orange-500/10'
                      : 'border-transparent focus:ring-2 focus:ring-primary/40'
                  }`}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1.5">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Продажа (₸)
                </span>
                <input
                  type="number"
                  value={priceSell}
                  onChange={(e) => setPriceSell(e.target.value)}
                  className="w-full h-14 px-5 rounded-2xl bg-gray-50 dark:bg-background-dark border-none text-sm font-black text-primary transition-all shadow-inner focus:ring-2 focus:ring-primary/40"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Мин. остаток
                </span>
                <input
                  type="number"
                  value={minStock}
                  onChange={(e) => setMinStock(e.target.value)}
                  className="w-full h-12 px-5 rounded-2xl bg-gray-50 dark:bg-background-dark border-none text-sm font-bold text-slate-900 dark:text-white transition-all shadow-inner"
                  placeholder="10"
                />
              </div>
              <div className="flex flex-col justify-end p-2 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/10">
                <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em] mb-1 leading-none">
                  Прибыль / Маржа
                </span>
                <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                  {formatPrice(parseFloat(priceSell) - parseFloat(priceBuy) || 0)}
                  <span className="text-[10px] text-emerald-500 ml-2">
                    ({priceBuy ? Math.round(((parseFloat(priceSell) - parseFloat(priceBuy)) / parseFloat(priceBuy)) * 100) : 0}%)
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <div className="flex-none p-6 pb-12  z-40">
        <button
          onClick={handleSave}
          disabled={!name || !priceSell}
          className="group relative flex w-full items-center justify-center h-16 rounded-[2.2rem] bg-primary overflow-hidden shadow-2xl shadow-primary/40 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
        >
          <div className="relative flex items-center gap-3">
            <span className="text-base font-black text-white uppercase tracking-widest">
              Добавить в базу
            </span>
            <Icon name="check_circle" className="text-[24px] text-white" />
          </div>
        </button>
      </div>

      {showItemPicker && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-300 p-4">
          <div className="w-full max-w-md bg-white dark:bg-surface-dark rounded-[3rem] h-[80vh] flex flex-col shadow-2xl border border-white/10 animate-in slide-in-from-bottom-full duration-500 overflow-hidden">
            <div className="p-8 border-b border-gray-100 dark:border-white/5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Выбор компонентов
                </h3>
                <button
                  onClick={() => setShowItemPicker(false)}
                  className="h-10 w-10 rounded-xl bg-gray-50 dark:bg-background-dark flex items-center justify-center text-gray-400"
                >
                  <Icon name="close" />
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                  <Icon name="search" />
                </span>
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-14 pl-14 pr-6 rounded-2xl bg-gray-50 dark:bg-background-dark border-none text-sm font-bold text-slate-900 dark:text-white shadow-inner"
                  placeholder="Поиск по складу..."
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-2">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => addItemToKit(p.id)}
                  className="flex items-center gap-4 p-4 rounded-[2rem] hover:bg-primary/5 cursor-pointer transition-all border border-transparent hover:border-primary/20 group"
                >
                  <img
                    src={p.img}
                    className="h-14 w-14 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform"
                    alt=""
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-900 dark:text-white truncate">{p.name}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {p.sku} • {formatPrice(p.priceBuy)}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-gray-50 dark:bg-background-dark flex items-center justify-center text-gray-300 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                    <Icon name="add" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateProductModal;
