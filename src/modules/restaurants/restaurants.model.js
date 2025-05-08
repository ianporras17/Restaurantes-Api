import { sequelize } from "../../db/index.js";
import { DataTypes } from "sequelize";

/* 
    Se crea el modelo del restaurante para la base de datos

*/

export const Restaurant = sequelize.define("Restaurant", {
    
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    capacity: {
        type: DataTypes.INTEGER
    }
    },
);

