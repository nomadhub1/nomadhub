const bcrypt = require('bcrypt');
const db = require('./config/db'); // Replace with the actual path to your database connection file
const userId = 1; // Replace with the actual ID of the test user
const newPassword = 'newpassword123';

async function updatePassword() {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await db.query(`UPDATE users SET password = ? WHERE id = ?`, [hashedPassword, userId]);
  console.log('Password updated successfully!');
}

updatePassword();