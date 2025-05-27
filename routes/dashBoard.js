const express = require("express")
const router = express.Router() // routing
const asynchandler = require("express-async-handler") // asyncHandler
const {
    Users,
    validateCreateUser,
    validateUpdateUser,
} = require("../models/Users.model") // user model
const {
    Products,
    validateCreateProduct,
    validateUpdateProduct,
} = require("../models/Products.model") // product model
const { porductUpload } = require("../middlewears/multerProductUpload") // product upload multer
const { userUpload } = require("../middlewears/multerUserUpload") // user upload multer
const cloudinary = require("../config/cloudnary") // cloudinary config
const {
    verifyToken,
    verifyTokenAndAuthorization,
    verifyTokenAndAdmin,
} = require("../middlewears/verifyToken") // verify token
const bcrypt = require("bcryptjs") // password hashing
const jwt = require("jsonwebtoken") // json Web Token

// admin users

/**
 * @desc get all admin users
 * @route /dashBoard/admin
 * @method GET
 * @access private
 */
router.get(
    "/admin",
    verifyTokenAndAdmin,
    asynchandler(async (req, res) => {
        const adminUserList = await (
            await Users.find().select(["-password"])
        ).filter((au) => au.admin === true)
        res.status(200).json(adminUserList)
    })
)

/**
 * @desc post new admin user
 * @route /dashBoard/admin
 * @method POST
 * @access private
 */
router.post(
    "/admin",
    verifyTokenAndAdmin,
    userUpload.single("userAvatar"),
    asynchandler(async (req, res) => {
        const { error } = validateCreateUser(req.body)
        if (error) {
            res.status(400).json({ message: error.message })
        } else {
            const isUserHere = await Users.findOne({ email: req.body.email })
            if (isUserHere) {
                res.status(400).json({ message: "Account is already exsist!" })
            } else {
                const salt = await bcrypt.genSalt(10)
                req.body.password = await bcrypt.hash(req.body.password, salt)

                const newUser = new Users({
                    username: req.body.username,
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email,
                    password: req.body.password,
                    admin: req.body.admin,
                })
                if (req.file) {
                    const userAvatarResult = await cloudinary.uploader.upload(
                        req.file.path,
                        {
                            folder: "users Avatar",
                        }
                    )
                    newUser.userAvatar = {
                        public_id: userAvatarResult.public_id,
                        url: userAvatarResult.secure_url,
                    }
                }
                const newUserResult = await newUser.save()
                const { password, ...other } = newUserResult._doc
                const token = jwt.sign(
                    { ...other },
                    process.env.TOKEN_SECRET_KEY,
                    {
                        expiresIn: "30d",
                    }
                )
                res.status(201).json({ ...other, token })
            }
        }
    })
)

/**
 * @desc patch admin user (admin/ not admin)
 * @route /dashBoard/admin/:id
 * @method PATCH
 * @access private
 */
router.patch(
    "/admin/:id",
    verifyTokenAndAdmin,
    asynchandler(async (req, res) => {
        const isUserHere = await Users.findById(req.params.id)
        if (isUserHere) {
            const { error } = validateUpdateUser(req.body)
            if (error) {
                res.status(400).json({ message: error.message })
            } else {
                if (req.body.admin === true || req.body.admin === false) {
                    const updatedAdmin = await Users.findByIdAndUpdate(
                        req.params.id,
                        {
                            $set: {
                                admin: req.body.admin,
                            },
                        },
                        { new: true }
                    )
                    res.status(200).json(updatedAdmin)
                } else {
                    res.status(400).json({ message: "error" })
                }
            }
        } else {
            res.status(404).json({ message: "User Not Found" })
        }
    })
)

/**
 * @desc delete admin user
 * @route /dashBoard/admin/:id
 * @method DELETE
 * @access private
 */
router.delete(
    "/admin/:id",
    verifyTokenAndAdmin,
    asynchandler(async (req, res) => {
        const isUserHere = await Users.findById(req.params.id)
        if (isUserHere) {
            await Users.findByIdAndDelete(isUserHere._id)
            res.status(200).json({
                message: "User has been deleted successfully",
            })
        } else {
            res.status(404).json({ message: "User Not Found" })
        }
    })
)

// users

/**
 * @desc Get users
 * @route /dashBoard/users
 * @method GET
 * @access private
 */
router.get(
    "/users",
    verifyTokenAndAdmin,
    asynchandler(async (req, res) => {
        const usersList = await Users.find()
        res.status(200).json(usersList)
    })
)

/**
 * @desc delete user
 * @route /dashBoard/users/:id
 * @method DELETE
 * @access private
 */
router.delete(
    "/users/:id",
    verifyTokenAndAdmin,
    asynchandler(async (req, res) => {
        const isUserHere = await Users.findById(req.params.id)
        if (isUserHere) {
            await Users.findByIdAndDelete(isUserHere._id)
            res.status(200).json({
                message: "User has been deleted successfully",
            })
        } else {
            res.status(404).json({ message: "User Not Found" })
        }
    })
)

// My Account

// router.patch()

// router.delete()

// products

/**
 * @desc get Products
 * @route /dashBoard/products
 * @method GET
 * @access private
 */
router.get(
    "/products",
    verifyTokenAndAdmin,
    asynchandler(async (req, res) => {
        const productsList = await Products.find().sort()
        res.status(200).json(productsList)
    })
)

/**
 * @desc post new Product
 * @route /dashBoard/products
 * @method POST
 * @access private
 */
router.post(
    "/products",
    verifyTokenAndAdmin,
    porductUpload.single("productImage"),
    asynchandler(async (req, res) => {
        const { error } = validateCreateProduct(req.body)
        if (error) {
            res.status(400).json({ message: error.message })
        } else {
            const newProduct = new Products({
                name: req.body.name,
                category: req.body.category,
                price: req.body.price,
                count: req.body.count,
            })
            if (req.file) {
                const productAvatarResult = await cloudinary.uploader.upload(
                    req.file.path,
                    {
                        folder: "Product images",
                    }
                )
                newProduct.productImage = {
                    public_id: productAvatarResult.public_id,
                    url: productAvatarResult.secure_url,
                }
            }
            const newProductResult = await newProduct.save()
            res.status(201).json(newProductResult)
        }
    })
)

/**
 * @desc patch product
 * @route /dashBoard/products/:id
 * @method PATCH
 * @access private
 */
router.patch(
    "/products/:id",
    verifyTokenAndAdmin,
    porductUpload.single("productImage"),
    asynchandler(async (req, res) => {
        const isProductHere = await Products.findById(req.params.id)
        if (isProductHere) {
            const { error } = validateUpdateProduct(req.body)
            if (error) {
                res.status(400).json({ message: error.message })
            } else {
                let updatedProductImage
                if (req.file) {
                    const productAvatarResult =
                        await cloudinary.uploader.upload(req.file.path, {
                            folder: "Product images",
                        })
                    updatedProductImage = {
                        public_id: productAvatarResult.public_id,
                        url: productAvatarResult.secure_url,
                    }
                }
                let updatedProduct = await Products.findByIdAndUpdate(
                    req.params.id,
                    {
                        $set: {
                            name: req.body.name,
                            category: req.body.category,
                            price: req.body.price,
                            count: req.body.count,
                            productImage: updatedProductImage,
                        },
                    },
                    { new: true }
                )
                res.status(200).json(updatedProduct)
            }
        } else {
            res.status(404).json({ message: "Product Not Found" })
        }
    })
)

/**
 * @desc delete product
 * @route /dashBoard/products/:id
 * @method DELETE
 * @access private
 */
router.delete(
    "/products/:id",
    verifyTokenAndAdmin,
    asynchandler(async (req, res) => {
        const isProductsHere = await Products.findById(req.params.id)
        if (isProductsHere) {
            await Products.findByIdAndDelete(isProductsHere._id)
            res.status(200).json({
                message: "Product has been deleted successfully",
            })
        } else {
            res.status(404).json({ message: "Product Not Found" })
        }
    })
)

module.exports = router
