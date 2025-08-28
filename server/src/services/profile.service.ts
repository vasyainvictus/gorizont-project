// server/src/services/profile.service.ts
import { prisma } from '../lib/prisma';
import { Profile } from '@prisma/client';
import { subYears } from 'date-fns';

export interface ProfileData {
  name: string;
  birthDate: string;
  city: string;
  about: string;
  photoUrl: string;
  interestIds: number[];
}

export async function createOrUpdateProfile(userId: string, profileData: ProfileData): Promise<Profile> {
  const { interestIds, ...dataWithoutInterests } = profileData;

  const profilePayload = {
    ...dataWithoutInterests,
    birthDate: new Date(dataWithoutInterests.birthDate),
  };

  const profile = await prisma.profile.upsert({
    where: { userId: userId },
    update: profilePayload,
    create: {
      ...profilePayload,
      user: {
        connect: { id: userId },
      },
    },
  });

  if (interestIds && Array.isArray(interestIds)) {
    await prisma.profileInterest.deleteMany({
      where: { profileId: profile.id },
    });
    if (interestIds.length > 0) {
      await prisma.profileInterest.createMany({
        data: interestIds.map(interestId => ({
          profileId: profile.id,
          interestId: interestId,
        })),
        skipDuplicates: true,
      });
    }
  }
  return profile;
}

export interface ProfileFeedFilters {
  interestIds?: string;
  city?: string;
  ageFrom?: string;
  ageTo?: string;
}

export async function getProfilesFeed(
  currentUserId: string,
  filters: ProfileFeedFilters = {}
): Promise<any[]> {
  const { interestIds, city, ageFrom, ageTo } = filters;

  const whereClause: any = {
    userId: {
      not: currentUserId,
    },
    user: {
      status: 'VERIFIED',
    },
  };

  if (city && typeof city === 'string' && city.trim()) {
    whereClause.city = {
      equals: city.trim(),
      mode: 'insensitive',
    };
  }

  const birthDateConditions: any = {};
  if (ageTo && !isNaN(Number(ageTo))) {
    birthDateConditions.gte = subYears(new Date(), Number(ageTo) + 1);
  }
  if (ageFrom && !isNaN(Number(ageFrom))) {
    birthDateConditions.lte = subYears(new Date(), Number(ageFrom));
  }
  if (Object.keys(birthDateConditions).length > 0) {
    whereClause.birthDate = birthDateConditions;
  }
  
  if (interestIds && typeof interestIds === 'string') {
    const validInterestIds = interestIds.split(',').map(Number).filter(id => !isNaN(id));
    if (validInterestIds.length > 0) {
      whereClause.interests = {
          some: {
            interestId: {
              in: validInterestIds
            }
          }
      };
    }
  }

  const profiles = await prisma.profile.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { id: true, username: true, status: true },
      },
      interests: {
        select: {
          interest: { select: { id: true, name: true } },
        },
      },
    },
  });
  
  return profiles.map(profile => ({
    ...profile,
    interests: profile.interests.map((pi: any) => pi.interest),
  }));
}

// --- НОВАЯ ФУНКЦИЯ ДЛЯ ПОЛУЧЕНИЯ СВОЕГО ПРОФИЛЯ ---
export async function getProfileByUserId(userId: string) {
  const profile = await prisma.profile.findUnique({
    where: {
      userId: userId,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          status: true,
        },
      },
      interests: {
        select: {
          interest: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!profile) {
    return null;
  }

  // Приводим данные к тому же удобному формату, что и в ленте
  return {
    ...profile,
    interests: profile.interests.map((pi: any) => pi.interest),
  };
}
// --- КОНЕЦ НОВОЙ ФУНКЦИИ ---