/*
  Warnings:

  - The primary key for the `Interest` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Interest` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `ProfileInterest` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `interestId` on the `ProfileInterest` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "ProfileInterest" DROP CONSTRAINT "ProfileInterest_interestId_fkey";

-- AlterTable
ALTER TABLE "Interest" DROP CONSTRAINT "Interest_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Interest_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ProfileInterest" DROP CONSTRAINT "ProfileInterest_pkey",
DROP COLUMN "interestId",
ADD COLUMN     "interestId" INTEGER NOT NULL,
ADD CONSTRAINT "ProfileInterest_pkey" PRIMARY KEY ("profileId", "interestId");

-- AddForeignKey
ALTER TABLE "ProfileInterest" ADD CONSTRAINT "ProfileInterest_interestId_fkey" FOREIGN KEY ("interestId") REFERENCES "Interest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
