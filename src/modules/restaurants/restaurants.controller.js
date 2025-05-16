import { restaurantDAO } from "./dao/index.js";

export const resgisterRestaurant = async (req, res) => {

    const {name, address, phone, capacity } = req.body;

    if(!name || !address || !phone){
        return res.status(400).json({Error: "Debe ingresar nombre, dirección y teléfono"});
    }

    try{
        
        const nuevo = await restaurantDAO.create({name, address, phone, capacity});
        return res.status(201).json({ message: "Restaurante creado", restaurante: nuevo });

    }catch(err){

        return res.status(500).json({error: "Error al conectar con la base de datos"})

    }

};

export const verRestaurantes = async (req, res) => {
    try{

        const restaurantes = await restaurantDAO.findAllRestaurant();
        return res.status(200).json(restaurantes);

    }catch{
        return res.status(500).json({error: "Error al conectar a la data base"});
    }
}