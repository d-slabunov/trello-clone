/* eslint-disable no-underscore-dangle */
const express = require('express');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongoose');
const _ = require('lodash');
const { Board } = require('../models/Board');
const { User } = require('../models/User');
const { parseError } = require('../utils/parseError');

const router = express.Router();

router.get('/all', (req, res) => {
  const token = req.headers.authorization.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(400).send({ err: 'Invalid token' });
    } else {
      User.findById({ _id: decoded._id })
        .then((user) => {
          const { boards } = user;
          res.status(200).send({ boards });
        })
        .catch((err) => {
          console.log('Error finding user', err);
          res.status(400).send({ err });
        });
    }
  });
});

router.get('/:id', (req, res) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  const boardId = req.params.id;
  Board.findById(boardId)
    .then((board) => {
      if (board) {
        if (!board.isPrivate) {
          return res.status(200).send(board);
        }

        if (token) {
          jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
              res.status(400).send({ err: 'Invalid token' });
            } else {
              const isMember = !!board.members.find(member => member._id.toString() === decoded._id.toString());

              if (isMember) {
                res.status(200).send(board);
              } else {
                res.status(403).send({ err: 'You have no access to this board' });
              }
            }
          });
        } else {
          res.status(403).send({ err: 'You have no access to this board' });
        }
      } else {
        res.status(400).send({ err: 'Could not find the board' });
      }
    })
    .catch(() => res.status(400).send({ err: 'Could not find the board' }));
});

router.post('/:id', (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const boardId = req.params.id;

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      req.status(400).send({ err: 'Invalid token' });
    } else {
      const board = await Board.findById(boardId);

      if (board) {
        const isOwner = board.owner.toHexString() === decoded._id;

        if (!isOwner) {
          res.status(400).send({ err: 'Only board owner can change board settings and title ' });
        } else {
          try {
            board.updateBoard(req.body);
            const updatedBoard = await board.save();

            if (req.body.title) {
              const usersToUpdate = await Promise.all(updatedBoard.members.map(async (member) => {
                const result = await User.findById(member._id.toHexString());
                return result;
              }));

              const udpatedUsers = usersToUpdate.map((user) => {
                user.updateBoardTitle(updatedBoard);
                return user.save();
              });

              await Promise.all(udpatedUsers);
            }
            res.status(200).send(updatedBoard);
          } catch (e) {
            console.log(e);
            res.status(400).send({ err: 'Could not update board in updating' });
          }
        }
      } else {
        res.status(400).send({ err: 'Could not find the board' });
      }
    }
  });
});

router.post('/', (req, res) => {
  const token = req.headers.authorization.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(400).send({ err: 'Invalid token' });
    } else {
      User.findById({ _id: decoded._id })
        .then((user) => {
          if (user) {
            const board = new Board({
              owner: user._id,
              title: req.body.title,
              members: [
                {
                  _id: user._id,
                  email: user.email,
                  nickname: user.nickname,
                },
              ],
              description: req.body.description,
              isPrivate: req.body.access === 'private',
              isReadOnly: true,
            });

            board.save()
              .then((board) => {
                user.boards.push({
                  _id: board._id,
                  title: board.title,
                });
                return user.save().catch(err => console.log('Error saving user with new board', err));
              })
              .then(doc => res.status(200).send({
                _id: board._id,
                title: board.title,
                owner: user.nickname,
                description: board.description,
                members: [{
                  _id: user._id,
                  email: user.email,
                  nickname: user.nickname,
                }],
                isPrivate: board.isPrivate,
                isReadOnly: board.isReadOnly,
                marks: board.marks,
                boards: board.boards,
                columns: board.columns,
              }));
          } else {
            res.status(400).json({ err: 'Could not find the user' });
          }
        })
        .catch((err) => {
          console.log(err);
          res.status(400).json({ err });
        });
    }
  });
});

router.get('/find_users/:email', (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const { email } = req.params;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(400).send({ err: 'Invalid token' });
    }

    User.find({})
      .then((users) => {
        const foundUsers = users.filter(user => user.email.toLowerCase().indexOf(email.toLowerCase()) !== -1);

        res.status(200).send({ users: foundUsers, message: 'Request success' });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send({ err: 'Error on the server' });
      });
  });
});

router.post('/:id/add_member', (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const { member } = req.body;
  const boardId = req.params.id;

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(400).send({ err: 'Invalid token' });
    }

    try {
      const board = await Board.findById(boardId);

      const isOwner = board.owner.toHexString() === decoded._id;
      
      if (isOwner || decoded._id === member) {
        const user = await User.findById(member);

        if (!board.members.find(boardMember => boardMember._id.toHexString() === member)) {

          board.addMember({ _id: user._id, email: user.email, nickname: user.nickname });
          user.addBoard({ _id: board.id, title: board.title });

          const savedBoard = await board.save();

          const savedUser = await user.save();

          return res.status(200).send({ message: 'Member added', board: savedBoard });
        }
        return res.status(200).send({ message: 'Member already added', board });
      }

      res.status(400).send({ err: 'Only board owner can add members' });
    } catch (e) {
      res.status(400).send({ err: 'Could not add a member' });
    }
  });
});

router.post('/:id/remove_member', (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const { member } = req.body;
  const boardId = req.params.id;

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(400).send({ err: 'Invalid token' });
    }

    try {
      const board = await Board.findById(boardId);

      const isOwner = board.owner.toHexString() === decoded._id;
      
      if (isOwner || decoded._id === member) {
        const user = await User.findById(member);

        if (!board.members.find(boardMember => boardMember._id === member)) {

          board.removeMember(user._id.toHexString());
          user.removeBoard({ _id: board.id });

          const savedBoard = await board.save();

          const savedUser = await user.save();

          return res.status(200).send({ message: 'Member removed', board: savedBoard });
        }
        return res.status(200).send({ message: 'Member already removed', board });
      }

      res.status(400).send({ err: 'Only board owner can remove members' });
    } catch (e) {
      res.status(400).send({ err: 'Could not remove a member' });
    }
  });
});

router.get('/:id/get_members', (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const boardId = req.params.id;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(400).send({ err: 'Invalid token' });
    }

    Board.findById(boardId)
      .then((board) => {
        if (board) {
          return res.status(200).send({ members: board.members });
        }

        res.status(400).send({ err: 'Board is not found' });
      })
      .catch((err) => {
        console.log('Could not find a board', err);
        res.status(400).send({ err: 'Could not find a board' });
      });
  });
});

module.exports = {
  boardRouter: router,
};
