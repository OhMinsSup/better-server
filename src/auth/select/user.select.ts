import { Prisma } from '@prisma/client';

export const USER_SELECT = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  username: true,
  email: true,
  emailVerified: true,
  isAdmin: true,
  isAnonymous: true,
  isSuspended: true,
  lastActiveAt: true,
  lastSignedInAt: true,
});
