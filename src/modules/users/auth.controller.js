import { User } from "./users.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {

    /*  
        Función que se necarga de crear un usuario nuevo, obtiene el emain y la password
        que le dimos en el req.body y con sequelice crea el ususario y lo pasa a cliente
        para guardarlo, en caso de error pues lo mostrará.
    
    */

    const {email, password, role} = req.body;

    if (!email || !password || !role){
        return res.status(400).json({error: "Faltan campos oblogatorios"});

    }
    

    try{
        const hashedPassword = await bcrypt.hash(password, 10);

        const nuevoUsuario = await User.create({email, password: hashedPassword, role});
        
        return res.status(201).json({message: "Usuario creado correctamente"});

    }catch (err) {

        if(err.name == "SequelizeUniqueConstraintError"){
            return res.status(400).json({error: "correo ya registrado"});
        }
        console.error(err)
        return res.status(500).json({error: "Error al registrar el usuario"});
    }
}

export const loginUser = async (req, res) =>{
    const {email, password} = req.body;

    if(!email || !password){
        return res.status(400).json({error: "Debe ingresar correo y contraseña"});
    }

    try{
        const usuario = await User.findOne({where: {email}});
        if (!usuario){
            return res.status(401).json({error: "Datos incorrectos"});
        }

        const valid = await bcrypt.compare(password, usuario.password);
        if(!valid){
            return res.status(401).json({error: "Datos incorrectos"});
        }

        const payload = {id: usuario.id, email: usuario.email, role: usuario.role};
        const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "1h"});

        return res.json({ token });
    }catch(err){
        return res.status(500).json({error: "Error al conectar el servidor"})
    }

}