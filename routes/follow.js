const express = require("express");
const router = express.Router();
const FollowController = require("../controllers/follow");
//Importarmos el middelware de autenticación
const check = require("../middlewares/auth");
const follow = require("../models/follow");

//Definir rutas
//router.get("/prueba-follow", FollowController.pruebaUser);

//Ruta de guardar follow
router.post("/save", check.auth, FollowController.save);

//Ruta para dejar de seguir un usuario
router.delete("/unfollow/:id", check.auth, FollowController.unfollow);

//Ruta para ver a que usuarios estoy siguiendo
router.get("/following/:id?/:page?", check.auth, FollowController.following);

//Ruta para ver quiénes son mis seguidores
router.get("/followers/:id?/:page?", check.auth, FollowController.followers);

//Exportar router
module.exports = router;