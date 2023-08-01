-- CreateTable
CREATE TABLE "Pharmacie" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "city" TEXT,
    "street" TEXT,
    "tel" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,

    CONSTRAINT "Pharmacie_pkey" PRIMARY KEY ("id")
);
