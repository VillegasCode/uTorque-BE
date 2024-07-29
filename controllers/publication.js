// Importar módulos
const fs = require("fs");
const path = require("path");

// Importar modelos
const Publication = require("../models/publication");

// Importar servicios
const followService = require("../services/followService");

// Acciones de prueba
const pruebaPublication = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde: controllers/publication.js"
    });
};

// Guardar publicación
const save = async (req, res) => {
    try {
        const params = req.body;
        if (!params.text) {
            return res.status(400).send({ status: "error", message: "Debes enviar el texto de la publicación." });
        }

        const newPublication = new Publication({
            ...params,
            user: req.user.id,
        });

        const publicationStored = await newPublication.save();
        return res.status(200).send({
            status: "success",
            message: "Publicación guardada",
            publicationStored
        });
    } catch (error) {
        return res.status(400).send({ status: "error", message: "No se ha guardado la publicación." });
    }
};

// Sacar una publicación
const detail = async (req, res) => {
    try {
        const publicationId = req.params.id;
        const publicationStored = await Publication.findById(publicationId);

        if (!publicationStored) {
            return res.status(404).send({
                status: "error",
                message: "No existe la publicación"
            });
        }

        return res.status(200).send({
            status: "success",
            message: "Mostrar publicación",
            publication: publicationStored
        });
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error al obtener la publicación"
        });
    }
};

// Eliminar publicaciones
const remove = async (req, res) => {
    try {
        const publicationId = req.params.id;
        const result = await Publication.findOneAndDelete({ user: req.user.id, _id: publicationId });

        if (!result) {
            return res.status(500).send({
                status: "error",
                message: "No se ha eliminado la publicación"
            });
        }

        return res.status(200).send({
            result,
            status: "success",
            message: "Eliminar publicación",
            publication: publicationId
        });
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error al eliminar la publicación"
        });
    }
};

// Listar publicaciones de un usuario
const user = async (req, res) => {
    try {
        const userId = req.params.id;
        let page = req.params.page || 1;
        const itemsPerPage = 5;

        const publications = await Publication.find({ user: userId })
            .sort("-created_at")
            .populate('user', '-password -__v -role -email')
            .skip((page - 1) * itemsPerPage)
            .limit(itemsPerPage);

        const total = await Publication.countDocuments({ user: userId });

        if (!publications.length) {
            return res.status(404).send({
                status: "error",
                message: "No hay publicaciones para mostrar"
            });
        }

        return res.status(200).send({
            status: "success",
            message: "Publicaciones del perfil de un usuario",
            page,
            total,
            pages: Math.ceil(total / itemsPerPage),
            publications
        });
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error al obtener las publicaciones"
        });
    }
};

// Subir ficheros
const upload = async (req, res) => {
    try {
        const publicationId = req.params.id;
        if (!req.file) {
            return res.status(404).send({
                status: "error",
                message: "Petición no incluye la imagen"
            });
        }

        const image = req.file.originalname;
        const extension = image.split(".").pop();

        if (!["png", "jpg", "jpeg", "gif", "PNG", "JPG", "GIF", "JPEG"].includes(extension)) {
            fs.unlinkSync(req.file.path);
            return res.status(400).send({
                status: "error",
                message: "Extensión del fichero inválida"
            });
        }

        const publicationUpdated = await Publication.findOneAndUpdate(
            { user: req.user.id, _id: publicationId },
            { file: req.file.filename },
            { new: true }
        );

        if (!publicationUpdated) {
            return res.status(500).send({
                status: "error",
                message: "Error en la subida del avatar"
            });
        }

        return res.status(200).send({
            status: "success",
            publication: publicationUpdated,
            file: req.file
        });
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error al subir el archivo"
        });
    }
};

// Devolver archivos multimedia imágenes
const media = (req, res) => {
    const file = req.params.file;
    const filePath = path.resolve(`./uploads/publications/${file}`);

    fs.stat(filePath, (error, stats) => {
        if (error || !stats.isFile()) {
            return res.status(404).send({
                status: "error",
                message: "No existe la imagen"
            });
        }

        return res.sendFile(filePath);
    });
};

// Listar todas las publicaciones (FEED)
const feed = async (req, res) => {
    try {
        let page = req.params.page || 1;
        const itemsPerPage = 5;

        const myFollows = await followService.followUserIds(req.user.id);
        const publications = await Publication.find({ user: { $in: myFollows.following } })
            .populate("user", "-password -role -__v -email")
            .sort("-created_at")
            .skip((page - 1) * itemsPerPage)
            .limit(itemsPerPage);

        const total = await Publication.countDocuments({ user: { $in: myFollows.following } });

        return res.status(200).send({
            status: "success",
            message: "Feed de publicaciones",
            following: myFollows.following,
            total,
            page,
            pages: Math.ceil(total / itemsPerPage),
            publications
        });
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error al obtener el feed de publicaciones"
        });
    }
};

// Exportar acciones
module.exports = {
    pruebaPublication,
    save,
    detail,
    remove,
    user,
    upload,
    media,
    feed
};