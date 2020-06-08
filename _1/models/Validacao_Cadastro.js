let verificar = function(req){
    
    let erros = []

    if(!req.nome || typeof req.nome == undefined || req.nome == null || req.nome.length < 2){
        erros.push({texto:"Nome inválido!"})
    }

    if(!req.email || typeof req.email == undefined || req.email == null){
        erros.push({texto:"Email inválido!"})
    }

    if(!req.senha || typeof req.senha == undefined || req.senha == null){
        erros.push({texto:"Senha inválido!"})
    }

    if(req.senha.length < 6){
        erros.push({texto:"Senha muito pequena!"})
    }

    if(req.senha != req.senha2){
        erros.push({texto:"As senhas são diferentes, tente novamente!"})
    }

    return erros;

}

    module.exports = verificar