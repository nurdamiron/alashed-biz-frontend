import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/shared/components';
import { useAppContext } from '@/shared/context/AppContext';
import type { KitComponent } from '@/shared/types';

const CreateProductModal = () => {
  const navigate = useNavigate();
  const { addProduct, products, formatPrice } = useAppContext();

  // Сохраненная категория из localStorage
  const savedCategory = localStorage.getItem('alash_last_category') || '';

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState(savedCategory);
  const [unit, setUnit] = useState('шт');
  const [priceBuy, setPriceBuy] = useState('');
  const [priceSell, setPriceSell] = useState('');
  const [minStock, setMinStock] = useState('5');
  const [isKit, setIsKit] = useState(false);
  const [kitItems, setKitItems] = useState<KitComponent[]>([]);
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Рекомендованная цена закупа для комплекта
  const recommendedBuyPrice = useMemo(() => {
    if (!isKit) return 0;
    return kitItems.reduce((acc, item) => {
      const prod = products.find((p) => p.id === item.productId);
      return acc + (prod ? prod.priceBuy * item.quantity : 0);
    }, 0);
  }, [kitItems, products, isKit]);

  const handleSave = () => {
    if (!name || !priceSell) return;

    // Сохраняем категорию для следующего добавления
    if (category) {
      localStorage.setItem('alash_last_category', category);
    }

    addProduct({
      id: Date.now().toString(),
      name,
      sku: sku || `SKU-${Date.now().toString().slice(-6)}`,
      category: category || 'Без категории',
      unit,
      stock: 0,
      minStock: parseInt(minStock) || 0,
      priceBuy: parseFloat(priceBuy) || 0,
      priceSell: parseFloat(priceSell) || 0,
      img: 'https://cdn-icons-png.flaticon.com/512/1006/1006771.png',
      kitComponents: isKit && kitItems.length > 0 ? kitItems : undefined,
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
            return { ...item, quantity: Math.max(0, item.quantity + delta) };
          }
          return item;
        })
        .filter((i) => i.quantity > 0)
    );
  };

  const removeFromKit = (productId: string) => {
    setKitItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const filteredProducts = useMemo(() => {
    return Array.isArray(products)
      ? products.filter(
          (p) =>
            !p.kitComponents &&
            (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      : [];
  }, [products, searchQuery]);

  // Уникальные категории из существующих товаров
  const existingCategories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [products]);

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden">
      {/* Header */}
      <header className="flex-none sticky top-0 z-30 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
        <div
          className="flex items-center justify-between px-5 pb-3"
          style={{ paddingTop: 'max(1rem, calc(1rem + env(safe-area-inset-top)))' }}
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-10 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 shadow-sm text-gray-400 active:scale-90 transition-all"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">
              Склад
            </span>
            <h1 className="text-base font-black text-slate-900 dark:text-white tracking-tight uppercase">
              Новый товар
            </h1>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar px-5 pt-4 space-y-6 pb-40">
        {/* Название */}
        <section className="bg-white dark:bg-surface-dark rounded-[2rem] p-5 border border-gray-100 dark:border-white/5">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
            Название товара *
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Введите название..."
            className="w-full h-14 px-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-base font-medium text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </section>

        {/* SKU и Категория */}
        <section className="bg-white dark:bg-surface-dark rounded-[2rem] p-5 border border-gray-100 dark:border-white/5 space-y-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
              Артикул (SKU)
            </label>
            <input
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="Авто-генерация если пусто"
              className="w-full h-12 px-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-sm font-medium text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
              Категория
            </label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              list="categories"
              placeholder="Введите или выберите..."
              className="w-full h-12 px-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-sm font-medium text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <datalist id="categories">
              {existingCategories.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
              Единица измерения
            </label>
            <div className="flex gap-2">
              {['шт', 'кг', 'м', 'л', 'упак'].map((u) => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    unit === u
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Комплект */}
        <section className="bg-white dark:bg-surface-dark rounded-[2rem] p-5 border border-gray-100 dark:border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Это комплект?</p>
              <p className="text-xs text-gray-400">Товар состоит из других товаров</p>
            </div>
            <button
              onClick={() => setIsKit(!isKit)}
              className={`w-14 h-8 rounded-full relative transition-all ${
                isKit ? 'bg-primary' : 'bg-gray-200 dark:bg-white/10'
              }`}
            >
              <div
                className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all ${
                  isKit ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          {isKit && (
            <div className="pt-4 border-t border-gray-100 dark:border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Состав комплекта
                </span>
                <button
                  onClick={() => setShowItemPicker(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-xl text-xs font-bold active:scale-95 transition-all"
                >
                  <Icon name="add" className="text-[16px]" />
                  Добавить
                </button>
              </div>

              {kitItems.length > 0 ? (
                <div className="space-y-2">
                  {kitItems.map((item) => {
                    const prod = products.find((p) => p.id === item.productId);
                    if (!prod) return null;
                    return (
                      <div
                        key={item.productId}
                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-2xl"
                      >
                        <img src={prod.img} className="h-10 w-10 rounded-xl object-cover" alt="" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {prod.name}
                          </p>
                          <p className="text-xs text-gray-400">{formatPrice(prod.priceBuy)}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateKitQty(item.productId, -1)}
                            className="w-8 h-8 rounded-lg bg-white dark:bg-surface-dark flex items-center justify-center text-gray-400"
                          >
                            <Icon name="remove" className="text-[16px]" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-slate-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateKitQty(item.productId, 1)}
                            className="w-8 h-8 rounded-lg bg-white dark:bg-surface-dark flex items-center justify-center text-primary"
                          >
                            <Icon name="add" className="text-[16px]" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromKit(item.productId)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400"
                        >
                          <Icon name="delete" className="text-[18px]" />
                        </button>
                      </div>
                    );
                  })}
                  {recommendedBuyPrice > 0 && (
                    <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-xl">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        Себестоимость комплекта
                      </span>
                      <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                        {formatPrice(recommendedBuyPrice)}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Icon name="inventory_2" className="text-[40px] text-gray-300 dark:text-gray-600 mb-2" />
                  <p className="text-xs text-gray-400">Добавьте товары в комплект</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Цены */}
        <section className="bg-white dark:bg-surface-dark rounded-[2rem] p-5 border border-gray-100 dark:border-white/5 space-y-4">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
            Цены
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Закупка</label>
              <input
                type="number"
                value={priceBuy}
                onChange={(e) => setPriceBuy(e.target.value)}
                placeholder="0"
                className="w-full h-14 px-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-lg font-bold text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Продажа *</label>
              <input
                type="number"
                value={priceSell}
                onChange={(e) => setPriceSell(e.target.value)}
                placeholder="0"
                className="w-full h-14 px-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-lg font-bold text-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Мин. остаток</label>
            <input
              type="number"
              value={minStock}
              onChange={(e) => setMinStock(e.target.value)}
              placeholder="5"
              className="w-full h-12 px-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-sm font-medium text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <div className="flex-none p-5 pb-8 bg-background-light dark:bg-background-dark">
        <button
          onClick={handleSave}
          disabled={!name || !priceSell}
          className="w-full h-16 rounded-[2rem] bg-primary text-white font-black text-sm uppercase tracking-wider shadow-2xl shadow-primary/40 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-30"
        >
          <Icon name="add_circle" className="text-[22px]" />
          Добавить товар
        </button>
      </div>

      {/* Item Picker Modal */}
      {showItemPicker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-lg bg-white dark:bg-surface-dark rounded-t-[2rem] shadow-2xl border-t border-gray-100 dark:border-white/5 flex flex-col max-h-[80vh]">
            <div className="p-5 border-b border-gray-100 dark:border-white/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Выберите товар
                </h3>
                <button
                  onClick={() => setShowItemPicker(false)}
                  className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400"
                >
                  <Icon name="close" className="text-[20px]" />
                </button>
              </div>
              <div className="relative">
                <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск..."
                  className="w-full h-12 pl-12 pr-4 rounded-xl bg-gray-100 dark:bg-white/5 text-sm text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addItemToKit(p.id)}
                    disabled={kitItems.some((i) => i.productId === p.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all disabled:opacity-30"
                  >
                    <img src={p.img} className="h-12 w-12 rounded-xl object-cover" alt="" />
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.sku} • {formatPrice(p.priceBuy)}</p>
                    </div>
                    <Icon name="add_circle" className="text-[24px] text-primary" />
                  </button>
                ))
              ) : (
                <div className="py-10 text-center text-gray-400">
                  <p className="text-sm">Товары не найдены</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateProductModal;
