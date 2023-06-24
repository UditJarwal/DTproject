const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = 3000;

// Connection URI to MongoDB server
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

app.use(express.json());

// GET /api/v3/app/events/:id
// Get an event by its unique id
app.get('/api/v3/app/events/:id', async (req, res) => {
  try {
    const db = client.db('mydb');
    const result = await db.collection('events').findOne({ _id: new ObjectId(req.params.id) });
    if (!result) {
      return res.status(404).send('Event not found');
    }
    return res.send(result);
  } catch (err) {
    console.error(err);
    return res.status(500).send('Internal server error');
  }
});

// GET /api/v3/app/events?type=latest&limit=5&page=1
// Get latest events paginated by limit and page number
app.get('/api/v3/app/events', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const skip = (parseInt(req.query.page) - 1) * limit || 0;
    const db = client.db('mydb');
    const result = await db.collection('events').find().sort({ _id: -1 }).skip(skip).limit(limit).toArray();
    return res.send(result);
  } catch (err) {
    console.error(err);
    return res.status(500).send('Internal server error');
  }
});

// POST /api/v3/app/events
// Create an event and return its Id
app.post('/api/v3/app/events', async (req, res) => {
  try {
    const db = client.db('mydb');
    const result = await db.collection('events').insertOne(req.body);
    return res.send(result.insertedId);
  } catch (err) {
    console.error(err);
    return res.status(500).send('Internal server error');
  }
});

// PUT /api/v3/app/events/:id
// Update an event by its unique id
app.put('/api/v3/app/events/:id', async (req, res) => {
  try {
    const db = client.db('mydb');
    const result = await db.collection('events').updateOne({ _id: new ObjectId(req.params.id) }, { $set: req.body });
    if (result.matchedCount === 0) {
      return res.status(404).send('Event not found');
    }
    return res.send();
  } catch (err) {
    console.error(err);
    return res.status(500).send('Internal server error');
  }
});

// DELETE /api/v3/app/events/:id
// Delete an event by its unique id
app.delete('/api/v3/app/events/:id', async (req, res) => {
  try {
    const db = client.db('mydb');
    const result = await db.collection('events').deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).send('Event not found');
    }
    return res.send();
  } catch (err) {
    console.error(err);
    return res.status(500).send('Internal server error');
  }
});

// Start the Express.js app and connect to MongoDB server
app.listen(port, async () => {
  await client.connect();
  console.log(`App listening at http://localhost:${port}`);
});