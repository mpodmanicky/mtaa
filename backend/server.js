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
/**
 * @return returns status code with json message along with user data
 * @params request body
 * Api call to register user
 * Checking if the user exists
 * Checking if the passwords match
 * On successfull auth sent 200, along with json user data
 */
app.post('/register', async (req, res) => {
  const user = req.body;

  try {
    const existing_user = await pool.query("SELECT * FROM users WHERE email = $1 and username = $2", [user.email, user.username]);
    if (existing_user.rows.length === 0) {
      if (user.password === user.password2) {
        await pool.query('INSERT INTO users (username, name, lastname, email, password) VALUES ($1, $2, $3, $4, $5);', [user.username, user.name, user.lastname, user.email, user.password]);
        return res.status(200).json({ message: 'User registered successfully' });
      } else {
        return res.status(400).json({ error: 'Passwords do not match' });
      }
    } else {
      return res.status(409).json({ error: 'User with this email or username already exists' });
    }
  } catch (error) {
    console.error("Something went wrong when registering...", error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @return returns status code along with json message containing user data
 * @params request body
 */
app.post('/login', async (req, res) => {
  const user = req.body

  try {
    const existing_user = await pool.query("select * from users where username = $1", [user.username]);
    if(existing_user.rows.length === 0) {
      return res.status(404).json({ message: "User does not exist!" });
    } else {
      if (user.password === existing_user.rows[0].password) {
        return res.status(200).json({ message: "User logged in successfully!" });
      } else {
        return res.status(400).json({ error: "Incorrect password!" });
      }
    }
  } catch (e) {
    console.error("Something went wrong when logging in...", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @returns updated user profile
 * Users can update their profile information
 */
app.post('/profile', async (req, res) => {});

/**
 * @returns topic users, messages and all content based on id
 * User clicks on desired topic
 * Topic loads along with user posts and content
 */
app.get('/topic/:id', async (req, res) => {
  const topicId = req.params.id;

  try {
    const topicData = await pool.query("") // potrebujeme vybrat vsetky data, cize posty, k postom komentare, ich hodnotenie atd atd atd...
    if(topicData.rows.length === 0) {
      return res.status(200).json({ message: "Be the first to post!" });
    } else {
      return res.status(200).json({ data: topicData }); // posleme tonu udajov musime tam porobit spravne joiny aby to vsetko sedelo lebo s nami bude amen
    }
  } catch (e) {
    console.error("Something went wrong when loading topic...", e);
    return res.status(500).json({ error: "Internal server error!" });
  }
});

/**
 * @returns created topic with empty content
 * User creates his own topic and can set it up to be either public/private
 * He can invite people to his topic
 * 
 */
app.post('/topic', async (req, res) => {
  const topicData = req.body;

  try {
    const userAlreadyHasTopic = await pool.query("Select * from topics where name = $1 and owner_id = $2", [topicData.topicName, topicData.user_id]);
    if(userAlreadyHasTopic.rows.length === 0) {
      await pool.query("INSERT INTO topics (name, owner_id, private) VALUES ($1, $2, $3)", [topicData.topicName, topicData.user_id, topicData.isPrivate]);
      return res.status(200).json({ message: `Topic ${topicData.topicName} successfully created` });
    } else {
      return res.status(409).json({ error: "User already has topic with the name created!" });
      } 
  } catch (e) {
    console.error("Something went wrong when adding topic...", e);
    return res.status(500).json({ error: "Internal server error!" });
  }
});

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
