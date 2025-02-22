import mongoose, { mongo } from "mongoose";
import { User } from "./user.model.js";
import { Question } from "./question.model.js";

const gameSchema = new mongoose.Schema({
    players: [{
        userID: {
            type:mongoose.Schema.Types.ObjectId,
            ref: User,
            required : true,
        },
        username: {
            type: String,
            required : true
        },
        score: {
            type: Number,
            default: 0
        },
        eliminated: {
            type: Boolean,
            default: false
        }  
    }],
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: Question
    }],
    status: {
        type: String,
        enum: ["waiting", "playing", "finished"],
        default: "waiting"
    },
    currentRound: {
        type: Number,
        default: 0
    },
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        default: null
    }
})

export const Game = mongoose.model("Game", gameSchema)