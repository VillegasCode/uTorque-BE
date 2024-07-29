const validator = require("validator");

const validate = (params) => {
    //Para validar que no sea una cadena vacía o en blanco
    //Para validar el mínimo y máximo de caracteres ingresados
    //Para validar que los caracteres ingresados sean letras del alfabeto español
    let name = !validator.isEmpty(params.name) &&
        validator.isLength(params.name, { min: 2, max: 50 }) &&
        validator.isAlpha(params.name, "es-ES");

    let surname = !validator.isEmpty(params.surname) &&
        validator.isLength(params.surname, { min: 2, max: 50 }) &&
        /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s']+$/.test(params.surname);

    let nick = !validator.isEmpty(params.nick) &&
        validator.isLength(params.nick, { min: 3, max: 25 });

    let email = !validator.isEmpty(params.email) &&
        validator.isEmail(params.email) &&
        validator.isLength(params.email, { min: 6, max: 35 });

    let password = !validator.isEmpty(params.password) &&
    validator.isLength(params.password, { min: 8, max: 35 });

    if(params.bio){
        let bio = validator.isLength(params.bio, { min: undefined, max: 300 });

        if(!bio) {
            throw new Error("No se ha superado la validación");
        } else {
            console.log("validacion superada");
        }
    }
    
    if (!name || !surname || !nick || !email || !password) {
        throw new Error("No se ha superado la validación");
    } else {
        console.log("validación superada");
    }
}

module.exports = validate