const { Pool } = require('pg');
const dbParams = require('../lib/db.js');
const db = new Pool(dbParams);

module.exports = db;