import { DataTypes } from "sequelize";
import { sequelize }  from '../../db/index.js';
import { User }       from '../users/users.model.js';
import { Restaurant } from '../restaurants/restaurants.model.js';

export const Reservation = sequelize.define("Reservation",{
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    guests: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('ACTIVE', 'CANCELLED'),
        defaultValue: 'ACTIVE',
    },
    restaurantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {model: 'Restaurants', key: 'id'},
        onDelete: 'CASCADE'
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {model: 'Users', key: 'id'},
        onDelete: 'CASCADE',
    }
});

Restaurant.hasMany(Reservation, { foreignKey: 'restaurantId', as: 'reservations' });
User.hasMany(Reservation,       { foreignKey: 'userId',       as: 'reservations' });
Reservation.belongsTo(Restaurant, { foreignKey: 'restaurantId' });
Reservation.belongsTo(User,       { foreignKey: 'userId' });