import { bookingsApi } from "@/lib/api";

/**
 * Starts a timer to release a booking hold after 15 minutes
 * @param bookingId - The ID of the booking to release
 * @param onRelease - Callback function when hold is released
 * @returns A function to clear the timeout if needed
 */
export const startHoldTimer = (bookingId: string, onRelease?: () => void) => {
  const HOLD_DURATION_MS = 15 * 60 * 1000; // 15 minutes
  
  const timer = setTimeout(async () => {
    try {
      await bookingsApi.releaseHold(bookingId);
      onRelease?.();
    } catch (error) {
      console.error('Failed to release booking hold:', error);
      // Retry after 30 seconds if the first attempt fails
      setTimeout(() => {
        bookingsApi.releaseHold(bookingId).catch(console.error);
      }, 30000);
    }
  }, HOLD_DURATION_MS);

  // Return cleanup function to clear the timeout if needed
  return () => clearTimeout(timer);
};

/**
 * Confirms a booking after successful payment
 * @param bookingId - The ID of the booking to confirm
 * @param onSuccess - Callback on successful confirmation
 * @param onError - Callback if confirmation fails
 */
export const confirmBookingAfterPayment = async (
  bookingId: string, 
  onSuccess?: () => void,
  onError?: (error: any) => void
) => {
  try {
    await bookingsApi.confirmBooking(bookingId);
    onSuccess?.();
  } catch (error) {
    console.error('Failed to confirm booking:', error);
    onError?.(error);
  }
};
