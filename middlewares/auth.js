//Importar modulos
const jwt = require("jwt-simple");

//Para controlar fechas se usa moment
const moment = require("moment");

// Importar clave secreta
const libjwt = require("../services/jwt");
const secret = libjwt.secret;


//Función de autenticación (MIDDLEWARE)
exports.auth = (req, res, next) => {

    //Comprobar si me llega la cabecera de authorización (esto va en la sección headers en postman)
    if(!req.headers.authorization){
        return res.status(403).send({
            status: "error",
            message: "La petición no tiene la cabecera de autenticación"
        });
    }

    //Limpiar el token de las comillas simples y doble con expresiones regulares, atributo global
    let token = req.headers.authorization.replace(/['"]+/g, '');

    //Decodificar token
    try{
        let payload = jwt.decode(token, secret);

        //Comprobar expiración del token
        if(payload.exp <= moment().unix()) {
            return res.status(401).send({
                status: "error",
                message: "Token expirado",
            });
        }

        //Agregar datos de usuario a request
        req.user = payload;

    } catch(error){
        return res.status(404).send({
            status: "error",
            message: "Token inválido",
            error
        });
    }

    //Pasar a ejecución de acción
    next();
}