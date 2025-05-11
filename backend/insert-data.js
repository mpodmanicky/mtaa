const { Pool } = require('pg');

// Create a database connection
const pool = new Pool({
  host: "localhost",
  port: "5434",
  user: "postgres",
  password: "postgres",
  database: "mtaa",
});

async function insertTestData() {
  try {
    console.log('Inserting test data...');

    // Check if test data already exists
    const existingConversations = await pool.query('SELECT COUNT(*) FROM conversations');
    if (parseInt(existingConversations.rows[0].count) > 0) {
      console.log('Test data already exists');
      return;
    }

    // Check for existing users
    const existingUsers = await pool.query(`
      SELECT username FROM users
      WHERE username IN ('john_doe', 'jane_smith', 'bob_johnson', 'alice_williams', 'mike_brown')
    `);

    const existingUsernames = existingUsers.rows.map(row => row.username);

    // Insert test users that don't already exist
    const usersToInsert = [
      ['john_doe', 'John', 'Doe', 'john.doe@stuba.sk', 'password123'],
      ['jane_smith', 'Jane', 'Smith', 'jane.smith@stuba.sk', 'password123'],
      ['bob_johnson', 'Bob', 'Johnson', 'bob.johnson@stuba.sk', 'password123'],
      ['alice_williams', 'Alice', 'Williams', 'alice.williams@stuba.sk', 'password123'],
      ['mike_brown', 'Mike', 'Brown', 'mike.brown@stuba.sk', 'password123']
    ].filter(user => !existingUsernames.includes(user[0]));

    // Insert users one by one
    for (const userData of usersToInsert) {
      await pool.query(`
        INSERT INTO users (username, name, lastname, email, password)
        VALUES ($1, $2, $3, $4, $5)
      `, userData);
    }

    console.log('Test users inserted');

    // Get user IDs
    const user1Result = await pool.query("SELECT id FROM users WHERE username = 'john_doe' LIMIT 1");
    const user2Result = await pool.query("SELECT id FROM users WHERE username = 'jane_smith' LIMIT 1");
    const user3Result = await pool.query("SELECT id FROM users WHERE username = 'bob_johnson' LIMIT 1");
    const user4Result = await pool.query("SELECT id FROM users WHERE username = 'alice_williams' LIMIT 1");
    const user5Result = await pool.query("SELECT id FROM users WHERE username = 'mike_brown' LIMIT 1");

    const user1Id = user1Result.rows[0].id;
    const user2Id = user2Result.rows[0].id;
    const user3Id = user3Result.rows[0].id;
    const user4Id = user4Result.rows[0].id;
    const user5Id = user5Result.rows[0].id;

    console.log('User IDs retrieved:', { user1Id, user2Id, user3Id, user4Id, user5Id });

    // Create conversation 1 (John and Jane)
    const conv1Result = await pool.query('INSERT INTO conversations DEFAULT VALUES RETURNING id');
    const conv1Id = conv1Result.rows[0].id;
    await pool.query(
      'INSERT INTO conversation_participants (conversation_id, user_id) VALUES ($1, $2), ($1, $3)',
      [conv1Id, user1Id, user2Id]
    );

    // Create conversation 2 (John, Bob, and Alice)
    const conv2Result = await pool.query('INSERT INTO conversations DEFAULT VALUES RETURNING id');
    const conv2Id = conv2Result.rows[0].id;
    await pool.query(
      'INSERT INTO conversation_participants (conversation_id, user_id) VALUES ($1, $2), ($1, $3), ($1, $4)',
      [conv2Id, user1Id, user3Id, user4Id]
    );

    // Create conversation 3 (Jane and Mike)
    const conv3Result = await pool.query('INSERT INTO conversations DEFAULT VALUES RETURNING id');
    const conv3Id = conv3Result.rows[0].id;
    await pool.query(
      'INSERT INTO conversation_participants (conversation_id, user_id) VALUES ($1, $2), ($1, $3)',
      [conv3Id, user2Id, user5Id]
    );

    console.log('Conversations created with IDs:', { conv1Id, conv2Id, conv3Id });

    // Add messages to conversation 1
    await pool.query(`
      INSERT INTO messages (conversation_id, sender_id, content) VALUES
        ($1, $2, 'Hey Jane, how are you doing?'),
        ($1, $3, 'Hi John! I''m doing well, thanks for asking. How about you?'),
        ($1, $2, 'I''m good too. Just working on that project for MTAA class.'),
        ($1, $3, 'Oh nice! I should start working on that soon too.'),
        ($1, $2, 'Let me know if you need any help with it!')
    `, [conv1Id, user1Id, user2Id]);

    // Add messages to conversation 2
    await pool.query(`
      INSERT INTO messages (conversation_id, sender_id, content) VALUES
        ($1, $2, 'Hey everyone, shall we meet for the group project?'),
        ($1, $3, 'Sure, I''m free on Thursday after 3 PM.'),
        ($1, $4, 'Thursday works for me too!'),
        ($1, $2, 'Great, Thursday at 4 PM at the library?'),
        ($1, $3, 'Perfect, see you then!')
    `, [conv2Id, user1Id, user3Id, user4Id]);

    // Add messages to conversation 3
    await pool.query(`
      INSERT INTO messages (conversation_id, sender_id, content) VALUES
        ($1, $2, 'Hi Mike, did you submit the assignment yet?'),
        ($1, $3, 'Not yet, I''m still working on the last question.'),
        ($1, $2, 'Don''t forget the deadline is tonight at midnight!'),
        ($1, $3, 'Thanks for the reminder. I''ll finish it soon!')
    `, [conv3Id, user2Id, user5Id]);

    console.log('Test messages inserted');
    console.log('All test data inserted successfully!');
  } catch (error) {
    console.error('Error inserting test data:', error);
  } finally {
    // Close the pool
    pool.end();
  }
}

// Run the function
// insertTestData();

async function insertTopicsData() {
  try {
    console.log('Inserting topics test data...');

    // Check if topics data already exists
    const existingTopics = await pool.query('SELECT COUNT(*) FROM topics');
    if (parseInt(existingTopics.rows[0].count) > 0) {
      console.log('Topics data already exists');
      return;
    }

    // Make sure we have at least one user to be the owner
    const userResult = await pool.query('SELECT id FROM users LIMIT 1');
    if (userResult.rows.length === 0) {
      console.log('No users found. Please create a user first.');
      return;
    }

    const ownerId = userResult.rows[0].id;
    console.log(`Using user ID ${ownerId} as owner for topics`);

    // Insert the default topics
    const defaultTopics = [
      { name: 'Dormitory', owner_id: ownerId, visibility: 'public' },
      { name: 'University', owner_id: ownerId, visibility: 'public' },
      { name: 'Canteen', owner_id: ownerId, visibility: 'public' },
      { name: 'Library', owner_id: ownerId, visibility: 'public' },
      { name: 'Other', owner_id: ownerId, visibility: 'public' }
    ];

    for (const topic of defaultTopics) {
      await pool.query(
        'INSERT INTO topics (name, owner_id, visibility) VALUES ($1, $2, $3)',
        [topic.name, topic.owner_id, topic.visibility]
      );
      console.log(`Inserted topic: ${topic.name}`);
    }

    // Insert some posts for each topic
    const topicsResult = await pool.query('SELECT id FROM topics');
    const topicIds = topicsResult.rows.map(row => row.id);

    const users = await pool.query('SELECT id, username FROM users LIMIT 5');
    const userIds = users.rows.map(row => ({ id: row.id, username: row.username }));

    // Create sample post content based on topic
    const getPostContent = (topicIndex, postIndex) => {
      const topics = ['Dormitory', 'University', 'Canteen', 'Library', 'Other'];
      const contentByTopic = {
        'Dormitory': [
          'Does anyone know if there are laundry facilities in the west wing?',
          'My roommate is always playing loud music at night. What can I do?',
          'Looking for people interested in forming a study group in the dorm common area',
          'The wifi in building B is really slow. Anyone else experiencing this?'
        ],
        'University': [
          'When do course registrations for next semester open?',
          'Does anyone have Professor Smith for CS101? How are his classes?',
          'Lost my student ID card near the engineering building. Please contact me if found!',
          'Are the computer labs in the science building open 24/7?'
        ],
        'Canteen': [
          'The new vegetarian options at the canteen are amazing!',
          'What time does the canteen close on weekends?',
          'Anyone else think they should bring back Taco Tuesdays?',
          'Is the coffee at the canteen worth it or should I go to the cafe?'
        ],
        'Library': [
          'Does anyone know if the library has extended hours during finals week?',
          'Which floor is the quietest for studying?',
          'Has anyone used the book reservation system? How does it work?',
          'Looking for study buddies at the library tonight!'
        ],
        'Other': [
          'Anyone interested in joining the campus hiking club this weekend?',
          'Lost my keys somewhere on campus. They have a red keychain.',
          'When is the next student council meeting?',
          'Does anyone know a good barber shop near campus?'
        ]
      };

      const topicName = topics[topicIndex] || 'Other';
      const content = contentByTopic[topicName];
      return content[postIndex % content.length];
    };

    // Insert 4 posts for each topic
    for (let i = 0; i < topicIds.length; i++) {
      const topicId = topicIds[i];

      for (let j = 0; j < 4; j++) {
        const userId = userIds[j % userIds.length].id;
        const content = getPostContent(i, j);
        const likes = Math.floor(Math.random() * 15); // Random likes between 0-14

        await pool.query(
          'INSERT INTO posts (topic_id, user_id, content, votes) VALUES ($1, $2, $3, $4)',
          [topicId, userId, content, likes]
        );
      }

      console.log(`Inserted 4 posts for topic ID ${topicId}`);
    }

    // Insert comments for some posts
    const postsResult = await pool.query('SELECT id FROM posts');
    const postIds = postsResult.rows.map(row => row.id);

    const commentContents = [
      'Great point!',
      'I totally agree with this.',
      'Does anyone know more about this?',
      'Thanks for sharing this information.',
      'I had the same experience last week.',
      'Could you provide more details?',
      'This is really helpful!',
      'I disagree, but respect your opinion.',
      'Has anyone else tried this?',
      'Keep us updated on any developments!'
    ];

    // Add 2-5 comments to each post
    for (const postId of postIds) {
      const commentCount = 2 + Math.floor(Math.random() * 4); // 2-5 comments

      for (let i = 0; i < commentCount; i++) {
        const userId = userIds[Math.floor(Math.random() * userIds.length)].id;
        const content = commentContents[Math.floor(Math.random() * commentContents.length)];

        await pool.query(
          'INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3)',
          [postId, userId, content]
        );
      }

      console.log(`Inserted ${commentCount} comments for post ID ${postId}`);
    }

    console.log('All topics test data inserted successfully!');
  } catch (error) {
    console.error('Error inserting topics data:', error);
  } finally {
    // Close the pool
    pool.end();
  }
}

// Run the function
insertTopicsData();
