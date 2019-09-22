const express = require('express');
var cors = require('cors');
require('dotenv').config();
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const Pusher = require('pusher');


const adapter = new FileSync('db.json');
const db = low(adapter);

// configue pusher
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_APP_KEY,
  secret: process.env.PUSHER_APP_SECRET,
  cluster: process.env.PUSHER_APP_CLUSTER
});


// set the initial json file
db.defaults({ posts: [] })
  .write();

// set for default data
if (db.get('posts').size().value() === 0) {
  db.get('posts')
    .push({ id: 1, link: 'https://images.unsplash.com/photo-1567604466803-83fec44ae584?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=600&ixlib=rb-1.2.1&q=80&w=480', count: 1005 })
    .write();
  db.get('posts').push({ id: 2, link: 'https://images.unsplash.com/photo-1568793105498-0ee14aac6565?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=600&ixlib=rb-1.2.1&q=80&w=480', count: 1006 }).write();
  db.get('posts').push({ id: 3, link: 'https://images.unsplash.com/photo-1567030422165-af7ea28f987c?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=600&ixlib=rb-1.2.1&q=80&w=480', count: 1007 }).write();
}


const app = express();
app.use(cors());

// get the initial posts array
app.get('/posts', async (req, res) => {
  const posts = await db.get('posts').orderBy('count', 'desc').value();
  res.status(200).json(posts, 200);
});

// post like for image
app.get('/posts/:id/like', async (req, res) => {
  const post = await db.get('posts').find({ id: parseInt(req.params.id, 10) }).value();
  await db.get('posts').find({ id: parseInt(req.params.id, 10) }).assign({ count: parseInt(post.count, 10) + 1 }).write();
  pusher.trigger('pusherlikes', 'likes', {
    count: post.count,
    id: parseInt(req.params.id, 10)
  });
  res.status(200).json({ message: 'Post like success' });
});

app.get('/', (req, res) => res.send('Hello World'));
const port = process.env.PORT || 3000;
app.listen(port);
console.log(`Pusher API server started on: ${port}`);
