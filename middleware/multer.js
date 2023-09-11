const multer = require("multer");
const path = require("path");


const fileStorageEngine = multer.diskStorage({

    destination: (req, file, cb) => {

        let ext = path.extname(file.originalname);
        if (ext !== ".png" && ext !== ".jpg" && ext !== ".gif" && ext !== ".jpeg") {
            return cb(new Error("Images Only Allowed"));
        }
        cb(null, path.join(__dirname, "../public/productImages"));
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + "--" + file.originalname);
    },

});

const upload = multer({ storage: fileStorageEngine });

module.exports = {
  upload

};