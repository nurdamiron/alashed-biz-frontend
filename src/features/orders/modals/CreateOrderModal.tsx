import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/shared/components';
import { useAppContext } from '@/shared/context/AppContext';
import { api } from '@/shared/lib/api';
import { validatePhone, handlePhoneInput } from '@/shared/lib/validators';
import type { Product, OrderItem } from '@/shared/types';

interface InternalOrderItem {
  product: Product;
  quantity: number;
}

type DeliveryOption = 'pickup' | 'courier';
type OrderSource = 'Kaspi' | 'Instagram' | 'Сайт' | 'WhatsApp';

const SOURCES: { id: OrderSource; label: string; img: string; color: string }[] = [
  {
    id: 'Kaspi',
    label: 'Kaspi',
    img: 'https://upload.wikimedia.org/wikipedia/commons/f/f3/Kaspi.kz_logo.png',
    color: 'bg-[#F14635]',
  },
  {
    id: 'Instagram',
    label: 'Insta',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/600px-Instagram_icon.png',
    color: 'bg-[#E4405F]',
  },
  {
    id: 'WhatsApp',
    label: 'WA',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/600px-WhatsApp.svg.png',
    color: 'bg-[#25D366]',
  },
  {
    id: 'Сайт',
    label: 'Сайт',
    img: 'https://cdn-icons-png.flaticon.com/512/1006/1006771.png',
    color: 'bg-primary',
  },
];

const CreateOrderModal = () => {
  const navigate = useNavigate();
  const { addOrder, formatPrice, products } = useAppContext();

  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | undefined>();
  const [address] = useState('');
  const [source, setSource] = useState<OrderSource>('Kaspi');
  const [deliveryType] = useState<DeliveryOption>('pickup');
  const [selectedItems, setSelectedItems] = useState<InternalOrderItem[]>([]);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handlePhoneChange = (value: string) => {
    const formatted = handlePhoneInput(value);
    setPhone(formatted);

    // Validate
    const validation = validatePhone(formatted);
    setPhoneError(validation.error);
  };

  const totalAmount = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.product.priceSell * item.quantity, 0),
    [selectedItems]
  );

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults(Array.isArray(products) ? products.slice(0, 20) : []);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await api.inventory.search(searchQuery);
        setSearchResults(results);
      } catch (e) {
        console.error('Search failed', e);
        setSearchResults(
          Array.isArray(products) ? products.filter(
            (p) =>
              p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.sku.toLowerCase().includes(searchQuery.toLowerCase())
          ) : []
        );
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, products]);

  const addItem = (product: Product) => {
    setSelectedItems((prev) => {
      const exists = prev.find((i) => i.product.id === product.id);
      if (exists) {
        // Check stock limit
        const currentQty = exists.quantity;
        if (currentQty >= product.stock) {
          return prev; // Don't exceed stock
        }
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: Math.min(i.quantity + 1, product.stock) } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setShowProductPicker(false);
  };

  const handleSave = async () => {
    if (!clientName || selectedItems.length === 0 || phoneError) return;

    const structuredItems: OrderItem[] = selectedItems.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      priceAtOrder: item.product.priceSell,
    }));

    await addOrder({
      id: '',
      client: clientName,
      phone,
      amount: totalAmount,
      status: 'Ожидание',
      date: new Date().toISOString(),
      desc: selectedItems.map((i) => `${i.product.name} x${i.quantity}`).join(', '),
      source: source,
      img: selectedItems[0]?.product.img || '',
      items: structuredItems,
      total_amount: totalAmount,
      delivery_address: address,
      delivery_type: deliveryType,
    } as any);
    navigate(-1);
  };

  return (
    <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark overflow-hidden z-50">
      <header className="px-5 py-4 flex items-center justify-between border-b dark:border-gray-800 bg-white dark:bg-surface-dark">
        <button onClick={() => navigate(-1)} className="p-2">
          <Icon name="close" />
        </button>
        <h2 className="font-black uppercase text-sm">Новый заказ</h2>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 overflow-y-auto p-5 space-y-8 pb-32">
        <section className="space-y-4">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Источник и клиент
          </label>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {SOURCES.map((s) => (
              <button
                key={s.id}
                onClick={() => setSource(s.id)}
                className={`flex-1 min-w-[80px] p-4 rounded-2xl border transition-all ${
                  source === s.id
                    ? 'border-primary bg-primary/10'
                    : 'bg-white dark:bg-surface-dark border-transparent'
                }`}
              >
                <img src={s.img} className="h-8 w-8 object-contain mx-auto mb-2" alt="" />
                <p className="text-[10px] font-black text-center">{s.label}</p>
              </button>
            ))}
          </div>
          <input
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="ФИО Клиента"
            className="w-full h-14 rounded-2xl bg-white dark:bg-surface-dark border-none px-5 font-bold"
          />
          <div>
            <input
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="+7 700 123 45 67"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              aria-invalid={!!phoneError}
              aria-describedby={phoneError ? 'phone-error' : undefined}
              className={`w-full h-14 rounded-2xl bg-white dark:bg-surface-dark border-2 px-5 font-bold transition-colors ${
                phoneError
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-transparent focus:border-primary'
              }`}
            />
            {phoneError && (
              <p id="phone-error" className="text-xs text-red-500 font-medium mt-1 ml-2">
                {phoneError}
              </p>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Товары
            </label>
            <button
              onClick={() => setShowProductPicker(true)}
              className="text-primary text-[10px] font-black uppercase tracking-widest"
            >
              Добавить +
            </button>
          </div>
          {selectedItems.map((item) => (
            <div
              key={item.product.id}
              className="bg-white dark:bg-surface-dark p-4 rounded-2xl flex gap-4 items-center border border-gray-100 dark:border-white/5"
            >
              <img src={item.product.img} className="h-12 w-12 rounded-xl object-cover" alt="" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black truncate">{item.product.name}</p>
                <p className="text-xs text-primary font-black">{formatPrice(item.product.priceSell)}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    setSelectedItems((prev) =>
                      prev.map((i) =>
                        i.product.id === item.product.id
                          ? { ...i, quantity: Math.max(1, i.quantity - 1) }
                          : i
                      )
                    )
                  }
                  aria-label="Уменьшить количество"
                  className="h-11 w-11 rounded-lg bg-gray-100 dark:bg-white/5 touch-target flex items-center justify-center"
                >
                  <Icon name="remove" />
                </button>
                <span className="font-black min-w-[2rem] text-center">{item.quantity}</span>
                <button
                  onClick={() =>
                    setSelectedItems((prev) =>
                      prev.map((i) =>
                        i.product.id === item.product.id
                          ? { ...i, quantity: Math.min(i.quantity + 1, item.product.stock) }
                          : i
                      )
                    )
                  }
                  disabled={item.quantity >= item.product.stock}
                  aria-label="Увеличить количество"
                  className="h-11 w-11 rounded-lg bg-primary text-white touch-target flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon name="add" />
                </button>
              </div>
              {item.quantity >= item.product.stock && (
                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-1">
                  Макс. кол-во на складе
                </p>
              )}
            </div>
          ))}
        </section>

        <section className="bg-primary p-6 rounded-[2rem] text-white">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Итого к оплате</p>
          <h2 className="text-4xl font-black">{formatPrice(totalAmount)}</h2>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 w-full p-6 bg-white dark:bg-background-dark border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={handleSave}
          disabled={!clientName || selectedItems.length === 0 || !!phoneError}
          className="w-full h-16 bg-blue-500 text-white font-bold rounded-2xl shadow-xl shadow-primary/30 disabled:opacity-30 touch-target"
        >
          Создать заказ
        </button>
      </div>

      {showProductPicker && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md flex items-end">
          <div className="w-full bg-background-light dark:bg-surface-dark rounded-t-[3rem] h-[80vh] flex flex-col p-6 animate-in slide-in-from-bottom-full duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-xl">Каталог</h3>
              <button onClick={() => setShowProductPicker(false)}>
                <Icon name="close" />
              </button>
            </div>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск..."
              className="w-full h-12 rounded-xl bg-white dark:bg-background-dark border-none px-4 mb-4"
            />
            <div className="flex-1 overflow-y-auto space-y-2">
              {isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                searchResults.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addItem(p)}
                    className="w-full flex gap-4 p-4 bg-white dark:bg-background-dark rounded-2xl items-center text-left"
                  >
                    <img src={p.img} className="h-10 w-10 rounded-lg object-cover" alt="" />
                    <div className="flex-1">
                      <p className="text-sm font-black">{p.name}</p>
                      <p className="text-[10px] font-bold text-gray-400">{p.sku}</p>
                    </div>
                    <Icon name="add_circle" className="text-primary" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateOrderModal;
