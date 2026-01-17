import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@/shared/components';
import { useAppContext } from '@/shared/context/AppContext';

const OrderDetailScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { orders, products, formatPrice, updateOrderStatus } = useAppContext();

  const order = orders.find((o) => o.id === id);
  if (!order) return <div className="p-20 text-center opacity-50">Заказ не найден</div>;

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'Ожидание':
        return { label: 'Подготовка', color: 'bg-orange-500', glow: 'shadow-orange-500/30', step: 1 };
      case 'Отправлено':
        return { label: 'В пути', color: 'bg-primary', glow: 'shadow-primary/30', step: 2 };
      case 'Доставлено':
        return { label: 'Доставлен', color: 'bg-emerald-500', glow: 'shadow-emerald-500/30', step: 3 };
      case 'Отменено':
        return { label: 'Отменен', color: 'bg-red-500', glow: 'shadow-red-500/30', step: 0 };
      default:
        return { label: 'Н/Д', color: 'bg-gray-500', glow: '', step: 0 };
    }
  };

  const statusInfo = getStatusInfo(order.status);

  const openWhatsApp = () => {
    if (order.phone) {
      const phone = order.phone.replace(/\D/g, '');
      const text = encodeURIComponent(
        `Здравствуйте, ${order.client}! Alashed на связи. По поводу вашего заказа ${order.id}.`
      );
      window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
    }
  };

  const timelineSteps = [
    { id: 1, label: 'Принят', icon: 'shopping_basket', active: true },
    { id: 2, label: 'Сборка', icon: 'precision_manufacturing', active: statusInfo.step >= 1 },
    { id: 3, label: 'Логистика', icon: 'local_shipping', active: statusInfo.step >= 2 },
    { id: 4, label: 'Финиш', icon: 'verified', active: statusInfo.step >= 3 },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
      <header className="sticky top-0 z-30 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-xl px-6 py-6 border-b border-gray-200/50 dark:border-white/5 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-12 h-12 rounded-[1.2rem] bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 shadow-sm active:scale-90 transition-all"
        >
          <Icon name="arrow_back_ios_new" className="text-[20px]" />
        </button>
        <div className="text-center">
          <p className="text-[9px] font-black text-primary uppercase tracking-[0.4em] mb-1">
            Детали Заказа
          </p>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
            {order.id}
          </h2>
        </div>
        <div className="w-12"></div>
      </header>

      <main className="flex-1 p-6 space-y-8 pb-48">
        <section className="bg-slate-900 dark:bg-indigo-950 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest block mb-1">
                  Текущий Статус
                </span>
                <div
                  className={`inline-flex px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${statusInfo.color} ${statusInfo.glow}`}
                >
                  {statusInfo.label}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between relative px-2">
              <div className="absolute top-1/2 left-0 w-full h-1.5 bg-white/10 -translate-y-1/2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-1000"
                  style={{ width: `${(statusInfo.step / (timelineSteps.length - 1)) * 100}%` }}
                ></div>
              </div>

              {timelineSteps.map((step) => (
                <div key={step.id} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`h-10 w-10 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 ${
                      step.active
                        ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30 scale-110'
                        : 'bg-slate-800 border-white/10 text-white/20'
                    }`}
                  >
                    <Icon name={step.icon} className="text-[18px]" />
                  </div>
                  <span
                    className={`absolute -bottom-6 whitespace-nowrap text-[8px] font-black uppercase tracking-widest transition-opacity ${
                      step.active ? 'opacity-100 text-blue-300' : 'opacity-30'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
              Данные Клиента
            </h3>
          </div>
          <div className="bg-white dark:bg-surface-dark rounded-[2.5rem] p-6 shadow-sm border border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-5 mb-8">
              <div className="h-24 w-24 rounded-[2.2rem] bg-gray-50 dark:bg-background-dark p-1 border-2 border-primary/20 shrink-0">
                <img
                  src={`https://i.pravatar.cc/150?u=${order.client}`}
                  className="h-full w-full object-cover rounded-[1.8rem]"
                  alt=""
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-2 truncate">
                  {order.client}
                </h4>
                <p className="text-xs text-gray-400 font-bold flex items-center gap-1.5 truncate">
                  <Icon name="phone" className="text-[14px] text-primary" />
                  <span>{order.phone || 'Нет номера'}</span>
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 h-14 rounded-2xl bg-slate-900 dark:bg-white/10 text-white font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 active:scale-95 transition-all">
                <Icon name="call" className="text-[18px]" /> Вызов
              </button>
              <button
                onClick={openWhatsApp}
                className="flex-1 h-14 rounded-2xl bg-[#25D366] text-white font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 active:scale-95 transition-all"
              >
                <Icon name="chat" className="text-[18px]" /> WhatsApp
              </button>
            </div>
          </div>
        </section>

        {order.items && order.items.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                Товары в заказе
              </h3>
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                {order.items.length} шт
              </span>
            </div>
            <div className="bg-white dark:bg-surface-dark rounded-[2.5rem] p-4 shadow-sm border border-gray-100 dark:border-white/5 space-y-3">
              {order.items.map((item, index) => {
                const product = products.find((p) => p.id === item.productId);
                const subtotal = item.quantity * item.priceAtOrder;
                return (
                  <div
                    key={item.productId || index}
                    className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-background-dark rounded-2xl"
                  >
                    <div className="h-12 w-12 rounded-xl bg-white dark:bg-surface-dark flex items-center justify-center border border-gray-100 dark:border-white/5 overflow-hidden shrink-0">
                      {product?.img ? (
                        <img src={product.img} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Icon name="inventory_2" className="text-[20px] text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                        {product?.name || `Товар #${item.productId}`}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {formatPrice(item.priceAtOrder)} x{item.quantity}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-primary">{formatPrice(subtotal)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="bg-white dark:bg-surface-dark rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-white/5">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
            Итоговая Сумма
          </p>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
            {formatPrice(order.amount)}
          </h2>
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2">
            Источник: {order.source}
          </p>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 w-full p-6 pb-12 bg-background-light dark:bg-background-dark z-40">
        <div className="flex gap-4 max-w-sm mx-auto">
          <button
            onClick={() => {
              const next =
                order.status === 'Ожидание'
                  ? 'Отправлено'
                  : order.status === 'Отправлено'
                  ? 'Доставлено'
                  : 'Ожидание';
              updateOrderStatus(order.id, next as any);
            }}
            className="flex-1 h-16 rounded-[1.8rem] bg-blue-500 text-white font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl shadow-primary/40 active:scale-95 transition-all"
          >
            <span>
              {order.status === 'Ожидание' ? 'Начать доставку' : 'Изменить статус'}
            </span>
            <Icon name="arrow_forward" className="text-[22px]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailScreen;
