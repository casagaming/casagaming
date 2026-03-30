
const TURSO_DIRECT_URL = 'https://casagaming1-casagaming.aws-eu-west-1.turso.io';
const TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzM4MTY2MzUsImlkIjoiMDE5Y2ZmNjQtODQwMS03OTE4LTkwYWMtYzg0NDVjMmU5YTJhIiwicmlkIjoiNmY0ZmRlMDYtMmYwYy00YzcyLTkxY2EtOGVmNDFjMGIxMDllIn0.uI1magG-U9X1NVygJU0-jRincNwJhsvcvl5gBJZj3FsKARpFLFH0ORe4Vcbmz7Udhn1nmh9ePxFBT1QAHm3mDg';

async function run() {
  const response = await fetch(`${TURSO_DIRECT_URL}/v2/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TURSO_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          type: 'execute',
          stmt: {
            sql: "SELECT id, name_en, name_ar, image_url FROM products WHERE name_en LIKE '%tast%' OR name_ar LIKE '%tast%' OR name_en LIKE '%test%' OR name_ar LIKE '%test%' OR name_en LIKE '%تيست%' OR name_ar LIKE '%تيست%'",
            args: [],
          },
        },
        { type: 'close' },
      ],
    }),
  });

  const data = await response.json();
  console.log(JSON.stringify(data.results[0].response.result.rows, null, 2));
}

run().catch(console.error);
