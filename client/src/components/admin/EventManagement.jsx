import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Edit, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const EventManagement = () => {
  const { events, addEvent, updateEvent, deleteEvent } = useApp();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    venue: '',
    date: '',
    time: '',
    imageUrl: '',
    featured: false,
  });

  const [ticketCategories, setTicketCategories] = useState([
    {
      id: 'cat-1',
      name: 'General',
      price: 50,
      totalSeats: 100,
      availableSeats: 100,
      description: 'General admission',
    },
  ]);

  const openDialog = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        description: event.description,
        category: event.category,
        venue: event.venue,
        date: format(event.date, 'yyyy-MM-dd'),
        time: event.time,
        imageUrl: event.imageUrl,
        featured: event.featured,
      });
      setTicketCategories(event.ticketCategories);
    } else {
      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        category: '',
        venue: '',
        date: '',
        time: '',
        imageUrl:
          'https://images.unsplash.com/photo-1740459057005-65f000db582f',
        featured: false,
      });
      setTicketCategories([
        {
          id: `cat-${Date.now()}`,
          name: 'General',
          price: 50,
          totalSeats: 100,
          availableSeats: 100,
          description: 'General admission',
        },
      ]);
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const eventData = {
      id: editingEvent?.id || `event-${Date.now()}`,
      ...formData,
      date: new Date(formData.date),
      ticketCategories,
      createdAt: editingEvent?.createdAt || new Date(),
    };

    if (editingEvent) {
      updateEvent(editingEvent.id, eventData);
      toast.success('Event updated');
    } else {
      addEvent(eventData);
      toast.success('Event created');
    }

    setIsDialogOpen(false);
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
      },
    ]);
  };

  const updateTicketCategory = (index, field, value) => {
    const updated = [...ticketCategories];
    updated[index][field] = value;
    if (field === 'totalSeats' && !editingEvent) {
      updated[index].availableSeats = value;
    }
    setTicketCategories(updated);
  };

  const removeTicketCategory = (index) => {
    setTicketCategories(ticketCategories.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Event Management</h1>
          <p className="text-gray-500">Create and manage events</p>
        </div>
        <button
          onClick={() => openDialog()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <Plus size={16} /> Create Event
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Event</th>
              <th className="p-3">Category</th>
              <th className="p-3">Date</th>
              <th className="p-3">Venue</th>
              <th className="p-3">Tickets</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => {
              const total = event.ticketCategories.reduce(
                (s, c) => s + c.totalSeats,
                0
              );
              const available = event.ticketCategories.reduce(
                (s, c) => s + c.availableSeats,
                0
              );

              return (
                <tr key={event.id} className="border-t">
                  <td className="p-3 flex gap-3 items-center">
                    <img
                      src={event.imageUrl}
                      alt=""
                      className="w-16 h-10 rounded object-cover"
                    />
                    <div>
                      <p className="font-medium">{event.title}</p>
                      {event.featured && (
                        <span className="text-xs bg-yellow-100 px-2 py-0.5 rounded">
                          Featured
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3">{event.category}</td>
                  <td className="p-3 flex items-center gap-1">
                    <Calendar size={14} />
                    {format(event.date, 'MMM d, yyyy')}
                  </td>
                  <td className="p-3 truncate max-w-xs">{event.venue}</td>
                  <td className="p-3">
                    {total - available} / {total} sold
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => openDialog(event)}
                      className="text-blue-600 hover:underline"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="text-red-500 hover:underline"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded p-6 w-full max-w-3xl space-y-4 overflow-y-auto max-h-[90vh]"
          >
            <h2 className="text-xl font-bold">
              {editingEvent ? 'Edit Event' : 'Create Event'}
            </h2>

            <input
              className="w-full border p-2 rounded"
              placeholder="Event Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />

            <textarea
              className="w-full border p-2 rounded"
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setIsDialogOpen(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default EventManagement;
