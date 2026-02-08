import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { DollarSign, Ticket, Users, Calendar } from 'lucide-react';
import { format, subDays } from 'date-fns';

export const AdminDashboard = () => {
  const { events, bookings, users, tickets } = useApp();

  const totalRevenue = bookings
    .filter(b => b.status === 'confirmed' || b.status === 'paid')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const totalBookings = bookings.length;
  const totalTicketsSold = tickets.filter(
    t => t.status === 'valid' || t.status === 'used'
  ).length;
  const totalUsers = users.filter(u => u.role === 'user').length;

  const revenueByEvent = events
    .map(event => {
      const revenue = bookings
        .filter(
          b =>
            b.eventId === event.id &&
            (b.status === 'confirmed' || b.status === 'paid')
        )
        .reduce((sum, b) => sum + b.totalAmount, 0);

      return {
        name:
          event.title.length > 20
            ? event.title.slice(0, 20) + '...'
            : event.title,
        revenue
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  const bookingsByStatus = [
    { name: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length, color: '#22c55e' },
    { name: 'Paid', value: bookings.filter(b => b.status === 'paid').length, color: '#3b82f6' },
    { name: 'Pending', value: bookings.filter(b => b.status === 'pending').length, color: '#f59e0b' },
    { name: 'Cancelled', value: bookings.filter(b => b.status === 'cancelled').length, color: '#ef4444' }
  ].filter(i => i.value > 0);

  const salesTrend = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const sales = bookings
      .filter(b => {
        const d = new Date(b.bookingDate);
        return (
          format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') &&
          (b.status === 'confirmed' || b.status === 'paid')
        );
      })
      .reduce((sum, b) => sum + b.totalAmount, 0);

    return { date: format(date, 'MMM dd'), sales };
  });

  const upcomingEvents = events
    .filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Overview of your ticketing system</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Revenue',
            value: `$${totalRevenue.toFixed(2)}`,
            icon: <DollarSign />,
            color: 'green'
          },
          {
            label: 'Total Bookings',
            value: totalBookings,
            icon: <Calendar />,
            color: 'blue'
          },
          {
            label: 'Tickets Sold',
            value: totalTicketsSold,
            icon: <Ticket />,
            color: 'purple'
          },
          {
            label: 'Total Users',
            value: totalUsers,
            icon: <Users />,
            color: 'orange'
          }
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow p-6 flex justify-between items-center"
          >
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className={`text-2xl font-bold text-${stat.color}-600`}>
                {stat.value}
              </p>
            </div>
            <div
              className={`h-12 w-12 bg-${stat.color}-100 rounded-full flex items-center justify-center`}
            >
              {React.cloneElement(stat.icon, {
                className: `h-6 w-6 text-${stat.color}-600`
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-semibold mb-4">Revenue by Event</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueByEvent}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-semibold mb-4">Sales Trend (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis />
              <Tooltip />
              <Line dataKey="sales" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom section */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-semibold mb-4">Bookings by Status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={bookingsByStatus} dataKey="value" outerRadius={80}>
                {bookingsByStatus.map((e, i) => (
                  <Cell key={i} fill={e.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow p-4 lg:col-span-2">
          <h2 className="font-semibold mb-4">Upcoming Events</h2>
          <div className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <p className="text-gray-500 text-sm text-center">
                No upcoming events
              </p>
            ) : (
              upcomingEvents.map(event => {
                const totalSeats = event.ticketCategories.reduce(
                  (s, c) => s + c.totalSeats,
                  0
                );
                const availableSeats = event.ticketCategories.reduce(
                  (s, c) => s + c.availableSeats,
                  0
                );
                const sold = ((totalSeats - availableSeats) / totalSeats) * 100;

                return (
                  <div
                    key={event.id}
                    className="border rounded-lg p-3"
                  >
                    <div className="flex justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{event.title}</h4>
                        <p className="text-xs text-gray-500">
                          {format(event.date, 'MMM d, yyyy')} • {event.venue}
                        </p>
                      </div>
                      <p className="text-sm font-medium">
                        {totalSeats - availableSeats}/{totalSeats}
                      </p>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 bg-blue-600 rounded-full"
                        style={{ width: `${sold}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
