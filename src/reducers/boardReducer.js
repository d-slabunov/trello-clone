import { boardActionTypes, columnActionTypes } from '../types';


const initialState = {
  _id: '',
  title: '',
  owner: '',
  history: [],
  description: '',
  isPrivate: true,
  marks: [
    {
      color: 'yellow',
      title: '',
      _id: '4893284023u4ej890jfoijfwe0',
    },
    {
      color: 'green',
      title: '',
      _id: '4893284023uasdasd0jfoijfwe0',
    },
    {
      color: 'red',
      title: '',
      _id: '48932840234645t90jfoijfwe0',
    },
  ],
  chat: '',
  cards: [],
  members: [],
  isReadOnly: false,
  columns: [],
};

const boardReducer = (state = initialState, action) => {
  let data;
  switch (action.type) {
    case boardActionTypes.CREATED:
      data = { ...action.data.data };
      return {
        _id: data._id,
        owner: data.owner,
        title: data.title,
        history: [],
        description: '',
        isPrivate: data.isPrivate,
        marks: data.marks,
        cards: data.cards,
        members: data.members,
        isReadOnly: data.isReadOnly,
        columns: data.columns,
      };
    case columnActionTypes.COLUMN_DELETED:
    case columnActionTypes.COLUMN_POSITIONS_UPDATED:
    case columnActionTypes.COLUMN_UPDATED:
    case boardActionTypes.BOARD_UPDATED:
    case boardActionTypes.BOARD_DOWNLOADED:
      data = { ...action.data.data };
      return {
        _id: data._id,
        owner: data.owner,
        title: data.title,
        history: [],
        description: '',
        isPrivate: data.isPrivate,
        marks: data.marks,
        cards: data.cards,
        members: data.members,
        isReadOnly: data.isReadOnly,
        columns: data.columns,
      };
    case boardActionTypes.BOARD_MEMBER_ADDED:
      data = { ...action.data.data };
      return {
        _id: data.board._id,
        owner: data.board.owner,
        title: data.board.title,
        history: [],
        description: '',
        isPrivate: data.board.isPrivate,
        marks: data.board.marks,
        cards: data.board.cards,
        members: data.board.members,
        isReadOnly: data.board.isReadOnly,
        columns: data.board.columns,
      };
    case boardActionTypes.BOARD_MEMBER_REMOVED:
      data = { ...action.data.data };
      return {
        _id: data.board._id,
        owner: data.board.owner,
        title: data.board.title,
        history: [],
        description: '',
        isPrivate: data.board.isPrivate,
        marks: data.board.marks,
        cards: data.board.cards,
        members: data.board.members,
        isReadOnly: data.board.isReadOnly,
        columns: data.board.columns,
      };
    case boardActionTypes.BOARD_MEMBERS_RECEIVED:
      data = { ...action.data.data };
      return {
        ...state,
        members: data.members,
      };
    case columnActionTypes.COLUMN_CREATED:
      data = { ...action.data.data };
      return {
        ...state,
        columns: [...state.columns, data.column],
      };
    case boardActionTypes.BOARD_UPDATE_FAILED:
    case boardActionTypes.COLUMN_CREATE_FAILED:
    case boardActionTypes.COLUMN_DELETE_FAILED:
    case boardActionTypes.COLUMN_POSITIONS_UPDATE_FAILED:
    default:
      return { ...state };
  }
};

export default boardReducer;
