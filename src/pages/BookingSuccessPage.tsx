import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function BookingSuccessPage() {
  const [searchParams] = useSearchParams();
  const bookingUrl = searchParams.get('booking_url');

  useEffect(() => {
    if (bookingUrl) {
      window.location.href = bookingUrl;
    }
  }, [bookingUrl]);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background text-foreground">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Payment Successful! 🎉</h1>
        <p className="text-muted-foreground">
          {bookingUrl ? 'Redirecting you to book your session...' : 'Thank you for your purchase!'}
        </p>
      </div>
    </div>
  );
}
