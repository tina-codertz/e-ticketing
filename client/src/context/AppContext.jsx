// context/AppContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ticketsAPI, adminAPI, authAPI } from '../services/api';

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

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setCurrentUser(userData);
        // Fetch events and bookings from API
        loadDataFromAPI();
      } catch (error) {
        console.error('Error loading user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Load data from API
  const loadDataFromAPI = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Fetch available tickets/events
      const eventsData = await ticketsAPI.getAvailableTickets();
      // Transform backend events to frontend format
      const transformedEvents = eventsData.map(event => ({
        id: event.event_id,
        title: event.name,
        description: '',
        category: 'Event',
        venue: event.location,
        date: new Date(event.date),
        time: new Date(event.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format&fit=crop',
        featured: false,
        ticketCategories: [{
          id: `cat-${event.event_id}`,
          name: 'Standard Ticket',
          price: parseFloat(event.price),
          totalSeats: event.total_tickets,
          availableSeats: event.available_tickets,
          description: 'Standard admission ticket'
        }]
      }));
      setEvents(transformedEvents);

      // Fetch user bookings
      const bookingsData = await ticketsAPI.getUserBookings();
      // Transform backend bookings to frontend format
      const transformedBookings = bookingsData.map(booking => ({
        id: booking.booking_id,
        userId: booking.user_id,
        eventId: booking.event_id,
        eventTitle: booking.event_name,
        eventDate: new Date(booking.event_date || booking.booking_time),
        eventVenue: booking.event_location || '',
        items: [{
          categoryId: `cat-${booking.event_id}`,
          categoryName: 'Standard Ticket',
          quantity: booking.ticket_count,
          price: parseFloat(booking.price) || 0
        }],
        totalAmount: (parseFloat(booking.price) || 0) * booking.ticket_count,
        status: booking.status || 'confirmed',
        bookingDate: new Date(booking.booking_time)
      }));
      setBookings(transformedBookings);
    } catch (error) {
      console.error('Error loading data from API:', error);
    }
  };

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
  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const { token, user } = response;
      const userData = {
        ...user,
        id: user.user_id,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name || user.email}`
      };
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setCurrentUser(userData);
      await loadDataFromAPI();
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setEvents([]);
    setBookings([]);
    setTickets([]);
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
  const addBooking = async (bookingData) => {
    try {
      // Call API to create booking
      const result = await ticketsAPI.bookTickets(bookingData.eventId, bookingData.items[0].quantity);
      
      // Reload bookings from API
      await loadDataFromAPI();
      
      return result;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
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
    setCurrentUser,
    users,
    events,
    setEvents,
    bookings,
    setBookings,
    tickets,
    setTickets,
    
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
    loadDataFromAPI,
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