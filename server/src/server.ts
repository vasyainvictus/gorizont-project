// server/src/server.ts
import Fastify from 'fastify';
import dotenv from 'dotenv';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { handleTelegramAuth } from './services/auth.service';
// --- ИЗМЕНЕНИЕ: Импортируем новую функцию ---
import { createOrUpdateProfile, getProfilesFeed, getProfileByUserId, ProfileData, ProfileFeedFilters } from './services/profile.service';
import { prisma } from './lib/prisma';

import { pipeline } from 'stream';
import util from 'util';
import fs from 'fs';
import path from 'path';

const pump = util.promisify(pipeline);
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

dotenv.config();

const server = Fastify({
  logger: true,
});

server.register(cors, { origin: '*' });
server.register(multipart, {
  limits: { fileSize: 10 * 1024 * 1024, files: 2 },
});
server.register(fastifyStatic, {
  root: path.join(__dirname, '..', 'uploads'),
  prefix: '/uploads/',
});

server.post('/api/auth/telegram', async (request, reply) => {
  // Вызываем нашу новую функцию-адаптер
  const result = await handleTelegramAuth(request.body as any); 
  return reply.status(200).send(result);
});

server.post('/api/profiles', async (request, reply) => {
  try {
    const data = await request.file(); 
    
    const body: any = {};
    if (data && data.fields) {
        Object.keys(data.fields).forEach(key => {
            const field = data.fields[key] as any;
            body[key] = field.value;
        });
    }

    let photoUrl: string | null = null;
    if (data && data.file) {
        const fileName = `${Date.now()}-${data.filename}`;
        const filePath = path.join(uploadsDir, fileName);
        await pump(data.file, fs.createWriteStream(filePath));
        photoUrl = `/uploads/${fileName}`;
    }
    
    const { userId, name, birthDate, city, about, interestIds } = body;
    
    if (!userId || !name || !birthDate || !city || !about ) {
      return reply.status(400).send({ error: 'Не все обязательные поля были предоставлены.' });
    }

    const profileData: ProfileData = {
      name, birthDate, city, about, 
      photoUrl: photoUrl || 'default.jpg',
      interestIds: JSON.parse(interestIds || '[]'),
    };

    const newProfile = await createOrUpdateProfile(userId, profileData);
    return reply.status(201).send(newProfile);

  } catch (error) {
    server.log.error(error);
    if (error instanceof Error && error.message.includes('Foreign key constraint failed')) {
      return reply.status(404).send({ error: 'Пользователь с таким ID не найден.' });
    }
    return reply.status(500).send({ error: 'Внутренняя ошибка сервера при обработке профиля.' });
  }
});

server.get('/api/profiles', async (request, reply) => {
  try {
    const { currentUserId, ...filters } = request.query as { currentUserId: string } & ProfileFeedFilters;

    if (!currentUserId) {
      return reply.status(400).send({ error: 'currentUserId is a required query parameter.' });
    }

    const profiles = await getProfilesFeed(currentUserId, filters);
    
    return reply.status(200).send(profiles);

  } catch (error) {
    server.log.error(error, "Failed to get profiles feed");
    return reply.status(500).send({ error: 'Internal server error while fetching profiles.' });
  }
});

server.get('/api/interests', async (request, reply) => {
    const interests = await prisma.interest.findMany({ select: { id: true, name: true } });
    return reply.status(200).send(interests);
});


// --- НОВЫЕ РОУТЫ ДЛЯ СТРАНИЦЫ "МОЙ ПРОФИЛЬ" ---

// Роут для получения данных своего профиля
server.get('/api/profiles/me', async (request, reply) => {
  const { userId } = request.query as { userId: string };

  if (!userId) {
    return reply.status(400).send({ error: 'userId is required' });
  }

  try {
    const profile = await getProfileByUserId(userId);
    if (!profile) {
      return reply.status(404).send({ error: 'Profile not found' });
    }
    return reply.status(200).send(profile);
  } catch (error) {
    server.log.error(error, "Failed to get user's own profile");
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

// Роут для обновления своего профиля (принимает JSON)
server.put('/api/profiles/me', async (request, reply) => {
  try {
    // В теле запроса ожидаем userId и все поля для обновления
    const { userId, ...profileData } = request.body as { userId: string } & ProfileData;

    if (!userId) {
      return reply.status(400).send({ error: 'userId is required' });
    }

    // Используем нашу универсальную функцию createOrUpdateProfile
    await createOrUpdateProfile(userId, profileData);

    // Возвращаем полный, обновленный профиль на фронтенд
    const fullProfile = await getProfileByUserId(userId);

    return reply.status(200).send(fullProfile);

  } catch (error) {
    server.log.error(error);
    if (error instanceof Error && error.message.includes('Foreign key constraint failed')) {
      return reply.status(404).send({ error: 'Пользователь с таким ID не найден.' });
    }
    return reply.status(500).send({ error: 'Внутренняя ошибка сервера при обновлении профиля.' });
  }
});

// --- КОНЕЦ НОВЫХ РОУТОВ ---
server.get('/api/profiles/:id', async (request, reply) => {
  try {
    // 1. Извлекаем ID из параметров URL (например, из /api/profiles/abc-123)
    const { id } = request.params as { id: string };

    // 2. Вызываем наш существующий сервис, который умеет искать профиль по ID
    const profile = await getProfileByUserId(id);

    // 3. Если профиль не найден, возвращаем ошибку 404
    if (!profile) {
      return reply.status(404).send({ error: 'Profile not found' });
    }

    // 4. Если все хорошо, отправляем данные профиля
    return reply.status(200).send(profile);

  } catch (error) {
    server.log.error(error, "Failed to get profile by ID");
    return reply.status(500).send({ error: 'Internal server error' });
  }
});
server.post('/api/connections', async (request, reply) => {
  try {
    // 1. Получаем ID отправителя и получателя из тела запроса
    const { requesterId, receiverId } = request.body as { requesterId: string; receiverId: string };

    // 2. Валидация: проверяем, что все данные пришли и что пользователь не пытается подружиться сам с собой
    if (!requesterId || !receiverId) {
      return reply.status(400).send({ error: 'Требуется указать ID отправителя и получателя.' });
    }
    if (requesterId === receiverId) {
      return reply.status(400).send({ error: 'Нельзя отправить запрос самому себе.' });
    }

    // 3. Проверяем, не существует ли уже такой запрос (в любом направлении)
    // Это предотвращает дублирование и спам
    const existingConnection = await prisma.connection.findFirst({
      where: {
        OR: [
          { requesterId: requesterId, receiverId: receiverId },
          { requesterId: receiverId, receiverId: requesterId },
        ],
      },
    });

    if (existingConnection) {
      return reply.status(409).send({ error: 'Запрос на общение с этим пользователем уже существует.' });
    }

    // 4. Если все проверки пройдены, создаем новую запись в БД
    const newConnection = await prisma.connection.create({
      data: {
        requesterId: requesterId,
        receiverId: receiverId,
        status: 'PENDING', // Начальный статус "в ожидании"
      },
    });

    // 5. Отправляем успешный ответ
    return reply.status(201).send({ message: 'Запрос на общение успешно отправлен.', connection: newConnection });

  } catch (error) {
    server.log.error(error, 'Failed to create a connection');
    // Обработка ошибки, если один из пользователей не найден в БД
    if (error instanceof Error && error.message.includes('Foreign key constraint failed')) {
        return reply.status(404).send({ error: 'Один из пользователей не найден.' });
    }
    return reply.status(500).send({ error: 'Внутренняя ошибка сервера.' });
  }
});
// 1. Роут для получения списка входящих запросов на общение
server.get('/api/connections', async (request, reply) => {
  try {
    const { userId } = request.query as { userId: string };
    if (!userId) {
      return reply.status(400).send({ error: 'userId is required' });
    }

    const connectionsFromDb = await prisma.connection.findMany({
      where: {
        receiverId: userId,
        status: 'PENDING',
      },
      include: {
        requester: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // --- НАЧАЛО ИСПРАВЛЕНИЯ ---
    // Преобразуем BigInt в строку перед отправкой на фронтенд
    const safeConnections = connectionsFromDb.map(conn => {
      // Создаем копию requester, но с telegramId в виде строки
      const safeRequester = {
        ...conn.requester,
        telegramId: conn.requester.telegramId.toString(),
      };
      
      // Возвращаем полную копию connection с "безопасным" requester
      return {
        ...conn,
        requester: safeRequester,
      };
    });

    return reply.status(200).send(safeConnections);
  } catch (error) {
    server.log.error(error, 'Failed to get connections');
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

// 2. Роут для ответа на запрос (принять/отклонить)
server.put('/api/connections/:id', async (request, reply) => {
  try {
    const { id } = request.params as { id: string };
    const { status, currentUserId } = request.body as { status: 'ACCEPTED' | 'REJECTED', currentUserId: string };

    if (!status || !['ACCEPTED', 'REJECTED'].includes(status)) {
      return reply.status(400).send({ error: 'Status must be ACCEPTED or REJECTED' });
    }
    
    // Важная проверка безопасности: убеждаемся, что пользователь, который отвечает на запрос,
    // действительно является его получателем.
    const connectionToUpdate = await prisma.connection.findFirst({
        where: { id: parseInt(id), receiverId: currentUserId }
    });

    if (!connectionToUpdate) {
        return reply.status(404).send({ error: 'Connection not found or you do not have permission to update it.'});
    }

    const updatedConnection = await prisma.connection.update({
      where: {
        id: parseInt(id),
      },
      data: {
        status: status,
      },
    });

    return reply.status(200).send(updatedConnection);
  } catch (error) {
    server.log.error(error, 'Failed to update connection');
    return reply.status(500).send({ error: 'Internal server error' });
  }
});
server.get('/api/dev/users', async (request, reply) => {
  try {
    const usersFromDb = await prisma.user.findMany({
      include: {
        profile: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // --- НАЧАЛО ИСПРАВЛЕНИЯ ---
    // Преобразуем BigInt в строку, чтобы JSON.stringify не сломался
    const users = usersFromDb.map(user => ({
      ...user,
      telegramId: user.telegramId.toString(),
    }));
    // --- КОНЕЦ ИСПРАВЛЕНИЯ ---

    return reply.status(200).send(users);

  } catch (error) {
    server.log.error(error, 'Failed to get dev users list');
    return reply.status(500).send({ error: 'Internal server error' });
  }
});

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