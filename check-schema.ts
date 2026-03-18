import { turso } from './src/lib/turso';

async function checkSchema() {
  try {
    const result = await turso.execute('PRAGMA table_info(shipping_rates)');
    console.log(JSON.stringify(result.rows, null, 2));
  } catch (error) {
    console.error(error);
  }
}

checkSchema();
