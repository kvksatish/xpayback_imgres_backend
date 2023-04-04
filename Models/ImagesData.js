const mongoose = require("mongoose")

const ImagesSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    imgslinks: {
        type: Array,
        required: true
    }
})
const ImagesModel = mongoose.model("imglinks", ImagesSchema)


module.exports = { ImagesModel }