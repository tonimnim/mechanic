-- CreateTable
CREATE TABLE "ContactEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "method" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientId" TEXT NOT NULL,
    "mechanicId" TEXT NOT NULL,
    CONSTRAINT "ContactEvent_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ContactEvent_mechanicId_fkey" FOREIGN KEY ("mechanicId") REFERENCES "MechanicProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ShopProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "shopName" TEXT NOT NULL,
    "description" TEXT,
    "inventoryCategories" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '+254700000000',
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    CONSTRAINT "ShopProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ShopProfile" ("address", "city", "description", "id", "inventoryCategories", "lat", "lng", "shopName", "userId") SELECT "address", "city", "description", "id", "inventoryCategories", "lat", "lng", "shopName", "userId" FROM "ShopProfile";
DROP TABLE "ShopProfile";
ALTER TABLE "new_ShopProfile" RENAME TO "ShopProfile";
CREATE UNIQUE INDEX "ShopProfile_userId_key" ON "ShopProfile"("userId");
CREATE TABLE "new_MechanicProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "bio" TEXT,
    "specialties" TEXT NOT NULL,
    "yearsExperience" INTEGER NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '+254700000000',
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "availability" TEXT NOT NULL DEFAULT 'online',
    CONSTRAINT "MechanicProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MechanicProfile" ("address", "availability", "bio", "city", "id", "lat", "lng", "specialties", "userId", "yearsExperience") SELECT "address", "availability", "bio", "city", "id", "lat", "lng", "specialties", "userId", "yearsExperience" FROM "MechanicProfile";
DROP TABLE "MechanicProfile";
ALTER TABLE "new_MechanicProfile" RENAME TO "MechanicProfile";
CREATE UNIQUE INDEX "MechanicProfile_userId_key" ON "MechanicProfile"("userId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
