import { esClient } from "./esClient.js";

/**
 * Indexa un documento en Elasticsearch.
 * No hace nada si está en entorno de pruebas.
 * @param {{ name: string, category: string, description?: string }} params
 */
export const indexDocumentInElastic = async ({ name, category, description }) => {
  if (process.env.NODE_ENV === "test") return;

  try {
    await esClient.index({
      index: 'products',
      document: {
        name,
        category,
        description: description || "Producto sin descripción"
      }
    });
  } catch (err) {
    console.error(
      `❌ No se pudo indexar ${category} en Elastic:`,
      err.meta?.body?.error || err
    );
  }
};
