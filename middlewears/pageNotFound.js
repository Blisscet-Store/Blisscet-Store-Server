const pageNotFound = (req, res, next) => {
    const err = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(err);
};

module.exports = pageNotFound;
