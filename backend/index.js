import express from "express"
import dotenv from "dotenv"
import connectDB from "./db.js"

import joinGame from "./controllers/gameControllers.js"
import startRound from "./controllers/startRound.js"
import submitAnswer from "./controllers/submitAnswer.js"
import nextRound from "./controllers/nextRound.js"
import showQuestion from "./controllers/showQuestion.js"

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

app.post("/api/show-question/:gameId", showQuestion)

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

    io.emit("test", "Hello from server!!")
    

    socket.on("joinGameRoom", (gameId) => {
        socket.join(gameId)
        console.log(`Socket ${socket.id} joined room ${gameId}`);
    })

    // socket.on("testing_group_message", (gameId) => { 
    //     console.log(`Received testing_group_message event for gameId: ${gameId}`);
    //     io.to(gameId).emit("group_test", "message only sent to group");
    // })

    socket.on("submitAnswer", async ({ gameId, userId, answer }) => {
    try {
        console.log("Received submitAnswer event:", gameId, userId, answer);

        const game = await Game.findById(gameId).populate("questions");

        if (!game || game.status !== "playing") {
            console.log("Game not found or not in playing state.");
            return;
        }

        const player = game.players.find((p) => p.userID.toString() === userId);
        if (!player || player.eliminated) {
            console.log(`Player ${userId} not found or already eliminated.`);
            return;
        }

        // ✅ Ensure we have a valid question
        const currentQuestion = game.questions[game.currentRound];
        if (!currentQuestion) {
            console.log("No more questions, game should end!");
            return;
        }

        const correctAnswer = currentQuestion.correctAnswer;
        const isCorrect = answer === correctAnswer;

        if (isCorrect) {
            player.score += 1;
        } else {
            player.eliminated = true;
        }

        if (!game.submittedPlayers) {
            game.submittedPlayers = [];
        }

        if (!game.submittedPlayers.includes(userId)) {
            game.submittedPlayers.push(userId);
        }


        await game.save();

        // ✅ Emit Answer Result
        io.to(gameId).emit("answer", {
            userId,
            correct: isCorrect,
            eliminated: player.eliminated,
            newScore: player.score,
        });
        console.log("Emitted answer event:", { userId, correct: isCorrect, eliminated: player.eliminated, newScore: player.score });

        // ✅ Check if Game is Over (Only 1 player left)
        const remainingPlayers = game.players.filter((p) => !p.eliminated);
        if (remainingPlayers.length === 1) {
            game.status = "finished";
            game.winner = remainingPlayers[0].userID;

            await game.save();

            io.to(gameId).emit("gameOver", {
                message: `Game Over! Winner: ${remainingPlayers[0].username}`,
                winner: remainingPlayers[0],
            });

            return; // ✅ Stop execution after game over
        }

        const activePlayers = game.players.filter((p) => !p.eliminated);
        if (activePlayers.length === game.submittedPlayers.length) {
            console.log("All players submitted their answers, moving to next round.");
            game.submittedPlayers = [];
            await game.save();

            // Call nextRound immediately
            const fakeReq = { params: { gameId } };
            const fakeRes = {
                status: (code) => ({
                    json: (data) => console.log(`Next Round Response [${code}]:`, data),
                }),
            };

            await nextRound(fakeReq, fakeRes);
        }




    } catch (error) {
        console.log("Error in submitAnswer event:", error);
    }
});


    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})

