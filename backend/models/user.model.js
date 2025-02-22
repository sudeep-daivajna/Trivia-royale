import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required : true
    },
    password: {
        type: String,
        required : true
    },
    wins: {
        type: Number,
        default : 0
    },
    losses: {
        type: Number,
        default: 0
    }
}, {timestamps: true})

export const User = mongoose.model("User", userSchema)