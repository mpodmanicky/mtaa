const express = require("express");
const app = express();
const { Pool } = require("pg");
const multer = require("multer");
const path = require("path");
let pool = null;
const fs = require("fs");
pool = new Pool({
  host: "localhost",
  port: "5434",
  user: "postgres",
  password: "postgres",
  database: "mtaa",
});

app.listen(8080, () => {
  console.log("REST API IS UP AND RUNNING ON LOCALHOST:8080");
});
// Configure multer to save files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Folder for saving files
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Unique file name
  },
});

// Filter to check file types (images and videos only)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "video/mp4", "video/mpeg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Only images (jpeg, png) and videos (mp4, mpeg) are allowed"),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

function createTables() {
  // table users
  pool
    .query(
      `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR NOT NULL,
      name VARCHAR NOT NULL,
      lastname VARCHAR NOT NULL,
      email VARCHAR NOT NULL,
      password VARCHAR NOT NULL
    );
  `
    )
    .then(() => {
      // table uploads
      return pool.query(`
        CREATE TABLE IF NOT EXISTS uploads (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          file_path VARCHAR NOT NULL,
          file_type VARCHAR NOT NULL,
          upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    })
    .catch((err) => console.error("Error creating tables:", err))
    .then(() => {
      // table topics
      return pool.query(`
          CREATE TABLE IF NOT EXISTS topics (
          id SERIAL PRIMARY KEY,
          name VARCHAR NOT NULL,
          owner_id INTEGER REFERENCES users(id),
          visibility ENUM('public', 'private') DEFAULT 'public',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`);
    })
    .catch((err) => console.error("Error creating tables:", err))
    .then(() => {
      // table posts
      return pool.query(`
          CREATE TABLE IF NOT EXISTS posts (
          id SERIAL PRIMARY KEY,
          topic_id INTEGER REFERENCES topics(id),
          user_id INTEGER REFERENCES users(id),
          votes INTEGER DEFAULT 0,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`);
    })
    .catch((err) => console.error("Error creating tables:", err))
    .then(() => {
      // table comments
      return pool.query(`
          CREATE TABLE IF NOT EXISTS comments (
          id SERIAL PRIMARY KEY,
          post_id INTEGER REFERENCES posts(id),
          user_id INTEGER REFERENCES users(id),
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`);
    })
    .catch((err) => console.error("Error creating tables:", err))
    .then(() => {
      // table replies to comments
      return pool.query(`
          CREATE TABLE IF NOT EXISTS replies (
          id SERIAL PRIMARY KEY,
          comment_id INTEGER REFERENCES comments(id),
          user_id INTEGER REFERENCES users(id),
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`);
    })
    .catch((err) => console.error("Error creating tables:", err))
    .then(() => {
      // junction table users/topics
      return pool.query(`
          CREATE TABLE IF NOT EXISTS users_topics (
          user_id INTEGER REFERENCES users(id),
          topic_id INTEGER REFERENCES topics(id)
        );`);
    })
    .catch((err) => console.error("Error creating tables:", err));
}

setTimeout(() => {
  createTables();
}, 3000);
app.use(express.json());
//file upload
//Method: POST
// URL: http://localhost:8080/upload
// Body tab → form-data:
// Key: user_id, Type: Text, Value: 1 (or the ID of an existing user).
// Key: file, Type: File, select a file (e.g. image.jpg).
// Click Send.
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ error: "No file uploaded or invalid file type" });
    }

    const userId = req.body.user_id; //Assume that the user_id is passed in the body of the request
    const filePath = req.file.path;
    const fileType = req.file.mimetype;

    // Save information about the file in the database
    const result = await pool.query(
      "INSERT INTO uploads (user_id, file_path, file_type) VALUES ($1, $2, $3) RETURNING *",
      [userId, filePath, fileType]
    );

    return res.status(200).json({
      message: "File uploaded successfully",
      file: result.rows[0],
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
//retrieve all uploads
//Method: GET
// URL: http://localhost:8080/uploads
// Body: Not required.
// Click Send.
app.get("/uploads", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.*, us.username
      FROM uploads u
      LEFT JOIN users us ON u.user_id = us.id
    `);
    return res.status(200).json({
      message: "Uploads retrieved successfully",
      uploads: result.rows,
    });
  } catch (error) {
    console.error("Error retrieving uploads:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
// Getting information about the file by ID
//Method: GET
// URL: http://localhost:8080/upload/1 (replace 1 with the file ID from the uploads table).
// Body: Not required.
// Click Send.

app.get("/upload/:id", async (req, res) => {
  const fileId = req.params.id;

  try {
    const result = await pool.query("SELECT * FROM uploads WHERE id = $1", [
      fileId,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "File not found" });
    }

    return res.status(200).json({
      message: "File info retrieved successfully",
      file: result.rows[0],
    });
  } catch (error) {
    console.error("Error retrieving file info:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
// Download file by ID
//Method: GET
// URL: http://localhost:8080/download/1 (replace 1 with the file ID).
// Body: Not required.
// Click Send.
app.get("/download/:id", async (req, res) => {
  const fileId = req.params.id;

  try {
    const result = await pool.query(
      "SELECT file_path, file_type FROM uploads WHERE id = $1",
      [fileId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "File not found" });
    }

    const filePath = result.rows[0].file_path;
    const fileType = result.rows[0].file_type;

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found on server" });
    }

    // Set download headers
    res.setHeader("Content-Type", fileType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${path.basename(filePath)}"`
    );

    // Send file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Error downloading file:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
// Delete file by ID
// Method: DELETE
// URL: http://localhost:8080/upload/1 (replace 1 with the file ID).
// Body: Not required.
// Click Send.
app.delete("/upload/:id", async (req, res) => {
  const fileId = req.params.id;

  try {
    const result = await pool.query(
      "SELECT file_path FROM uploads WHERE id = $1",
      [fileId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "File not found" });
    }

    const filePath = result.rows[0].file_path;

    // Delete the file from the server
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete the record from the database
    await pool.query("DELETE FROM uploads WHERE id = $1", [fileId]);

    return res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
//replacement of a downloaded file
//Method: PUT
// URL: http://localhost:8080/upload/1 (replace 1 with the ID of an existing file from the uploads table).
// Body tab → form-data:
// Key: file, Type: File, select a new file (for example, new_image.png).
// Click Send.
app.put("/upload/:id", upload.single("file"), async (req, res) => {
  const fileId = req.params.id;

  try {
    // Check if the file exists in the database
    const existingFile = await pool.query(
      "SELECT file_path FROM uploads WHERE id = $1",
      [fileId]
    );

    if (existingFile.rows.length === 0) {
      return res.status(404).json({ error: "File not found" });
    }

    // Check if a new file has been loaded
    if (!req.file) {
      return res.status(400).json({ error: "No new file uploaded" });
    }

    // Delete the old file from the server
    const oldFilePath = existingFile.rows[0].file_path;
    if (fs.existsSync(oldFilePath)) {
      fs.unlinkSync(oldFilePath);
    }

    const newFilePath = req.file.path;
    const newFileType = req.file.mimetype;

    // Update the record in the database
    const result = await pool.query(
      "UPDATE uploads SET file_path = $1, file_type = $2, upload_date = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *",
      [newFilePath, newFileType, fileId]
    );

    return res.status(200).json({
      message: "File updated successfully",
      file: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating file:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// register post api call, we could enhance it with password hashing with modules like bcrypt, further in the project
/**
 * @return returns status code with json message along with user data
 * @params request body
 * Api call to register user
 * Checking if the user exists
 * Checking if the passwords match
 * On successfull auth sent 200, along with json user data
 */
app.post("/register", async (req, res) => {
  const user = req.body;

  try {
    const existing_user = await pool.query(
      "SELECT * FROM users WHERE email = $1 and username = $2",
      [user.email, user.username]
    );
    if (existing_user.rows.length === 0) {
      if (user.password === user.password2) {
        await pool.query(
          "INSERT INTO users (username, name, lastname, email, password) VALUES ($1, $2, $3, $4, $5);",
          [user.username, user.name, user.lastname, user.email, user.password]
        );
        return res
          .status(200)
          .json({ message: "User registered successfully" });
      } else {
        return res.status(400).json({ error: "Passwords do not match" });
      }
    } else {
      return res
        .status(409)
        .json({ error: "User with this email or username already exists" });
    }
  } catch (error) {
    console.error("Something went wrong when registering...", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @return returns status code along with json message containing user data
 * @params request body
 */
app.post("/login", async (req, res) => {
  const user = req.body;

  try {
    const existing_user = await pool.query(
      "select * from users where username = $1",
      [user.username]
    );
    if (existing_user.rows.length === 0) {
      return res.status(404).json({ message: "User does not exist!" });
    } else {
      if (user.password === existing_user.rows[0].password) {
        return res
          .status(200)
          .json({ message: "User logged in successfully!" });
      } else {
        return res.status(400).json({ error: "Incorrect password!" });
      }
    }
  } catch (e) {
    console.error("Something went wrong when logging in...", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/user/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const userData = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);
    if (userData.rows.length === 0) {
      return res.status(404).json({ error: "User not found!" });
    } else {
      return res.status(200).json({ data: userData.rows[0] });
    }
  } catch (e) {
    console.error("Something went wrong when loading user...", e);
    return res.status(500).json({ error: "Internal server error!" });
  }
});

app.delete("/user/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const userData = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);
    if (userData.rows.length === 0) {
      return res.status(404).json({ error: "User not found!" });
    } else {
      await pool.query("DELETE FROM users WHERE id = $1", [userId]);
      return res.status(200).json({ message: "User deleted successfully!" });
    }
  } catch (e) {
    console.error("Something went wrong when deleting user...", e);
    return res.status(500).json({ error: "Internal server error!" });
  }
});

/**
 * @returns updated user profile
 * Users can update their profile information
 * put/patch/update
 */
app.put("/profile", async (req, res) => {
  const userData = req.body; // name, username, password.... anything can be changed
});

/**
 * @returns topic users, messages and all content based on id
 * User clicks on desired topic
 * Topic loads along with user posts and content
 */
app.get("/topic/:id", async (req, res) => {
  const topicId = req.params.id;

  try {
    const topicData = await pool.query(
      "SELECT username, topics.name, posts.content, comments.content, replies.content FROM users JOIN "
    ); // potrebujeme vybrat vsetky data, cize posty, k postom komentare, ich hodnotenie atd atd atd...
    if (topicData.rows.length === 0) {
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
 * @returns created empty topic
 * User creates his own topic and can set it up to be either public/private
 * He can invite people to his topic
 *
 */
app.post("/topic", async (req, res) => {
  const topicData = req.body;

  try {
    const userAlreadyHasTopic = await pool.query(
      "Select * from topics where name = $1 and owner_id = $2",
      [topicData.topicName, topicData.user_id]
    );
    if (userAlreadyHasTopic.rows.length === 0) {
      await pool.query(
        "INSERT INTO topics (name, owner_id, visibility) VALUES ($1, $2, $3)",
        [topicData.topicName, topicData.user_id, topicData.isPrivate]
      );
      return res
        .status(200)
        .json({ message: `Topic ${topicData.topicName} successfully created` });
    } else {
      return res
        .status(409)
        .json({ error: "User already has topic with the name created!" });
    }
  } catch (e) {
    console.error("Something went wrong when adding topic...", e);
    return res.status(500).json({ error: "Internal server error!" });
  }
});

/**
 * @@description This endpoint enables users to create posts in a specific topic.
 * @returns Status code 200 with a success message if the post is created successfully.
 * @params request body containing topic_id, user_id, and content.
 */

app.post("/post", async (req, res) => {
  const data = req.body;
  try {
    const topic = await pool.query("SELECT * FROM topics WHERE id = $1", [
      data.topic_id,
    ]);
    if (topic.rows.length === 0) {
      return res.status(404).json({ error: "Topic not found!" });
    } else {
      await pool.query(
        "INSERT INTO posts (topic_id, user_id, content) VALUES ($1, $2, $3)",
        [data.topic_id, data.user_id, data.content]
      );
      return res.status(200).json({ message: "Post created successfully!" });
    }
  } catch (e) {
    console.error("Something went wrong when creating post...", e);
    return res.status(500).json({ error: "Internal server error!" });
  }
});

/**
 * @returns created comment
 * User can add a comment to a post
 */
app.post("/comment", async (req, res) => {
  const data = req.body;
  try {
    const post = await pool.query("SELECT * FROM posts WHERE id = $1", [
      data.post_id,
    ]);
    if (post.rows.length === 0) {
      return res.status(404).json({ error: "Post not found!" });
    } else {
      await pool.query(
        "INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3)",
        [data.post_id, data.user_id, data.content]
      );
      return res.status(200).json({ message: "Comment created successfully!" });
    }
  } catch (e) {
    console.error("Something went wrong when creating comment...", e);
    return res.status(500).json({ error: "Internal server error!" });
  }
});

/**
 * @returns created reply
 * User can add a reply to a comment
 */
app.post("/reply", async (req, res) => {
  const data = req.body;
  try {
    const comment = await pool.query("SELECT * FROM comments WHERE id = $1", [
      data.comment_id,
    ]);
    if (comment.rows.length === 0) {
      return res.status(404).json({ error: "Comment not found!" });
    } else {
      await pool.query(
        "INSERT INTO replies (comment_id, user_id, content) VALUES ($1, $2, $3)",
        [data.comment_id, data.user_id, data.content]
      );
      return res.status(200).json({ message: "Reply created successfully!" });
    }
  } catch (e) {
    console.error("Something went wrong when creating reply...", e);
    return res.status(500).json({ error: "Internal server error!" });
  }
});

/**
 * @description This endpoint allows users to vote on a post.
 * @returns Status code 200 with a success message if the vote is updated successfully.
 * @params request body containing vote value (+1 or -1).
 */
app.put("/post/:id/vote", async (req, res) => {
  const postId = req.params.id;
  const { vote } = req.body; // Expecting a vote value of either +1 or -1

  try {
    const post = await pool.query("SELECT * FROM posts WHERE id = $1", [
      postId,
    ]);
    if (post.rows.length === 0) {
      return res.status(404).json({ error: "Post not found!" });
    } else {
      await pool.query(
        "UPDATE posts SET votes = votes + $1 WHERE id = $2",
        [vote, postId]
      );
      return res.status(200).json({ message: "Post vote updated successfully!" });
    }
  } catch (e) {
    console.error("Something went wrong when updating post vote...", e);
    return res.status(500).json({ error: "Internal server error!" });
  }
});
