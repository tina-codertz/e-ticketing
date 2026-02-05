CREATE DATABASE ticketing_db;

-- \c ticketing_db;

CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL
);

CREATE TABLE events (
  event_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  date TIMESTAMP NOT NULL,
  location VARCHAR(255) NOT NULL,
  total_tickets INTEGER NOT NULL CHECK (total_tickets >= 0),
  available_tickets INTEGER NOT NULL CHECK (available_tickets >= 0),
  price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE bookings (
  booking_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id),
  event_id INTEGER REFERENCES events(event_id),
  ticket_count INTEGER NOT NULL CHECK (ticket_count > 0),
  booking_time TIMESTAMP NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'confirmed'
);

CREATE TABLE activity_logs (
  log_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) NULL,
  action TEXT NOT NULL,
  timestamp TIMESTAMP NOT NULL
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_events_event_id ON events(event_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_event_id ON bookings(event_id);

-- Sample data
INSERT INTO users (name, email, password_hash, role, created_at)
VALUES ('Admin User', 'admin@example.com', '$2b$10$examplehashedpassword', 'admin', NOW());

INSERT INTO events (name, date, location, total_tickets, available_tickets, price)
VALUES ('Concert A', '2025-07-01 18:00:00', 'Venue A', 100, 100, 50.00),
       ('Movie B', '2025-07-02 20:00:00', 'Cinema B', 50, 50, 15.00);