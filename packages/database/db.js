const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

db.serialize(() => {
  db.run('CREATE TABLE if not exists users (name TEXT, surname TEXT, age INTEGER)');

  // db.run('INSERT INTO users VALUES (?,?,?)', 'Vasya', 'Pupkin', 13);
  //
  // const prepare = db.prepare('INSERT INTO users VALUES (?,?,?)');
  // for (let i = 0; i < 1; i += 1) {
  //   prepare.run('Roman', 'Bobrunov', 20 + i);
  // }
  // prepare.finalize();
});

module.exports = db;
