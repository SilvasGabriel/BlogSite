if(process.env.NODE_ENV == "production"){
    module.exports = {mongoURI:   "mongodb+srv://GabrielSilva:741852159@blogapp-1hgtl.mongodb.net/blog?retryWrites=true&w=majority"}
}else{
    module.exports = {mongoURI: "mongodb://localhost/blog"}
}
