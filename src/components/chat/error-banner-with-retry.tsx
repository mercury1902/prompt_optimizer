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
    <div className="p-4 bg-red-900/20 border-l-4 border-red-500">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-semibold text-red-300">{config.label}</h4>
          <p className="text-sm text-red-400/80 mt-1">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              disabled={isRetrying}
              className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Đang thử lại...' : 'Thử lại'}
            </button>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-400 hover:text-red-300 transition-colors"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
