const express = require("express");
const router = express.Router(); // routing
const asynchandler = require("express-async-handler"); // asyncHandler
const { Products } = require("../models/Products.model"); // product model
const {
    Users,
    validateCreateUser,
    validateLogin,
    validateUpdateUserPassword,
    validateLoginUpdatePass,
    validateUpdateUser,
    validateCreateNewProduct,
    validateUpdateCartProduct,
} = require("../models/Users.model"); // user model
const bcrypt = require("bcryptjs"); // password hashing
const jwt = require("jsonwebtoken"); // json Web Token
const { userUpload } = require("../middlewears/multerUserUpload"); // user upload multer
const cloudinary = require("cloudinary"); // cloudinary config
const {
    verifyToken,
    verifyTokenAndAuthorization,
} = require("../middlewears/verifyToken"); // verify token

// products

/**
 * @desc get all products
 * @route /products
 * @method GET
 * @access public
 */
router.get(
    "/products",
    asynchandler(async (req, res) => {
        const productsList = await Products.find().sort();
        res.status(200).json(productsList);
    })
);

/**
 * @desc create a new product to user cart
 * @route /products
 * @method POST
 * @access private
 */
router.post(
    "/products",
    verifyToken,
    asynchandler(async (req, res) => {
        const { error } = validateCreateNewProduct(req.body);
        if (error) {
            res.status(400).json({ message: error });
        } else {
            const isUserHere = await Users.findById(req.user._id);
            if (isUserHere) {
                isUserHere.cart.push(req.body);
                isUserHere.save();
                res.status(201).json({
                    message: "Product added to cart successfully",
                    cart: isUserHere.cart,
                });
            } else {
                res.status(404).json({ message: "User not found" });
            }
        }
    })
);

/**
 * @desc update product in user cart
 * @route /products
 * @method PATCH
 * @access private
 */
router.patch(
    "/products",
    verifyToken,
    asynchandler(async (req, res) => {
        const { error } = validateUpdateCartProduct(req.body);
        if (error) {
            res.status(400).json({ message: error.message });
        } else {
            const isUserHere = await Users.findById(req.user._id);
            if (isUserHere) {
                // Find the product index instead of the product itself
                const productIndex = isUserHere.cart.findIndex(
                    (product) =>
                        product.productImage.url === req.body.productImage.url
                );
                if (productIndex !== -1) {
                    // Update the product count directly in the array
                    isUserHere.cart[productIndex].count = req.body.count;
                    // Mark the cart array as modified
                    isUserHere.markModified("cart");
                    // Save the user document
                    await isUserHere.save();
                    // Return the updated product
                    res.status(200).json({
                        message: "Product updated successfully",
                        product: isUserHere.cart[productIndex],
                    });
                } else {
                    res.status(404).json({ message: "Product not found" });
                }
            } else {
                res.status(404).json({ message: "User not found" });
            }
        }
    })
);

/**
 * @desc delete product in user cart
 * @route /cart
 * @method DELETE
 * @access private
 */
router.delete(
    "/cart",
    verifyToken,
    asynchandler(async (req, res) => {
        const isUserHere = await Users.findById(req.user._id);
        if (isUserHere) {
            const productIndex = isUserHere.cart.findIndex(
                (product) =>
                    product.productImage.url === req.body.productImage.url
            );
            if (productIndex > -1) {
                isUserHere.cart.splice(productIndex, 1);

                // Mark the cart array as modified
                isUserHere.markModified("cart");

                await isUserHere.save();
                res.status(200).json({
                    message: "Product deleted successfully",
                });
            } else {
                res.status(404).json({ message: "Product not found" });
            }
        } else {
            res.status(404).json({ message: "No user found" });
        }
    })
);

/**
 * @desc get cart data of logged user
 * @route /cart
 * @method GET
 * @access private
 */
router.get(
    "/cart",
    verifyToken,
    asynchandler(async (req, res) => {
        const isUserHere = await Users.findById(req.user._id);
        if (isUserHere) {
            res.status(200).json(isUserHere.cart);
        } else {
            res.status(404).json({ message: "No user found" });
        }
    })
);

// userSettings

/**
 * @desc get logged user data
 * @route /userSettings
 * @method GET
 * @access private
 */
router.get(
    "/userSettings",
    verifyToken,
    asynchandler(async (req, res) => {
        const isUserHere = await Users.findById(req.user._id);
        if (isUserHere) {
            res.status(200).json(isUserHere);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    })
);

/**
 * @desc update logged user data
 * @route /userSettings/:id
 * @method PATCH
 * @access private
 */
router.patch(
    "/userSettings/:id",
    userUpload.single("userAvatar"),
    verifyTokenAndAuthorization,
    asynchandler(async (req, res) => {
        const { error } = validateUpdateUser(req.body);
        if (error) {
            return res.status(400).json({ message: error.message });
        }

        // Create an object with only the fields that are present in the request
        const updatedUser = {};
        if (req.body.username) updatedUser.username = req.body.username;
        if (req.body.firstName) updatedUser.firstName = req.body.firstName;
        if (req.body.lastName) updatedUser.lastName = req.body.lastName;
        if (req.body.email) updatedUser.email = req.body.email;

        // Handle file upload if present
        if (req.file) {
            const userAvatarResult = await cloudinary.uploader.upload(
                req.file.path,
                {
                    folder: "users Avatar",
                }
            );
            updatedUser.userAvatar = {
                public_id: userAvatarResult.public_id,
                url: userAvatarResult.secure_url,
            };
        }

        // Check if user exists and update in one step
        const updated = await Users.findByIdAndUpdate(
            req.user._id,
            {
                $set: updatedUser,
            },
            { new: true }
        );

        if (updated) {
            res.status(200).json(updated);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    })
);

/**
 * @desc update logged user password
 * @route /userSettings/:id/password
 * @method PATCH
 * @access private
 */
router.patch(
    "/userSettingsCP/:id",
    verifyTokenAndAuthorization,
    asynchandler(async (req, res) => {
        const { error } = validateUpdateUserPassword(req.body);
        if (error) {
            return res.status(400).json({ message: error.message });
        }

        const isUserHere = await Users.findById(req.user._id);
        if (isUserHere) {
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);

            const updated = await Users.findByIdAndUpdate(
                req.user._id,
                {
                    $set: {
                        password: req.body.password,
                    },
                },
                { new: true }
            );

            res.status(200).json({
                message: "Password has been changed successfully",
            });
        } else {
            res.status(404).json({ message: "User not found!" });
        }
    })
);

/**
 * @desc delete user
 * @route /userSettings/:id
 * @method DELETE
 * @access private
 */
router.delete(
    "/userSettings/:id",
    verifyTokenAndAuthorization,
    asynchandler(async (req, res) => {
        const isUserHere = await Users.findById(req.user._id);
        if (isUserHere) {
            await Users.findByIdAndDelete(req.params.id);
            res.status(200).json({
                message: "User has been deleted",
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    })
);

// login

/**
 * @desc login user
 * @route /login
 * @method POST
 * @access public
 */
router.post(
    "/login",
    asynchandler(async (req, res) => {
        const { error } = validateLogin(req.body);
        if (error) {
            res.status(400).json({ message: error.message });
        } else {
            const isUserRegisterd = await Users.findOne({
                email: req.body.email,
            });
            if (!isUserRegisterd) {
                res.status(400).json({
                    message: "User is not registerd!",
                });
            } else {
                const isPasswordMatch = await bcrypt.compare(
                    req.body.password,
                    isUserRegisterd.password
                );
                if (!isPasswordMatch) {
                    res.status(400).json({ message: "Incorect user data!" });
                } else {
                    const { password, ...other } = isUserRegisterd._doc;
                    const token = jwt.sign(
                        { ...other },
                        process.env.TOKEN_SECRET_KEY,
                        { expiresIn: "30d" }
                    );
                    res.status(200).json({ ...other, token });
                }
            }
        }
    })
);

/**
 * @desc Reset Password
 * @route /login/resetPassword
 * @method PATCH
 * @access public
 */
router.patch(
    "/login/:id",
    asynchandler(async (req, res) => {
        res.status(200).json({
            message: "mainpage update forgot password user",
        });
    })
);

// register

/**
 * @desc register new user
 * @route /register
 * @method POST
 * @access public
 */
router.post(
    "/register",
    userUpload.single("userAvatar"),
    asynchandler(async (req, res) => {
        const { error } = validateCreateUser(req.body);
        if (error) {
            res.status(400).json({ message: error.message });
        } else {
            const isUserHere = await Users.findOne({ email: req.body.email });
            if (isUserHere) {
                res.status(400).json({
                    message: "User is already registerd!",
                });
            } else {
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);

                const newUser = new Users({
                    username: req.body.username,
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email,
                    password: req.body.password,
                });
                if (req.body.cart) {
                    newUser.cart = req.body.cart;
                } else {
                    newUser.cart = [];
                }
                if (req.file) {
                    const userAvatarResult = await cloudinary.uploader.upload(
                        req.file.path,
                        {
                            folder: "users Avatar",
                        }
                    );
                    newUser.userAvatar = {
                        public_id: userAvatarResult.public_id,
                        url: userAvatarResult.secure_url,
                    };
                }
                const newUserResult = await newUser.save();

                const { password, ...other } = newUserResult._doc;
                const token = jwt.sign(
                    { ...other },
                    process.env.TOKEN_SECRET_KEY,
                    {
                        expiresIn: "30d",
                    }
                );
                res.status(201).json({ ...other, token });
            }
        }
    })
);

module.exports = router;
