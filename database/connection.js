const mongoose = require("mongoose");

const connection = async() => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/u_TorqueDB");
        console.log("Conectado correctamente a bd: u_TORQUE");
    } catch(error) {
        console.log(error);
        throw new Error("No se ha podido conectar a la DB");
    }
}

module.exports = connection