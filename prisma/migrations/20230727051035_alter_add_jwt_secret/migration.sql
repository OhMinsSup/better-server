/*
  Warnings:

  - Added the required column `jwtSecret` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "emailVerified" DATETIME,
    "jwtSecret" TEXT NOT NULL,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isSuspended" BOOLEAN NOT NULL DEFAULT false,
    "suspendedAt" DATETIME,
    "lastActiveAt" DATETIME,
    "lastSignedInAt" DATETIME,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("createdAt", "deletedAt", "email", "emailVerified", "id", "isAdmin", "isAnonymous", "isSuspended", "lastActiveAt", "lastSignedInAt", "suspendedAt", "updatedAt", "username") SELECT "createdAt", "deletedAt", "email", "emailVerified", "id", "isAdmin", "isAnonymous", "isSuspended", "lastActiveAt", "lastSignedInAt", "suspendedAt", "updatedAt", "username" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
