// prisma/seed.ts
import { PrismaClient, UserStatus } from '@prisma/client';
import { subYears } from 'date-fns';

const prisma = new PrismaClient();

// --- ДАННЫЕ ДЛЯ НАПОЛНЕНИЯ ---

// Массив начальных интересов
const interestsData = [
  { name: 'Спорт' }, { name: 'Выставки' }, { name: 'Настолки' },
  { name: 'Кино' }, { name: 'Книги' }, { name: 'Йога' },
  { name: 'Кулинария' }, { name: 'Танцы' }, { name: 'Фотография' },
  { name: 'Волонтёрство' },
];

// Вымышленные имена для профилей
const names = [
  'Анна', 'Мария', 'Елена', 'Дарья', 'Анастасия',
  'Алёна', 'Виктория', 'Ксения', 'Полина', 'София',
];

// Города
const cities = [
  'Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург',
  'Казань', 'Нижний Новгород', 'Красноярск', 'Челябинск'
];

// Описания
const descriptions = [
  'Люблю йогу и здоровое питание', 'Ищу компанию для походов в кино',
  'Увлекаюсь фотографией и путешествиями', 'Ищу единомышленниц для настольных игр',
  'Люблю выставки и современное искусство', 'Ищу подруг для совместных тренировок',
  'Увлекаюсь кулинарией и виноделием', 'Ищу компанию для волонтёрства'
];

// --- ОСНОВНАЯ ФУНКЦИЯ ---

async function main() {
  // --- ЭТАП 1: СОЗДАНИЕ ИНТЕРЕСОВ ---
  console.log('🌱 Этап 1: Заполнение таблицы Interest...');
  for (const interestData of interestsData) {
    await prisma.interest.upsert({
      where: { name: interestData.name },
      update: {},
      create: { name: interestData.name },
    });
  }
  console.log('✅ Таблица Interest успешно заполнена.');

  // --- ЭТАП 2: СОЗДАНИЕ ТЕСТОВЫХ ПРОФИЛЕЙ ---
  console.log('\n🌱 Этап 2: Наполнение базы тестовыми профилями...');
  const allInterests = await prisma.interest.findMany();

  for (let i = 0; i < 12; i++) {
    const name = names[Math.floor(Math.random() * names.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const about = descriptions[Math.floor(Math.random() * descriptions.length)];
    const age = Math.floor(Math.random() * 20) + 20; // 20-39 лет
    const birthDate = subYears(new Date(), age);
    const telegramId = BigInt(1000000000 + i);

    try {
      const user = await prisma.user.upsert({
        where: { telegramId },
        update: {},
        create: {
          telegramId,
          username: `${name.toLowerCase()}_${1000 + i}`,
          status: UserStatus.VERIFIED
        }
      });

      const profile = await prisma.profile.upsert({
        where: { userId: user.id },
        update: { name, birthDate, city, about, photoUrl: `https://i.pravatar.cc/150?img=${i + 1}` },
        create: { name, birthDate, city, about, photoUrl: `https://i.pravatar.cc/150?img=${i + 1}`, userId: user.id }
      });

      await prisma.profileInterest.deleteMany({ where: { profileId: profile.id } });

      const numInterests = Math.floor(Math.random() * 3) + 2;
      const shuffled = [...allInterests].sort(() => 0.5 - Math.random());
      const selectedInterests = shuffled.slice(0, numInterests);

      await prisma.profileInterest.createMany({
        data: selectedInterests.map(interest => ({
          profileId: profile.id,
          interestId: interest.id,
        })),
      });

      console.log(`✅ Создан/обновлен профиль: ${name}, ${age} лет, ${city}`);
    } catch (error) {
      console.error(`❌ Ошибка при создании профиля ${i + 1}:`, error);
    }
  }
  console.log('✅ Генерация тестовых профилей завершена!');
}

// --- ЗАПУСК ---

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });