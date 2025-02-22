import express from "express"
import dotenv from "dotenv"
import connectDB from "./db.js"

import joinGame from "./controllers/gameControllers.js"
import startRound from "./controllers/startRound.js"
import submitAnswer from "./controllers/submitAnswer.js"
import nextRound from "./controllers/nextRound.js"

import { createServer } from "http"
import { Server } from "socket.io"
import {initSocket} from "./socket.js"
import { Game } from "./models/game.model.js"



dotenv.config()
connectDB()

const app = express()

app.use(express.json());

app.get("/", (req, res) => {
    res.send("hello world")
})

app.post("/api/joingame", (req, res) => {
    joinGame(req,res)
})

app.get("/api/start-round/:gameId", startRound)

app.post("/api/submit-answer/:gameId/:userId", submitAnswer)

app.post("/api/next-round/:gameId", nextRound)


// =======================================================================
const server = createServer(app)
const io = new Server(server, {
    cors: {
    origin : "*",
    }
})

initSocket(io)

io.on("connection", (socket) => {
    console.log('A user connected:', socket.id);

    socket.on("joinGameRoom", (gameId) => {
        socket.join(gameId)
        console.log(`Socket ${socket.id} joined room ${gameId}`);
    })

    socket.on("submitAnswer", async ({ gameId, userId, answer }) => {
        // console.log("Received submitAnswer event:", gameId, userId, answer);
        const game = await Game.findById(gameId).populate("questions")
        console.log(game);
    })

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})

