import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@/shared/components';
import { useAppContext } from '@/shared/context/AppContext';
import type { AuditLog } from '@/shared/types';

const SPEC_ICONS: Record<string, string> = {
  Возраст: 'child_care',
  Сложность: 'psychology',
  Микроконтроллер: 'memory',
  Питание: 'bolt',
  Дистанция: 'straighten',
  Интерфейс: 'settings_input_component',
  Угол: 'rotate_right',
  Усилие: 'fitness_center',
};

const InventoryDetailScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { products, updateProductStock, getProductLogs } = useAppContext();

  const product = products.find((p) => p.id === id);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [modalType, setModalType] = useState<'in' | 'out' | null>(null);
  const [quantity, setQuantity] = useState<string>('');

  useEffect(() => {
    if (id) {
      getProductLogs(id).then(setLogs);
    }
  }, [id, product?.stock]);

  if (!product)
    return (
      <div className="p-10 text-center dark:text-white font-black uppercase tracking-widest opacity-50">
        Товар не найден
      </div>
    );

  const handleAction = async () => {
    const qty = parseInt(quantity);
    if (qty > 0) {
      const delta = modalType === 'in' ? qty : -qty;
      await updateProductStock(product.id, delta);
    }
    setModalType(null);
    setQuantity('');
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark transition-colors duration-300">
      <header className="sticky top-0 z-30 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
        <div
          className="flex items-center justify-between px-5 pb-3"
          style={{
            paddingTop: 'max(1rem, calc(1rem + env(safe-area-inset-top)))'
          }}
        >
          <button
            onClick={() => navigate('/inventory')}
            className="flex items-center justify-center w-10 h-10 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 shadow-sm text-slate-900 dark:text-white active:scale-90 transition-all"
          >
            <Icon name="arrow_back_ios_new" className="text-[18px]" />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">
              Детали
            </span>
            <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight uppercase">
              Товар
            </h2>
          </div>
          <button
            onClick={() => navigate(`/inventory/${id}/edit`)}
            className="flex items-center justify-center w-10 h-10 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 shadow-sm text-primary active:scale-90 transition-all"
          >
            <Icon name="edit" className="text-[20px]" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar px-5 pt-4 space-y-6 pb-40">
        <div className="flex items-center gap-5">
          <div className="h-28 w-28 rounded-[2rem] bg-white dark:bg-surface-dark p-3 shadow-xl border border-gray-100 dark:border-gray-800 shrink-0">
            <img src={product.img} alt="" className="w-full h-full object-cover rounded-2xl" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-2 truncate">
              {product.name}
            </h1>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-black text-gray-400 uppercase tracking-tighter">
                {product.sku}
              </p>
              <span className="inline-block self-start px-3 py-1 rounded-xl bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                {product.category}
              </span>
            </div>
          </div>
        </div>

        <section className="rounded-[2rem] bg-gradient-to-br from-primary to-blue-600 p-6 text-white shadow-2xl shadow-primary/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Icon name="inventory_2" className="text-[80px]" />
          </div>
          <div className="relative z-10">
            <p className="text-blue-100 text-[10px] font-black mb-2 uppercase tracking-[0.2em]">
              На складе
            </p>
            <div className="flex items-end gap-3">
              <h1 className="text-5xl font-black tracking-tight">{product.stock}</h1>
              <span className="text-lg font-bold mb-1.5 opacity-70 uppercase">
                {product.unit || 'шт'}
              </span>
            </div>
            <div className="mt-6 flex items-center gap-4">
              <div
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 ${
                  product.stock <= product.minStock ? 'bg-red-500/30' : 'bg-white/20'
                }`}
              >
                <Icon
                  name={product.stock <= product.minStock ? 'warning' : 'check_circle'}
                  className="text-[16px]"
                />
                {product.stock <= product.minStock ? 'Мало' : 'В наличии'}
              </div>
              <span className="text-xs text-blue-100 font-bold opacity-70">
                Мин: {product.minStock}
              </span>
            </div>
          </div>
        </section>

        {product.specs && Object.keys(product.specs).length > 0 && (
          <section>
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-1">
              Характеристики
            </h3>
            <div className="bg-white dark:bg-surface-dark rounded-[2rem] p-4 shadow-sm border border-gray-100 dark:border-white/5">
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-white/5"
                  >
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Icon name={SPEC_ICONS[key] || 'info'} className="text-[18px]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider truncate">
                        {key}
                      </p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section>
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-1">
            История Движений
          </h3>
          <div className="bg-white dark:bg-surface-dark rounded-[2rem] p-2 shadow-sm border border-gray-100 dark:border-white/5 divide-y divide-gray-100 dark:divide-white/5">
            {logs.length > 0 ? (
              logs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 rounded-[1.8rem] transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all ${log.delta > 0
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : 'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}
                    >
                      <Icon
                        name={log.delta > 0 ? 'post_add' : 'local_shipping'}
                        className="text-[20px]"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[150px]">
                        {log.reason}
                      </p>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter opacity-70">
                        {new Date(log.timestamp).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-black ${log.delta > 0 ? 'text-emerald-500' : 'text-slate-900 dark:text-white'
                      }`}
                  >
                    {log.delta > 0 ? '+' : ''}
                    {log.delta}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-10 text-center text-gray-400 text-xs font-black uppercase tracking-widest opacity-30">
                Лог пуст
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer Action Buttons */}
      <div className="flex-none p-5 pb-8 bg-background-light dark:bg-background-dark">
        <div className="flex gap-4">
          <button
            onClick={() => setModalType('out')}
            className="flex-1 h-16 rounded-[2rem] border-2 border-gray-200 dark:border-white/10 text-slate-900 dark:text-white font-black text-sm uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Icon name="remove_circle" className="text-[22px]" />
            <span>Списать</span>
          </button>
          <button
            onClick={() => setModalType('in')}
            className="flex-1 h-16 rounded-[2rem] bg-primary text-white font-black text-sm uppercase tracking-wider shadow-2xl shadow-primary/40 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Icon name="add_circle" className="text-[22px]" />
            <span>Приход</span>
          </button>
        </div>
      </div>

      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-sm bg-white dark:bg-surface-dark rounded-[2rem] p-6 shadow-2xl border border-gray-100 dark:border-white/5">
            <div className="flex flex-col items-center mb-6">
              <div
                className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-4 ${
                  modalType === 'in'
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : 'bg-red-500/10 text-red-500'
                }`}
              >
                <Icon
                  name={modalType === 'in' ? 'add_circle' : 'remove_circle'}
                  className="text-[32px]"
                />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {modalType === 'in' ? 'Приемка товара' : 'Списание товара'}
              </h3>
            </div>
            <div className="relative mb-6">
              <input
                type="number"
                autoFocus
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full h-20 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl text-center text-4xl font-black text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="0"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setModalType(null);
                  setQuantity('');
                }}
                className="flex-1 h-14 rounded-2xl font-bold text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 active:scale-95 transition-all"
              >
                Отмена
              </button>
              <button
                onClick={handleAction}
                disabled={!quantity || parseInt(quantity) <= 0}
                className={`flex-1 h-14 rounded-2xl font-bold text-sm text-white shadow-xl transition-all active:scale-95 disabled:opacity-30 ${
                  modalType === 'in' ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-red-500 shadow-red-500/30'
                }`}
              >
                Подтвердить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryDetailScreen;
