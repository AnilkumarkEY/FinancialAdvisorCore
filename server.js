import express from "express";
import { AccessToken } from "livekit-server-sdk";
import dotenv from "dotenv";
import cors from "cors";
import { AccessToken } from "livekit-server-sdk";

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

const LIVEKIT_API_KEY = "API6cX4vDhMK5mn"; // <-- Replace with your LiveKit API key
const LIVEKIT_API_SECRET = "mauoiSYg9ZAuK3k2oLTkFHTu1vXjHHbjTqaR7xBlkID"; // <-- Replace with your LiveKit API secret
const LIVEKIT_URL = "wss://YOUR_LIVEKIT_SERVER_URL"; // <-- Replace with your LiveKit server URL

app.use(cors());

app.get("/token", async (req, res) => {
  const identity = req.query.identity || "flutter-user";
  const room = req.query.room || "ey-demo";
  if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
    return res.status(500).json({ error: "LiveKit API key/secret not set" });
  }
  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity,
  });
  at.addGrant({ roomJoin: true, room });
  const token = await at.toJwt();
  res.json({ token });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
