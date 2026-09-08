import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = '@rota/notification_prefs';

export interface NotificationPrefs {
  alertasRecarga: boolean;
  novidades: boolean;
}

const INICIAL: NotificationPrefs = {
  alertasRecarga: true,
  novidades: true,
};

export function useNotificationPrefs() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(INICIAL);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (!mounted) return;
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as Partial<NotificationPrefs>;
          setPrefs({
            alertasRecarga: parsed.alertasRecarga ?? true,
            novidades: parsed.novidades ?? true,
          });
        } catch {
          setPrefs(INICIAL);
        }
      }
      setCarregando(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const atualizar = useCallback((patch: Partial<NotificationPrefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { prefs, carregando, atualizar };
}
