import { useState } from 'react';
import { Icon } from '@/shared/components';
import { useAppContext } from '@/shared/context/AppContext';
import { api } from '@/shared/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AIHubModal = ({ onClose }: { onClose: () => void }) => {
  const { appName, products, orders, stats } = useAppContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const context = `Context: ${products.length} products, ${orders.length} orders, revenue: ${stats.revenue}`;
      const response = await api.ai.chat(`${context}\n\nUser: ${userMessage}`, messages);
      setMessages((prev) => [...prev, { role: 'assistant', content: response.response }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Извините, произошла ошибка. Попробуйте позже.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-black flex flex-col font-sans animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5">
        <button onClick={onClose} className="p-2 opacity-50 hover:opacity-100 transition-opacity">
          <Icon name="close" />
        </button>
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-30">
          {appName} assistant
        </span>
        <div className="w-8"></div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
            <Icon name="smart_toy" className="text-6xl mb-4" />
            <h3 className="text-lg font-bold mb-2">Чем могу помочь?</h3>
            <p className="text-sm text-gray-500">
              Спросите о товарах, заказах или аналитике
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-primary text-white rounded-br-md'
                  : 'bg-gray-100 dark:bg-surface-dark rounded-bl-md'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-surface-dark p-4 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Input */}
      <footer className="p-6 border-t border-gray-100 dark:border-white/5">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Введите сообщение..."
            className="flex-1 h-14 px-6 bg-gray-100 dark:bg-surface-dark rounded-2xl border-none text-sm focus:ring-2 focus:ring-primary/50"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="h-14 w-14 rounded-2xl bg-primary text-white flex items-center justify-center disabled:opacity-50 active:scale-95 transition-all"
          >
            <Icon name="send" />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default AIHubModal;
