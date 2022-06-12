

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');

const db = require('../lib/db.js');
const userMiddleware = require("../middleware/users.js")



//SIGN-UP
router.post("/sign-up",userMiddleware.validateRegister,(req,res,next)=>{
    db.query(`SELECT * FROM usuarios WHERE LOWER(usuario) = LOWER(${db.escape(req.body.usuario)})`,
    (err,result)=>{
        if(result && result.length){
            //error
            return res.status(409).send({
                message: 'Este usario ya está en uso!',
            });
        }else{ 
            //username not in use
            bcrypt.hash(req.body.password, 10, (err, hash)=>{
                if(err){
                    throw err;
                    return res.status(500).send({
                        message: err,
                    });
                }else{
                    db.query(
                        `INSERT INTO usuarios (id,usuario,password,registered) VALUES('${uuid.v4()}', ${db.escape(
                        req.body.usuario
                        )}, '${hash}', now());`,
                        (err, result) => {
                            if(err){
                                throw err;
                                return res.status(400).send({
                                    message: err,
                                });
                            }
                            return res.status(201).send({
                                message: 'Registro Exitoso!',
                            });
                        }   
                    );
                }
            });
        }
    });

});
//LOGIN
router.post("/login",(req, res, next) => {
    db.query(
    `SELECT * FROM usuarios WHERE usuario = ${db.escape(req.body.username)};`,
    (err, result) => {
      // user does not exists
    if (err) {
        throw err;
        return res.status(400).send({
        msg: err,
        });
    }
    if (!result.length) {
        return res.status(401).send({
        mswg: "Usuario o contraseña incorrectos",
        });
    }
      // check password
    bcrypt.compare(
        req.body.password,
        result[0]["password"],
        (bErr, bResult) => {
          // wrong password
        if (bErr) {
            throw bErr;
            return res.status(401).send({
            msg: "Username or password is incorrect!",
            });
        }
        if (bResult) {
            const token = jwt.sign(
            {
                username: result[0].usuario,
                userId: result[0].id,
            },
            "SECRETKEY",
            {
                expiresIn: "7d",
            }
            );
            db.query(
            `UPDATE usuarios SET lastlogin = now() WHERE id = '${result[0].id}'`
            );
            return res.status(200).send({
            msg: "Logged in!",
            token,
            usuario: result[0],
            });
        }
        return res.status(401).send({
            msg: "Username or password is incorrect!",
        });
        }
    );
    }
);
});
//SECRET-ROUTE
router.get ("/secret-route",userMiddleware.isLoggedIn,(req,res,next)=>{
    console.log(req.userData);
    res.send("Este es el contenido secreto")
});

module.exports = router;