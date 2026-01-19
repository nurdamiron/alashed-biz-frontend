import { useEffect, useRef } from 'react';
import Icon from './Icon';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) => {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus trap and ESC key handling
  useEffect(() => {
    if (isOpen) {
      confirmRef.current?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: 'warning',
      iconBg: 'bg-red-100 dark:bg-red-500/20',
      iconColor: 'text-red-600 dark:text-red-400',
      confirmBg: 'bg-red-500 hover:bg-red-600',
    },
    warning: {
      icon: 'error',
      iconBg: 'bg-amber-100 dark:bg-amber-500/20',
      iconColor: 'text-amber-600 dark:text-amber-400',
      confirmBg: 'bg-amber-500 hover:bg-amber-600',
    },
    info: {
      icon: 'info',
      iconBg: 'bg-blue-100 dark:bg-blue-500/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      confirmBg: 'bg-blue-500 hover:bg-blue-600',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        <div className="p-6">
          {/* Icon */}
          <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl ${styles.iconBg} flex items-center justify-center`}>
            <Icon name={styles.icon} className={`text-3xl ${styles.iconColor}`} />
          </div>

          {/* Title */}
          <h2
            id="confirm-dialog-title"
            className="text-xl font-black text-center text-slate-900 dark:text-white mb-2"
          >
            {title}
          </h2>

          {/* Message */}
          <p
            id="confirm-dialog-description"
            className="text-sm text-center text-gray-600 dark:text-gray-400 mb-6"
          >
            {message}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 h-12 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-200 dark:hover:bg-slate-700 transition-all active:scale-95 disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              ref={confirmRef}
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 h-12 rounded-xl ${styles.confirmBg} text-white font-bold text-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
