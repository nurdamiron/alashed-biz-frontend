import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@/shared/components';
import { useAppContext } from '@/shared/context/AppContext';
import type { KitComponent } from '@/shared/types';

const CATEGORY_SPECS: Record<string, { key: string; label: string; placeholder: string }[]> = {
  Наборы: [
    { key: 'Возраст', label: 'Возрастное ограничение', placeholder: '6+' },
    { key: 'Количество деталей', label: 'Количество деталей', placeholder: '100 шт' },
    { key: 'Уровень', label: 'Сложность', placeholder: 'Начинающий' },
  ],
  Контроллеры: [
    { key: 'Микроконтроллер', label: 'Чип', placeholder: 'ATmega328P' },
    { key: 'Питание', label: 'Напряжение питания', placeholder: '5V - 12V' },
    { key: 'Порты', label: 'Кол-во портов I/O', placeholder: '14' },
  ],
  Датчики: [
    { key: 'Дистанция', label: 'Рабочая дистанция', placeholder: '2-400 см' },
    { key: 'Напряжение', label: 'Рабочее напряжение', placeholder: '3.3V / 5V' },
    { key: 'Интерфейс', label: 'Интерфейс', placeholder: 'Digital / Analog / I2C' },
  ],
  Моторы: [
    { key: 'Угол поворота', label: 'Угол', placeholder: '180° / 360°' },
    { key: 'Крутящий момент', label: 'Усилие (кг/см)', placeholder: '1.6 кг' },
    { key: 'Скорость', label: 'Скорость (сек/60°)', placeholder: '0.12' },
  ],
};

const EditProductModal = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { products, updateProduct, formatPrice } = useAppContext();

  const product = products.find((p) => p.id === id);

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Наборы');
  const [priceBuy, setPriceBuy] = useState('');
  const [priceSell, setPriceSell] = useState('');
  const [minStock, setMinStock] = useState('');
  const [specs, setSpecs] = useState<Record<string, string>>({});
  const [kitItems, setKitItems] = useState<KitComponent[]>([]);
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (product) {
      setName(product.name);
      setSku(product.sku);
      setCategory(product.category);
      setPriceBuy(product.priceBuy.toString());
      setPriceSell(product.priceSell.toString());
      setMinStock(product.minStock.toString());
      setSpecs(product.specs || {});
      setKitItems(product.kitComponents || []);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white">
        <p>Товар не найден</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-primary font-bold">
          Назад
        </button>
      </div>
    );
  }

  const handleSpecChange = (key: string, value: string) => {
    setSpecs((prev) => ({ ...prev, [key]: value }));
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

  const handleSave = () => {
    if (!name || !priceSell) return;

    updateProduct({
      ...product,
      name,
      sku,
      category,
      minStock: parseInt(minStock) || 0,
      priceBuy: parseFloat(priceBuy) || 0,
      priceSell: parseFloat(priceSell),
      specs: specs,
      kitComponents: category === 'Наборы' ? kitItems : undefined,
    });
    navigate(-1);
  };

  const filteredProducts = Array.isArray(products) ? products.filter(
    (p) =>
      p.category !== 'Наборы' &&
      (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
  ) : [];

  const currentSpecs = CATEGORY_SPECS[category] || [];

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden">
      {/* Pill indicator */}
      <div className="flex-none pt-3 pb-1 flex justify-center">
        <div className="h-1.5 w-14 rounded-full bg-gray-200 dark:bg-white/10"></div>
      </div>

      <header className="flex-none flex items-center justify-between px-6 pb-4 pt-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-10 h-10 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 shadow-sm text-gray-400 active:scale-90 transition-all"
        >
          <Icon name="close" className="text-[20px]" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">
            Редактирование
          </span>
          <h1 className="text-slate-900 dark:text-white text-lg font-black tracking-tight uppercase">
            Товар
          </h1>
        </div>
        <div className="w-10" />
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-4 pb-48">
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              Основная информация
            </p>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
                Название товара
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-14 px-5 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-base font-medium text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
                type="text"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Артикул</label>
                <div className="relative">
                  <input
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full h-14 pl-5 pr-12 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-base font-medium text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    type="text"
                  />
                  <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors">
                    <Icon name="barcode_scanner" className="text-[20px]" />
                  </button>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Категория</label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-14 appearance-none rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-base font-medium text-slate-900 dark:text-white pl-5 pr-10 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option>Наборы</option>
                    <option>Контроллеры</option>
                    <option>Датчики</option>
                    <option>Моторы</option>
                    <option>Корпуса</option>
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Icon name="expand_more" className="text-[20px]" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {currentSpecs.length > 0 && (
            <>
              <div className="h-px bg-gray-100 dark:bg-white/5 w-full"></div>
              <div className="space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Характеристики: {category}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {currentSpecs.map((spec) => (
                    <div key={spec.key}>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
                        {spec.label}
                      </label>
                      <input
                        value={specs[spec.key] || ''}
                        onChange={(e) => handleSpecChange(spec.key, e.target.value)}
                        className="w-full h-14 px-5 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-base font-medium text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder={spec.placeholder}
                        type="text"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {category === 'Наборы' && (
            <>
              <div className="h-px bg-gray-100 dark:bg-white/5 w-full"></div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    Состав набора
                  </p>
                  <button
                    onClick={() => setShowItemPicker(true)}
                    className="text-primary text-xs font-bold"
                  >
                    + Добавить
                  </button>
                </div>

                <div className="space-y-2 mt-2">
                  {kitItems.map((item) => {
                    const prod = products.find((p) => p.id === item.productId);
                    if (!prod) return null;
                    return (
                      <div
                        key={item.productId}
                        className="flex items-center justify-between bg-white dark:bg-surface-dark p-3 rounded-2xl border border-gray-100 dark:border-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <img src={prod.img} className="w-10 h-10 rounded-xl object-cover" alt="" />
                          <span className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
                            {prod.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateKitQty(item.productId, -1)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Icon name="remove" className="text-[18px]" />
                          </button>
                          <span className="text-sm font-black w-6 text-center text-slate-900 dark:text-white">{item.quantity}</span>
                          <button onClick={() => updateKitQty(item.productId, 1)} className="text-primary">
                            <Icon name="add" className="text-[18px]" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {kitItems.length === 0 && (
                    <p className="text-center text-gray-400 text-xs py-4">Нет компонентов</p>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="h-px bg-gray-100 dark:bg-white/5 w-full"></div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              Цены и Запасы
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
                  Цена закупа
                </label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                    ₸
                  </span>
                  <input
                    value={priceBuy}
                    onChange={(e) => setPriceBuy(e.target.value)}
                    className="w-full h-14 pl-10 pr-5 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-base font-medium text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    type="number"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
                  Цена продажи
                </label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                    ₸
                  </span>
                  <input
                    value={priceSell}
                    onChange={(e) => setPriceSell(e.target.value)}
                    className="w-full h-14 pl-10 pr-5 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-base font-medium text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    type="number"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
                  Мин. остаток
                </label>
                <input
                  value={minStock}
                  onChange={(e) => setMinStock(e.target.value)}
                  className="w-full h-14 px-5 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-base font-medium text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  type="number"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex-none p-6 pb-12 z-10">
        <button
          onClick={handleSave}
          disabled={!name || !priceSell}
          className="group relative flex w-full items-center justify-center h-16 rounded-[2rem] bg-primary overflow-hidden shadow-2xl shadow-primary/40 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
        >
          <div className="relative flex items-center gap-3">
            <span className="text-base font-black text-white uppercase tracking-widest">
              Сохранить изменения
            </span>
            <Icon name="save" className="text-[24px] text-white" />
          </div>
        </button>
      </div>

      {showItemPicker && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-white dark:bg-surface-dark rounded-[3rem] h-[70vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b dark:border-white/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Выбор комплектующих</h3>
                <button onClick={() => setShowItemPicker(false)} className="text-slate-900 dark:text-white">
                  <Icon name="close" />
                </button>
              </div>
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-background-dark border-none text-slate-900 dark:text-white placeholder-gray-400"
                placeholder="Поиск по складу..."
              />
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => addItemToKit(p.id)}
                  className="flex items-center gap-4 p-3 rounded-2xl hover:bg-primary/5 cursor-pointer transition-all border border-transparent hover:border-primary/20"
                >
                  <img src={p.img} className="h-10 w-10 rounded-lg object-cover" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate text-slate-900 dark:text-white">{p.name}</p>
                    <p className="text-[10px] text-gray-400 uppercase">
                      {p.sku} • {formatPrice(p.priceBuy)}
                    </p>
                  </div>
                  <Icon name="add_circle" className="text-primary" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProductModal;
