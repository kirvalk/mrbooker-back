const router = require('express').Router();
const db = require('../db/db');
const { validate } = require('jsonschema');

// router.use('/:id', (req, res, next) => {
//   const task = db.get('tasks')
//     .find({ id: req.params.id })
//     .value();
//
//   if (!task) {
//     next(new Error('CAN_NOT_FIND_TASK'));
//   }
// });

// GET /tasks
router.get('/', (req, res) => {
  const rooms = db.get('rooms').value();

  res.json({ status: 'OK', data: rooms });
});

// GET /tasks/:id
router.get('/:id', (req, res) => {
  const room = db
    .get('rooms')
    .find({ id: req.params.id })
    .value();

  res.json({ status: 'OK', data: room });
});

// POST /tasks
router.post('/', (req, res, next) => {
  // const requestBodySchema = {
  //   id: 'path-task',
  //   type: 'object',
  //   properties: { text: { type: 'string' } },
  //   required: ['text'],
  //   additionalProperties: false,
  // };
  //
  // if (!validate(req.body, requestBodySchema).valid) {
  //   next(new Error('INVALID_API_FORMAT'));
  // }

  const newRoom = obj => {
    return Object.assign(obj, {
      id: String(Math.random()
        .toString(16)
        .split('.')[1]),
      reserved: [],
    });
  };

  const room = newRoom(req.body);

  db
    .get('rooms')
    .push(room)
    .write();

  res.json({ status: 'OK', data: room });
});

// PATCH /tasks/:id
router.patch('/:id', (req, res, next) => {
  // const requestBodySchema = {
  //   id: 'path-task',
  //   type: 'object',
  //   properties: {
  //     text: { type: 'string' },
  //     isCompleted: { type: 'boolean' },
  //   },
  //   additionalProperties: false,
  //   minProperties: 1,
  // };
  //
  // if (!validate(req.body, requestBodySchema).valid) {
  //   next(new Error('INVALID_API_FORMAT'));
  // }

  const room = db
    .get('rooms')
    .find({ id: req.params.id })
    .value();

  Object.keys(room).forEach(key => {
    if (!req.body[key]) return;
    if (typeof room[key] === 'object' && room[key] !== null) {
      Object.assign(room[key], req.body[key]);
    } else {
      room[key] = req.body[key];
    }
  });

  db.write();
  res.json({ status: 'OK', data: room });
});

// PATCH /tasks/book/:id
router.patch('/book/:id', (req, res, next) => {
  const bookedDates = db
    .get('rooms')
    .find({ id: req.params.id })
    .at('reserved')
    .first()
    .value();

  if (bookedDates.indexOf(req.body.date) === -1) {
    bookedDates.push(req.body.date);
  } else {
    bookedDates.splice(bookedDates.indexOf(req.body.date), 1);
  }

  db.write();
  const room = db
    .get('rooms')
    .find({ id: req.params.id })
    .value();
  res.json({ status: 'OK', data: room });
});

// DELETE /tasks/:id
router.delete('/:id', (req, res) => {
  db
    .get('rooms')
    .remove({ id: req.params.id })
    .write();

  res.json({ status: 'OK' });
});

module.exports = router;
