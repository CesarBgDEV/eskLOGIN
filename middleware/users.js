const jwt = require('jsonwebtoken');

module.exports = {
    validateRegister: (req,res,next) => {
        //usuario min length 3
        if(!req.body.usuario || req.body.usuario.length< 3){
            return res.status(400).send({
                message: "Por favor, ingrese un usuario con minimo 3 caracteres",
            });
        }
        //pass min 6 chars
        if(!req.body.password || req.body.password.length < 6){
            return res.status(400).send({
                message: "Por favor, ingrese una constraseña con minimo 6 caracteres",
            });
        }
        //pass (repeat) must match
        if(!req.body.password_repeat || req.body.password != req.body.password_repeat){
            return res.status(400).send({
                message: "Las contraseñas no coinciden",
            });
        }
        next();
    },
    isLoggedIn: (req, res, next)=> {
        if(!req.headers.authorization){
            return res.status(400).send({
                message: "La sesión no es válida!",
            });
        }
        try{
            const authHeader = req.headers.authorization;
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, 'SECRETKEY');
            req.userData = decoded;
            next();
        }catch(err) {
            throw err;
            return res.status(400).send({
                message: "La sesión no es válida!",
            });
        }
    },
};