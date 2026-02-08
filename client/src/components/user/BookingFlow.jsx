import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { format } from 'date-fns';
import { toast } from 'sonner';

const BookingFlow = ({ event, items, onBack, onComplete }) => {
  const {
    currentUser,
    addBooking,
    updateTicketAvailability,
    generateTickets
  } = useApp();

  const [step, setStep] = useState('payment'); // payment | processing | confirmed
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [bookingId, setBookingId] = useState('');

  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalTickets = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const handlePayment = (e) => {
    e.preventDefault();
    setStep('processing');

    setTimeout(() => {
      const newBooking = {
        id: `booking-${Date.now()}`,
        userId: currentUser.id,
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        eventVenue: event.venue,
        items,
        totalAmount,
        status: 'paid',
        paymentMethod:
          paymentMethod === 'credit-card' ? 'Credit Card' : 'PayPal',
        transactionId: `TXN-${Date.now()}`,
        bookingDate: new Date(),
        confirmationSent: false
      };

      items.forEach((item) => {
        updateTicketAvailability(
          event.id,
          item.categoryId,
          -item.quantity
        );
      });

      addBooking(newBooking);
      generateTickets(newBooking);

      setBookingId(newBooking.id);
      setStep('confirmed');

      toast.success(
        `Booking confirmed! Email sent to ${currentUser.email}`
      );
    }, 2000);
  };

  /* ================= PROCESSING ================= */
  if (step === 'processing') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded shadow p-12 text-center">
          <div className="mb-6">
            <div className="h-16 w-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            Processing Payment
          </h3>
          <p className="text-gray-600">
            Please wait while we confirm your booking...
          </p>
          <div className="mt-4 w-full bg-gray-200 rounded h-2">
            <div className="bg-blue-600 h-2 rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  /* ================= CONFIRMED ================= */
  if (step === 'confirmed') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded shadow p-12 text-center">
          <div className="mb-6">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <h3 className="text-2xl font-bold mb-2">
            Booking Confirmed!
          </h3>

          <p className="text-gray-600 mb-1">
            Booking ID:{' '}
            <span className="font-mono">{bookingId}</span>
          </p>

          <p className="text-gray-600 mb-6">
            Confirmation email sent to {currentUser.email}
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded p-4 text-left mb-6">
            <h4 className="font-semibold">{event.title}</h4>
            <p className="text-sm text-gray-700">
              {format(event.date, 'EEEE, MMMM d, yyyy')} at{' '}
              {event.time}
            </p>
            <p className="text-sm text-gray-700">{event.venue}</p>

            <div className="border-t my-2" />

            {items.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between text-sm"
              >
                <span>
                  {item.quantity} × {item.categoryName}
                </span>
                <span className="font-medium">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}

            <div className="border-t my-2" />

            <div className="flex justify-between font-bold">
              <span>Total Paid</span>
              <span className="text-green-600">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={onComplete}
              className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700"
            >
              View My Tickets
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full border py-3 rounded"
            >
              Browse More Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ================= PAYMENT ================= */
  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center text-sm text-gray-600 mb-4 hover:text-black"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </button>

      <div className="grid md:grid-cols-3 gap-6">
        {/* ORDER SUMMARY */}
        <div className="bg-white rounded shadow p-6">
          <h3 className="font-semibold mb-2">Order Summary</h3>

          <p className="font-medium">{event.title}</p>
          <p className="text-sm text-gray-600">
            {format(event.date, 'MMM d, yyyy')} • {event.time}
          </p>

          <div className="border-t my-3" />

          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex justify-between text-sm mb-1"
            >
              <span>
                {item.quantity} × {item.categoryName}
              </span>
              <span>
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}

          <div className="border-t my-3" />

          <div className="flex justify-between text-sm">
            <span>Subtotal ({totalTickets} tickets)</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>

          <div className="flex justify-between font-bold text-lg mt-2">
            <span>Total</span>
            <span className="text-blue-600">
              ${totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* PAYMENT FORM */}
        <div className="md:col-span-2 bg-white rounded shadow p-6">
          <h3 className="font-semibold mb-4">Payment Information</h3>

          <form onSubmit={handlePayment} className="space-y-6">
            {/* Payment Method */}
            <div>
              <p className="font-medium mb-2">Payment Method</p>

              <label className="flex items-center border rounded p-4 mb-2 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="credit-card"
                  checked={paymentMethod === 'credit-card'}
                  onChange={() =>
                    setPaymentMethod('credit-card')
                  }
                  className="mr-3"
                />
                <CreditCard className="h-5 w-5 mr-2" />
                Credit / Debit Card
              </label>

              <label className="flex items-center border rounded p-4 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="paypal"
                  checked={paymentMethod === 'paypal'}
                  onChange={() => setPaymentMethod('paypal')}
                  className="mr-3"
                />
                <span className="font-semibold text-blue-600">
                  PayPal
                </span>
              </label>
            </div>

            {paymentMethod === 'credit-card' && (
              <div className="space-y-4">
                <input
                  className="w-full border rounded px-4 py-2"
                  placeholder="Cardholder Name"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  required
                />
                <input
                  className="w-full border rounded px-4 py-2"
                  placeholder="Card Number"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    className="border rounded px-4 py-2"
                    placeholder="MM/YY"
                    required
                  />
                  <input
                    className="border rounded px-4 py-2"
                    placeholder="CVV"
                    required
                  />
                </div>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded text-sm text-yellow-800">
              <strong>Demo Mode:</strong> No real payment is
              processed.
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 flex items-center justify-center"
            >
              <CreditCard className="mr-2 h-5 w-5" />
              Pay ${totalAmount.toFixed(2)}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingFlow;
