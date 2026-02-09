import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(undefined);

export const AppProvider = ({ children }) => {
  /* =======================
     State
  ======================= */
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tickets, setTickets] = useState([]);

  /* =======================
     Persist auth (optional)
  ======================= */
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  /* =======================
     Auth (Backend-ready)
  ======================= */
  const login = async (email, password) => {
    // TODO: call backend API
    // const res = await api.post('/login', { email, password })
    // setCurrentUser(res.data.user)

    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('token');
  };

  const register = async (payload) => {
    // TODO: call backend API
    // await api.post('/register', payload)

    return true;
  };

  /* =======================
     Events
  ======================= */
  const fetchEvents = async () => {
    // TODO: GET /events
    // setEvents(res.data)
  };

  const addEvent = async (event) => {
    // TODO: POST /events
    // setEvents(prev => [...prev, res.data])
  };

  const updateEvent = async (id, data) => {
    // TODO: PUT /events/:id
    // setEvents(prev => prev.map(e => e.id === id ? res.data : e))
  };

  const deleteEvent = async (id) => {
    // TODO: DELETE /events/:id
    // setEvents(prev => prev.filter(e => e.id !== id))
  };

  /* =======================
     Bookings
  ======================= */
  const fetchBookings = async () => {
    // TODO: GET /bookings
  };

  const addBooking = async (booking) => {
    // TODO: POST /bookings
  };

  const updateBookingStatus = async (id, status) => {
    // TODO: PATCH /bookings/:id/status
  };

  const cancelBooking = async (id) => {
    // TODO: PATCH /bookings/:id/cancel
  };

  const getUserBookings = (userId) => {
    return bookings.filter(b => b.userId === userId);
  };

  /* =======================
     Tickets
  ======================= */
  const fetchTickets = async () => {
    // TODO: GET /tickets
  };

  const generateTickets = async (bookingId) => {
    // TODO: POST /tickets/generate
  };

  const getUserTickets = (userId) => {
    return tickets.filter(t => t.userId === userId);
  };

  /* =======================
     Users (Admin)
  ======================= */
  const fetchUsers = async () => {
    // TODO: GET /users
  };

  const updateUser = async (id, data) => {
    // TODO: PUT /users/:id
  };

  const deleteUser = async (id) => {
    // TODO: DELETE /users/:id
  };

  /* =======================
     Availability
  ======================= */
  const updateTicketAvailability = async (eventId, categoryId, change) => {
    // TODO: PATCH /events/:id/availability
  };

  const value = {
    currentUser,
    users,
    events,
    bookings,
    tickets,

    login,
    logout,
    register,

    fetchEvents,
    addEvent,
    updateEvent,
    deleteEvent,

    fetchBookings,
    addBooking,
    updateBookingStatus,
    cancelBooking,
    getUserBookings,

    fetchTickets,
    generateTickets,
    getUserTickets,

    fetchUsers,
    updateUser,
    deleteUser,

    updateTicketAvailability,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
