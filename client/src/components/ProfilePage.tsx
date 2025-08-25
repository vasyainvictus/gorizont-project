import { useState } from 'react';
import axios from 'axios';

// Этот компонент принимает ID пользователя, чтобы знать, для кого создавать профиль
interface ProfilePageProps {
  userId: string;
}

export function ProfilePage({ userId }: ProfilePageProps) {
  // Состояния для каждого поля формы
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [city, setCity] = useState('');
  const [about, setAbout] = useState('');
  
  // Общие состояния для процесса отправки
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Предотвращаем стандартное поведение формы (перезагрузку страницы)
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const profileData = {
        userId, // ID пользователя, который мы получили от LoginPage
        name,
        age: parseInt(age, 10), // Преобразуем возраст в число
        city,
        about,
        photoUrl: 'default_photo.jpg', // Временная заглушка для фото
      };

      // Отправляем данные на наш новый роут
      const response = await axios.post('/api/profiles', profileData);

      console.log('Профиль успешно создан:', response.data);
      setSuccess(true);

    } catch (err: any) {
      setError(err.response?.data?.error || 'Не удалось создать профиль.');
    } finally {
      setLoading(false);
    }
  };

  // Если профиль успешно создан, показываем сообщение
  if (success) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Отлично!</h1>
        <p>Ваш профиль был успешно создан. Скоро здесь появится лента анкет.</p>
      </div>
    );
  }

  // Основная форма
  return (
    <div style={{ padding: '20px' }}>
      <h1>Создание профиля</h1>
      <p>Расскажите немного о себе, чтобы другие могли вас узнать.</p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        <input
          type="text"
          placeholder="Ваше имя (как к вам обращаться)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ padding: '10px' }}
        />
        <input
          type="number"
          placeholder="Возраст"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          required
          style={{ padding: '10px' }}
        />
        <input
          type="text"
          placeholder="Город"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
          style={{ padding: '10px' }}
        />
        <textarea
          placeholder="Коротко о себе (до 300 символов)"
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          maxLength={300}
          required
          style={{ padding: '10px', minHeight: '80px' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '12px', cursor: 'pointer', backgroundColor: '#0088cc', color: 'white', border: 'none' }}>
          {loading ? 'Сохранение...' : 'Сохранить профиль'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
}