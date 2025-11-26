-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'PAID', 'REFUNDED');

-- AlterTable
ALTER TABLE "public"."orders" ADD COLUMN     "paymentStatus" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING';
