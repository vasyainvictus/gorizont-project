// server/src/lib/prisma.ts

import { PrismaClient } from '@prisma/client';

// Объявляем глобальную переменную для хранения клиента
declare global {
  var prisma: PrismaClient | undefined;
}

// Создаем клиента, переиспользуя существующий экземпляр в режиме разработки,
// чтобы избежать множества подключений из-за горячей перезагрузки.
export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}