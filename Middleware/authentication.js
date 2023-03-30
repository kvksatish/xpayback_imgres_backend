
var jwt = require('jsonwebtoken');
const authentication = (req, res, next) => {
    if (!req.headers.authorization) {
        console.log(req.headers.authorization)
        return res.send("plz login again")
    }
    const token = req.headers.authorization.split(" ")[1]
    jwt.verify(token, 'secret', function (err, decoded) {
        if (err) {
            res.send("Please login")
        } else {
            req.body["usn"] = decoded.email
            next()


        }
    });
}
module.exports = authentication