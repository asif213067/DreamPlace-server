import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import "dotenv/config";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

const client = new MongoClient(process.env.MONGODB_CLIENT);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

const mongoClient = await connectToMongoDB();
const db = mongoClient.db("dreamPlace");
const destinationCollection = db.collection("destination");

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/add-destination", async (req, res) => {
  const destinationData = req.body;

  const result = await destinationCollection.insertOne(destinationData);

  console.log(result);
  res.send(result);
});

app.get("/destinations", async (req, res) => {
  const result = await destinationCollection.find().toArray();

  res.send(result);
});

app.get("/destination/:id", async (req, res) => {
  const { id } = req.params;

  const result = await destinationCollection.findOne({ _id: new ObjectId(id) });

  res.send(result);
});

app.patch("/destination/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid destination ID",
      });
    }

    const { _id, ...updatedData } = req.body;

    const result = await destinationCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedData },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "Destination not found",
      });
    }

    res.status(200).json({
      message: "Destination updated successfully",
      result,
    });
  } catch (error) {
    console.error("Update destination error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
});

app.delete("/destination/:id", async (req, res) => {
    const { id } = req.params;

    const result = await destinationCollection.deleteOne({ _id: new ObjectId(id) });

    res.json(result);
})

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
