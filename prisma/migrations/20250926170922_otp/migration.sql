/*
  Warnings:

  - You are about to drop the column `activation_link` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."users_activation_link_key";

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "activation_link",
ADD COLUMN     "otp" TEXT,
ADD COLUMN     "otpExpiresAt" TIMESTAMP(3);
