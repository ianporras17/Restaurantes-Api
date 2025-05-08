import { Reservation } from "./reservations.model.js";
import { Restaurant } from "../restaurants/restaurants.model.js";
import { User } from "../users/users.model.js";

export const newReservation = async (req, res) => {
    const {date, time, guests, status, restaurantId} = req.body;

    if(!date || !time || !guests || !restaurantId){
        return res.status(400).json({error: "Falatan datos necesarios"});
    }

    try{

        const restaurant = await Restaurant.findByPk(restaurantId);
        if(!restaurant){
            return res.status(404).json({error: "Restaurante no existente"})
        }

        const reservation = await Reservation.create({date, time, guests, status, restaurantId, userId: req.user.id});
        return res.status(201).json({msg: "Reservación creada correctamente", reservation})

    }catch{
        return res.status(500).json({error: "No se puedo coencetar a la BD"})
    }

}

export const cancelReservation = async (req, res) => {
    const {id} = req.params;

    try{
        const reservation = await Reservation.findByPk(id);
        if(!reservation){
            return res.status(404).json({error:"No existe la reservación"});
        }

        if (req.user.role !== 'Admin' && reservation.userId !== req.user.id) {
            return res.status(403).json({ error: 'Sin permisos para cancelar esta reserva' });
        }

        reservation.status = 'CANCELLED';
        await reservation.save();

        res.status(200).json({msg: "Reservación cancelada", reservation});
    }catch(err){
        return res.status(500).json({error: "Error al conetar al servidor"});
    }
}