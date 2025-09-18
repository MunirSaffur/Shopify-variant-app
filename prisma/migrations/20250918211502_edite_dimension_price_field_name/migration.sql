/*
  Warnings:

  - You are about to drop the column `price` on the `Dimension` table. All the data in the column will be lost.
  - Added the required column `multiple` to the `Dimension` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Dimension" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "option" TEXT NOT NULL,
    "multiple" INTEGER NOT NULL
);
INSERT INTO "new_Dimension" ("id", "option") SELECT "id", "option" FROM "Dimension";
DROP TABLE "Dimension";
ALTER TABLE "new_Dimension" RENAME TO "Dimension";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
