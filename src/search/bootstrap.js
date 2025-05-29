// src/search/bootstrap.js
import { esClient } from './elastic.config.js';

const INDEX = 'products';
const MAPPINGS = {
  properties: {
    name:        { type: 'text' },
    description: { type: 'text' },
    category:    { type: 'keyword' }
  }
};

export async function ensureProductsIndex() {
  try {
    const { body: exists } = await esClient.indices.exists({ index: INDEX });
    if (!exists) {
      await esClient.indices.create({ index: INDEX, mappings: MAPPINGS });
      console.log(`🛠️  Índice '${INDEX}' creado al iniciar search-service`);
    }
  } catch (err) {
    console.error('❌ No se pudo asegurar el índice products:', err.message || err);
  }
}
