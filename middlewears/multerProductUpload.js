const path = require("path")
const multer = require("multer")

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/productImages"),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        cb(null, `${Date.now()}${ext}`)
    },
})

let porductUpload = multer({
    storage: storage,
    fileFilter: (req, file, callback) => {
        if (
            file.mimetype == "image/png" ||
            file.mimetype == "image/jpeg" ||
            file.mimetype == "image/svg+xml"
        ) {
            callback(null, true)
        } else {
            callback(new Error("Only jpg, png, svg files are supported"), false)
        }
    },

    limits: {
        fileSize: 1024 * 1024 * 16,
    },
})

module.exports = {
    porductUpload,
}
