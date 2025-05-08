import { where } from "sequelize";
import { User } from "./users.model.js";
import bcrypt from "bcrypt";

export const meUser = async (req, res) => {
    try {
      // usamos el id que traía el token, pero vamos a la BD
      const usuario = await User.findByPk(req.user.id, {
        attributes: ["id", "email", "role"]
      });
      if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      return res.status(200).json(usuario);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Error en el servidor" });
    }
  };

export const idUserModify = async (req, res) => {

    const {id} = req.params;
    const {email, password, role} = req.body;

    try{
        const usuario = await User.findByPk(id);

        if(!usuario){
            return res.status(404).json({error: "Usuario no encontrado"});

        }

        if (role && req.user.role !== 'Admin') {
            return res.status(403).json({ error: 'Sin permisos para cambiar role' });
          }
        

        if(email){
            usuario.email = email;
        }

        if(password){
            const hashedPassword = await bcrypt.hash(password, 10);
            usuario.password = hashedPassword;
        }

        if(role){
            usuario.role = role;
        }

        await usuario.save();
        await usuario.reload(); 
        return res.status(200).json({msg: "Usuario actualizado correctamente",       usuario: {
            id: usuario.id,
            email: usuario.email,
            role: usuario.role
          }});
          
    }catch(err){
        if (err.name === "SequelizeUniqueConstraintError") {
            return res.status(400).json({ error: "El correo ya está registrado" });
        }
        console.error(err);
        return res.status(500).json({error: "Error en el servidor"})
    }
}


export const deleteUser = async (req, res) =>{
    const {id} = req.params;

    try{
        const usuario = await User.findByPk(id);
        if(!usuario){
            return res.status(404).json({error: "Usuario no existe"})
        }

        await usuario.destroy();
        return res.status(200).json({msg: "Usurario eliminado correctamente"});
    }catch(err){
        return res.status(500).json({error: "Error en el servidor"});
    }
}
