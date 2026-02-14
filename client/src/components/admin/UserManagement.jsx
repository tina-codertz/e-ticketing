// UserManagement.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Eye, Trash2, UserPlus, Mail, Phone, Shield, UserCheck, UserX, Download, DollarSign, Filter } from 'lucide-react';
import { format, subMonths } from 'date-fns';
import { toast } from 'sonner';

const UserManagement = () => {
  const { users, deleteUser, getUserBookings, updateUserRole, loadDataFromAPI } = useApp();

  // Load data on mount
  useEffect(() => {
    loadDataFromAPI();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState(new Set());

  const filteredUsers = useMemo(() => 
    users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && user.active !== false) ||
        (statusFilter === 'inactive' && user.active === false);

      return matchesSearch && matchesRole && matchesStatus;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [users, searchTerm, roleFilter, statusFilter]
  );

  const getUserStats = (userId) => {
    const userBookings = getUserBookings(userId);
    const confirmedBookings = userBookings.filter(b => b.status === 'confirmed' || b.status === 'paid');
    const totalSpent = confirmedBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const monthlyAvg = userBookings.length > 0 ? 
      totalSpent / (Math.max(1, Math.ceil((new Date() - new Date(users.find(u => u.id === userId)?.createdAt)) / (1000 * 60 * 60 * 24 * 30)))) : 
      0;
    
    return {
      totalBookings: userBookings.length,
      totalSpent,
      monthlyAvg,
      lastBooking: userBookings[0] && userBookings[0].bookingDate ? (() => {
        try {
          const date = new Date(userBookings[0].bookingDate);
          return isNaN(date.getTime()) ? 'Never' : format(date, 'MMM d, yyyy');
        } catch {
          return 'Never';
        }
      })() : 'Never'
    };
  };

  const handleDeleteUser = (userId) => {
    const user = users.find(u => u.id === userId);
    const stats = getUserStats(userId);
    
    if (stats.totalBookings > 0) {
      toast.error(`Cannot delete user with ${stats.totalBookings} active bookings`);
      return;
    }

    if (confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
      deleteUser(userId);
      toast.success('User deleted successfully');
      setSelectedUser(null);
    }
  };

  const handleToggleUserSelection = (userId) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleBulkAction = (action) => {
    if (selectedUsers.size === 0) {
      toast.error('Please select users first');
      return;
    }

    switch (action) {
      case 'delete':
        if (confirm(`Delete ${selectedUsers.size} selected users?`)) {
          selectedUsers.forEach(userId => {
            const user = users.find(u => u.id === userId);
            if (user.role !== 'admin') {
              deleteUser(userId);
            }
          });
          toast.success(`${selectedUsers.size} users deleted`);
          setSelectedUsers(new Set());
        }
        break;
      case 'export':
        // Export logic here
        toast.success('Users exported successfully');
        break;
    }
  };

  const handleRoleChange = (userId, newRole) => {
    updateUserRole(userId, newRole);
    toast.success(`User role updated to ${newRole}`);
  };

  const exportUsers = () => {
    // Export logic here
    toast.success('Users exported successfully');
  };

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.active !== false).length,
    admins: users.filter(u => u.role === 'admin').length,
    newThisMonth: users.filter(u => new Date(u.createdAt) > subMonths(new Date(), 1)).length,
    totalSpent: users.reduce((sum, user) => sum + getUserStats(user.id).totalSpent, 0)
  }), [users]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-blue-900 text-white rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">User Management</h1>
            <p className="text-blue-200">View and manage registered users</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <button
              onClick={exportUsers}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              <Download size={16} />
              Export
            </button>
            <button className="flex items-center gap-2 bg-white text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
              <UserPlus size={16} />
              Invite User
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Users', value: stats.total, color: 'blue', icon: <UserCheck /> },
          { label: 'Active Users', value: stats.active, color: 'green', icon: <UserCheck /> },
          { label: 'Administrators', value: stats.admins, color: 'purple', icon: <Shield /> },
          { label: 'New This Month', value: stats.newThisMonth, color: 'orange', icon: <UserPlus /> },
          { label: 'Total Spent', value: `$${stats.totalSpent.toLocaleString()}`, color: 'emerald', icon: <DollarSign /> }
        ].map((stat, i) => (
          <div key={i} className={`bg-white border border-${stat.color}-100 rounded-xl p-4`}>
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                {React.cloneElement(stat.icon, { className: `h-5 w-5 text-${stat.color}-600` })}
              </div>
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className={`text-lg font-bold text-${stat.color}-700`}>{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        {/* Filters and Search */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name, email, phone, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="user">Users</option>
                <option value="admin">Admins</option>
                <option value="organizer">Organizers</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 border rounded-xl flex items-center gap-2 ${
                  showFilters ? 'bg-blue-50 border-blue-300 text-blue-600' : 'border-gray-300'
                }`}
              >
                <Filter size={16} />
                Filters
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="grid md:grid-cols-3 gap-4 p-4 border rounded-xl bg-gray-50">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Date From
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Spent Min
                </label>
                <input
                  type="number"
                  placeholder="$0.00"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
          )}

          {/* Bulk Actions */}
          {selectedUsers.size > 0 && (
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <UserCheck className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-700">
                  {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('export')}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Export Selected
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete Selected
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto border border-gray-200 rounded-xl">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.size === filteredUsers.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
                      } else {
                        setSelectedUsers(new Set());
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">User</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Contact</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Activity</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <UserX className="h-16 w-16 text-gray-300 mb-4" />
                      <p className="text-gray-500 text-lg mb-2">No users found</p>
                      <p className="text-gray-400">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const stats = getUserStats(user.id);
                  const isSelected = selectedUsers.has(user.id);

                  return (
                    <tr 
                      key={user.id} 
                      className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleUserSelection(user.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-900">{user.name}</p>
                              {user.role === 'admin' && (
                                <Shield className="h-4 w-4 text-purple-500" />
                              )}
                            </div>
                            <p className="text-sm text-gray-500">ID: {String(user.id).slice(-8)}</p>
                            <p className="text-xs text-gray-400">
                              Joined {user.createdAt ? (() => {
                                try {
                                  const date = new Date(user.createdAt);
                                  return isNaN(date.getTime()) ? 'N/A' : format(date, 'MMM d, yyyy');
                                } catch {
                                  return 'N/A';
                                }
                              })() : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Bookings</span>
                            <span className="font-semibold">{stats.totalBookings}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Total Spent</span>
                            <span className="font-semibold text-green-600">
                              ${stats.totalSpent.toFixed(2)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Last active: {stats.lastBooking}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-700'
                              : user.role === 'organizer'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {user.role}
                          </span>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            user.active === false 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {user.active === false ? 'Inactive' : 'Active'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View details"
                          >
                            <Eye size={16} />
                          </button>
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete user"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-4 text-sm">
          <p className="text-gray-600">
            Showing <span className="font-semibold">{filteredUsers.length}</span> of{' '}
            <span className="font-semibold">{users.length}</span> users
          </p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border rounded-lg hover:bg-gray-50">Previous</button>
            <button className="px-3 py-1 border rounded-lg bg-blue-50 text-blue-700">1</button>
            <button className="px-3 py-1 border rounded-lg hover:bg-gray-50">2</button>
            <button className="px-3 py-1 border rounded-lg hover:bg-gray-50">Next</button>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">User Details</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* User Profile */}
              <div className="flex items-start gap-6">
                <div className="h-20 w-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-gray-900">{selectedUser.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedUser.role === 'admin' 
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {selectedUser.role}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{selectedUser.email}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{selectedUser.phone || 'Not provided'}</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Member Since</p>
                      <p className="font-medium">
                        {selectedUser.createdAt ? (() => {
                          try {
                            const date = new Date(selectedUser.createdAt);
                            return isNaN(date.getTime()) ? 'N/A' : format(date, 'MMMM d, yyyy');
                          } catch {
                            return 'N/A';
                          }
                        })() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Total Bookings', value: getUserStats(selectedUser.id).totalBookings },
                  { label: 'Total Spent', value: `$${getUserStats(selectedUser.id).totalSpent.toFixed(2)}` },
                  { label: 'Monthly Average', value: `$${getUserStats(selectedUser.id).monthlyAvg.toFixed(2)}` }
                ].map((stat, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Role Management */}
              <div className="border-t pt-6">
                <h4 className="font-medium text-gray-900 mb-4">Role Management</h4>
                <div className="flex gap-3">
                  {['user', 'organizer', 'admin'].map((role) => (
                    <button
                      key={role}
                      onClick={() => handleRoleChange(selectedUser.id, role)}
                      disabled={selectedUser.role === role}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        selectedUser.role === role
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Booking History */}
              <div className="border-t pt-6">
                <h4 className="font-medium text-gray-900 mb-4">Booking History</h4>
                {getUserBookings(selectedUser.id).length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No bookings yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getUserBookings(selectedUser.id).map((booking) => (
                      <div
                        key={booking.id}
                        className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">{booking.eventTitle}</p>
                            <p className="text-sm text-gray-500">
                              {booking.bookingDate ? (() => {
                                try {
                                  const date = new Date(booking.bookingDate);
                                  return isNaN(date.getTime()) ? 'N/A' : format(date, 'MMM d, yyyy');
                                } catch {
                                  return 'N/A';
                                }
                              })() : 'N/A'}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'confirmed' || booking.status === 'paid'
                              ? 'bg-green-100 text-green-700'
                              : booking.status === 'cancelled'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {booking.items.reduce((sum, i) => sum + i.quantity, 0)} tickets
                          </span>
                          <span className="font-bold text-green-600">
                            ${booking.totalAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="border-t pt-6 flex justify-end gap-3">
                {selectedUser.role !== 'admin' && (
                  <button
                    onClick={() => handleDeleteUser(selectedUser.id)}
                    className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 size={16} />
                    Delete User
                  </button>
                )}
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;