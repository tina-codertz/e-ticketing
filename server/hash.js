// server/generateHash.js
// const bcrypt = require('bcrypt');
import bcrypt from 'bcrypt';

const password = 'admin123'; // Replace with your desired password
bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
    return;
  }
  console.log('Generated hash:', hash);
}); 