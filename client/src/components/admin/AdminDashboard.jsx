// AdminDashboard.jsx
import React, { useMemo, useEffect } from 'react';
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
  Legend,
  ResponsiveContainer
} from 'recharts';
import { DollarSign, Ticket, Users, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { format, subDays, isAfter } from 'date-fns';

export default function AdminDashboard() {
  const { events, bookings, users, tickets, loadDataFromAPI } = useApp();

  // Load data on mount
  useEffect(() => {
    loadDataFromAPI();
  }, []);

  // Memoized calculations for better performance
  const stats = useMemo(() => {
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'paid');
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    
    // Calculate revenue from previous period for comparison
    const prevPeriodStart = subDays(new Date(), 14);
    const prevPeriodRevenue = bookings
      .filter(b => {
        const bookingDate = new Date(b.bookingDate);
        return (b.status === 'confirmed' || b.status === 'paid') && 
               bookingDate < prevPeriodStart;
      })
      .reduce((sum, b) => sum + b.totalAmount, 0);
    
    const revenueChange = prevPeriodRevenue > 0 
      ? ((totalRevenue - prevPeriodRevenue) / prevPeriodRevenue * 100).toFixed(1)
      : 100;

    return {
      totalRevenue,
      totalBookings: bookings.length,
      totalTicketsSold: tickets.filter(t => t.status === 'valid' || t.status === 'used').length,
      totalUsers: users.filter(u => u.role === 'user').length,
      revenueChange: parseFloat(revenueChange)
    };
  }, [bookings, tickets, users]);

  const revenueByEvent = useMemo(() => 
    events
      .map(event => {
        const revenue = bookings
          .filter(b => b.eventId === event.id && (b.status === 'confirmed' || b.status === 'paid'))
          .reduce((sum, b) => sum + b.totalAmount, 0);

        return {
          id: event.id,
          name: event.title.length > 15 ? `${event.title.slice(0, 15)}...` : event.title,
          fullName: event.title,
          revenue,
          color: '#3b82f6'
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6),
    [events, bookings]
  );

  const bookingsByStatus = useMemo(() => [
    { 
      name: 'Confirmed', 
      value: bookings.filter(b => b.status === 'confirmed').length, 
      color: '#10b981',
      bgColor: 'bg-green-100'
    },
    { 
      name: 'Paid', 
      value: bookings.filter(b => b.status === 'paid').length, 
      color: '#3b82f6',
      bgColor: 'bg-blue-100'
    },
    { 
      name: 'Pending', 
      value: bookings.filter(b => b.status === 'pending').length, 
      color: '#f59e0b',
      bgColor: 'bg-yellow-100'
    },
    { 
      name: 'Cancelled', 
      value: bookings.filter(b => b.status === 'cancelled').length, 
      color: '#ef4444',
      bgColor: 'bg-red-100'
    }
  ].filter(i => i.value > 0), [bookings]);

  const salesTrend = useMemo(() => 
    Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const sales = bookings
        .filter(b => {
          const bookingDate = new Date(b.bookingDate);
          return (
            format(bookingDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') &&
            (b.status === 'confirmed' || b.status === 'paid')
          );
        })
        .reduce((sum, b) => sum + b.totalAmount, 0);

      return { 
        date: format(date, 'MMM dd'), 
        sales,
        day: format(date, 'EEE')
      };
    }),
    [bookings]
  );

  const upcomingEvents = useMemo(() =>
    events
      .filter(e => isAfter(new Date(e.date), new Date()))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5),
    [events]
  );

  const statsCards = [
    {
      label: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: <DollarSign className="h-6 w-6" />,
      color: 'green',
      change: stats.revenueChange,
      changeLabel: 'vs last period'
    },
    {
      label: 'Total Bookings',
      value: stats.totalBookings.toLocaleString(),
      icon: <Calendar className="h-6 w-6" />,
      color: 'blue',
      change: 12.5,
      changeLabel: 'vs last month'
    },
    {
      label: 'Tickets Sold',
      value: stats.totalTicketsSold.toLocaleString(),
      icon: <Ticket className="h-6 w-6" />,
      color: 'purple',
      change: 8.3,
      changeLabel: 'vs last month'
    },
    {
      label: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: <Users className="h-6 w-6" />,
      color: 'orange',
      change: 5.2,
      changeLabel: 'vs last month'
    }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-semibold text-gray-800">{label}</p>
          <p className="text-blue-600 font-medium">
            ${payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-blue-900 text-white rounded-2xl p-6 shadow-xl">
        <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
        <p className="text-gray-300">Welcome back! Here's what's happening with your events today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                <p className={`text-2xl font-bold text-${stat.color}-600 mb-2`}>
                  {stat.value}
                </p>
                <div className="flex items-center gap-1">
                  {stat.change >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change >= 0 ? '+' : ''}{stat.change}%
                  </span>
                  <span className="text-xs text-gray-500 ml-1">{stat.changeLabel}</span>
                </div>
              </div>
              <div className={`h-12 w-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center`}>
                {React.cloneElement(stat.icon, {
                  className: `h-6 w-6 text-${stat.color}-600`
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue by Event */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Top Events by Revenue</h2>
            <span className="text-sm text-gray-500">{revenueByEvent.length} events</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueByEvent}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                fontSize={12} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                fontSize={12}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="revenue" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sales Trend */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Sales Trend (Last 7 Days)</h2>
            <span className="text-sm text-gray-500">Daily revenue</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                fontSize={12}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                fontSize={12}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6, fill: '#10b981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Bookings by Status */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Bookings by Status</h2>
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={bookingsByStatus}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {bookingsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-3 mt-4 w-full">
              {bookingsByStatus.map((status, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full`} style={{ backgroundColor: status.color }} />
                  <span className="text-sm text-gray-600">{status.name}</span>
                  <span className="ml-auto font-semibold">{status.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Upcoming Events</h2>
            <span className="text-sm text-gray-500">{upcomingEvents.length} events</span>
          </div>
          <div className="space-y-4">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No upcoming events scheduled</p>
              </div>
            ) : (
              upcomingEvents.map(event => {
                const totalSeats = event.ticketCategories.reduce((s, c) => s + c.totalSeats, 0);
                const availableSeats = event.ticketCategories.reduce((s, c) => s + c.availableSeats, 0);
                const soldPercentage = ((totalSeats - availableSeats) / totalSeats) * 100;
                const daysUntilEvent = Math.ceil((new Date(event.date) - new Date()) / (1000 * 60 * 60 * 24));

                return (
                  <div
                    key={event.id}
                    className="group border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                          <div>
                            <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                              {event.title}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {format(event.date, 'MMM d, yyyy')} • {event.venue}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          daysUntilEvent <= 7 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {daysUntilEvent <= 7 ? `${daysUntilEvent}d left` : `${daysUntilEvent}d to go`}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Ticket Sales</span>
                        <span className="font-medium">
                          {totalSeats - availableSeats} / {totalSeats} sold
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${soldPercentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>0%</span>
                        <span>{soldPercentage.toFixed(0)}%</span>
                        <span>100%</span>
                      </div>
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
}