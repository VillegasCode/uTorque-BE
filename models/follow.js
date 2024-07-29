const {Schema, model} = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const FollowSchema = Schema({
    user: {
        type: Schema.ObjectId,
        ref: "User"
    },
    followed: {
        type: Schema.ObjectId,
        ref: "User"
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

//Pasarle el objeto que contiene las funciones del paquete mongoose-paginate-v2
FollowSchema.plugin(mongoosePaginate);

module.exports = model("Follow", FollowSchema, "follow");