import { DataTypes } from "sequelize";
import { sequelize } from "../../db/index.js";

/* 
    Se crea el modelo del usuario para la base de datos

*/

export const User = sequelize.define("User", {
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role:{
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "Cliente"  
    },
});