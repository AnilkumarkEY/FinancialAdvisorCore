import express from "express";
import { AccessToken } from "livekit-server-sdk";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env

const createToken = async (roomData) => {
  const { roomName, participantName } = roomData;
  const at = new AccessToken(process.env.API_KEY, process.env.SECRET, {
    identity: participantName,
    ttl: 600, // Token to expire after 10 minutes (in seconds)
  });
  at.addGrant({ roomJoin: true, room: roomName });

  return at.toJwt();
};

const app = express();
app.use(express.json());
const port = 8081;

app.post("/getToken", async (req, res) => {
  try {
    console.log(req.body);
    const token = await createToken(req.body);
    res.send({ token: token });
  } catch (error) {
    console.log(error);

    res.status(500).send("Error generating token");
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
