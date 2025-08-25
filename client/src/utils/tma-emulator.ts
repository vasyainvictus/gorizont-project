import crypto from 'crypto';

// ВАЖНО: Вставьте сюда свой настоящий токен бота
const BOT_TOKEN = '8475012174:AAFTnn_ilXUWyLHo5CyfbS-JCrTz0q_qfqQ';

export function getDevInitDataObject() {
  const userData = {
    id: 999888777,
    first_name: 'Vasilisa',
    last_name: 'Test',
    username: 'vasilisa_dev',
    language_code: 'ru',
  };

  // Создаем данные для проверки хеша. `user` здесь ДОЛЖЕН быть строкой.
  const dataToCheck: Record<string, string> = {
    auth_date: String(Math.floor(Date.now() / 1000)),
    user: JSON.stringify(userData),
  };

  const dataCheckString = Object.entries(dataToCheck)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
  const hmac = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  // А теперь собираем ОБЪЕКТ, который будет отправлен на сервер.
  // `user` здесь - это ОБЪЕКТ, а не строка.
  return {
    auth_date: dataToCheck.auth_date,
    user: userData, // <--- ВОТ ГЛАВНОЕ ИСПРАВЛЕНИЕ
    hash: hmac,
  };
}