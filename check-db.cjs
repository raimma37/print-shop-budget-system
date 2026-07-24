const { neon } = require('@neondatabase/serverless');
require('dotenv').config();
const sql = neon(process.env.DATABASE_URL);
sql.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'sessions' ORDER BY ordinal_position")
  .then(r => { 
    console.log('SESSIONS TABLE:', JSON.stringify(r.rows ?? r, null, 2));
    return sql.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
  })
  .then(r => console.log('TABLES:', JSON.stringify(r.rows ?? r, null, 2)))
  .catch(e => console.error('ERROR:', e.message));
