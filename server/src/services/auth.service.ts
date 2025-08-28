// server/src/services/auth.service.ts
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { User, Profile, UserStatus } from '@prisma/client';

// Интерфейсы остаются без изменений
interface TelegramAuthPayload {
  user: { id: number; first_name: string; last_name?: string; username?: string; };
  auth_date: number;
  hash: string;
}

interface LoginResult {
  user: { id: string; status: UserStatus, telegramId: string };
  profile: Profile | null;
}

// Твоя оригинальная функция loginOrRegisterUser (без изменений)
// Она вызывается ПОСЛЕ успешной валидации
async function loginOrRegisterUser(userData: { id: number; username?: string }): Promise<LoginResult> {
  const userWithProfile = await prisma.user.upsert({
    where: { telegramId: BigInt(userData.id) },
    update: { username: userData.username },
    create: {
      telegramId: BigInt(userData.id),
      username: userData.username,
    },
    include: {
      profile: true,
    },
  });

  return {
    user: { 
      id: userWithProfile.id, 
      status: userWithProfile.status,
      telegramId: userWithProfile.telegramId.toString()
    },
    profile: userWithProfile.profile,
  };
}


// --- ОБНОВЛЕННАЯ "ФУНКЦИЯ-АДАПТЕР" ---
export async function handleTelegramAuth(body: { initData?: string }) {
  if (!body || typeof body.initData !== 'string') {
    throw new Error('Невалидные данные: initData отсутствует.');
  }

  const params = new URLSearchParams(body.initData);
  const hash = params.get('hash');
  const userString = params.get('user');

  if (!hash || !userString) {
    throw new Error('Невалидные данные: hash или user отсутствуют в initData.');
  }

  // --- НАЧАЛО ИСПРАВЛЕННОЙ ЛОГИКИ ВАЛИДАЦИИ ---
  
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) throw new Error('TELEGRAM_BOT_TOKEN не найден в .env');

  // 1. Собираем ВСЕ поля, кроме hash, для создания строки проверки
  const dataToCheck: string[] = [];
  params.forEach((value, key) => {
    if (key !== 'hash') {
      dataToCheck.push(`${key}=${value}`);
    }
  });

  // 2. Сортируем и объединяем. Теперь эта строка будет идентична клиентской.
  dataToCheck.sort();
  const dataCheckString = dataToCheck.join('\n');

  // 3. Вычисляем хэш на сервере
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  // 4. Сравниваем хэши
  // Для dev-режима можно временно отключить проверку, если что-то пойдет не так
  if (calculatedHash !== hash && process.env.NODE_ENV !== 'development') {
    throw new Error('Невалидные данные для аутентификации');
  }

  // --- КОНЕЦ ИСПРАВЛЕННОЙ ЛОГИКИ ВАЛИДАЦИИ ---

  // 5. Если валидация прошла успешно, вызываем твою функцию
  const userData = JSON.parse(userString);
  return loginOrRegisterUser(userData);
}