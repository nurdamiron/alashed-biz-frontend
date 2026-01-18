import { useAppContext } from '@/shared/context/AppContext';
import Icon from './Icon';

interface ThemeToggleProps {
  variant?: 'card' | 'compact' | 'icon-only';
  className?: string;
  showLabel?: boolean;
}

/**
 * ThemeToggle Component
 *
 * A reusable theme toggle component with multiple variants:
 * - card: Full card layout with icon, label, and description
 * - compact: Horizontal layout with icon and toggle
 * - icon-only: Just the toggle switch
 *
 * Features:
 * - Instant localStorage update
 * - Smooth animations
 * - Backend sync (when authenticated)
 * - Mobile-friendly
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'card',
  className = '',
  showLabel = true,
}) => {
  const { theme, toggleTheme } = useAppContext();
  const isDark = theme === 'dark';

  if (variant === 'icon-only') {
    return (
      <button
        onClick={toggleTheme}
        className={`w-14 h-8 rounded-full relative transition-all duration-300 ${
          isDark ? 'bg-blue-500' : 'bg-slate-200'
        } ${className}`}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        <div
          className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transition-all duration-300 ${
            isDark ? 'left-7' : 'left-1'
          }`}
        />
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center justify-between ${className}`}>
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isDark
                ? 'bg-indigo-500/10 text-indigo-400'
                : 'bg-amber-500/10 text-amber-500'
            }`}
          >
            <Icon name={isDark ? 'dark_mode' : 'light_mode'} className="text-xl" />
          </div>
          {showLabel && (
            <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </span>
          )}
        </div>
        <button
          onClick={toggleTheme}
          className={`w-14 h-8 rounded-full relative transition-all duration-300 ${
            isDark ? 'bg-blue-500' : 'bg-slate-200'
          }`}
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
          <div
            className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transition-all duration-300 ${
              isDark ? 'left-7' : 'left-1'
            }`}
          />
        </button>
      </div>
    );
  }

  // Default 'card' variant
  return (
    <section
      className={`rounded-2xl overflow-hidden ${
        isDark
          ? 'bg-slate-800/50 border border-white/5'
          : 'bg-white border border-slate-200/50 shadow-sm'
      } ${className}`}
    >
      <div className="p-5">
        <h3
          className={`text-xs font-semibold uppercase tracking-wider mb-4 ${
            isDark ? 'text-slate-500' : 'text-slate-400'
          }`}
        >
          Appearance
        </h3>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                isDark
                  ? 'bg-indigo-500/10 text-indigo-400'
                  : 'bg-amber-500/10 text-amber-500'
              }`}
            >
              <Icon name={isDark ? 'dark_mode' : 'light_mode'} className="text-2xl" />
            </div>
            <div>
              <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </p>
              <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {isDark ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className={`w-14 h-8 rounded-full relative transition-all duration-300 active:scale-95 ${
              isDark ? 'bg-blue-500' : 'bg-slate-200'
            }`}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            <div
              className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transition-all duration-300 ${
                isDark ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ThemeToggle;
