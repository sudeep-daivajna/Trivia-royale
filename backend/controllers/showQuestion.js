import { Game } from "../models/game.model.js";

const showQuestion = async (req, res) => { 
    try { 
        const { gameId } = req.params;
        const game = await Game.findById(gameId).populate("questions");

        if (!game || game.status !== "playing") {
            return res.status(400).json({ message: "Game not found or not in playing state" });
        }
        
        const currentQuestion = game.questions[game.currentRound];
        console.log(game);

        const io = getSocket();
        io.to(gameId).emit("roundStarted", {
            roundNumber: game.currentRound + 1,
            question: {
                _id: currentQuestion._id,
                question: currentQuestion.question,
                options: currentQuestion.options,
            },
        });
        

    }
    catch (error) {
        console.log("Error in showQuestion:", error);
    }
}

export default showQuestion