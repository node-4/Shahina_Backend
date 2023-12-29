const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;
var notificationModel = new Schema({
        userId: {
                type: Mongoose.Schema.Types.ObjectId,
                ref: "user"
        },
        orderUserId: {
                type: Mongoose.Schema.Types.ObjectId,
                ref: "user"
        },
        body: {
                type: String
        },
        date: {
                type: String
        },
        time: {
                type: String
        },
        status: {
                type: String,
                enum: ["ACTIVE", "BLOCKED", "DELETE"],
                default: "ACTIVE"
        },
}, { timestamps: true });
module.exports = Mongoose.model("adminNotification", notificationModel);