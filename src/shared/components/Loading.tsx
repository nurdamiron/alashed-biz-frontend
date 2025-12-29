const Loading = () => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background-light dark:bg-background-dark transition-colors duration-300">
      <div className="relative flex items-center justify-center mb-8 px-10">
        <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping"></div>
        <div className="absolute inset-[-20%] rounded-full bg-primary/5 animate-pulse delay-300"></div>

        <span className="relative z-10 text-3xl font-black tracking-tight text-primary animate-pulse">
          ALASHED
        </span>
      </div>

      <div className="flex flex-col items-center opacity-40">
        <span className="text-[9px] font-black text-primary tracking-[0.4em] uppercase">
          Инициализация Системы
        </span>
      </div>

      <div className="mt-10 flex gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"></div>
      </div>
    </div>
  );
};

export default Loading;
