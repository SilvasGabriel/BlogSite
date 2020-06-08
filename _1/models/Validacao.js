let verificar = function(req){
    
    let erros = []

    if(!req.nome || typeof req.nome == undefined || req.nome == null || req.nome.length < 2){
        erros.push({texto:"Nome inválido!"})
    }
    if(!req.slug || typeof req.slug == undefined || req.slug == null){
        erros.push({texto:"Slug inválido!"})
    }

    return erros;
}   

module.exports = verificar

