const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello assingment Eleven");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.frl4ype.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();

    const dataCollection = client.db("dataStore").collection("products");

    // post data

    app.post("/product", async (req, res) => {
      const body = req.body;
      const result = await dataCollection.insertOne(body);
      res.send(result);
    });

    // get data
    app.get("/all-data", async (req, res) => {
      const result = await dataCollection.find().limit(20).toArray();
      res.send(result);
    });
    app.get("/all-data/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await dataCollection.findOne(filter);
      res.send(result);
    });

    // put data

    app.put("/update-data/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          ...body,
        },
      };
      const result = await dataCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // delete data

    app.delete("/delete-data/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await dataCollection.deleteOne(filter);
      res.send(result);
    });

    app.get("/some-data", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await dataCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/getText/:text", async (req, res) => {
      const text = req.params.text;
      const result = await dataCollection
        .find({
          $or: [
            {
              name: { $regex: text, $options: "i" },
            },
            {
              subCategory: { $regex: text, $options: "i" },
            },
          ],
        })
        .toArray();
      res.send(result);
    });

    app.get("/all-datas/:subCategory", async (req, res) => {
      let query = {};
      if (req.query?.subCategory) {
        query = { subCategory: req.query.subCategory };
      }
      const result = await dataCollection.find(query).toArray();
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB! Server"
    );
  } finally {
    //     await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`server  is running from toy shop port : ${port}`);
});
