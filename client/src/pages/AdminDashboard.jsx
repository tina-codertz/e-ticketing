import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";

const API_URL = "http://localhost:3000/api";
const socket = io("http://localhost:3000", {
  transports: ["websocket", "polling"],
  withCredentials: true,
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
});

function AdminDashboard({ user, setUser }) {
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");
  const [newEvent, setNewEvent] = useState({
    name: "",
    date: "",
    location: "",
    total_tickets: "",
    price: "",
  });

  useEffect(() => {
    // Fetch users
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUsers(res.data);
      } catch (err) {
        setError("Failed to load users");
      }
    };
    fetchUsers();

    // Fetch tickets
    const fetchTickets = async () => {
      try {
        const res = await axios.get(`${API_URL}/admin/tickets`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setTickets(res.data);
      } catch (err) {
        setError("Failed to load tickets");
      }
    };
    fetchTickets();

    // Fetch logs
    const fetchLogs = async () => {
      try {
        const res = await axios.get(`${API_URL}/admin/logs`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setLogs(res.data);
      } catch (err) {
        setError("Failed to load logs");
      }
    };
    fetchLogs();

    // Real-time ticket updates
    socket.on("ticketUpdate", (updatedTicket) => {
      setTickets((prev) =>
        prev.map((t) =>
          t.event_id === updatedTicket.event_id ? updatedTicket : t
        )
      );
    });

    return () => socket.off("ticketUpdate");
  }, []);

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/admin/tickets`, newEvent, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const res = await axios.get(`${API_URL}/admin/tickets`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTickets(res.data);
      setNewEvent({
        name: "",
        date: "",
        location: "",
        total_tickets: "",
        price: "",
      });
      setError("");
    } catch (err) {
      setError("Failed to add event");
    }
  };

  const handleDeleteTicket = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;

    try {
      // First check if the ticket exists
      const ticketExists = await axios.get(
        `${API_URL}/admin/events/${eventId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (ticketExists.data) {
        // Delete the ticket
        await axios.delete(`${API_URL}/admin/tickets/${eventId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        // Refresh tickets list
        const res = await axios.get(`${API_URL}/admin/tickets`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setTickets(res.data);
        setError("");

        // Add success message
        setError("Ticket deleted successfully");
      } else {
        setError("Ticket not found");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete ticket");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    )
      return;

    try {
      await axios.delete(`${API_URL}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const res = await axios.get(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUsers(res.data);
      setError("");
    } catch (err) {
      setError("Failed to delete user");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-8 bg-white rounded-lg shadow-sm p-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              Admin Dashboard
            </h2>
            <p className="text-gray-600 mt-1">
              Manage events, users, and monitor activity
            </p>
          </div>
          <button
            onClick={() => setUser(null)}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Add New Event
            </h3>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <input
                type="text"
                placeholder="Event Name"
                value={newEvent.name}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, name: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="datetime-local"
                value={newEvent.date}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, date: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Location"
                value={newEvent.location}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, location: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Total Tickets"
                value={newEvent.total_tickets}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, total_tickets: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Price"
                value={newEvent.price}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, price: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-200"
              >
                Add Event
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Users Management
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                      Role
                    </th>
                    {/* <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                      Actions
                    </th> */}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.user_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {user.role}
                        </span>
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => handleDeleteUser(user.user_id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold mb-6 text-gray-800">
              Activity Logs
            </h3>
            {logs.length > 0 ? (
              <div className="space-y-3">
                {logs.slice(0, 5).map((log) => (
                  <div
                    key={log.log_id}
                    className="text-sm p-3 bg-gray-50 rounded-lg"
                  >
                    <p className="text-gray-800">{log.action}</p>
                    <p className="text-xs text-gray-600">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No activity logs available
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          Events Management
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Event Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Available Tickets
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Price
                </th>
                {/* <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                  Actions
                </th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tickets.map((ticket) => (
                <tr key={ticket.event_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {ticket.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(ticket.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {ticket.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {ticket.available_tickets} / {ticket.total_tickets}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {ticket.price.toLocaleString("en-TZ", {
                      style: "currency",
                      currency: "TZS",
                    })}
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => handleDeleteTicket(ticket.event_id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
