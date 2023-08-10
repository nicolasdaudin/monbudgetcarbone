-- CreateEnum
CREATE TYPE "OutboundInboundType" AS ENUM ('outbound', 'inbound');

-- CreateTable
CREATE TABLE "FlightTravel" (
    "id" SERIAL NOT NULL,
    "user" TEXT NOT NULL,

    CONSTRAINT "FlightTravel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Route" (
    "id" SERIAL NOT NULL,
    "type" "OutboundInboundType" NOT NULL,
    "order" INTEGER,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "distance" INTEGER NOT NULL,
    "kgCO2eq" DOUBLE PRECISION NOT NULL,
    "flightTravelId" INTEGER NOT NULL,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_flightTravelId_fkey" FOREIGN KEY ("flightTravelId") REFERENCES "FlightTravel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
