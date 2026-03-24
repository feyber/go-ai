-- AlterTable
ALTER TABLE "User" ADD COLUMN "tiktok" TEXT;
ALTER TABLE "User" ADD COLUMN "whatsapp" TEXT;

-- AlterTable
ALTER TABLE "Video" ADD COLUMN "productUrl" TEXT;

-- CreateTable
CREATE TABLE "WhitelistedEmail" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "TikTokPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "bookmarks" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "scrapedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TikTokPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserVideo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "assignedDate" TEXT NOT NULL,
    "downloadedAt" DATETIME,
    "tiktokUrl" TEXT,
    "views" INTEGER DEFAULT 0,
    "likes" INTEGER DEFAULT 0,
    "comments" INTEGER DEFAULT 0,
    "bookmarks" INTEGER DEFAULT 0,
    "shares" INTEGER DEFAULT 0,
    "lastScrapedAt" DATETIME,
    CONSTRAINT "UserVideo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserVideo_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UserVideo" ("assignedDate", "id", "userId", "videoId") SELECT "assignedDate", "id", "userId", "videoId" FROM "UserVideo";
DROP TABLE "UserVideo";
ALTER TABLE "new_UserVideo" RENAME TO "UserVideo";
CREATE UNIQUE INDEX "UserVideo_videoId_key" ON "UserVideo"("videoId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "WhitelistedEmail_email_key" ON "WhitelistedEmail"("email");
