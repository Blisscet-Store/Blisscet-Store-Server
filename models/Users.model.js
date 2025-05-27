const mongoose = require("mongoose");
const joi = require("joi");

const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, trim: true, unique: true },
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, unique: true },
        password: { type: String, required: true, trim: true },
        userAvatar: {
            public_id: { type: String, default: "default_avatar_id" },
            url: {
                type: String,
                default:
                    "https://res.cloudinary.com/dnqyfwhbk/image/upload/v1747068681/default-user-avatar_qezhg0.svg",
            },
        },
        admin: { type: Boolean, default: false },
        cart: { type: Array, default: [] },
    },
    { timestamps: true }
);

const Users = mongoose.model("Users", userSchema);

// express validation with joi
let validateCreateUser = (bodyData) => {
    const schema = joi.object({
        username: joi.string().alphanum().required(),
        firstName: joi.string().trim().min(2).lowercase().required(),
        lastName: joi.string().trim().min(2).lowercase().required(),
        email: joi.string().email().trim().lowercase().required(),
        password: joi
            .string()
            .min(8)
            .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
            .required(),
        admin: joi.boolean().default(false),
        userAvatar: joi.string().empty(""),
    });

    return schema.validate(bodyData);
};

let validateUpdateUser = (bodyData) => {
    const schema = joi.object({
        _id: joi.string().optional(),
        username: joi.string().alphanum().allow("").optional(),
        firstName: joi.string().trim().min(2).lowercase().allow("").optional(),
        lastName: joi.string().trim().min(2).lowercase().allow("").optional(),
        email: joi.string().email().lowercase().allow("").trim().optional(),
        userAvatar: joi.string().optional(),
    });

    return schema.validate(bodyData);
};

let validateUpdateUserPassword = (bodyData) => {
    const schema = joi.object({
        _id: joi.string().optional(),
        password: joi
            .string()
            .min(8)
            .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
    });

    return schema.validate(bodyData);
};

let validateLogin = (bodyData) => {
    const schema = joi.object({
        email: joi.string().email().trim().lowercase().required(),
        password: joi
            .string()
            .min(8)
            .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
            .required(),
    });

    return schema.validate(bodyData);
};

let validateLoginUpdatePass = (bodyData) => {
    const schema = joi.object({
        email: joi.string().email().trim().lowercase(),
        password: joi
            .string()
            .min(8)
            .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
    });

    return schema.validate(bodyData);
};

let validateCreateNewProduct = (bodyData) => {
    const schema = joi.object({
        productImage: { public_id: joi.string(), url: joi.string() },
        name: joi.string(),
        category: joi.string(),
        price: joi.number(),
        count: joi.number().integer().positive(),
    });

    return schema.validate(bodyData);
};

let validateUpdateCartProduct = (bodyData) => {
    const schema = joi.object({
        name: joi.string().optional(),
        category: joi.string().optional(),
        price: joi.number().optional(),
        productImage: { public_id: joi.string(), url: joi.string() },
        count: joi.number().integer().positive(),
    });

    return schema.validate(bodyData);
};

module.exports = {
    Users,
    validateCreateUser,
    validateUpdateUser,
    validateUpdateUserPassword,
    validateLogin,
    validateLoginUpdatePass,
    validateCreateNewProduct,
    validateUpdateCartProduct,
};
