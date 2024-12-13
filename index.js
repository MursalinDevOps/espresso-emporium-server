const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.ESPRESSO_USERNAME}:${process.env.ESPRESSO_SECRET_KEY}@cluster0.mzx0h.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // create a MongoDB collection
    const coffeeCollection = client.db("coffeeDB").collection("coffee");
    // firebase users
    const userCollection = client.db("coffeeDB").collection("users");

    // get all data in the localhost link
    app.get("/coffee", async (req, res) => {
      const cursor = coffeeCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // receive add coffee form data from the client side
    app.post("/coffee", async (req, res) => {
      const addCoffeeFormData = req.body;
      console.log(addCoffeeFormData);
      const result = await coffeeCollection.insertOne(addCoffeeFormData);
      res.send(result);
    });

    // delete a coffee
    app.delete("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.deleteOne(query);
      res.send(result);
    });

    // firebase users related API's

    // get the users
    app.get("/users", async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // create user in the DB
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      console.log("Creating new user ", newUser);
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    });

    // delete user from the DB
    app.delete('/users/:id', async(req ,res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = userCollection.deleteOne(query);
      res.send(result);
    })

    // get unique item to update
    app.get("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.findOne(query);
      res.send(result);
    });

    // update coffee
    app.put("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedCoffee = req.body;

      const coffee = {
        $set: {
          name: updatedCoffee.name,
          quantity: updatedCoffee.quantity,
          supplier: updatedCoffee.supplier,
          taste: updatedCoffee.taste,
          category: updatedCoffee.category,
          details: updatedCoffee.details,
          photo: updatedCoffee.photo,
        },
      };
      const result = await coffeeCollection.updateOne(filter, coffee, options);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", async (req, res) => {
  res.send("ESPRESSO SERVER IS RUNNING...");
});

app.listen(port, () => {
  console.log(`espresso emporium is running on ${port} port!`);
});
