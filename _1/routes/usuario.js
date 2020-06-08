const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')
const verificar = require('../models/Validacao_Cadastro')
const bcrypt = require('bcryptjs')
const passport = require('passport')


/*Rota registro usuarios*/
router.get('/registro',(req,res)=>{
    res.render('usuarios/registro.handlebars')
})

router.post('/registro',(req,res)=>{
    
    let erros = verificar(req.body)

    if(erros.length > 0){
        res.render('usuarios/registro.handlebars',{erros: erros})
    }else{
        Usuario.findOne({email:req.body.email}).lean().then((usuario)=>{
            
            if(usuario){
                req.flash("error_msg","Já existe uma conta com esse e-mail no nosso sistema!")
                res.redirect('/usuarios/registro')
            }else{
                const novoUsuario = new Usuario ({
                    
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                
                    /*Para criar um administrador tire os comentarios, e crie uma conta
                    eAdmin: 1 */
                    
                })
                
                //Encriptar a senha
                bcrypt.genSalt(10,(erro, salt)=>{
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash)=>{
                        
                        if(erro){
                            req.flash("error_msg","Houve um erro durante o salvamento do usuário.")
                            res.redirect('/')
                            console.log(erro)
                        }

                        novoUsuario.senha = hash

                        novoUsuario.save().then(()=>{
                            req.flash("success_msg","Usuário criado com sucesso.")
                            res.redirect('/')
                        }).catch((err)=>{
                            req.flash("error_msg","Houve um erro ao criar o usuário, tente novamente!"+err)
                            res.redirect('/usuarios/registro')
                            console.log(err)

                        })
                    
                    })
                })

            }

        }).catch((err)=>{
            req.flash("error_msg","Houve um erro interno."+err)
            res.redirect('/')
            console.log(err)
        })
    }
})

/*Rota de login do usuario*/
router.get('/login',(req,res)=>{
    res.render('usuarios/login.handlebars')
})

router.post('/login',(req,res,next)=>{
    passport.authenticate('local',{
        successRedirect: '/',
        failureRedirect: '/usuarios/login',
        failureFlash: true
    })(req,res,next)
})

/*Rota de Logout de usuario*/
router.get('/logout',(req,res)=>{
    req.logOut()
    req.flash("success_msg","Deslogado com sucesso!")
    res.redirect('/')
})

module.exports = router