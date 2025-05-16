import bcrypt from "bcrypt";
import { userDAO } from "./dao/index.js";

export const meUser = async (req, res) => {
  try {
    const usuario = await userDAO.findById(req.user.id);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    return res.status(200).json({
      id: usuario.id,
      email: usuario.email,
      role: usuario.role,
    });
  } catch (err) {
    return res.status(500).json({ error: "Error en el servidor" });
  }
};

export const idUserModify = async (req, res) => {
  const { id } = req.params;
  const { email, password, role } = req.body;

  try {
    const user = await userDAO.findById(id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    if (role && req.user.role !== "Admin") {
      return res.status(403).json({ error: "Sin permisos para cambiar role" });
    }

    const updates = {};
    if (email) updates.email = email;
    if (role) updates.role = role;
    if (password) updates.password = await bcrypt.hash(password, 10);

    const actualizado = await userDAO.update(id, updates);

    return res.status(200).json({
      msg: "Usuario actualizado correctamente",
      usuario: {
        id: actualizado.id,
        email: actualizado.email,
        role: actualizado.role,
      },
    });
  } catch (err) {
    if (err.code === 11000 || err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "El correo ya está registrado" });
    }
    console.error(err);
    return res.status(500).json({ error: "Error en el servidor" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const deleted = await userDAO.delete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Usuario no existe" });

    return res.status(200).json({ msg: "Usuario eliminado correctamente" });
  } catch (err) {
    return res.status(500).json({ error: "Error en el servidor" });
  }
};
