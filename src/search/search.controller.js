import { esClient } from './elastic.config.js';
import { getFromCache, setToCache } from '../utils/cache.js';

const INDEX = 'products';

export const searchProducts = async (req, res) => {
  const { q } = req.query;
  const cacheKey = `search:q:${q}`;

  try {
    const cached = await getFromCache(cacheKey);
    if (cached) return res.json(cached);

    const result = await esClient.search({
      index: INDEX,
      query: {
        multi_match: {
          query: q,
          fields: ['name^3', 'description', 'category']
        }
      }
    });

    const products = result.hits.hits.map(hit => hit._source);
    await setToCache(cacheKey, products, 60);
    res.json(products);

  } catch (err) {
    console.error("Error en búsqueda:", err);
    res.status(500).json({ error: "Error buscando productos" });
  }
};

export const searchByCategory = async (req, res) => {
  const { category } = req.params;
  const cacheKey = `search:category:${category}`;

  try {
    const cached = await getFromCache(cacheKey);
    if (cached) return res.json(cached);

    const result = await esClient.search({
      index: INDEX,
      query: {
        match: { category }
      }
    });

    const products = result.hits.hits.map(hit => hit._source);
    await setToCache(cacheKey, products, 60);
    res.json(products);

  } catch (err) {
    console.error("Error filtrando:", err);
    res.status(500).json({ error: "Error filtrando por categoría" });
  }
};

export const reindexProducts = async (req, res) => {
  try {
    const productos = req.body.products || [];

    const exists = await esClient.indices.exists({ index: INDEX });
    if (!exists) {
      await esClient.indices.create({
        index: INDEX,
        mappings: {
          properties: {
            name:       { type: 'text' },
            description:{ type: 'text' },
            category:   { type: 'keyword' }
          }
        }
      });
    }

    const ops = productos.flatMap(p => [
      { index: { _index: INDEX } },
      {
        name:        p.name,
        category:    p.category,
        description: p.description || "Producto sin descripción"
      }
    ]);

    const bulkResponse = await esClient.bulk({ refresh: true, operations: ops });

    if (bulkResponse.errors) {
      console.error("Errores en el reindexado:", JSON.stringify(bulkResponse, null, 2));
      return res.status(500).json({ error: "Falló el reindexado" });
    }

    res.json({ message: "Productos indexados correctamente" });

  } catch (err) {
    console.error("Error en reindexado:", err);
    res.status(500).json({ error: "Error indexando productos" });
  }
};
