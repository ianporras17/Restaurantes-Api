import { Menu } from "./menus.model.js";
import { Restaurant } from "../restaurants/restaurants.model.js";

export const registerMenu = async (req, res) => {

    const {title, isActive, restaurantId } = req.body;

    if(!title || !restaurantId){
        return res.status(400).json({error: "Faltana datos necesarios"})
    }

    try{
        const restaurante = await Restaurant.findByPk(restaurantId);

        if(!restaurante){
            return res.status(404).json({error: "No existe el restaurante"})
        }

        const menuNew = await Menu.create({title, isActive, restaurantId});
        return res.status(201).json({message: "Menu creado correctamente",
            menuN: {
                id: menuNew.id,
                title: menuNew.title,
                isActive: menuNew.isActive,
                restaurant: menuNew.restaurantId
            }
        })

    }catch(err){
        return res.status(500).json({error: "No se puedo conectar a la base de datos"})
    }
}

export const buscarMenu = async (req, res) => {
    const {id} = req.params;

    if(!id){
        return res.status(400).json({error: "debe ingresar un id"});
    }

    try{

        const menu = await Menu.findByPk(id, {
            include: {
              model: Restaurant,
              attributes: ['id', 'name', 'address']   // lo que necesites
                }
            }
        );
        if(!menu){
            return res.status(404).json({error: "El menú buscado no existe"});
        }

        return res.status(200).json(menu);

    }catch(err){
        return res.status(500).json({error: "No se puedo conectar a la base de datos"})
    }
}

export const actualizarMenu = async (req, res) => {
    const { id } = req.params;
    const { title, isActive } = req.body;
  
    try {
      const menu = await Menu.findByPk(id);
      if (!menu) {
        return res.status(404).json({ error: "Menu no existente" });
      }
  

    if (title !== undefined)   {
        menu.title    = title;
    };

    if (isActive !== undefined) {
        menu.isActive = isActive;
    };
  
      await menu.save();
      await menu.reload();
  
      return res.status(200).json({
        msg: "Menu actualizado correctamente",
        menu: {
          id: menu.id,
          title: menu.title,
          isActive: menu.isActive,
          restaurantId: menu.restaurantId,
        },
      });
    } catch (err) {
      console.error(err);               // ← verás la causa real si vuelve a fallar
      return res
        .status(500)
        .json({ error: "No se pudo conectar a la base de datos" });
    }
  };

export const deleteMenu = async (req, res) =>{
    const {id} = req.params;

    try{
        const menu = await Menu.findByPk(id);
        if(!menu){
            return res.status(404).json({error: "Menú no existente"});
        }

        await menu.destroy();
        return res.status(200).json({msg: "Menu eliminado"});
    }catch(err){
        return res.status(500).json({error: "No se pudo conectar a la base de datos"});
    }
}
  