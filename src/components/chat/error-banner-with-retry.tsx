import React from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  type?: 'network' | 'server' | 'unknown';
  isRetrying?: boolean;
}

export const ErrorBannerWithRetry: React.FC<ErrorBannerProps> = ({
  message,
  onRetry,
  onDismiss,
  type = 'unknown',
  isRetrying = false,
}) => {
  const typeConfig = {
    network: { color: 'orange', label: 'Lỗi kết nối' },
    server: { color: 'red', label: 'Lỗi máy chủ' },
    unknown: { color: 'red', label: 'Đã xảy ra lỗi' },
  };

  const config = typeConfig[type];

  return (
    <div className="border-b border-rose-300/60 bg-rose-50/90 p-4 dark:border-rose-900/60 dark:bg-rose-950/30">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 flex-shrink-0 text-rose-500 dark:text-rose-300" />
        <div className="flex-1">
          <h4 className="font-semibold text-rose-700 dark:text-rose-200">{config.label}</h4>
          <p className="mt-1 text-sm text-rose-600/90 dark:text-rose-300/90">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              disabled={isRetrying}
              className="mt-3 flex min-h-11 items-center gap-2 rounded-lg border border-rose-300/70 bg-rose-100 px-3 py-1.5 text-sm text-rose-700 transition-colors hover:bg-rose-200 disabled:opacity-50 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200 dark:hover:bg-rose-900/60"
            >
              <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Đang thử lại...' : 'Thử lại'}
            </button>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-rose-500 transition-colors hover:bg-rose-100 hover:text-rose-700 dark:text-rose-300 dark:hover:bg-rose-900/60"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
