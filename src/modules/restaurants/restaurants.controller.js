import { Restaurant } from "./restaurants.model.js";

export const resgisterRestaurant = async (req, res) => {

    const {name, address, phone, capacity } = req.body;

    if(!name || !address || !phone){
        return res.status(400).json({Error: "Debe ingresar nombre, dirección y teléfono"});
    }

    try{
        
        const restaurante = await Restaurant.create({name, address, phone, capacity});
        res.status(201).json({message: "Restaurante creado correctamenete",
            restaurant: {
                id: restaurante.id,
                name: restaurante.name,
                address: restaurante.address,
                phone: restaurante.phone,
                capacity: restaurante.capacity
            } 
        })
    }catch(err){

        return res.status(500).json({error: "Error al conectar con la base de datos"})

    }

};

export const verRestaurantes = async (req, res) => {
    try{

        const restaurantes = await Restaurant.findAll();
        return res.status(200).json(restaurantes);

    }catch{
        return res.status(500).json({error: "Error al conectar a la data base"});
    }
}