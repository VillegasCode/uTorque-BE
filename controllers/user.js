//Importar dependencias y modulos
const bcrypt = require("bcrypt");
const mongoosePagination = require("mongoose-paginate-v2");
//Importar la libreria fs "file system"
const fs = require("fs");
const path = require("path");
//Importar modelos
const User = require("../models/user");
const Follow = require("../models/follow");
const Publication = require("../models/publication");

//Importar servicios
const jwt = require("../services/jwt");
const { use } = require("../routes/user");
const followService = require("../services/followService");
const validate = require("../helpers/validate");
const user = require("../models/user");

//Acciones de prueba
const pruebaUser = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde: controllers/user.js",
        //Traer los datos del usuario desde jwt.js
        usuario: req.user
    });
}


// Método Registro de usuarios
const register = (req, res) => {
    //Recoger datos de la peticion
    let params = req.body;

    //Comprobar que me llegan bien (+ validacion)
    if (!params.name || !params.email || !params.nick || !params.password) {
        return res.status(400).json({
            status: "error",
            message: "Faltan datos por enviar",
        });
    }

    //Validación avanzada
    try {
        validate(params);
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Validación no superada",
            parametros: params
        });
    }

    //Verificación de usuarios duplicados
    User.find({
        $or: [
            { email: params.email.toLowerCase() },
            { nick: params.nick.toLowerCase() }
        ],
    }).then(async (users) => {
        if (users && users.length >= 1) {
            return res.status(200).send({
                status: "duplicate",
                message: "El usuario ya existe"
            });
        }

        //Cifrar la contraseña, le pasamos lo que queremos cifrar y como 2do parámetro le indicamos el número de veces que va a cifrar la contraseña
        let pwd = await bcrypt.hash(params.password, 10);
        params.password = pwd;

        //Crear objeto de usuario
        let user_to_save = new User(params);

        //Guardar usuario en la DB
        user_to_save.save().then((userStored) => {

            //Devolver Resultado
            return res.status(200).json({
                status: "success",
                message: "Acción de registro de usuario",
                user: userStored,
            });
        }).catch((error) => {
            return res.status(500).json({ status: "error", message: "Error al guardar el usuario" })
        });

    })
}

const login = async (req, res) => {
    //Recoger parámetros del body
    let params = req.body;

    if (!params.email || !params.password) {
        return res.status(400).send({
            status: "error",
            message: "Faltan datos por enviar"
        });
    }

    //Buscar en la DB si existe el usuario

    try {
        var user = await User.findOne({ email: params.email })
        //Para no mostrar ni el campo password, ni el campo rol
        //.select({ "password": 0, "role": 0 }).exec();
        if (!user) {
            return res.status(404).send({
                status: "error",
                message: "No existe el usuario " + params.email
            });
        }

        //Comprobar contraseña de los params con el hash cifrado y que devuelva true si es identica o false si es errónea
        const pwd = bcrypt.compareSync(params.password, user.password);

        if (!pwd) {
            return res.status(400).send({
                status: "error",
                message: "No te has identificado correctamente"
            })
        }

        else {

            //Devolver token y le pasamos el objeto a codificar
            const token = jwt.createToken(user);

            //Eliminar password del objeto

            //Devolver Datos del usuario
            return res.status(200).send({
                status: "success",
                message: "Acción de login",
                user: {
                    id: user._id,
                    name: user.name,
                    nick: user.nick,
                    email: user.email
                },
                token
            });
        }
    } catch (error) {
        return res.status(404).send({
            status: "error",
            message: "No existe el usuario catch " + params.email,
        });
    }
}

//Consulta para sacar los datos del usuario
const profile = async (req, res) => {
    //Recibir el parámetro del id de usuario por la url
    const id = req.params.id;

    try {
        //Devolver el resultado
        const userProfile = await User.findById(id).select({ password: 0, role: 0 });
        
        if (!userProfile) {
            return res.status(404).send({
                status: "error",
                message: "No existe el usuario"
            });
        }

        //Información de seguimiento
        const followInfo = await followService.followThisUser(req.user.id, id);

        //Resultado existoso y Posteriormente: devolver información de follows
        return res.status(200).send({
            status: "success",
            Profile: userProfile,
            following: followInfo.iFollowing,  
            follower: followInfo.heFollower
        });
    } catch (error) {
        return res.status(404).send({
            status: "error",
            message: "Hay un error en la consulta"
        });
    }
};

const list = (req, res) => {
    //Controlar en que página estamos
    let page = 1;
    if (req.params.page) {
        page = req.params.page;
    }
    page = parseInt(page);


    //Consulta con mongoose paginate, hay que pasale la página actual y un número de items por página
    let itemsPerPage = 5;
    const options = {
        page: page,
        limit: itemsPerPage,
        sort: { _id: -1 },
    };

    User.paginate({}, options)
        .then(async (result) => {
            if (!result) {
                return res.status(404).send({
                    error: "error",
                    message: "No existen usuarios"
                });
            }

            //Sacar un array de ids de los usuarios que me siguen y los sigo como Carlitos Billetudo
            let followUserIds = await followService.followUserIds(req.user.id);

            //Devolver el resultado y información de usuarios que sigo y usuarios que me siguen
            return res.status(200).send({
                status: "success",
                message: "Ruta de listado de usuario que yo sigo",
                users: result.docs,
                page,
                itemsPerPage,
                total: result.totalDocs,
                pages: Math.ceil(result.totalDocs / itemsPerPage),
                user_following: followUserIds.following,
                user_follow_me: followUserIds.followers
            });
        })
        .catch((error) => {
            return res.status(500).send({
                status: "error",
                message: "Error al listar usuarios",
                error
            });
        });
};

//Método de actualizar usuario
const update = (req, res) => {
    //Recoger info del usuario a actualizar
    let userIdentity = req.user;
    let userToUpdate = req.body;

    //Eliminar campos sobrantes
    delete userToUpdate.iat;
    delete userToUpdate.exp;
    delete userToUpdate.role;
    delete userToUpdate.image;

    //Comprobar si el usuario ya existe
    //Verificación de usuarios duplicados
    User.find({
        $or: [
            { email: userToUpdate.email.toLowerCase() },
            { nick: userToUpdate.nick.toLowerCase() }
        ],
    }).then(async (users) => {
        let userIsset = false;
        users.forEach(user => {
            if (user && user._id != userIdentity.id) userIsset = true;
        });

        if (userIsset) {
            return res.status(200).send({
                status: "success",
                message: "El usuario ya existe"
            });
        }

        //Cifrar la contraseña, le pasamos lo que queremos cifrar y como 2do parámetro le indicamos el número de veces que va a cifrar la contraseña
        if (userToUpdate.password) {
            let pwd = await bcrypt.hash(userToUpdate.password, 10);
            userToUpdate.password = pwd;
        } else {
            //Eliminar el campo password para que al momento de mandar no sobreescriba la contraseña vacía
            delete userToUpdate.password;
        }

        //Buscar y actualizar
        try {
            let userUpdated = await User.findByIdAndUpdate(userIdentity.id, userToUpdate, { new: true });

            if (!userUpdated) {
                return res.status(500).json({ status: "error", message: "Error al actualizar" })
            }

            //Devolver respuesta
            return res.status(200).send({
                status: "success",
                message: "Metodo de actualizar usuario",
                userUpdated,
                
            });

        } catch (error) {
            return res.status(500).send({
                status: "error",
                message: "Error al actualizar",
                error
            });
        }
    });
}

const upload = async(req, res) => {

    //Recoger el fichero de imagen y comprobar que existe
    if (!req.file) {
        return res.status(404).send({
            status: "error",
            message: "Petición no incluye la imagen"
        });
    }

    //Conseguir el nombre del archivo
    let image = req.file.originalname;

    //Sacar la extensión del archivo
    const imageSplit = image.split("\.");
    const extension = imageSplit[1];

    //Comprobar extensión
    if (extension != "png" && extension != "PNG" && extension != "jpg" && extension != "JPG" && extension != "jpeg" && extension != "JPEG" && extension != "gif" && extension != "GIF") {
        const filePath = req.file.path;

        //Borramos el archivo si no tiene la extensión adecuada
        const fileDeleted = fs.unlinkSync(filePath);

        //Devolver respuesta negativa
        return res.status(400).send({
            status: "error",
            message: "Extensión del fichero inválida",
        });
    }

    //Si es correcta la extensión, hay que guardar la imagen en la DB
    
    let userUpdated = await User.findOneAndUpdate( {_id: req.user.id} , { image: req.file.filename }, { new: true });
        try {
            if (!userUpdated) {
                return res.status(500).send({
                    status: "error",
                    message: "Error en la subida del avatar",
                    user: req.user,
                    error: error.message
                });
            }

            //Devolver respuesta
            return res.status(200).send({
                status: "success",
                user: userUpdated,
                file: req.file,
            });

        } catch (error) {
            return res.status(400).send({
                status: "error",
                message: "Error en la app",
                user: req.user,
                error: error.message
            });
        }
}

//Función avatar
const avatar = (req, res) => {
    //Sacar el parámetro de la url
    const file = req.params.file;

    //Montar el path real de la imagen
    const filePath = "./uploads/avatars/" + file;

    //Comprobar que existe el path
    fs.stat(filePath, (error, exists) => {
        if(!exists){
            return res.status(404).send({
                status: "error",
                message: "No existe la imagen",
            });
        }
    
    //Devolver un file
    return res.sendFile(path.resolve(filePath));
});
}

//Función COUNTERS to count following, followed and posts
const counters = async (req, res) => {
    let userId = req.user.id;

    if (req.params.id) {
        userId = req.params.id;
    }

    try {
        const following = await Follow.count({ "user": userId});

        const followed = await Follow.count({ "followed": userId });

        const publications = await Publication.count({ "user": userId });

        return res.status(200).send({
            userId,
            following: following,
            followed: followed,
            publications: publications
        });
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error en los contadores",
            error
        });
    }
}


//Exportar métodos del user.js que se encuentra dentro de Controllers
module.exports = {
    pruebaUser,
    register,
    login,
    profile,
    list,
    update,
    upload,
    avatar,
    counters
}