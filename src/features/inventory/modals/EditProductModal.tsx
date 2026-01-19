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
    <div className="bg-background-light dark:bg-background-dark font-display antialiased text-gray-900 dark:text-white h-screen flex flex-col overflow-hidden z-50 absolute inset-0">
      <div className="shrink-0 pt-4 pb-2 px-4 bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-border-dark flex items-center justify-between z-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-gray-500 dark:text-gray-400"
        >
          <Icon name="close" className="text-[28px]" />
        </button>
        <h1 className="text-lg font-bold tracking-tight">Редактирование</h1>
        <button
          onClick={handleSave}
          className="text-primary font-semibold text-base px-2 hover:opacity-80 transition-opacity"
        >
          Готово
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        <div className="p-4 space-y-6 max-w-lg mx-auto w-full">
          <div className="space-y-4">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Основная информация
            </p>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Название товара
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full rounded-lg bg-white dark:bg-surface-dark border-gray-300 dark:border-border-dark text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent py-3 px-4 transition-all"
                type="text"
              />
            </div>
            <div className="flex gap-4">
              <div className="space-y-1.5 flex-1 min-w-0 relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Артикул</label>
                <div className="relative">
                  <input
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="block w-full rounded-lg bg-white dark:bg-surface-dark border-gray-300 dark:border-border-dark text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent py-3 pl-4 pr-10 transition-all"
                    type="text"
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors">
                    <Icon name="barcode_scanner" className="text-[20px]" />
                  </button>
                </div>
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Категория</label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="block w-full appearance-none rounded-lg bg-white dark:bg-surface-dark border-gray-300 dark:border-border-dark text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent py-3 pl-4 pr-10 transition-all"
                  >
                    <option>Наборы</option>
                    <option>Контроллеры</option>
                    <option>Датчики</option>
                    <option>Моторы</option>
                    <option>Корпуса</option>
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Icon name="expand_more" className="text-[20px]" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {currentSpecs.length > 0 && (
            <>
              <div className="h-px bg-gray-200 dark:bg-border-dark w-full"></div>
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Характеристики: {category}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {currentSpecs.map((spec) => (
                    <div key={spec.key} className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {spec.label}
                      </label>
                      <input
                        value={specs[spec.key] || ''}
                        onChange={(e) => handleSpecChange(spec.key, e.target.value)}
                        className="block w-full rounded-lg bg-white dark:bg-surface-dark border-gray-300 dark:border-border-dark text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent py-3 px-4"
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
              <div className="h-px bg-gray-200 dark:bg-border-dark w-full"></div>
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
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
                        className="flex items-center justify-between bg-white dark:bg-surface-dark p-3 rounded-lg border border-gray-100 dark:border-border-dark"
                      >
                        <div className="flex items-center gap-3">
                          <img src={prod.img} className="w-8 h-8 rounded object-cover" alt="" />
                          <span className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[120px]">
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
                          <span className="text-sm font-black w-6 text-center">{item.quantity}</span>
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

          <div className="h-px bg-gray-200 dark:bg-border-dark w-full"></div>

          <div className="space-y-4">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Цены и Запасы
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Цена закупа
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    ₸
                  </span>
                  <input
                    value={priceBuy}
                    onChange={(e) => setPriceBuy(e.target.value)}
                    className="block w-full rounded-lg bg-white dark:bg-surface-dark border-gray-300 dark:border-border-dark text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent py-3 pl-8 pr-4 transition-all"
                    type="number"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Цена продажи
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    ₸
                  </span>
                  <input
                    value={priceSell}
                    onChange={(e) => setPriceSell(e.target.value)}
                    className="block w-full rounded-lg bg-white dark:bg-surface-dark border-gray-300 dark:border-border-dark text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent py-3 pl-8 pr-4 transition-all"
                    type="number"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Мин. остаток
                </label>
                <input
                  value={minStock}
                  onChange={(e) => setMinStock(e.target.value)}
                  className="block w-full rounded-lg bg-white dark:bg-surface-dark border-gray-300 dark:border-border-dark text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent py-3 px-4 transition-all"
                  type="number"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="shrink-0 p-4 pb-8 bg-background-light dark:bg-background-dark border-t border-gray-200 dark:border-border-dark absolute bottom-0 left-0 w-full z-20 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
        <button
          onClick={handleSave}
          className="w-full bg-primary text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          <Icon name="save" className="text-[20px]" />
          <span>Сохранить изменения</span>
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
