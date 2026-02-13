import React, { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Check, Smartphone, Wallet } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';

const BookingFlow = ({ event: propEvent, items: propItems = [], onBack, onComplete }) => {
  const {
    currentUser,
    addBooking,
    generateTickets,
    loadDataFromAPI,
    events
  } = useApp();

  const navigate = useNavigate();
  const location = useLocation();
  
  // Get event and items from props, route state, or location state
  const routeState = location.state || {};
  const eventFromState = routeState.event || propEvent;
  const itemsFromState = routeState.items || propItems;
  
  const [event, setEvent] = useState(eventFromState);
  const [items, setItems] = useState(itemsFromState);
  const [step, setStep] = useState('payment'); // payment | processing | confirmed
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [mobileMoneyProvider, setMobileMoneyProvider] = useState('mtn');
  const [bookingId, setBookingId] = useState('');

  // Try to get event from URL params or events list if not provided
  useEffect(() => {
    if (!event && itemsFromState.length > 0) {
      const eventId = itemsFromState[0]?.eventId;
      if (eventId) {
        const foundEvent = events.find(e => String(e.id) === String(eventId));
        if (foundEvent) {
          setEvent(foundEvent);
        }
      }
    }
  }, [events, itemsFromState]);

  const safeItems = Array.isArray(items) ? items : [];

  const totalAmount = safeItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalTickets = safeItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // If required data is missing, show a friendly fallback instead of crashing
  if (!event || safeItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <CreditCard className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <h3 className="text-xl font-semibold mb-2 text-gray-800">No tickets selected</h3>
        <p className="text-gray-600 mb-6">
          Please choose an event and tickets before proceeding to payment.
        </p>
        <button
          onClick={() => {
            if (onBack) {
              onBack();
            } else {
              navigate('/');
            }
          }}
          className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 transition-opacity font-semibold"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to events
        </button>
      </div>
    );
  }

  const handlePayment = async (e) => {
    e.preventDefault();
    
    // Validate payment method specific fields
    if (paymentMethod === 'credit-card' && (!cardName || !cardNumber)) {
      toast.error('Please fill in all card details');
      return;
    }
    
    if (paymentMethod === 'mobile-money' && !mobileNumber) {
      toast.error('Please enter your mobile money number');
      return;
    }

    setStep('processing');

    try {
      // Prepare booking data
      const bookingData = {
        userId: currentUser.id || currentUser.user_id,
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        eventVenue: event.venue,
        items,
        totalAmount,
        status: 'confirmed',
        paymentMethod: paymentMethod === 'credit-card' 
          ? 'Credit Card' 
          : paymentMethod === 'mobile-money'
          ? `Mobile Money (${mobileMoneyProvider.toUpperCase()})`
          : 'PayPal',
        transactionId: `TXN-${Date.now()}`,
        paymentDetails: paymentMethod === 'mobile-money' 
          ? { provider: mobileMoneyProvider, phoneNumber: mobileNumber }
          : paymentMethod === 'credit-card'
          ? { cardName, last4: cardNumber.slice(-4) }
          : {}
      };

      // Call API to create booking
      await addBooking(bookingData);

      // Generate tickets locally (will be synced with backend)
      const newBooking = {
        ...bookingData,
        id: `booking-${Date.now()}`,
        bookingDate: new Date()
      };
      generateTickets(newBooking);

      // Reload data from API
      await loadDataFromAPI();

      setBookingId(newBooking.id);
      setStep('confirmed');

      toast.success(
        `Booking confirmed! ${paymentMethod === 'mobile-money' ? 'Payment instructions sent to your phone.' : 'Confirmation email sent to ' + currentUser.email}`
      );
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || error.message || 'Payment failed. Please try again.');
      setStep('payment');
    }
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
              onClick={() => {
                if (onComplete) {
                  onComplete();
                } else {
                  navigate('/tickets');
                }
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl hover:opacity-90 transition-opacity font-semibold"
            >
              View My Tickets
            </button>
            <button
              onClick={() => {
                if (onBack) {
                  onBack();
                } else {
                  navigate('/');
                }
              }}
              className="w-full border border-gray-300 py-3 rounded-xl hover:bg-gray-50 transition-colors"
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
              <p className="font-medium mb-3">Payment Method</p>

              <div className="space-y-2">
                <label className={`flex items-center border-2 rounded-xl p-4 cursor-pointer transition-all ${
                  paymentMethod === 'credit-card' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="credit-card"
                    checked={paymentMethod === 'credit-card'}
                    onChange={() => setPaymentMethod('credit-card')}
                    className="mr-3"
                  />
                  <CreditCard className="h-5 w-5 mr-2 text-gray-600" />
                  <span className="font-medium">Credit / Debit Card</span>
                </label>

                <label className={`flex items-center border-2 rounded-xl p-4 cursor-pointer transition-all ${
                  paymentMethod === 'mobile-money' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="mobile-money"
                    checked={paymentMethod === 'mobile-money'}
                    onChange={() => setPaymentMethod('mobile-money')}
                    className="mr-3"
                  />
                  <Smartphone className="h-5 w-5 mr-2 text-green-600" />
                  <span className="font-medium">Mobile Money</span>
                </label>

                <label className={`flex items-center border-2 rounded-xl p-4 cursor-pointer transition-all ${
                  paymentMethod === 'paypal' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={() => setPaymentMethod('paypal')}
                    className="mr-3"
                  />
                  <Wallet className="h-5 w-5 mr-2 text-blue-600" />
                  <span className="font-semibold text-blue-600">PayPal</span>
                </label>
              </div>
            </div>

            {paymentMethod === 'credit-card' && (
              <div className="space-y-4 bg-gray-50 p-4 rounded-xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
                      const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                      setCardNumber(formatted);
                    }}
                    maxLength={19}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="MM/YY"
                      maxLength={5}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="123"
                      maxLength={4}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'mobile-money' && (
              <div className="space-y-4 bg-green-50 p-4 rounded-xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Money Provider
                  </label>
                  <select
                    value={mobileMoneyProvider}
                    onChange={(e) => setMobileMoneyProvider(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="mtn">MTN Mobile Money</option>
                    <option value="vodacom">Vodacom M-Pesa</option>
                    <option value="airtel">Airtel Money</option>
                    <option value="tigo">Tigo Pesa</option>
                    <option value="orange">Orange Money</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="+255 123 456 789"
                    value={mobileNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setMobileNumber(value);
                    }}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter your mobile money registered number
                  </p>
                </div>
                <div className="bg-white border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    <strong>Payment Instructions:</strong>
                  </p>
                  <ol className="text-xs text-gray-600 mt-2 space-y-1 list-decimal list-inside">
                    <li>You will receive a payment prompt on your phone</li>
                    <li>Enter your mobile money PIN to confirm</li>
                    <li>Your booking will be confirmed automatically</li>
                  </ol>
                </div>
              </div>
            )}

            {paymentMethod === 'paypal' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  You will be redirected to PayPal to complete your payment securely.
                </p>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-sm text-yellow-800">
              <strong>Demo Mode:</strong> No real payment is processed. This is a demonstration of the payment flow.
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center font-semibold shadow-lg"
            >
              {paymentMethod === 'mobile-money' ? (
                <>
                  <Smartphone className="mr-2 h-5 w-5" />
                  Pay ${totalAmount.toFixed(2)} via Mobile Money
                </>
              ) : paymentMethod === 'paypal' ? (
                <>
                  <Wallet className="mr-2 h-5 w-5" />
                  Pay ${totalAmount.toFixed(2)} with PayPal
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-5 w-5" />
                  Pay ${totalAmount.toFixed(2)}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingFlow;
