import { CreateBookingDTO } from "../dto/booking.dto";
import { confirmBooking, createBooking, createIdempotencyKey, finalizeIdempotencyKey, getIdempotencykeyWithLock } from "../repositories/booking.repository";
import { BadRequestError, InternalServerError, NotFoundError } from "../utils/errors/app.error";
import { generateIdempotencyKey } from "../utils/generateIdempotency";
import prismaClient from '../prisma/client'
import { redlock } from "../config/redis.config";

export async function createBookingService(createBookingDTO: CreateBookingDTO) {

    const ttl = 50000;
    const bookingResource = `hotel:${createBookingDTO.hotelid}`;


    try {

         await redlock.acquire([bookingResource], ttl);
      

        const booking = await createBooking({
            userId: createBookingDTO.userId,
            hotelid: createBookingDTO.hotelid,
            totalGuest: createBookingDTO.totalGuest,
            bookingAmount: createBookingDTO.bookingAmount
        });

        const idempotencykey = generateIdempotencyKey();

        await createIdempotencyKey(idempotencykey, booking.id)

        return {
            bookingId: booking.id,
            idempotencykey: idempotencykey
        };

    } catch (error) {
        throw new InternalServerError('Failed to acquire lock for the booking resource')
    }

}


export async function confirmBookingService(idempotencyKey: string) {
    return await prismaClient.$transaction(async (tx) => {
        const idempotencyKeyData = await getIdempotencykeyWithLock(idempotencyKey, tx);

        if (!idempotencyKeyData || !idempotencyKeyData.bookingId) {
            throw new NotFoundError('Idempotency key not found');
        }

        if (idempotencyKeyData.finalized) {
            throw new BadRequestError('idempotency key already exists');
        }

        const booking = await confirmBooking(tx, idempotencyKeyData.bookingId);

        await finalizeIdempotencyKey(tx, idempotencyKey);

        return booking;
    })


}