const jwt = require("jsonwebtoken");
const User = require("../models/Auth/userModel");
const authConfig = require("../configs/auth.config");

const verifyToken = (req, res, next) => {
    const token = req.get("Authorization")?.split("Bearer ")[1] || req.headers["x-access-token"];
    if (!token) {
        return res.status(403).send({
            message: "Please Login to Continue.",
        });
    }

    jwt.verify(token, authConfig.secret, async (err, decoded) => {
        if (err) {
            console.log(err);
            return res.status(401).send({ message: "Please Login to Continue.", });
        }
        const user = await User.findOne({ _id: decoded.id });
        const user1 = await User.findOne({ _id: decoded.id });
        if (!user && !user1) {
            return res.status(400).send({ message: "Please Login to Continue." });
        }
        req.user = user || user1;
        next();
    });
};
const isAdmin = (req, res, next) => {
    const token =
        req.headers["x-access-token"] ||
        req.get("Authorization")?.split("Bearer ")[1];

    if (!token) {
        return res.status(403).send({
            message: "Please Login to Continue.",
        });
    }

    jwt.verify(token, authConfig.secret, async (err, decoded) => {
        if (err) {
            return res.status(401).send({
                message: "Please Login to Continue. ",
            });
        }

        const user = await AdminModel.findOne({ email: decoded.id });

        if (!user) {
            return res.status(400).send({
                message: "Please Login to Continue.",
            });
        }
        req.user = user;

        next();
    });
};

module.exports = {
    verifyToken,
    isAdmin,
};
