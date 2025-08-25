import Fastify from 'fastify';
import dotenv from 'dotenv';
import cors from '@fastify/cors';
import { loginOrRegisterUser } from './services/auth.service';
import { createOrUpdateProfile, getProfilesFeed } from './services/profile.service'; // Добавили getProfilesFeed

dotenv.config();

const server = Fastify({
  logger: true,
});

server.register(cors, { origin: '*' });

// --- РОУТЫ ---

server.post('/api/auth/telegram', async (request, reply) => {
  try {
    const authData = request.body as any;
    if (!authData || !authData.hash || !authData.user || !authData.user.id) {
      return reply.status(400).send({ error: 'Запрос не содержит всех необходимых полей' });
    }
    
    // --- ИЗМЕНЕНИЕ ЗДЕСЬ ---
    // Теперь loginOrRegisterUser возвращает объект { user, profile }
    const { user, profile } = await loginOrRegisterUser(authData);

    // Мы передаем на клиент и пользователя, и его профиль
    return reply.status(200).send({
        message: 'Аутентификация прошла успешно',
        user: { id: user.id, status: user.status },
        profile: profile, // Может быть null, и это нормально
    });
    // --- КОНЕЦ ИЗМЕНЕНИЯ ---

  } catch (error) {
    server.log.error(error);
    if (error instanceof Error && error.message.includes('Невалидные данные')) {
      return reply.status(401).send({ error: 'Ошибка аутентификации: неверный хеш' });
    }
    return reply.status(500).send({ error: 'Внутренняя ошибка сервера' });
  }
});

server.post('/api/profiles', async (request, reply) => {
  // ... (этот код остается без изменений)
  try {
    const { userId, name, age, city, about, photoUrl } = request.body as any;
    if (!userId || !name || !age || !city || !about || !photoUrl) {
      return reply.status(400).send({ error: 'Не все поля профиля были предоставлены.' });
    }
    const numericAge = parseInt(age, 10);
    if (isNaN(numericAge)) {
      return reply.status(400).send({ error: 'Возраст должен быть числом.' });
    }
    const profileData = { name, age: numericAge, city, about, photoUrl };
    const newProfile = await createOrUpdateProfile(userId, profileData);
    return reply.status(201).send(newProfile);
  } catch (error) {
    server.log.error(error);
    if (error instanceof Error && error.message.includes('Foreign key constraint failed')) {
        return reply.status(404).send({ error: 'Пользователь с таким ID не найден.' });
    }
    return reply.status(500).send({ error: 'Внутренняя ошибка сервера' });
  }
});

// --- НОВЫЙ РОУТ ---
server.get('/api/profiles', async (request, reply) => {
    try {
        const profiles = await getProfilesFeed();
        return reply.status(200).send(profiles);
    } catch (error) {
        server.log.error(error);
        return reply.status(500).send({ error: 'Внутренняя ошибка сервера при получении профилей.' });
    }
});

// --- ЗАПУСК СЕРВЕРА ---
const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
    await server.listen({ port, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();