import mongoose from "mongoose";
import { Game } from "../models/game.model.js";
import nextRound from "./nextRound.js";
import { getSocket } from "../socket.js";



const startRound = async (req,res) => {
    // const gameID = new mongoose.Types.ObjectId(req.params.gameId)
    const gameID = req.params.gameId
    // console.log("gameID : ", gameID);

    try {
        // const question = await Game.findOne({ _id: gameID })
        const game = await Game.findById(gameID).populate("questions")
        // console.log(game);

        if (!game || game.status != "playing") {
            return res.status(400).json({ message: "Game not found or not in playing state" });
        }

        const currentQuestion = game.questions[game.currentRound];

        const io = getSocket()
        io.to(gameID).emit("roundStarted", {
            roundNumber: game.currentRound + 1,
            question: {
                _id: currentQuestion._id,
                question: currentQuestion.question,
                options: currentQuestion.options,
            },
        });

        
        res.status(200).json({
        message: `Round ${game.currentRound + 1} started!`,
        question: {
            _id: currentQuestion._id,
            question: currentQuestion.question,
            options: currentQuestion.options,
        },
        });

        console.log(`Round ${game.currentRound + 1} started for Game ${game._id}`);
        console.log(`Question: ${currentQuestion.question}`);
        console.log(`Options: ${currentQuestion.options.join(", ")}`);

        setTimeout(async () => {
            console.log(`⏰ Timer ended for Game ${game._id} - Moving to next round`);
            // Simulate the request object for calling nextRound internally
            const fakeReq = { params: { gameId: game._id.toString() } };
            const fakeRes = {
                status: (code) => ({
                json: (data) => console.log(`Next Round Response [${code}]:`, data),
                }),
            };

            await nextRound(fakeReq, fakeRes);
            }, 10000);

    } catch (error) {
        res.status(500).json({
            message: "UNABLE TO GET QUESTION",
            error : error.message
        })
    }
}

export default startRound