const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database-example.db');

db.serialize(() => {
  db.run('CREATE TABLE if not exists users (name TEXT, surname TEXT, age INTEGER)');

  db.run('INSERT INTO users VALUES (?,?,?)', 'Vasya', 'Pupkin', 13);

  const prepare = db.prepare('INSERT INTO users VALUES (?,?,?)');
  for (let i = 0; i < 2; i += 1) {
    prepare.run('Roman', 'Bobrunov', 20 + i);
  }
  prepare.finalize();

  db.each('SELECT name, surname, age FROM users', (err, row) => {
    console.log(`name: ${row.name}, surname: ${row.surname}, age: ${row.age}`);
  });
});

db.close();
