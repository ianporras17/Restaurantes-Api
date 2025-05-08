import { Order } from "./orders.model.js";
import { Restaurant } from '../restaurants/restaurants.model.js';
import { Menu }       from '../menus/menus.model.js';
import { or } from "sequelize";

export const createOrder = async (req, res) => {

    const {menuId, total, restaurantId } = req.body;

    if(!menuId || !total || !restaurantId){
        return res.status(400).json({error: "Faltan datos"});
    }

    try{
        const menu = await Menu.findByPk(menuId);
        if(!menu){
            return res.status(404).json({error: "No existe el menu"})
        }

        const restaurant = await Restaurant.findByPk(restaurantId);
        if(!restaurant){
            return res.status(404).json({error: "No existe el restaurante"});
        }

        if (menu.restaurantId !== restaurantId) {
            return res
              .status(400)
              .json({ error: 'El menú no pertenece a ese restaurante' });
          }

        const order = await Order.create({menuId, total, restaurantId, userId: req.user.id })
        return res.status(201).json({msg: "Orden creada correctamente", order});

    }catch(err){
        return res.status(500).json({error: "No se pudo conectar a la bse de datos"});
    }

}


export const obtenerOrden = async (req, res) => {

    const {id} = req.params;

    try{

        const order = await Order.findByPk(id, {
            include: [
              { model: Restaurant, attributes: ['id', 'name', 'address'] },
              { model: Menu,       attributes: ['id', 'title'] },
            ],
          });
        if(!order){
            return res.status(404).json({error: "La orden buscada no existe"});
        }


        if (req.user.role !== 'Admin' && order.userId !== req.user.id) {
            return res.status(403).json({ error: 'Sin permisos para ver este pedido' });
        }

        return res.status(200).json(order)

    }catch(err){
        return res.status(500).json({error: "No se pudo conectar a la BD"});
    }
    
}