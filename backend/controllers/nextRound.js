import { Game } from "../models/game.model.js";

const nextRound = async (req, res) => {
    
    try {
        const {gameId} = req.params
        // console.log(gameId);

        const game = await Game.findById(gameId).populate("questions")

        if (!game || game.status !== "playing") {
        return res.status(400).json({ message: "Game not found or not in playing state" });
        }

        // console.log(game);

        const remainingPlayers = game.players.filter((player) => {
            if (player.eliminated === false) {
                return player
            }
        })

        if (remainingPlayers.length === 0) {
            game.status = "finished"
            game.winner = null
            await game.save()

            return res.status(200).json({
                message: "Game over! No winners, everyone is eliminated.",
                winner: null,
            })
        }

        if (remainingPlayers.length === 1) {
            game.status = "finished"
            game.winner = remainingPlayers[0].userID

            await game.save()

            return res.status(200).json({
                message: `Game over! Winner: ${remainingPlayers[0].username}`,
                winner: remainingPlayers[0],
            })
        }

        game.currentRound += 1

        if (game.currentRound >= game.questions.length) {
            game.status = "finished"
            game.winner = remainingPlayers.map(player => player.userID)

            await game.save()

            return res.status(200).json({
                message: "Game over! No mone questions!",
                winner: game.winner,
            })
        }

        await game.save();

        const nextQuestion = game.questions[game.currentRound]

        res.status(200).json({
        message: `Round ${game.currentRound + 1} started`,
        question: {
            _id: nextQuestion._id,
            question: nextQuestion.question,
            options: nextQuestion.options,
        },
        });

        console.log(`Game ${game._id} - Round ${game.currentRound + 1} started`);    
    } catch (error) {
        res.status(500).json({
        message: "Failed to move to the next round",
        error: error.message,
        });
    }
    
}

export default nextRound