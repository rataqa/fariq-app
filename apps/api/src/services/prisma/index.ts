import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';
import { IConfig } from '../env-settings/types';

export function makePrisma({ connectionString }: IConfig['prisma']) {
  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  return prisma;
}
