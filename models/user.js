const {Schema, model} = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    surname: {
        type: String,
        required: true
    },
    bio: String,
    nick: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: "role_user"
    },
    image: {
        type: String,
        default: "default.png"
    },
    created_at:{
        type: Date,
        default: Date.now
    }
});

//Pasarle el objeto que contiene las funciones del paquete mongoose-paginate-v2
UserSchema.plugin(mongoosePaginate);

//Nombre del modelo, nombre del Schema, nombre de la colección de datos de como se guardaría en mongoDB
module.exports = model("User", UserSchema, "users")