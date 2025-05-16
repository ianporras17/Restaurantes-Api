import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';
dotenv.config();

export const esClient = new Client({
  node: process.env.ELASTIC_URL || 'http://elasticsearch:9200',
  headers: {
    accept: 'application/vnd.elasticsearch+json;compatible-with=8',
    'content-type': 'application/vnd.elasticsearch+json;compatible-with=8',
  }
});
