// context/AppContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const AppContext = createContext(undefined);

// Mock data for initial state
const initialUsers = [
  {
    id: 'user-1',
    name: 'Admin User',
    email: 'admin@example.com',
    phone: '+1234567890',
    role: 'admin',
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'user-2',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1987654321',
    role: 'user',
    createdAt: new Date('2024-02-01')
  }
];

const initialEvents = [
  {
    id: 'event-1',
    title: 'Summer Music Festival',
    description: 'Annual summer music festival featuring top artists from around the world. Join us for an unforgettable experience with multiple stages, food vendors, and art installations.',
    category: 'Music',
    venue: 'Central Park',
    date: new Date('2024-07-15'),
    time: '18:00',
    imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format&fit=crop',
    featured: true,
    ticketCategories: [
      {
        id: 'cat-1-1',
        name: 'General Admission',
        price: 75,
        totalSeats: 500,
        availableSeats: 320,
        description: 'Access to all festival areas'
      },
      {
        id: 'cat-1-2',
        name: 'VIP Pass',
        price: 150,
        totalSeats: 100,
        availableSeats: 45,
        description: 'VIP lounge access + fast track entry'
      },
      {
        id: 'cat-1-3',
        name: 'VIP Plus',
        price: 250,
        totalSeats: 50,
        availableSeats: 12,
        description: 'All VIP benefits + backstage tour'
      }
    ],
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'event-2',
    title: 'Tech Conference 2024',
    description: 'The premier technology conference bringing together innovators, entrepreneurs, and industry leaders. Features keynote speeches, workshops, and networking opportunities.',
    category: 'Technology',
    venue: 'Convention Center',
    date: new Date('2024-09-20'),
    time: '09:00',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w-800&auto=format&fit=crop',
    featured: false,
    ticketCategories: [
      {
        id: 'cat-2-1',
        name: 'Standard Pass',
        price: 299,
        totalSeats: 300,
        availableSeats: 210,
        description: 'Access to all conference sessions'
      },
      {
        id: 'cat-2-2',
        name: 'Premium Pass',
        price: 499,
        totalSeats: 100,
        availableSeats: 65,
        description: 'Includes lunch and networking events'
      }
    ],
    createdAt: new Date('2024-02-10')
  }
];

const initialBookings = [
  {
    id: 'booking-1',
    userId: 'user-2',
    eventId: 'event-1',
    eventTitle: 'Summer Music Festival',
    eventDate: new Date('2024-07-15'),
    eventVenue: 'Central Park',
    items: [
      {
        categoryId: 'cat-1-1',
        categoryName: 'General Admission',
        quantity: 2,
        price: 75
      }
    ],
    totalAmount: 150,
    status: 'confirmed',
    paymentMethod: 'Credit Card',
    transactionId: 'TXN-001',
    bookingDate: new Date('2024-03-01')
  }
];

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState(initialUsers);
  const [events, setEvents] = useState(initialEvents);
  const [bookings, setBookings] = useState(initialBookings);
  const [tickets, setTickets] = useState([]);

  // Load initial data from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedEvents = localStorage.getItem('events');
    const savedBookings = localStorage.getItem('bookings');
    const savedTickets = localStorage.getItem('tickets');
    const savedUsers = localStorage.getItem('users');

    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    if (savedEvents) setEvents(JSON.parse(savedEvents));
    if (savedBookings) setBookings(JSON.parse(savedBookings));
    if (savedTickets) setTickets(JSON.parse(savedTickets));
    if (savedUsers) setUsers(JSON.parse(savedUsers));
  }, []);

  // Save to localStorage on changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  // Auth functions
  const login = (email, password) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      setCurrentUser(userWithoutPassword);
      return { success: true, user: userWithoutPassword };
    }
    return { success: false, error: 'Invalid credentials' };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const register = (userData) => {
    const newUser = {
      id: `user-${uuidv4()}`,
      ...userData,
      role: 'user',
      createdAt: new Date()
    };
    setUsers(prev => [...prev, newUser]);
    const { password: _, ...userWithoutPassword } = newUser;
    setCurrentUser(userWithoutPassword);
    return { success: true, user: userWithoutPassword };
  };

  // Event functions
  const addEvent = (eventData) => {
    const newEvent = {
      ...eventData,
      id: `event-${uuidv4()}`,
      createdAt: new Date()
    };
    setEvents(prev => [...prev, newEvent]);
    return newEvent;
  };

  const updateEvent = (id, data) => {
    setEvents(prev => prev.map(event => 
      event.id === id ? { ...event, ...data } : event
    ));
  };

  const deleteEvent = (id) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  // Booking functions
  const addBooking = (bookingData) => {
    const newBooking = {
      ...bookingData,
      id: `booking-${uuidv4()}`,
      bookingDate: new Date()
    };
    setBookings(prev => [...prev, newBooking]);
    return newBooking;
  };

  const updateBookingStatus = (id, status) => {
    setBookings(prev => prev.map(booking => 
      booking.id === id ? { ...booking, status } : booking
    ));
  };

  const cancelBooking = (id) => {
    updateBookingStatus(id, 'cancelled');
  };

  const getUserBookings = (userId) => {
    return bookings.filter(booking => booking.userId === userId);
  };

  // Ticket functions
  const generateTickets = (booking) => {
    const newTickets = [];
    booking.items.forEach(item => {
      for (let i = 0; i < item.quantity; i++) {
        newTickets.push({
          id: `ticket-${uuidv4()}`,
          bookingId: booking.id,
          userId: booking.userId,
          eventId: booking.eventId,
          eventTitle: booking.eventTitle,
          eventDate: booking.eventDate,
          eventVenue: booking.eventVenue,
          categoryName: item.categoryName,
          price: item.price,
          status: 'valid',
          qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${booking.id}-${item.categoryId}-${i}`
        });
      }
    });
    setTickets(prev => [...prev, ...newTickets]);
  };

  const getUserTickets = (userId) => {
    return tickets.filter(ticket => ticket.userId === userId);
  };

  // User management functions
  const updateUser = (id, data) => {
    setUsers(prev => prev.map(user => 
      user.id === id ? { ...user, ...data } : user
    ));
    
    if (currentUser?.id === id) {
      setCurrentUser(prev => ({ ...prev, ...data }));
    }
  };

  const deleteUser = (id) => {
    setUsers(prev => prev.filter(user => user.id !== id));
    if (currentUser?.id === id) {
      setCurrentUser(null);
    }
  };

  // Ticket availability
  const updateTicketAvailability = (eventId, categoryId, change) => {
    setEvents(prev => prev.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          ticketCategories: event.ticketCategories.map(cat => {
            if (cat.id === categoryId) {
              return {
                ...cat,
                availableSeats: Math.max(0, cat.availableSeats + change)
              };
            }
            return cat;
          })
        };
      }
      return event;
    }));
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
    
    addEvent,
    updateEvent,
    deleteEvent,
    
    addBooking,
    updateBookingStatus,
    cancelBooking,
    getUserBookings,
    
    generateTickets,
    getUserTickets,
    
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