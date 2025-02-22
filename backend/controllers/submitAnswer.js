import mongoose from "mongoose";
import { Game } from "../models/game.model.js";

const submitAnswer = async (req, res) => {
    const { gameId, userId } = req.params
    const { answer } = req.body;
    
    try {
        const game = await Game.findById(gameId).populate("questions")
        // console.log(game);

        if (!game || game.status !== "playing") {
            return res.status(500).json({message : "game not found or not playing"})
        }

        const question = game.questions[game.currentRound]
        // console.log(question);
        const player = game.players.find((player) => {
                if (player.userID.toString() === userId) {
                    return player
                }
        })
        
        if (!player) {
            return res.status(500).json({message : "Player NOT found"})
        }
        if (player.eliminated) {
            return res.status(500).json({message : "Player aldready eliminated"})
        }

        if (answer === question.correctAnswer) {
            player.score += 1
        } else {
            player.eliminated = true
        }

        // console.log(player);

        await game.save()
        
        res.status(200).json({
                message: player.eliminated
                    ? "Wrong answer! You are eliminated."
                    : "Correct answer! You move to the next round.",
                playerStatus: {
                    userID: player.userID,
                    eliminated: player.eliminated,
                    score: player.score,
                },
            });
        
        
    
    } catch (error) {
        res.status(500).json({
            message: "Unable to check answer",
            error : error
        })
    }

    
}

export default submitAnswer