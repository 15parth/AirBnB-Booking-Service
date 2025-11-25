import { CreateBookingDTO } from "../dto/booking.dto";
import { confirmBooking, createBooking, createIdempotencyKey, finalizeIdempotencyKey, getIdempotencykey } from "../repositories/booking.repository";
import { NotFoundError } from "../utils/errors/app.error";
import { generateIdempotencyKey } from "../utils/generateIdempotency";

export async function createBookingService(createBookingDTO: CreateBookingDTO){
 
    const booking = await createBooking({
        userId : createBookingDTO.userId,
        hotelid : createBookingDTO.hotelId,
        totalGuest: createBookingDTO.totalGuest,
        bookingAmount : createBookingDTO.bookingAmount
    });

    const idempotencykey = generateIdempotencyKey();

    await createIdempotencyKey(idempotencykey, booking.id)

    return {
        bookingId: booking.id,
        idempotencykey: idempotencykey
    };

}


export async function confirmBookingService(idempotencyKey:string) {
 const idempotencyKeyData = await getIdempotencykey(idempotencyKey);
 
 if(!idempotencyKeyData){
    throw new NotFoundError('Idempotency key not found');
 }

 const booking = await confirmBooking(idempotencyKeyData.bookingId);

 await finalizeIdempotencyKey(idempotencyKey);

 return booking;

}