'use client';

import { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { useAppStore } from '../../hooks/useStore';

export function Alerts() {
  const { alerts, dismissAlert } = useAppStore();

  useEffect(() => {
    alerts.forEach(alert => {
      if (alert.type === 'success') {
        const timer = setTimeout(() => {
          dismissAlert(alert.id);
        }, 5000);
        return () => clearTimeout(timer);
      }
    });
  }, [alerts, dismissAlert]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getAlertStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-[#1172e1]/10 border-[#1172e1]/30';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2 pointer-events-none">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`pointer-events-auto ${getAlertStyles(alert.type)} rounded-lg p-4 shadow-lg max-w-md animate-fade-in-right`}
        >
          <div className="flex items-start gap-3">
            <div className={`flex-shrink-0 ${alert.type === 'success' ? 'text-[#1172e1]' : ''}`}>
              {getAlertIcon(alert.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="text-sm font-semibold text-black">{alert.title}</h4>
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="flex-shrink-0 text-gray-400 hover:text-black transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600">{alert.message}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
