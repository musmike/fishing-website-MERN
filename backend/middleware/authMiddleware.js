const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
    let token = req.headers["x-access-token"];
    if (!token && req.headers["authorization"]) {
        const authHeader = req.headers["authorization"];
        if (authHeader.startsWith("Bearer ")) {
            token = authHeader.slice(7);
        } else {
            token = authHeader;
        }
    }

    if (typeof token === 'string' && token.startsWith("Bearer ")) {
        token = token.slice(7).trim();
    }

    if (!token) {
        return res.status(403).send({ message: "Nie dostarczono tokena!" });
    }

    jwt.verify(token, process.env.JWTPRIVATEKEY, (err, decodeduser) => {
        if (err) {
            console.log("Token niepoprawny, brak autoryzacji!");
            return res.status(401).send({ message: "Token niepoprawny, brak autoryzacji!" });
        }

        console.log("Token poprawny, użytkownik:" + decodeduser._id);
        req.user = decodeduser;
        next();
    });
};

module.exports = { authenticateToken };
