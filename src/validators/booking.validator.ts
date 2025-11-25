import { z } from "zod";

export const createBookingSchema = z.object({
   userId: z.number({message:"User ID must be present"}),
   hotelid: z.number({message:"Hotel ID must be present"}),
   totalGuest: z.number({message:"Total Guest must be present"}).min(1,{message:"Total guest must be more than 1"}),
   bookingAmount: z.number({message:"Booking Amount must be present"}).min(10,{message:"Booking amount must be greater than 10"})
})