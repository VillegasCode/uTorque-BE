const mongoose = require("mongoose");

const connection = async() => {
    try {
        //await mongoose.connect("mongodb://127.0.0.1:27017/u_TorqueDB");
        await mongoose.connect("mongodb+srv://villegascode:6ky4o9v7d02b3OuN@cluster0.ovbyd39.mongodb.net/u_TorqueDB?retryWrites=true&w=majority&appName=Cluster0");
        console.log("Conectado correctamente a bd: u_TORQUE");
    } catch(error) {
        console.log(error);
        throw new Error("No se ha podido conectar a la DB");
    }
}

module.exports = connection