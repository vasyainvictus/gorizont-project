import { useEffect, useCallback } from 'react';
import { useInitData, useMainButton } from '@tma.js/sdk-react';
import axios from 'axios';
import { getDevInitDataObject } from '../utils/tma-emulator';

// @ts-ignore
const isTelegramEnv = !!window.Telegram?.WebApp?.initData;

// Теперь onLoginSuccess будет передавать весь ответ от сервера
interface PanelProps {
  onLoginSuccess: (data: any) => void;
}

function DebugLoginPanel({ onLoginSuccess }: PanelProps) {
  const handleDebugLogin = async () => {
    try {
      const devData = getDevInitDataObject();
      const response = await axios.post('/api/auth/telegram', devData);
      onLoginSuccess(response.data); // Передаем весь объект response.data
    } catch (error) {
      console.error("Debug login failed", error);
    }
  };
  return (
    <div style={{ border: '2px dashed blue', padding: '15px', marginTop: '20px' }}>
      <h3>Панель Разработчика</h3>
      <button onClick={handleDebugLogin}>Войти как Тестовый Пользователь</button>
    </div>
  );
}

export function LoginPage({ onLoginSuccess }: PanelProps) {
  const performLogin = useCallback(async (authData: any) => {
    if (!authData) return;
    try {
      const response = await axios.post('/api/auth/telegram', authData);
      onLoginSuccess(response.data); // Передаем весь объект response.data
    } catch (err: any) {
      console.error('Login failed', err);
    }
  }, [onLoginSuccess]);

  if (isTelegramEnv) {
    const initData = useInitData();
    const mainButton = useMainButton();
    useEffect(() => {
      mainButton.setText('ВОЙТИ ЧЕРЕЗ TELEGRAM');
      mainButton.show();
      const loginHandler = () => {
        if (initData) {
          const params = new URLSearchParams(initData.toString());
          const authData: Record<string, any> = {};
          params.forEach((value, key) => {
            authData[key] = key === 'user' ? JSON.parse(value) : value;
          });
          performLogin(authData);
        }
      };
      mainButton.on('click', loginHandler);
      return () => mainButton.off('click', loginHandler);
    }, [initData, mainButton, performLogin]);
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Добро пожаловать в "Горизонт"!</h1>
      {!isTelegramEnv && <DebugLoginPanel onLoginSuccess={onLoginSuccess} />}
    </div>
  );
}