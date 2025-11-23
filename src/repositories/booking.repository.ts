import { Booking, Prisma } from "../generated/client";
import prismaClient from "../prisma/client";


export async function createBooking (bookingInput : Prisma.BookingCreateInput){
   const booking = await prismaClient.booking.create({
    data:bookingInput
   })

   return booking;
}

export async function createIdempotencyKey(key:number, booking?:Booking) {
   const idempotencyKey= await prismaClient.idempotencyKey.create({
      data:{
         key,
         booking
      }
   })
}