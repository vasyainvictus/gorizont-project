// client/src/utils/tma-emulator.ts
import hmacSHA256 from 'crypto-js/hmac-sha256';
import Hex from 'crypto-js/enc-hex';

// ВАЖНО: Вставьте сюда свой настоящий токен бота
const BOT_TOKEN = '8475012174:AAFTnn_ilXUWyLHo5CyfbS-JCrTz0q_qfqQ'; // <--- Убедись, что твой токен здесь

// --- НОВАЯ УНИВЕРСАЛЬНАЯ ФУНКЦИЯ ДЛЯ ГЕНЕРАЦИИ INITDATA ---
// Она будет использоваться нашей новой страницей входа
interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

/**
 * Генерирует строку initData, эмулируя ответ от клиента Telegram.
 * @param user - Объект с данными пользователя, под которым мы хотим войти.
 * @returns Строка initData, готовая к отправке на бэкенд.
 */
export function generateInitData(user: TelegramUser): string {
  // 1. Преобразуем объект пользователя в JSON-строку
  const userJson = JSON.stringify(user);

  // 2. Собираем части данных для проверки
  const authDate = Math.floor(Date.now() / 1000).toString();
  const dataParts = [
    `auth_date=${authDate}`,
    `query_id=dev-query-${Date.now()}`,
    `user=${userJson}`,
  ];

  // 3. Сортируем и объединяем их через \n
  dataParts.sort();
  const dataCheckString = dataParts.join('\n');

  // 4. Вычисляем хэш, используя твою логику с BOT_TOKEN
  const secretKey = hmacSHA256(BOT_TOKEN, "WebAppData");
  const hash = hmacSHA256(dataCheckString, secretKey).toString(Hex);

  // 5. Собираем финальную строку initData в формате URL-параметров
  const initDataString = [...dataParts, `hash=${hash}`].join('&');
  
  return initDataString;
}


// --- ТВОЯ СТАРАЯ ФУНКЦИЯ (переименована для ясности) ---
// Она возвращает объект, а не строку. Оставим ее на всякий случай, если она где-то нужна.
export function getDevInitDataObject_OLD(isNewUser = false) {
  let telegramId = 999888777; // ID для существующего
  if (isNewUser) {
    telegramId = Math.floor(Math.random() * 100000000) + 1000000000;
  }
  
  const userData = {
    id: telegramId,
    first_name: 'Тестовая',
    last_name: 'Пользовательница',
    username: 'test_dev_user',
    language_code: 'ru',
  };

  const dataToCheck: Record<string, string> = {
    auth_date: String(Math.floor(Date.now() / 1000)),
    user: JSON.stringify(userData),
  };

  const dataCheckString = Object.entries(dataToCheck)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  const secretKey = hmacSHA256(BOT_TOKEN, 'WebAppData');
  const hmac = hmacSHA256(dataCheckString, secretKey);
  const hash = Hex.stringify(hmac);

  return {
    auth_date: dataToCheck.auth_date,
    user: userData,
    hash: hash,
  };
}