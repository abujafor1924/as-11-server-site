const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello assingment Eleven from server");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.frl4ype.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const verifyToken = (req, res, next) => {
  // console.log("hitting jwt verify");

  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ error: true, message: "unauthorized acces" });
  }
  const token = authorization.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
    if (error) {
      return res
        .status(403)
        .send({ error: true, message: "unauthorized acces" });
    }
    req.decoded = decoded;
    next();
  });
  // console.log("jwt", token);
};

async function run() {
  try {
    // await client.connect();

    const dataCollection = client.db("dataStore").collection("products");

    // jwt token practice
    app.post("/jwt", (req, res) => {
      const user = req.body;
      // console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      // console.log({ token });
      res.send({ token });
    });

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
    app.patch("/update-data/:id", async (req, res) => {
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

    app.get("/some-data", verifyToken, async (req, res) => {
      const decoded = req.decoded;
      if (decoded.email !== req.query.email) {
        return res
          .status(403)
          .send({ error: 1, message: "don't access for your" });
      }

      const sortprice = req.query.sort;
      let sortDataPrice = {};
      if (sortprice === "asc") {
        sortDataPrice = { price: 1 };
      } else if (sortprice === "desc") {
        sortDataPrice = { price: -1 };
      }

      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await dataCollection
        .find(query)
        .sort(sortDataPrice)
        .toArray();
      res.send(result);
    });

    // app.get("/some-data", async (req, res) => {
    //   let query = {};
    //   if (req.query?.email) {
    //     query = { email: req.query.email };
    //   }
    //   const result = await dataCollection.find(query).toArray();
    //   res.send(result);
    // });

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

    app.get("/getcategory", async (req, res) => {
      let query = {};
      if (req?.query?.cat) {
        const subCategory = req.query.cat;
        query = { subCategory };
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
