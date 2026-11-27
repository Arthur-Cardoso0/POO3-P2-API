-- CreateEnum
CREATE TYPE "DiaFeira" AS ENUM ('QUARTA', 'SABADO');

-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "retirada" "DiaFeira" NOT NULL DEFAULT 'SABADO';
