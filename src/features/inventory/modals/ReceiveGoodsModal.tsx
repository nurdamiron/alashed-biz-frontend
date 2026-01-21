import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '@/shared/components';
import { useAppContext } from '@/shared/context/AppContext';

const ReceiveGoodsModal = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { products, suppliers, receiveGoods } = useAppContext();

  const preselectedProductId = searchParams.get('productId');

  const [formData, setFormData] = useState({
    productId: preselectedProductId || '',
    supplierId: '',
    quantity: '',
    documentNumber: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [supplierSearch, setSupplierSearch] = useState('');

  const activeProducts = products;
  const activeSuppliers = suppliers.filter(s => s.isActive !== false);

  const filteredProducts = activeProducts.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.sku?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredSuppliers = activeSuppliers.filter(s =>
    s.name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
    s.tin?.toLowerCase().includes(supplierSearch.toLowerCase())
  );

  const selectedProduct = products?.find(p => p.id === formData.productId);
  const selectedSupplier = suppliers?.find(s => s.id === formData.supplierId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId || !formData.supplierId || !formData.quantity) return;

    const quantity = parseInt(formData.quantity, 10);
    if (isNaN(quantity) || quantity <= 0) return;

    setIsSubmitting(true);
    try {
      await receiveGoods(
        formData.productId,
        quantity,
        formData.supplierId,
        formData.documentNumber || undefined,
        formData.notes || undefined
      );
      navigate('/inventory');
    } catch (error) {
      console.error('Failed to receive goods:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
      <header className="sticky top-0 z-20 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-xl px-6 py-4 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/inventory')}
            className="h-10 w-10 rounded-xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 flex items-center justify-center active:scale-90 transition-all"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
          <h1 className="text-lg font-black text-slate-900 dark:text-white">
            Приемка товара
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar px-6 py-6 pb-40">
        <div className="space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="h-24 w-24 rounded-3xl bg-emerald-500/10 flex items-center justify-center shadow-xl">
              <Icon name="inventory_2" className="text-[48px] text-emerald-500" />
            </div>
          </div>

          {/* Product Selection */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Товар *
            </label>
            {selectedProduct ? (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon name="inventory" className="text-[24px] text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900 dark:text-white">{selectedProduct.name}</p>
                  <p className="text-xs text-gray-500">
                    SKU: {selectedProduct.sku} | Остаток: {selectedProduct.stock} {selectedProduct.unit}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, productId: '' })}
                  className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center"
                >
                  <Icon name="close" className="text-[16px] text-gray-500" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Поиск товара..."
                    className="w-full h-12 pl-11 pr-4 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto rounded-2xl border border-gray-100 dark:border-white/5 divide-y divide-gray-100 dark:divide-white/5">
                  {filteredProducts.slice(0, 5).map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, productId: product.id });
                        setProductSearch('');
                      }}
                      className="w-full flex items-center gap-3 p-3 bg-white dark:bg-surface-dark hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon name="inventory" className="text-[20px] text-primary" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{product.name}</p>
                        <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                      </div>
                      <p className="text-xs font-bold text-gray-400">{product.stock} {product.unit}</p>
                    </button>
                  ))}
                  {filteredProducts.length === 0 && (
                    <div className="p-4 text-center text-sm text-gray-400">
                      Товары не найдены
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Supplier Selection */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Поставщик *
            </label>
            {selectedSupplier ? (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5">
                <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <Icon name="store" className="text-[24px] text-orange-500" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900 dark:text-white">{selectedSupplier.name}</p>
                  {selectedSupplier.tin && (
                    <p className="text-xs text-gray-500">БИН: {selectedSupplier.tin}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, supplierId: '' })}
                  className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center"
                >
                  <Icon name="close" className="text-[16px] text-gray-500" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]" />
                  <input
                    type="text"
                    value={supplierSearch}
                    onChange={(e) => setSupplierSearch(e.target.value)}
                    placeholder="Поиск поставщика..."
                    className="w-full h-12 pl-11 pr-4 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto rounded-2xl border border-gray-100 dark:border-white/5 divide-y divide-gray-100 dark:divide-white/5">
                  {filteredSuppliers.slice(0, 5).map((supplier) => (
                    <button
                      key={supplier.id}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, supplierId: supplier.id });
                        setSupplierSearch('');
                      }}
                      className="w-full flex items-center gap-3 p-3 bg-white dark:bg-surface-dark hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                        <Icon name="store" className="text-[20px] text-orange-500" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{supplier.name}</p>
                        {supplier.tin && <p className="text-xs text-gray-500">БИН: {supplier.tin}</p>}
                      </div>
                    </button>
                  ))}
                  {filteredSuppliers.length === 0 && (
                    <div className="p-4 text-center text-sm text-gray-400">
                      Поставщики не найдены
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Количество *
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="0"
                min="1"
                className="w-full h-14 px-5 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-xl font-black text-center focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
              {selectedProduct && (
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                  {selectedProduct.unit}
                </span>
              )}
            </div>
          </div>

          {/* Document Number */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Номер документа
            </label>
            <input
              type="text"
              value={formData.documentNumber}
              onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
              placeholder="Накладная №..."
              className="w-full h-14 px-5 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Примечания
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Дополнительная информация..."
              rows={3}
              className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          {/* Summary */}
          {selectedProduct && formData.quantity && parseInt(formData.quantity) > 0 && (
            <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-500/20">
              <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2">
                Итого после приемки
              </p>
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                  {selectedProduct.name}
                </p>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                  {selectedProduct.stock + parseInt(formData.quantity)} {selectedProduct.unit}
                </p>
              </div>
              <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1">
                Было: {selectedProduct.stock} + Приход: {formData.quantity}
              </p>
            </div>
          )}
        </div>
      </form>

      {/* Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-xl border-t border-gray-100 dark:border-white/5">
        <button
          onClick={handleSubmit}
          disabled={!formData.productId || !formData.supplierId || !formData.quantity || parseInt(formData.quantity) <= 0 || isSubmitting}
          className="w-full h-14 rounded-2xl bg-emerald-500 text-white font-black text-base shadow-xl shadow-emerald-500/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Icon name="add_circle" className="text-[20px]" />
              Оприходовать товар
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ReceiveGoodsModal;
