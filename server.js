const express = require('express');
const app = express();
const { Client } = require('pg');

let client = new Client({
  host: 'localhost',
  port: '5433',
  user: 'postgres',
  password: 'postgres',
  database: 'mtaa',
});

app.listen(8080, () => {
  console.log('REST API IS UP AND RUNNING ON LOCALHOST:8080');
});

app.get('/');
app.post('/register', (req, res) => {});
app.post('/login', (req, res) => {});
app.update();
app.delete();
