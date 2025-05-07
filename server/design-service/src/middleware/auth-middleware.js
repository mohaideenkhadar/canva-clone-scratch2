
const authenticatedRequest = (req, res, next) => {
    const userId = req.handlers['x-user-id'];    //Error will be clear handlers to headers

    if (!userId) {
        return res.status(401).json({
            error: "Access denied! Please login to continue",
        });
    }

    req.user = { userId };
    next();
};

export default authenticatedRequest;