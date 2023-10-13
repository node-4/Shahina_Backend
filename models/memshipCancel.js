const CartSchema = new Schema({
        user: {
                type: Schema.Types.ObjectId,
                ref: "user"
        },
        reason: {
                type: String,
        },
        type: {
                type: String,
        },
}, {
        timestamps: true
})
module.exports = mongoose.model("memshipCancel", CartSchema)