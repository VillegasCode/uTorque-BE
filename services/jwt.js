//Importar dependencias y frameworks
const jwt = require("jwt-simple");
const moment = require("moment");

//clave secreta
const secret = "CLAVE_SECRETA_del_proyecto_DE_LA_RED_soCIAL_987987";

//Crear una función para generar tokens y como es una sola función en todo el módulo procedemos a exportarlo directamente
const createToken = (user) => {
    //El objeto payload va a contener toda la información que se va a guardar dentro del token
    const payload = {
        id: user._id,
        name: user.name,
        surname: user.surname,
        nick: user.nick,
        email: user.email,
        role: user.role,
        image: user.image,
        //Agregar una fecha larga ilegible en formato unix
        iat: moment().unix(),
        //Expiración del token en segundos, minutos, horas, días, meses, etc
        exp: moment().add(30, "days").unix()
    };

    //Devolver JWT token codificando el objeto dentro del token con la clave secreta
    return jwt.encode(payload, secret);
}

module.exports = {
    secret,
    createToken
}