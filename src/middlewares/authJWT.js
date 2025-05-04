import jwt from "jsonwebtoken"

export function auth(roleRequerido){

    /* 
        Esta función es el la encargada de revisar el token y el role.
        
            Básicamente obtiene el token de los headers revisa que se haya obtenido uno
        luego lo decodifica para obtener su infomación y revisa que para la acción que vamos 
        a hacer tengamos el role necesario, solo si le pasamos un roleRequerido.
    
    */ 

    return (req, res, next) =>{
        const token = req.headers.authorization?.split(" ")[1];
        if(!token){
            return res.status(401).json({msg: "Token faltante"});
        }

        try{

            const payload = jwt.verify(token, process.env.JWT_SECRET);

            if(roleRequerido && payload.role != roleRequerido){
                return res.status(403).json({msg: "Sin permisos"});
            }

            req.user = payload;
            next();


        }catch{

            return res.status(401).json({msg: "Error: Token inválido"})

        }
    }
}