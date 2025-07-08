-- CreateTable
CREATE TABLE "CashRequest" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CashRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CashRequest" ADD CONSTRAINT "CashRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
