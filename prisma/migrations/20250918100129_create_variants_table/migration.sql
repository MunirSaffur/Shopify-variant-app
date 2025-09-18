-- CreateTable
CREATE TABLE "Dimension" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "option" TEXT NOT NULL,
    "price" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Material" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "option" TEXT NOT NULL,
    "price" INTEGER NOT NULL
);
