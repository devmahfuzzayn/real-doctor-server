const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
require("dotenv").config();
const app = express();

// middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Real Doctor server is running!");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wfuffuf.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        await client.connect();

        const servicesCollection = client
            .db("realDoctor")
            .collection("services");
        const bookingsCollection = client
            .db("realDoctor")
            .collection("bookings");

        app.get("/services", async (req, res) => {
            const result = await servicesCollection.find().toArray();
            res.send(result);
        });

        app.get("/services/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const options = {
                projection: {
                    title: 1,
                    img: 1,
                    description: 1,
                    price: 1,
                    facility: 1,
                    status: 1,
                },
            };
            const result = await servicesCollection.findOne(query, options);
            res.send(result);
        });

        app.get("/bookings", async (req, res) => {
            const query = req.query;
            const result = await bookingsCollection.find(query).toArray();
            res.send(result);
        });

        app.post("/bookings", async (req, res) => {
            const book = req.body;
            const result = await bookingsCollection.insertOne(book);
            res.send(result);
        });

        app.patch("/bookings/:id", async (req, res) => {
            const id = req.params.id;
            const updatedBooking = req.body;
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    status: updatedBooking.status,
                },
            };
            const result = await bookingsCollection.updateOne(
                filter,
                updatedDoc
            );
            res.send(result);
        });

        app.delete("/bookings/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await bookingsCollection.deleteOne(query);
            res.send(result);
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!"
        );
    } finally {
        // Finally code goes here
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Real Doctor Server is Running on Port: ${port}`);
});
