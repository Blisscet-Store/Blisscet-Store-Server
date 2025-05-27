const jwt = require("jsonwebtoken");
require("dotenv").config();

// check if the token is valid or not
let verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    // const token = req.headers.token;
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        try {
            const decoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
            req.user = decoded;
            next();
        } catch (error) {
            res.status(401).json({ message: "Invalid token!" });
        }
    } else {
        res.status(401).json({ message: "No token provided!" });
    }
};

// user can update/delete their own data but only admin can create new users and delete any user
let verifyTokenAndAuthorization = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user._id === req.params.id || req.user.admin) {
            next();
        } else {
            return res
                .status(403)
                .json({ message: "You are not allowed to do that!" });
        }
    });
};

// only admin can access/update/delete data from this route
let verifyTokenAndAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.admin) {
            next();
        } else {
            return res
                .status(403)
                .json({ message: "Only admins are allowed!" });
        }
    });
};

module.exports = {
    verifyToken,
    verifyTokenAndAuthorization,
    verifyTokenAndAdmin,
};
