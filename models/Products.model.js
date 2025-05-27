const mongoose = require("mongoose")
const joi = require("joi")

// mongodb validation with schema
const productsSchema = new mongoose.Schema({
    productImage: {
        public_id: { type: String },
        url: {
            type: String,
        },
    },
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    count: { type: Number, default: 1 },
})

const Products = mongoose.model("Products", productsSchema)

// express validation with joi
let validateCreateProduct = (bodyData) => {
    const schema = joi.object({
        productImage: joi.string().empty(""),
        name: joi.string().required(),
        category: joi.string().required(),
        price: joi.number().required(),
        count: joi.number(),
    })

    return schema.validate(bodyData)
}

let validateUpdateProduct = (bodyData) => {
    const schema = joi.object({
        productImage: joi.string(),
        name: joi.string(),
        category: joi.string(),
        price: joi.number(),
        count: joi.number(),
    })

    return schema.validate(bodyData)
}

module.exports = {
    Products,
    validateCreateProduct,
    validateUpdateProduct,
}
