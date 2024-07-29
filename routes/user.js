const express = require("express");
const router = express.Router();
// Importamos Multer
const multer = require("multer");
const UserController = require("../controllers/user");
//Importamos el MIDDLEWARE de autenticación
const check = require("../middlewares/auth");


//CONFIGURACIÓN DE SUBIDAS
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/avatars/")
    },
    filename: (req, file, cb) => {
        cb(null, "avatar-" + Date.now() + "-" + file.originalname);
    }
});

const uploads = multer({storage});


//Definir rutas
//Creamos la ruta "prueba-usuario" y llamamos al método "pruebaUser" que se encuentra dentro del UserController
//pero previo usamos el middleware el objeto check con su método auth
router.get("/prueba-usuario", check.auth, UserController.pruebaUser);

//Creamos la ruta "register" y llamamos al método register que se encuentra dentro del UserController
router.post("/register", UserController.register);

//Creamos la ruta LOGIN
router.post("/login", UserController.login);

//Creamos la ruta para ver el perfil de un usuario pero solo se puede ser si se han logeado entonces añadimos el middleware
router.get("/profile/:id", check.auth, UserController.profile);

router.get("/list/:page?", check.auth, UserController.list);

//Ruta para actualizar el usuario previa autenticación
router.put("/update", check.auth, UserController.update);

//Subir imágenes pasandole 2 middlewares dentro de los corchetes
router.post("/upload", [check.auth, uploads.single("file0")], UserController.upload);

//Ruta para cargar el archivo del avatar solo en usuarios previamente identificados
router.get("/avatar/:file", UserController.avatar);

//Ruta para mostrar el contador del user controller
router.get("/counters/:id", check.auth, UserController.counters);

//Exportar router
module.exports = router;