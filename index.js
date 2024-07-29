//Importar dependencias
const connection =require("./database/connection");
const express = require("express");
const cors = require("cors");

//Mensaje de Bienvenida
console.log("API NODE para RED SOCIAL arrancada!!!, DB: u_TORQUE");

//Conexión a DB
connection();

//Crear Servidor NODE
const app = express();
const puerto = 3900;

//Configurar cors
app.use(cors());

//Convertir los datos del body a objetos js
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//Cargar conf rutas
const UserRoutes = require("./routes/user");
const PublicationRoutes = require("./routes/publication");
const FollowRoutes = require("./routes/follow");

app.use("/api/user", UserRoutes);
app.use("/api/publication", PublicationRoutes);
app.use("/api/follow", FollowRoutes);

//Ruta de Prueba
app.get("/ruta-prueba", (req, res) => {
    return res.status(200).json(
        {
            "id": 1,
            "nombre": "Carlos",
            "web": "empresarioencasa.org" 
        }
    );
})

//Poner servidor a escuchar peticiones http
app.listen(puerto, () => {
    console.log("Servidor de node corriendo en el puerto: ", puerto);
});