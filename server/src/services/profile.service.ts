import { prisma } from '../lib/prisma';
import { Profile } from '@prisma/client';

// Описываем тип данных, которые мы ожидаем от клиента для создания профиля
export interface ProfileData {
  name: string;
  age: number;
  city: string;
  about: string;
  photoUrl: string; // Пока что это будет просто строка, в будущем - ссылка на загруженное фото
}

/**
 * Создает или обновляет профиль для указанного пользователя.
 * @param userId - ID пользователя, для которого создается профиль.
 * @param profileData - Данные профиля.
 * @returns {Promise<Profile>} - Созданный или обновленный профиль.
 */
export async function createOrUpdateProfile(userId: string, profileData: ProfileData): Promise<Profile> {
  // Используем `upsert` для создания или обновления профиля одним запросом.
  const profile = await prisma.profile.upsert({
    where: {
      userId: userId,
    },
    update: {
      name: profileData.name,
      age: profileData.age,
      city: profileData.city,
      about: profileData.about,
      photoUrl: profileData.photoUrl,
    },
    create: {
      name: profileData.name,
      age: profileData.age,
      city: profileData.city,
      about: profileData.about,
      photoUrl: profileData.photoUrl,
      // Устанавливаем связь с существующим пользователем
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });

  return profile;
}


/**
 * Получает список всех профилей для отображения в ленте.
 * @returns {Promise<Profile[]>} - Массив профилей.
 */
export async function getProfilesFeed(): Promise<Profile[]> {
  // На данный момент мы просто запрашиваем все профили из базы.
  // В будущем мы добавим сюда пагинацию (загрузку по частям),
  // фильтрацию по городу и сортировку по активности.
  const profiles = await prisma.profile.findMany({
    // Сортируем по дате создания, чтобы новые анкеты были сверху.
    orderBy: {
      createdAt: 'desc',
    },
    // --- ВАЖНОЕ ДОБАВЛЕНИЕ ---
    // С помощью `include` мы говорим Prisma "подтянуть" связанные данные.
    // В данном случае, для каждого профиля мы хотим также получить
    // информацию о пользователе, который им владеет.
    include: {
      user: {
        // Мы не хотим "светить" все данные пользователя, только его username.
        select: {
          username: true,
        },
      },
    },
  });

  return profiles;
}