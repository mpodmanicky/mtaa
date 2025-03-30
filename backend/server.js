const express = require('express');
const app = express();
const { Pool } = require('pg');

let pool = null;
pool = new Pool({
  host: 'localhost',
  port: '5434',
  user: 'postgres',
  password: 'postgres',
  database: 'mtaa',
});

app.listen(8080, () => {
  console.log('REST API IS UP AND RUNNING ON LOCALHOST:8080');
});

function createTables() {
  pool.query("CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, username VARCHAR NOT NULL, name VARCHAR NOT NULL, lastname VARCHAR NOT NULL, email VARCHAR NOT NULL, password VARCHAR NOT NULL);"); 7
}

// timeout for function call to create tables
setTimeout(() => {
  createTables();
}, 3000);

app.use(express.json());
// register post api call, we could enhance it with password hashing with modules like bcrypt, further in the project
app.post('/register', async (req, res) => {
  //user object typically replacable with req.body creating object alike
  // const user = {
  //   username: 'Username',
  //   name: 'John',
  //   lastname: 'Doe',
  //   email: 'johndoe@gmail.com',
  //   password: 'johndoe123',
  //   password2: 'johndoe123'
  // }
  const user = req.body;

  try {
    const existing_user = await pool.query("SELECT * FROM users WHERE email = $1", [user.email]);
    if (existing_user.rows.length === 0) {
      if (user.password === user.password2) {
        await pool.query('INSERT INTO users (username, name, lastname, email, password) VALUES ($1, $2, $3, $4, $5);', [user.username, user.name, user.lastname, user.email, user.password]);
        return res.status(200).json({ message: 'User registered successfully' });
      } else {
        return res.status(400).json({ error: 'Passwords do not match' });
      }
    } else {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
  } catch (error) {
    console.error("Something went wrong when registering...", error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/login', (req, res) => {
  const user = req.body

  try {
    // doplnit logiku pre login checkovanie hesiel a podobne
  } catch (e) {
    console.error("Something went wrong when logging in...", e);
    return res.status(500).json({ error: "Internal server error" });
  }
})

// simple get request to retrieve user with id 1 from the database, get usually works with uri not body
app.get('/user', async (req, res) => {
  try {
    const user = await pool.query('SELECT * FROM users where id = 1;');
    if (user.rows.length !== 0) {
      return res.status(200).json({ message: 'User fetched', user: user.rows[0]})
    } else {
      return res.status(404).json({ error: 'User with this ID not found' });
    }
  } catch (error) {
    console.error('Something went wrong while fetching user from db...', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});
