import mongoose from "mongoose";
import { Game } from "../models/game.model.js";
import { Question } from "../models/question.model.js";
// import startRound from "./startRound.js";
import showQuestion from "./showQuestion.js";

const joinGame = async (req, res) => {
    const { userId, username } = req.body
    
    try {
        let game = await Game.findOne({ status: "waiting" })
        
        if (!game) {
            game = await Game.create({
                players: [{ userID: new mongoose.Types.ObjectId(userId), username }],
                status : "waiting"
            })
        }
        else {
            const joinedAldready = game.players.some((p) => {
                return p.userID.toString() === userId
            })

            if (!joinedAldready) {
                game.players.push({userID : new mongoose.Types.ObjectId(userId), username})
            }
        }

        if (game.players.length >= 3) {
            game.status = "playing"
            game.currentRound = 0

            const questions = await Question.aggregate([{ $sample: { size: 5 } }])
            game.questions = questions.map((q) => q._id)
            //call startRound
            req.params.gameId = game._id
            // await startRound(req, res)
            await showQuestion(req, res)
        }


        await game.save()
        res.status(200).json({
            message: game.status === "playing" ? "Game has started!!" :  "Joined the game successfully",
            game
        })

        if (game.status === "playing") {
            console.log(`Game ${game._id} started with ${game.players.length} players!`);
            }
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to join game :/",
            error : error.message
        })
    }
}

export default joinGame