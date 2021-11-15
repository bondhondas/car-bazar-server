const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

// MongoDB START
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xm1fc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("carDatabase");
        const usersCollection = database.collection("usersCollection");
        const carsCollection = database.collection("carsCollection");
        const orderCollection = database.collection("orderCollection");
        const reviewsCollection = database.collection("reviewsCollection");

        // GET ALL USERS API
        app.get('/users', async (req, res) => {
            const query = {};
            const cursor = usersCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        // POST USERS API
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });

        // PUT USERS API
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });

        // SET A USER TO ADMIN API
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const requester = req.query.email;
            if (requester) {
                const requesterAccount = await usersCollection.findOne({ email: requester });
                if (requesterAccount.role === 'Admin') {
                    const filter = { email: user.email };
                    const updateDoc = { $set: { role: 'Admin' } };
                    const result = await usersCollection.updateOne(filter, updateDoc);
                    res.json(result);
                }
            }
            else {
                res.status(403).json({ message: 'Sorry you do not have access to make admin' });
            };

        });

        // DELETE USER API
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(query);
            res.send(result);
        });

        // CHECK USER ROLE
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'Admin') {
                isAdmin = true;
            }
            res.send(isAdmin);
        });

        // GET ALL APARTMENTS API
        app.get('/apartments', async (req, res) => {
            const email = req.query.email;
            let query;
            let cursor;

            if (email) {
                query = { email: email };
                cursor = orderCollection.find(query);
            }

            else {
                query = {};
                cursor = carsCollection.find(query);
            };

            const result = await cursor.toArray();
            res.send(result);
        });

        // GET SINGLE APARTMENTS API
        app.get('/apartments/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const cursor = carsCollection.findOne(query);
            const result = await cursor;
            res.send(result);
        });

        // POST APARTMENTS API
        app.post('/apartments', async (req, res) => {
            const apartments = req.body;
            const result = await carsCollection.insertOne(apartments);
            res.send(result);
        });

        // DELETE APARTMENTS API
        app.delete('/apartments/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await carsCollection.deleteOne(query);
            res.send(result);
        });

        // UPDATE APARTMENTS API
        app.put('/apartments/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const apartments = req.body;
            const updateDoc = {
                $set: {
                    name: apartments.name,
                    price: apartments.price,
                    image: apartments.image,
                    description: apartments.description,
                    sqft: apartments.sqft,
                    beds: apartments.beds,
                    bath: apartments.bath
                },
            };
            const result = await carsCollection.updateOne(query, updateDoc);
            res.send(result);
        });

        // GET ALL ORDER API
        app.get('/orders', async (req, res) => {
            const id = req.query.id;
            const email = req.query.email;

            let query;
            let cursor;
            let orders;

            if (id) {
                query = { _id: ObjectId(id) };
                cursor = orderCollection.findOne(query);
                orders = await cursor;
            }

            else if (email) {
                query = { email: email };
                cursor = orderCollection.find(query);
                orders = await cursor.toArray();
            }

            else {
                query = {};
                cursor = orderCollection.find(query);
                orders = await cursor.toArray();
            }
            res.send(orders);
        });

        // POST ORDER API
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
        });

        // DELETE ORDER API
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.send(result);
        });

        // UPDATE ORDER API
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const order = req.body;
            const updateDoc = {
                $set: {
                    name: order.name,
                    email: order.email,
                    phone: order.phone,
                    address: order.address,
                    apartmentName: order.apartmentName,
                    price: order.price,
                    image: order.image,
                    description: order.description,
                    sqft: order.sqft,
                    beds: order.beds,
                    bath: order.bath,
                    status: order.status
                },
            };
            const result = await orderCollection.updateOne(query, updateDoc);
            res.send(result);
        });

        // GET REVIEWS API
        app.get('/reviews', async (req, res) => {
            const query = {};
            const cursor = reviewsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        // POST REVIEWS API
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.send(result);
        });

        // POST CONTACT API
        app.post('/contact', async (req, res) => {
            const contact = req.body;
            const result = await contactCollection.insertOne(contact);
            res.send(result);
        });

        // POST JOB APPLICATION API
        app.post('/careers', async (req, res) => {
            const application = req.body;
            const result = await jobApplicationCollection.insertOne(application);
            res.send(result);
        });
    }

    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("Server Running");
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});