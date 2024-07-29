const {Schema, model} = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const PublicationSchema = Schema({
    user: {
        type: Schema.ObjectId,
        ref: "User"
    },
    text: {
        type: String,
        required: true    
    },
    file: String,
    created_at: {
        type: Date,
        default: Date.now
    }
});

//Pasarle el objeto que contiene las funciones del paquete mongoose-paginate-v2
PublicationSchema.plugin(mongoosePaginate);

module.exports = model("Publication", PublicationSchema, "publications");