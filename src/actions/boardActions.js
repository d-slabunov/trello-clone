/* eslint-disable no-underscore-dangle */
import { boardActionTypes, userActionTypes } from '../types';
import api from '../api';
import createErrorResponseObject from '../utlis/createErrorResponseObject';

const createBoard = ({ token, title, access, description }) => (dispatch, getState) => {
  return api.board.createBoard(token, { title, access, description })
    .then((res) => {
      dispatch({ type: userActionTypes.BOARD_ADDED, data: res }); // Add board to user reducer
      return dispatch({ type: boardActionTypes.CREATED, data: res }).data;
    })
    .catch((err) => {
      return Promise.reject(
        dispatch({
          type: boardActionTypes.CREATE_FAILED,
          data: createErrorResponseObject(err),
        }).data,
      );
    });
};

const loadAllBoards = token => (dispatch, getState) => {
  return api.board.loadAllBoards(token)
    .then((res) => {
      const { board } = getState();
      const currentBoard = res.data.boards.find(responseBoard => responseBoard._id === board._id);
      if (currentBoard) {
        dispatch({
          type: boardActionTypes.BOARD_UPDATED,
          data: {
            data: {
              ...board,
              title: currentBoard.title,
            },
          },
        });
      }
      return dispatch({ type: userActionTypes.ALL_BOARDS_DOWNLOADED, data: res }).data;
    })
    .catch((err) => {
      return Promise.reject(
        dispatch({
          type: userActionTypes.ALL_BOARDS_DOWNLOADING_FAILED,
          data: createErrorResponseObject(err),
        }).data,
      );
    });
};

const getBoard = (token, id) => (dispatch, getState) => {
  return api.board.getBoard(token, id)
    .then((res) => {
      return dispatch({ type: boardActionTypes.BOARD_DOWNLOADED, data: res }).data;
    })
    .catch((err) => {
      return Promise.reject(
        dispatch({
          type: boardActionTypes.BOARD_DOWNLOAD_FAILED,
          data: createErrorResponseObject(err),
        }).data,
      );
    });
};

const updateBoard = (token, id, data) => (dispatch, getState) => {
  return api.board.updateBoard(token, id, data)
    .then((res) => {
      dispatch({ type: userActionTypes.BOARD_TITLE_UPDATED, data: res });
      return dispatch({ type: boardActionTypes.BOARD_UPDATED, data: res }).data;
    })
    .catch((err) => {
      return Promise.reject(
        dispatch({
          type: boardActionTypes.BOARD_UPDATE_FAILED,
          data: createErrorResponseObject(err),
        }).data,
      );
    });
};

const findUsers = (token, email) => (dispatch, getState) => {
  return api.board.findUsers(token, email)
    .then((res) => {
      return dispatch({ type: boardActionTypes.BOARD_USERS_FOUND, data: res }).data;
    })
    .catch((err) => {
      return Promise.reject(
        dispatch({
          type: boardActionTypes.BOARD_FIND_USERS_FAILED,
          data: createErrorResponseObject(err),
        }).data,
      );
    });
};

export default {
  createBoard,
  loadAllBoards,
  getBoard,
  updateBoard,
  findUsers,
};
