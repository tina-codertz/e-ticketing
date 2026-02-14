// EventManagement.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Edit, Trash2, Calendar, Image as ImageIcon, Star, Upload, X, Eye, Search } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { toast } from 'sonner';
// Removed ReactQuill - using textarea instead (ReactQuill incompatible with React 19)

const EventManagement = () => {
  const { events, addEvent, updateEvent, deleteEvent, bookings, loadDataFromAPI } = useApp();

  // Load data on mount
  useEffect(() => {
    loadDataFromAPI();
  }, []);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'music',
    venue: '',
    address: '',
    date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    time: '19:00',
    endDate: '',
    endTime: '',
    imageUrl: 'https://images.unsplash.com/photo-1740459057005-65f000db582f',
    featured: false,
    organizer: '',
    organizerContact: '',
    tags: ''
  });

  const [ticketCategories, setTicketCategories] = useState([
    {
      id: `cat-${Date.now()}`,
      name: 'General Admission',
      price: 50,
      totalSeats: 100,
      availableSeats: 100,
      description: 'Standard entry ticket',
      earlyBird: false,
      earlyBirdPrice: 40,
      earlyBirdEnd: format(addDays(new Date(), 3), 'yyyy-MM-dd')
    },
  ]);

  const categories = useMemo(() => 
    ['all', ...new Set(events.map(e => e.category))], 
    [events]
  );

  const filteredEvents = useMemo(() => 
    events.filter(event => {
      const matchesSearch = 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = 
        categoryFilter === 'all' || event.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [events, searchTerm, categoryFilter]
  );

  const openDialog = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        description: event.description,
        category: event.category,
        venue: event.venue,
        address: event.address || '',
        date: format(event.date, 'yyyy-MM-dd'),
        time: event.time || '19:00',
        endDate: event.endDate ? format(event.endDate, 'yyyy-MM-dd') : '',
        endTime: event.endTime || '',
        imageUrl: event.imageUrl,
        featured: event.featured,
        organizer: event.organizer || '',
        organizerContact: event.organizerContact || '',
        tags: event.tags || ''
      });
      setTicketCategories(event.ticketCategories.map(cat => ({
        ...cat,
        earlyBird: cat.earlyBird || false,
        earlyBirdPrice: cat.earlyBirdPrice || cat.price,
        earlyBirdEnd: cat.earlyBirdEnd || ''
      })));
    } else {
      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        category: 'music',
        venue: '',
        address: '',
        date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
        time: '19:00',
        endDate: '',
        endTime: '',
        imageUrl: 'https://images.unsplash.com/photo-1740459057005-65f000db582f',
        featured: false,
        organizer: '',
        organizerContact: '',
        tags: ''
      });
      setTicketCategories([
        {
          id: `cat-${Date.now()}`,
          name: 'General Admission',
          price: 50,
          totalSeats: 100,
          availableSeats: 100,
          description: 'Standard entry ticket',
          earlyBird: false,
          earlyBirdPrice: 40,
          earlyBirdEnd: format(addDays(new Date(), 3), 'yyyy-MM-dd')
        },
      ]);
    }
    setIsDialogOpen(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, upload to cloud storage and get URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('Event title is required');
      return false;
    }
    if (!formData.date) {
      toast.error('Event date is required');
      return false;
    }
    if (ticketCategories.some(cat => !cat.name.trim() || cat.price <= 0)) {
      toast.error('Please check all ticket categories');
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const eventData = {
      id: editingEvent?.id || `event-${Date.now()}`,
      ...formData,
      date: new Date(formData.date),
      endDate: formData.endDate ? new Date(formData.endDate) : null,
      ticketCategories: ticketCategories.map(cat => ({
        ...cat,
        availableSeats: editingEvent ? cat.availableSeats : cat.totalSeats
      })),
      createdAt: editingEvent?.createdAt || new Date(),
      updatedAt: new Date(),
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      stats: {
        views: editingEvent?.stats?.views || 0,
        bookings: editingEvent?.stats?.bookings || 0
      }
    };

    try {
      if (editingEvent) {
        updateEvent(editingEvent.id, eventData);
        toast.success('Event updated successfully!');
      } else {
        addEvent(eventData);
        toast.success('Event created successfully!');
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Failed to save event');
    }
  };

  const addTicketCategory = () => {
    setTicketCategories([
      ...ticketCategories,
      {
        id: `cat-${Date.now()}`,
        name: '',
        price: 0,
        totalSeats: 100,
        availableSeats: 100,
        description: '',
        earlyBird: false,
        earlyBirdPrice: 0,
        earlyBirdEnd: ''
      },
    ]);
  };

  const updateTicketCategory = (index, field, value) => {
    const updated = [...ticketCategories];
    updated[index][field] = value;
    
    if (field === 'totalSeats' && !editingEvent) {
      updated[index].availableSeats = value;
    }
    
    if (field === 'earlyBird') {
      if (value && !updated[index].earlyBirdPrice) {
        updated[index].earlyBirdPrice = updated[index].price * 0.8;
      }
    }
    
    setTicketCategories(updated);
  };

  const removeTicketCategory = (index) => {
    if (ticketCategories.length > 1) {
      setTicketCategories(ticketCategories.filter((_, i) => i !== index));
    } else {
      toast.error('At least one ticket category is required');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    const eventBookings = bookings.filter(b => b.eventId === eventId);
    
    if (eventBookings.length > 0) {
      toast.error(`Cannot delete event with ${eventBookings.length} active bookings`);
      return;
    }

    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        await deleteEvent(eventId);
        toast.success('Event deleted successfully');
        await loadDataFromAPI(); // Reload events
      } catch (error) {
        console.error('Error deleting event:', error);
        toast.error(error.message || 'Failed to delete event. It may have active bookings.');
      }
    }
  };

  const getEventStats = (event) => {
    const totalSeats = event.ticketCategories.reduce((s, c) => s + c.totalSeats, 0);
    const availableSeats = event.ticketCategories.reduce((s, c) => s + c.availableSeats, 0);
    const soldSeats = totalSeats - availableSeats;
    const revenue = bookings
      .filter(b => b.eventId === event.id && (b.status === 'confirmed' || b.status === 'paid'))
      .reduce((sum, b) => sum + b.totalAmount, 0);
    
    return { totalSeats, soldSeats, revenue, percentage: (soldSeats / totalSeats) * 100 };
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-blue-900 text-white rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Event Management</h1>
            <p className="text-purple-200">Create, edit, and manage your events</p>
          </div>
          <button
            onClick={() => openDialog()}
            className="mt-4 md:mt-0 flex items-center gap-2 bg-white text-purple-700 px-5 py-3 rounded-xl hover:bg-purple-50 transition-all hover:scale-105"
          >
            <Plus size={20} />
            Create Event
          </button>
        </div>
      </div>

      {/* Filters and Stats */}
      <div className="bg-white rounded-2xl shadow-lg border border-blue-500 p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search events by title, description, or venue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>

          <div className="flex gap-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>

            <div className="flex border border-gray-300 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-3 ${viewMode === 'grid' ? 'bg-blue-100 text-purple-700' : 'bg-white'}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-3 ${viewMode === 'list' ? 'bg-purple-100 text-purple-700' : 'bg-white'}`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-100 border border-blue-500 rounded-xl p-4">
            <p className="text-sm text-blue-600">Total Events</p>
            <p className="text-2xl font-bold text-blue-700">{events.length}</p>
          </div>
          <div className="bg-blue-100 border border-blue-500 rounded-xl p-4">
            <p className="text-sm text-blue-600">Active Events</p>
            <p className="text-2xl font-bold text-blue-700">
              {events.filter(e => new Date(e.date) >= new Date()).length}
            </p>
          </div>
          <div className="bg-blue-100 border border-blue-500 rounded-xl p-4">
            <p className="text-sm text-green-600">Featured</p>
            <p className="text-2xl font-bold text-green-700">
              {events.filter(e => e.featured).length}
            </p>
          </div>
          <div className="bg-blue-100 border border-blue-500 rounded-xl p-4">
            <p className="text-sm text-orange-600">Today's Events</p>
            <p className="text-2xl font-bold text-orange-700">
              {events.filter(e => format(new Date(e.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')).length}
            </p>
          </div>
        </div>

        {/* Events Grid/List */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No events found</p>
            <p className="text-gray-400">Try adjusting your search or create a new event</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const stats = getEventStats(event);
              const isUpcoming = new Date(event.date) >= new Date();
              const isSoldOut = stats.soldSeats >= stats.totalSeats;

              return (
                <div key={event.id} className="group border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="relative">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-48 object-cover"
                    />
                    {event.featured && (
                      <div className="absolute top-3 left-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Star size={12} />
                        Featured
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full text-xs">
                      {event.category}
                    </div>
                    {isSoldOut && (
                      <div className="absolute inset-0 bg-red-500/90 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">SOLD OUT</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1">
                        {event.title}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        isUpcoming ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {isUpcoming ? 'Upcoming' : 'Past'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <Calendar size={14} />
                      {format(event.date, 'MMM d, yyyy')} • {event.time}
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {event.description.replace(/<[^>]*>/g, '')}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Ticket Sales</span>
                        <span className="font-semibold">
                          {stats.soldSeats}/{stats.totalSeats}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-2 bg-blue-900 rounded-full transition-all duration-500"
                          style={{ width: `${stats.percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Revenue</span>
                        <span className="font-semibold text-green-600">
                          ${stats.revenue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openDialog(event)}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                        >
                          <Edit size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() => {/* View event details */}}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Event</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date & Time</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Sales</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Revenue</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEvents.map((event) => {
                  const stats = getEventStats(event);
                  const isUpcoming = new Date(event.date) >= new Date();

                  return (
                    <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="w-16 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-900">{event.title}</p>
                              {event.featured && (
                                <Star size={14} className="text-yellow-500" />
                              )}
                            </div>
                            <p className="text-sm text-gray-500">{event.venue}</p>
                            <p className="text-xs text-gray-400">{event.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          <span className="text-sm">
                            {format(event.date, 'MMM d, yyyy')}
                            <br />
                            <span className="text-gray-500">{event.time}</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Sold</span>
                            <span className="font-semibold">{stats.soldSeats}</span>
                          </div>
                          <div className="w-32 h-2 bg-gray-200 rounded-full">
                            <div
                              className="h-2 bg-purple-500 rounded-full"
                              style={{ width: `${stats.percentage}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-green-600">
                          ${stats.revenue.toLocaleString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          isUpcoming 
                            ? stats.soldSeats >= stats.totalSeats 
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {isUpcoming 
                            ? stats.soldSeats >= stats.totalSeats ? 'Sold Out' : 'Active'
                            : 'Ended'
                          }
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openDialog(event)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-sm text-gray-500 mt-4">
          Showing {filteredEvents.length} of {events.length} events
        </p>
      </div>

      {/* Create/Edit Event Modal */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <form onSubmit={handleSubmit} className="h-full flex flex-col">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingEvent ? 'Edit Event' : 'Create New Event'}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Event Image
                      </label>
                      <div className="relative">
                        <img
                          src={formData.imageUrl}
                          alt="Event preview"
                          className="w-full h-48 object-cover rounded-xl mb-3"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-3 right-3 bg-white/90 hover:bg-white border border-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <Upload size={16} />
                          Change Image
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          accept="image/*"
                          className="hidden"
                        />
                      </div>
                    </div>

                    {/* Basic Info */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Event Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Enter event title"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="music">Music</option>
                          <option value="sports">Sports</option>
                          <option value="conference">Conference</option>
                          <option value="theater">Theater</option>
                          <option value="comedy">Comedy</option>
                          <option value="workshop">Workshop</option>
                          <option value="festival">Festival</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="featured"
                          checked={formData.featured}
                          onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <label htmlFor="featured" className="text-sm text-gray-700">
                          Mark as featured event
                        </label>
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          min={format(new Date(), 'yyyy-MM-dd')}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Time
                        </label>
                        <input
                          type="time"
                          value={formData.time}
                          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={6}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
                        placeholder="Enter event description..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        You can use plain text or basic formatting
                      </p>
                    </div>

                    {/* Venue & Location */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Venue Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.venue}
                          onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Enter venue name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address
                        </label>
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Enter full address"
                        />
                      </div>
                    </div>

                    {/* Ticket Categories */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                          Ticket Categories
                        </label>
                        <button
                          type="button"
                          onClick={addTicketCategory}
                          className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                        >
                          + Add Category
                        </button>
                      </div>
                      
                      <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
                        {ticketCategories.map((category, index) => (
                          <div key={category.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium text-gray-900">Category {index + 1}</h4>
                              {ticketCategories.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeTicketCategory(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X size={16} />
                                </button>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <input
                                type="text"
                                placeholder="Category Name"
                                value={category.name}
                                onChange={(e) => updateTicketCategory(index, 'name', e.target.value)}
                                className="border border-gray-300 rounded px-3 py-2 text-sm"
                              />
                              <input
                                type="number"
                                placeholder="Price"
                                value={category.price}
                                onChange={(e) => updateTicketCategory(index, 'price', parseFloat(e.target.value))}
                                className="border border-gray-300 rounded px-3 py-2 text-sm"
                                min="0"
                                step="0.01"
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <input
                                type="number"
                                placeholder="Total Seats"
                                value={category.totalSeats}
                                onChange={(e) => updateTicketCategory(index, 'totalSeats', parseInt(e.target.value))}
                                className="border border-gray-300 rounded px-3 py-2 text-sm"
                                min="1"
                              />
                              <input
                                type="text"
                                placeholder="Description"
                                value={category.description}
                                onChange={(e) => updateTicketCategory(index, 'description', e.target.value)}
                                className="border border-gray-300 rounded px-3 py-2 text-sm"
                              />
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                id={`early-bird-${index}`}
                                checked={category.earlyBird}
                                onChange={(e) => updateTicketCategory(index, 'earlyBird', e.target.checked)}
                                className="rounded border-gray-300"
                              />
                              <label htmlFor={`early-bird-${index}`} className="text-sm text-gray-700">
                                Early Bird Pricing
                              </label>
                            </div>
                            
                            {category.earlyBird && (
                              <div className="grid grid-cols-2 gap-3">
                                <input
                                  type="number"
                                  placeholder="Early Bird Price"
                                  value={category.earlyBirdPrice}
                                  onChange={(e) => updateTicketCategory(index, 'earlyBirdPrice', parseFloat(e.target.value))}
                                  className="border border-gray-300 rounded px-3 py-2 text-sm"
                                  min="0"
                                  step="0.01"
                                />
                                <input
                                  type="date"
                                  placeholder="Early Bird End Date"
                                  value={category.earlyBirdEnd}
                                  onChange={(e) => updateTicketCategory(index, 'earlyBirdEnd', e.target.value)}
                                  className="border border-gray-300 rounded px-3 py-2 text-sm"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManagement;