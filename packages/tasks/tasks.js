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
  const task = db
    .get('tasks')
    .find({ id: req.params.id })
    .value();

  res.json({ status: 'OK', data: task });
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

  const task = newRoom(req.body);

  console.log(task);

  db
    .get('tasks')
    .push(task)
    .write();

  res.json({ status: 'OK', data: task });
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

  const task = db
    .get('tasks')
    .find({ id: req.params.id })
    .assign(req.body)
    .value();

  db.write();

  res.json({ status: 'OK', data: task });
});

// DELETE /tasks/:id
router.delete('/:id', (req, res) => {
  db
    .get('tasks')
    .remove({ id: req.params.id })
    .write();

  res.json({ status: 'OK' });
});

module.exports = router;
