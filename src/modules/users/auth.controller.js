import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userDAO } from "./dao/index.js";

export const registerUser = async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userDAO.create({ email, password: hashedPassword, role });

    return res.status(201).json({ message: "Usuario creado correctamente" , users: user});
  } catch (err) {
    if (err.code === 11000 || err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "Correo ya registrado" });
    }
      console.error(err);
      return res.status(500).json({ error: "Error al registrar el usuario" });
    }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "Debe ingresar correo y contraseña" });
  }

  try {
    const usuario = await userDAO.findByEmail(email);
    if (!usuario) {
      return res.status(401).json({ error: "Datos incorrectos" });
    }

    const valid = await bcrypt.compare(password, usuario.password);
    if (!valid) {
      return res.status(401).json({ error: "Datos incorrectos" });
    }

    const payload = { id: usuario.id, email: usuario.email, role: usuario.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.json({ token });
  } catch (err) {
    return res.status(500).json({ error: "Error al conectar con el servidor" });
  }
};