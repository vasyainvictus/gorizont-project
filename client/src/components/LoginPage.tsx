// client/src/components/LoginPage.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { generateInitData } from '../utils/tma-emulator'; // Убедись, что путь верный

interface User {
  id: string;
  telegramId: bigint;
  username: string | null;
  profile: any;
}

interface LoginPageProps {
  onLoginSuccess: (data: any) => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [devUsers, setDevUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. При загрузке страницы получаем список всех тестовых пользователей
  useEffect(() => {
    const fetchDevUsers = async () => {
      try {
        const response = await axios.get('/api/dev/users');
        setDevUsers(response.data);
      } catch (error) {
        console.error("Не удалось загрузить список dev-пользователей:", error);
      } finally {
        setLoading(false);
      }
    };
    // Выполняем только в режиме разработки
    if (import.meta.env.DEV) {
      fetchDevUsers();
    }
  }, []);

  // 2. Функция "логина" под конкретным, уже существующим пользователем
  const handleLoginAs = async (user: User) => {
    // Мы эмулируем данные Telegram для этого конкретного пользователя
    const initData = generateInitData({
      id: Number(user.telegramId), // Используем реальный telegramId из БД
      username: user.username || `user${user.telegramId}`,
      first_name: user.profile?.name || 'Test',
    });
    
    // Отправляем эмулированные данные на наш обычный роут авторизации
    try {
      const response = await axios.post('/api/auth/telegram', { initData });
      onLoginSuccess(response.data);
    } catch (error) {
      console.error("Ошибка входа:", error);
      alert("Не удалось войти под этим пользователем.");
    }
  };

  // 3. Функция для создания совершенно нового пользователя
  const handleCreateNewUser = async () => {
    // Генерируем случайного нового пользователя
    const newId = Math.floor(10000000 + Math.random() * 90000000);
    const initData = generateInitData({
      id: newId,
      username: `user${newId}`,
      first_name: 'Newbie',
    });
    try {
      const response = await axios.post('/api/auth/telegram', { initData });
      onLoginSuccess(response.data);
    } catch (error) {
      console.error("Ошибка создания нового пользователя:", error);
    }
  };


  return (
    <div style={{ padding: '20px' }}>
      <h1>Панель разработчика (Вход)</h1>
      <p>Выберите пользователя для входа или создайте нового.</p>
      
      <button onClick={handleCreateNewUser} style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', marginBottom: '20px' }}>
        Создать нового пользователя
      </button>

      <h2>Войти как существующий пользователь:</h2>
      {loading ? (
        <p>Загрузка пользователей...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {devUsers.length > 0 ? devUsers.map(user => (
            <button key={user.id} onClick={() => handleLoginAs(user)}>
              Войти как: {user.profile?.name || user.username} (ID: {user.telegramId.toString()})
            </button>
          )) : <p>Существующие пользователи не найдены. Создайте нового.</p>}
        </div>
      )}
    </div>
  );
}