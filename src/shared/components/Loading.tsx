const Loading = () => {
  // Get theme from localStorage or system preference (no context dependency)
  const isDark =
    localStorage.getItem('alash_theme') === 'dark' ||
    (!localStorage.getItem('alash_theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center transition-colors duration-500"
      style={{ backgroundColor: isDark ? '#000000' : '#fcfcfd' }}
    >
      {/* Animated Background Pulse */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/2 left-1/2 w-[500px] h-[500px] rounded-full blur-[128px] -translate-x-1/2 -translate-y-1/2 animate-pulse ${
          isDark ? 'bg-blue-500/30' : 'bg-blue-500/40'
        }`} />
        <div className={`absolute top-1/2 left-1/2 w-96 h-96 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 animate-ping ${
          isDark ? 'bg-cyan-500/20' : 'bg-cyan-500/30'
        }`} />
        <div className={`absolute top-1/2 left-1/2 w-80 h-80 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 animate-pulse ${
          isDark ? 'bg-indigo-500/25' : 'bg-indigo-500/35'
        }`} style={{ animationDelay: '-1s' }} />
      </div>

      {/* Logo with Pulse Animation */}
      <div className="relative z-10">
        <div className="animate-pulse">
          <img
            src={isDark ? '/logo-dark.png' : '/logo-light.png'}
            alt="Alashed"
            className="h-32 w-auto drop-shadow-2xl"
          />
        </div>
      </div>
    </div>
  );
};

export default Loading;
