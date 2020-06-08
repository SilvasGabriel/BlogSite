/*Carregando módulos*/
const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const index = express()
const admin = require("./routes/admin")
const path = require('path')
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')
require('./models/Postagem')
const Postagem  = mongoose.model('postagens')
require('./models/Categoria')
const categoria = mongoose.model('categorias')
const usuarios = require('./routes/usuario')
const passport = require('passport')
require('./Config/Authlocal')(passport)
const db = require('./Config/db')


/*Configurações*/
    //Sessão
    index.use(session({
        secret: "NodeCourse",
        resave: true,
        saveUninitialized: true,
    }))
    /*Passport*/
    index.use(passport.initialize())
    index.use(passport.session())
    /*Conect-Flash*/
    index.use(flash())
    //Middleware
    index.use((req,res,next) => {
        res.locals.success_msg = req.flash("success_msg")
        res.locals.error_msg = req.flash("error_msg")
        res.locals.error = req.flash("error")
        res.locals.user = req.user || null
        next();
    })
    //Body-Parser
    index.use(bodyParser.urlencoded({extended:true}))
    index.use(bodyParser.json())
    //Handlebars
    index.engine('handlebars',handlebars({defaultLayout:'main'}))
    index.set('view-engine','handlebars')
    //Mongoose
    mongoose.Promise = global.Promise

    mongoose.set('useNewUrlParser', true);
    mongoose.set('useFindAndModify', false);
    mongoose.set('useCreateIndex', true);
    mongoose.set('useUnifiedTopology', true);

    mongoose.connect(/*'mongodb://localhost/blog'*//*db.mongoURI*/process.env.MONGODB_URL).then(function() {
        /*Para excutar estaticamente o site coloque o que esta de fora dos cometarios nos comentarios e retire o db.mongoURI se estiver já cadastrado no mongo, se não retire o mongodb://localhost/blog*/
        console.log('Conectado ao mongodb ...')
    }).catch(function(erro) {
        console.log('Houve um erro ao conectar-se: '+erro)
    })
    //Arquivos Estaticos
    index.use(express.static(path.join(__dirname,'Public')))

/*Rotas*/
    /*Rota principal cliente*/
    index.get('/',function (req,res) {
        Postagem.find().populate('categoria').sort({data:"DESC"}).lean().then((postagens)=>{
            res.render('index.handlebars',{postagens: postagens})
        }).catch((err)=>{
            req.flash("error_msg","Houve um erro interno.")
            res.redirect('/404')
        })
    })
    /*Rota de erro cliente*/
    index.get('/404',(req,res)=>{
        res.send('Erro 404!',status(500))
    })
    /*Rota ler mais*/
    index.get('/postagem/:slug',function (req,res){
        Postagem.findOne({slug:req.params.slug}).lean().then((postagem)=>{
            if (postagem) {
                res.render('postagem/index.handlebars',{postagem: postagem})
            }else{
                req.flash("error_msg","Essa postagem não existe.")
                res.redirect('/')
            }
        }).catch((err)=>{
            req.flash("error_msg","Houve um erro interno."+err)
            res.redirect('/')
        })
    })
    /*Rota lista de categorias cadastradas*/
    index.get('/categorias',function(req,res){
        categoria.find().lean().then((categorias)=>{
            res.render('categorias/index.handlebars',{categorias: categorias})
        }).catch((err)=>{
            req.flash("error_msg","Erro ao listar as categorias."+err)
            res.redirect('/')
        })
    })
    /*Rota de redirecionamento de categorias*/
    index.get('/categorias/:slug',function(req,res){
        categoria.findOne({slug:req.params.slug}).lean().then((categoria)=>{
            
            if(categoria){

                Postagem.find({categoria: categoria._id}).lean().then((postagens)=>{

                    res.render('categorias/postagens.handlebars',{postagens: postagens, categoria:categoria})

                }).catch((err)=>{
                    req.flash("error_msg","Houve um erro ao listar os posts"+err)
                    res.redirect('/')
                })

            }else{
                req.flash("error_msg","Essa categoria não existe.")
                res.redirect('/')
            }
        
        }).catch((err)=>{
            req.flash("error_msg","Erro ao carregar a página de categorias."+err)
            res.redirect('/')
        })
    })

    /*Chamar as rotas*/
    index.use('/admin',admin)
    index.use('/usuarios',usuarios)
    

/*Outros*/
const PORT = process.env.PORT || 8081
index.listen(PORT, function(){
    console.log('Servidor funcionando...')
})