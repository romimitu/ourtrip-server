const express = require('express');
const { MongoClient } = require('mongodb');
const {ObjectId} = require('mongodb'); 
require('dotenv').config();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wellz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        console.log("DB Connected");
        const database = client.db('travel_agency');
        const serviceCollection = database.collection('services');
        const orderCollection = database.collection('orders');

        //GET All Order API
        app.get('/orders', async (req, res) => {
            const cursor = orderCollection.find({});
            orders = await cursor.toArray();
            res.send(orders);
        });

        
        //GET My Order API
        app.get('/orders/:email', async (req, res) => {
            const email = req.params.email;
            const orders = await orderCollection.find({email:email}).toArray();
            res.send(orders);
        });
        //Confirm Order API
        app.post('/confirm-order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                  status: "Confirmed"
                },
              };
            const orders = await orderCollection.updateOne(query,updateDoc);
            res.send(orders);
        });

        //GET services API
        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find({});
            services = await cursor.toArray();
            res.send(services);
        });
        // Add services API
        app.post('/service', async (req, res) => {
            const service = req.body;
            console.log(req.body);
            const result = await serviceCollection.insertOne(service);
            res.json(result);
        })

        // Add Orders API
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result);
        })
        
        // Delete Orders API
        app.delete('/delete-order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.json(result);
        })

    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Our Trip server is running');
});

app.listen(port, () => {
    console.log('Server running at port', port);
})
