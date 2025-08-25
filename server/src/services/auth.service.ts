import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { User, Profile } from '@prisma/client';

// ... (интерфейсы и функция validateTelegramAuth остаются без изменений)
interface TelegramAuthPayload { user: { id: number; first_name: string; last_name?: string; username?: string; }; auth_date: number; hash: string; }

function validateTelegramAuth(authData: Record<string, any>): boolean {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) throw new Error('TELEGRAM_BOT_TOKEN не найден в .env');
  const { hash, ...rest } = authData;
  const restAsStrings: Record<string, string> = {};
  for (const key in rest) { restAsStrings[key] = typeof rest[key] === 'object' ? JSON.stringify(rest[key]) : String(rest[key]); }
  const dataCheckString = Object.keys(restAsStrings).sort().map((key) => `${key}=${restAsStrings[key]}`).join('\n');
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  return calculatedHash === hash;
}


// --- НОВАЯ СТРУКТУРА ВОЗВРАЩАЕМЫХ ДАННЫХ ---
interface LoginResult {
  user: User;
  profile: Profile | null; // Профиль может отсутствовать
}

/**
 * Находит или регистрирует пользователя и сразу проверяет наличие у него профиля.
 * @param payload - Данные от Telegram.
 * @returns {Promise<LoginResult>} - Объект с пользователем и его профилем (или null).
 */
export async function loginOrRegisterUser(payload: TelegramAuthPayload): Promise<LoginResult> {
  if (!validateTelegramAuth(payload)) {
    throw new Error('Невалидные данные для аутентификации');
  }

  const userData = payload.user;

  // Используем `upsert` для пользователя. Это гарантирует, что пользователь будет создан,
  // если его нет, и найден, если он уже существует.
  const user = await prisma.user.upsert({
    where: { telegramId: BigInt(userData.id) },
    update: { username: userData.username },
    create: {
      telegramId: BigInt(userData.id),
      username: userData.username,
    },
  });

  // Сразу после получения данных о пользователе, ищем его профиль.
  const profile = await prisma.profile.findUnique({
    where: {
      userId: user.id,
    },
  });

  // Возвращаем и пользователя, и его профиль (который может быть null).
  return { user, profile };
}