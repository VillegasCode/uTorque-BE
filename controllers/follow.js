const Follow = require("../models/follow");
const User = require("../models/user");

// Importar servicio
const followService = require("../services/followService");

// Importar dependencias
const mongoosePaginate = require("mongoose-paginate-v2");

// Acciones de prueba
const pruebaFollow = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde: controllers/follow.js"
    });
}

// Acción de guardar un follow (acción seguir)
const save = async (req, res) => {
    try {
        // Conseguir datos por body
        const params = req.body;

        // Validar parámetros
        if (!params.followed) {
            return res.status(400).send({
                status: "error",
                message: "El parámetro 'followed' es necesario"
            });
        }

        // Sacar id del usuario identificado
        const identity = req.user;

        // Crear objeto con modelo Follow
        let userToFollow = new Follow({
            user: identity.id,
            followed: params.followed
        });

        // Guardar objeto en base de datos
        const followStored = await userToFollow.save();
        return res.status(200).send({
            status: "success",
            message: "Follow guardado",
            identity: req.user,
            followed: followStored
        });
    }
    catch (error) {
        return res.status(400).send({
            status: "error",
            message: "No se ha podido seguir al usuario"
        });
    }
}


// Acción de borrar un follow (acción dejar de seguir)
const unfollow = async (req, res) => {
    try {
        // Recoger el id del usuario que sigo y quiero dejar de seguir
        const followedId = req.params.id;

        // Recoger el id del usuario identificado
        const userId = req.user.id;

        const result = await Follow.findOneAndDelete({ user: userId, followed: followedId });

        // Find de las coincidencias y hacer deleteOne
        if (!result) {
            return res.status(500).send({
                userId: userId,
                followedId: followedId,
                status: "error",
                message: "No has dejado de seguir a nadie",
                result
            });
        }

        return res.status(200).send({
            status: "success",
            message: "Follow eliminado correctamente",
            followed: followedId
        });
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error al eliminar el followed"
        });
    }
};

// Acción listado de usuarios que cualquier usuario está siguiendo (siguiendo)
const following = (req, res) => {
    // Sacar el id del usuario identificado
    let userId = req.user.id;

    // Comprobar si me llega el id por parámetro en url
    if (req.params.id) userId = req.params.id;

    // Comprobar si me llega la página, si no la página 1
    let page = req.params.page || 1;

    // Usuarios por página quiero mostrar
    const itemsPerPage = 5;

    // Find a follow, popular datos de los usuario y paginar con mongoose paginate
    Follow.paginate(
        { user: userId },
        {
            populate: { path: "user followed", select: "-password -role -__v -email" },
            page: page,
            limit: itemsPerPage
        },
        async (error, result) => {
            if (error) {
                return res.status(500).send({
                    status: "error",
                    message: "Error en la consulta de follows"
                });
            }

            // Sacar un array de ids de los usuarios que me siguen y los que sigo
            let followUserIds = await followService.followUserIds(req.user.id);

            return res.status(200).send({
                status: "success",
                message: "Listado de usuarios que estoy siguiendo",
                follows: result.docs,
                total: result.totalDocs,
                pages: result.totalPages,
                user_following: followUserIds.following,
                user_follow_me: followUserIds.followers
            });
        }
    );
}

// Acción listado de usuarios que siguen a cualquier otro usuario (soy seguido, mis seguidores)
const followers = (req, res) => {
    // Sacar el id del usuario identificado
    let userId = req.user.id;

    // Comprobar si me llega el id por parámetro en url
    if (req.params.id) userId = req.params.id;

    // Comprobar si me llega la página, si no la página 1
    let page = req.params.page || 1;

    // Usuarios por página quiero mostrar
    const itemsPerPage = 5;

    Follow.paginate(
        { followed: userId },
        {
            populate: { path: "user", select: "-password -role -__v -email" },
            page: page,
            limit: itemsPerPage
        },
        async (error, result) => {
            if (error) {
                return res.status(500).send({
                    status: "error",
                    message: "Error en la consulta de followers"
                });
            }

            let followUserIds = await followService.followUserIds(req.user.id);

            return res.status(200).send({
                status: "success",
                message: "Listado de usuarios que me siguen",
                follows: result.docs,
                total: result.totalDocs,
                pages: result.totalPages,
                user_following: followUserIds.following,
                user_follow_me: followUserIds.followers
            });
        }
    );
}

// Exportar acciones
module.exports = {
    pruebaFollow,
    save,
    unfollow,
    following,
    followers
}