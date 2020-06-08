const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Categoria')
const categoria = mongoose.model('categorias')
const verificar = require('../models/Validacao')
require('../models/Postagem')
const post = mongoose.model('postagens')
const {eAdmin} = require('../helpers/eAdmin')

/*Rota principal*/
router.get('/', eAdmin, function (req,res) {
    res.render("admin/index.handlebars")
})


/*Rota listar postagens*/
router.get('/postagens', eAdmin, function (req,res) {

    post.find().lean().populate("categoria").sort({data: "DESC"}).then((postagens)=>{
        res.render('admin/postagens.handlebars',{postagens: postagens})
    }).catch((err)=>{
        req.flash("error_msg","Erro ao listar as postagens."+err)
        res.redirect('/admin')
    })
    
})

/*Rota adicionar postagem*/
router.get('/postagens/adicionar', eAdmin, function(req,res) {
    categoria.find().lean().then((categorias)=>{
        res.render('admin/adicionarpostagens.handlebars',{categorias:categorias})  
    }).catch((err)=>{
        req.flash("error_msg","Houve um erro ao carregar o formulário.")
        res.redirect('/admin')
    })
   
})

router.post('/postagens/nova', eAdmin, function (req,res) {
    let erros = []

    if(req.body.categoria == "0"){
        erros.push({texto:"Categoria inválida, registre uma categoria."})
    }

    if(erros.length > 0){
        res.render('admin/adicionarpostagens.handlebars',{erros: erros})
    }
    else{
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            conteudo: req.body.conteudo,
            descricao: req.body.descricao,
            categoria: req.body.categoria

        }

        new post(novaPostagem).save().then(()=>{
            req.flash("success_msg","Postagem criada com sucesso!")
            res.redirect('/admin/postagens')
        }).catch((err)=>{
            req.flash("error_msg","Houve um erro ao salvar a postagem: ")
            res.redirect('/admin/postagens')
        })
    }
})

/*Rota editar postagens*/
router.get('/postagens/editar/:id', eAdmin, function (req,res) {

    post.findById({_id:req.params.id}).lean().populate().then((postagem)=>{
        
        categoria.find().lean().then((categorias)=>{

            res.render('admin/editarpostagens.handlebars',{categorias: categorias, postagem: postagem})

        }).catch((err)=>{
            req.flash("error_msg","Erro ao listar as categorias.")
            res.redirect('/admin/postagens')
        })

    }).catch((err)=>{
        req.flash("error_msg","Erro ao carregar o formulário de postagens."+err)
        res.redirect('/admin/postagens')
    })

})

router.post('/postagens/editar', eAdmin, function (req,res) {
    
        post.findByIdAndUpdate({_id:req.body.id}).then((postagem)=>{
            
            postagem.titulo = req.body.titulo
            postagem.slug = req.body.slug
            postagem.descricao = req.body.descricao
            postagem.conteudo = req.body.conteudo
            postagem.categoria = req.body.categoria
            postagem.data = new Date()

            postagem.save().then(()=>{
                req.flash("success_msg","Postagem atualizada com sucesso!")
                res.redirect('/admin/postagens')
            }).catch((err)=>{
                console.log(err)
                req,flash("error_msg","Erro ao salvar a postagem, tente novamente" +err)
                res.redirect('/admin/postagens')
            })

        }).catch((err)=>{
            console.log(err)
            req.flash("error_msg","Houve um erro ao salvar a edição."+err)
            res.redirect('/admin/postagens')
        })

})

/*Rota deletar postagem*/
router.get('/postagens/deletar/:id', eAdmin, function (req,res) {
    post.findOneAndRemove({_id:req.params.id}).then(()=>{
        req.flash("success_msg","Postagem deletada com sucesso.")
        res.redirect('/admin/postagens')
    }).catch((err)=>{
        req.flash("error_msg","Erro ao deletar a postagem."+err)
        res.redirect('/admin/postagens')
    })
})


/*Rota adicionar categoria*/
router.get('/categorias/adicionar',eAdmin, function (req,res) {
    res.render('admin/adicionarcategorias.handlebars')
})

router.post('/categorias/nova', eAdmin, function (req,res) {
    /*Condições de erros*/
   let erros = verificar(req.body)

    if(erros.length > 0){
        res.render("admin/adicionarcategorias.handlebars",{erros: erros})
    }else{
        const novacategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
        new categoria(novacategoria).save().then(()=>{
            req.flash('success_msg',"Categoria criada com sucesso!")
            res.redirect('/admin/categorias')
        }).catch((err)=>{
            req.flash('error_msg',"Houve um erro ao registrar essa categoria, tente novamente!")
            res.redirect('/admin')
        })    
    }
    
})

/*Rota listar categorias*/
router.get('/categorias', eAdmin, function (req,res) {
    categoria.find().lean().sort({date: 'DESC'}).then((categorias)=>{
        res.render('admin/categorias.handlebars',{categorias: categorias})
    }).catch((err)=>{
        req.flash("error_msg","Houve um erro ao listar as categorias: "+err)
        res.redirect('/admin')
    })
})


/*Rota deletar categoria*/
router.post('/categorias/deletar', eAdmin, function (req, res) {
    categoria.deleteOne({_id:req.body.id}).then(()=>{
        req.flash("success_msg","A categoria foi deletada com sucesso!")
        res.redirect('/admin/categorias')
    }).catch((err)=>{
        req.flash("error_msg","Houve um erro ao deletar a categoria tente novamente.")
        res.redirect('/admin/categorias')
    })
})


/*Rota editar categoria*/
router.get('/categorias/editar/:id', eAdmin, function(req,res){
    categoria.findOne({_id:req.params.id}).lean().then((categoria)=>{
        res.render('admin/editarcategorias.handlebars',{categoria:categoria})
    }).catch((err) => {
        req.flash("error_msg","Esta categoria não existe.")
        res.redirect('/admin/categorias')
    })
})

router.post('/categorias/editar', eAdmin, function (req,res) {

    let erros = verificar(req.body)

    if(erros.length>0){
        res.render('admin/editarcategorias.handlebars',{erros:erros})
    }else{
        categoria.findById({_id:req.body.id}).then((categoria)=>{
            categoria.nome = req.body.nome
            categoria.slug = req.body.slug
    
            categoria.save().then( ()=>{
                req.flash("success_msg","Categoria editada com sucesso!")
                res.redirect('/admin/categorias')
            }).catch((err)=>{
                req.flash("error_msg","Houve um erro ao salvar a categoria!")
                res.redirect('/admin/categorias')
            })
    
        }).catch((err)=>{
            req.flash("error_msg","Houve um erro ao editar a categoria!")
            res.redirect('/admin/categorias')
        })
    }

})

module.exports = router