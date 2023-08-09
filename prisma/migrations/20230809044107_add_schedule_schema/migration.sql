-- CreateTable
CREATE TABLE "schedules" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "schedules_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "schedule_categories" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fk_schedule_id" INTEGER,
    "fk_category_id" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "schedule_categories_fk_schedule_id_fkey" FOREIGN KEY ("fk_schedule_id") REFERENCES "schedules" ("id") ON DELETE CASCADE ON UPDATE RESTRICT,
    CONSTRAINT "schedule_categories_fk_category_id_fkey" FOREIGN KEY ("fk_category_id") REFERENCES "categories" ("id") ON DELETE CASCADE ON UPDATE RESTRICT
);

-- CreateTable
CREATE TABLE "categories" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "places" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "scheduleId" INTEGER,
    CONSTRAINT "places_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "schedules" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "place_tags" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fk_place_id" INTEGER,
    "fk_tag_id" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "place_tags_fk_place_id_fkey" FOREIGN KEY ("fk_place_id") REFERENCES "places" ("id") ON DELETE CASCADE ON UPDATE RESTRICT,
    CONSTRAINT "place_tags_fk_tag_id_fkey" FOREIGN KEY ("fk_tag_id") REFERENCES "tags" ("id") ON DELETE CASCADE ON UPDATE RESTRICT
);

-- CreateTable
CREATE TABLE "tags" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "place_images" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fk_place_id" INTEGER,
    "fk_image_id" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "place_images_fk_place_id_fkey" FOREIGN KEY ("fk_place_id") REFERENCES "places" ("id") ON DELETE CASCADE ON UPDATE RESTRICT,
    CONSTRAINT "place_images_fk_image_id_fkey" FOREIGN KEY ("fk_image_id") REFERENCES "images" ("id") ON DELETE CASCADE ON UPDATE RESTRICT
);

-- CreateTable
CREATE TABLE "images" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cfId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "metadata" BLOB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "schedule_categories_fk_schedule_id_fk_category_id_key" ON "schedule_categories"("fk_schedule_id", "fk_category_id");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "place_tags_fk_place_id_fk_tag_id_key" ON "place_tags"("fk_place_id", "fk_tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "place_images_fk_place_id_fk_image_id_key" ON "place_images"("fk_place_id", "fk_image_id");

-- CreateIndex
CREATE UNIQUE INDEX "images_cfId_key" ON "images"("cfId");
