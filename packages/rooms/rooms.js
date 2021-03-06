const router = require('express').Router();
const db = require('../db/db');
const { validate } = require('jsonschema');

router.use((req, res, next) => {
  setTimeout(next, 300);
});

router.use('/:id', (req, res, next) => {
  const room = db.get('rooms')
    .find({ id: req.params.id })
    .value();

  next(!room ? new Error('CAN_NOT_FIND_ROOM') : null);
});

// GET /rooms?query-string
router.get('/', (req, res, next) => {
  const queryObj = req.query;
  const queryKeys = Object.keys(queryObj);
  let rooms = db.get('rooms').value();

  queryKeys.forEach(key => {
    rooms = rooms.filter(room => {
      if (key === 'capacity') {
        if (Number(queryObj[key]) < 0 || Number(queryObj[key]) % 1 !== 0) {
          return next(new Error('INCORRECT_PARAMS: capacity must be a positive integer'));
        }
        return room[key] >= Number(queryObj[key]);
      }
      if (key === 'reserved') {
        if (!Number(queryObj[key]) || Number(queryObj[key]) % 1 !== 0) {
          return next(new Error('INCORRECT_PARAMS: reserved must be time in milliseconds'));
        }
        return !room[key].find(entry => {
          return entry.date === Number(queryObj[key]);
        });
      }
      if (room.equipment[key] !== undefined) {
        if (queryObj[key] === '0' || queryObj[key] === '1') {
          const bool = Number(queryObj[key]);
          return bool === room.equipment[key];
        }
      }
      return true;
    });
  });

  res.json({ status: 'OK', data: rooms });
});


// GET /rooms/:id
router.get('/:id', (req, res) => {
  const room = db
    .get('rooms')
    .find({ id: req.params.id })
    .value();

  res.json({ status: 'OK', data: room });
});

// POST /rooms
router.post('/', (req, res, next) => {
  const requestBodySchema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      capacity: { type: 'integer', minimum: 2 },
      equipment: {
        type: 'object',
        properties: {
          projector: { type: 'integer', enum: [0, 1] },
          sound: { type: 'integer', enum: [0, 1] },
          telephone: { type: 'integer', enum: [0, 1] },
        },
        required: ['projector', 'sound', 'telephone'],
      },
    },
    required: ['name', 'capacity', 'equipment'],
  };

  if (!validate(req.body, requestBodySchema).valid) {
    return next(new Error('INVALID_API_FORMAT'));
  }

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
  return room;
});

// PATCH /rooms/:id
router.patch('/:id', (req, res, next) => {
  const requestBodySchema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      capacity: { type: 'integer', minimum: 2 },
      equipment: {
        type: 'object',
        properties: {
          projector: { type: 'integer', enum: [0, 1] },
          sound: { type: 'integer', enum: [0, 1] },
          telephone: { type: 'integer', enum: [0, 1] },
        },
        anyOf: [
          { required: ['projector'] },
          { required: ['sound'] },
          { required: ['telephone'] },
        ],
      },
    },
    anyOf: [
      { required: ['name'] },
      { required: ['capacity'] },
      { required: ['equipment'] },
    ],
  };

  if (!validate(req.body, requestBodySchema).valid) {
    return next(new Error('INVALID_API_FORMAT'));
  }

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
  return room;
});

// PATCH /rooms/:id/book
router.patch('/:id/book', (req, res, next) => {
  const requestBodySchema = {
    type: 'object',
    properties: {
      date: {
        type: 'integer',
        minimum: 1525107600000,
        maximum: 1546189200000,
        multipleOf: 100000,
      },
      user: { type: 'string' },
      required: ['date', 'user'],
    },
  };

  if (!validate(req.body, requestBodySchema).valid) {
    return next(new Error('INVALID_API_FORMAT'));
  }
  const bookEntries = db
    .get('rooms')
    .find({ id: req.params.id })
    .at('reserved')
    .first()
    .value();

  const alreadyBooked = bookEntries.find(entry => {
    return entry.date === req.body.date;
  });
  if (alreadyBooked) {
    bookEntries.splice(bookEntries.indexOf(alreadyBooked), 1);
  } else {
    bookEntries.push({ date: req.body.date, user: req.body.user });
  }

  db.write();
  const room = db
    .get('rooms')
    .find({ id: req.params.id })
    .value();
  res.json({ status: 'OK', data: room });
  return bookEntries;
});

// DELETE /rooms/:id
router.delete('/:id', (req, res) => {
  db
    .get('rooms')
    .remove({ id: req.params.id })
    .write();

  res.json({ status: 'OK' });
});


module.exports = router;
