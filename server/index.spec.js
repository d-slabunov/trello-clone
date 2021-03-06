/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
const { expect } = require('chai');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./index');
const { User } = require('./models/User');
const { users, populateUsers, initNewUser } = require('./test/userSeed');

const { userRequests } = require('./routes/__test__/user.test');
const { boardRequests } = require('./routes/__test__/board.test');

userRequests();
boardRequests();
