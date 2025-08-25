import { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { ProfilePage } from './components/ProfilePage';
import { FeedPage } from './components/FeedPage'; // Импортируем новый компонент

function App() {
  // Это состояние теперь будет хранить ВЕСЬ ответ от сервера, а не только user
  const [authData, setAuthData] = useState<any>(null);

  // Эта функция получает ВЕСЬ ответ от сервера
  const handleLoginSuccess = (data: any) => {
    console.log("Получены данные для входа:", data);
    setAuthData(data);
  };

  // --- ГЛАВНАЯ ЛОГИКА МАРШРУТИЗАЦИИ ---

  // 1. Если данных о входе нет, показываем LoginPage
  if (!authData) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // 2. Если данные есть, но профиль пустой (null), показываем ProfilePage
  if (authData.user && !authData.profile) {
    return <ProfilePage userId={authData.user.id} />;
  }

  // 3. Если данные есть и профиль тоже есть, показываем FeedPage
  if (authData.user && authData.profile) {
    return <FeedPage />;
  }

  // Запасной вариант на случай странного состояния
  return <LoginPage onLoginSuccess={handleLoginSuccess} />;
}

export default App;