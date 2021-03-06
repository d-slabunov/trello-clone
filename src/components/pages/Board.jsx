/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import '../../styles/board.sass';
import Loader from '../utils/Loader';
import PopupContainer from '../utils/PopupContainer';
import RenameBoardForm from '../forms/boardForms/RenameBoardForm';
import ReadonlyAccessBoardForm from '../forms/boardForms/ReadonlyAccessBoardForm';
import PublicAccessBoardForm from '../forms/boardForms/PublicAccessBoardForm';
import MembersForm from '../forms/boardForms/MembersForm';
import boardActions from '../../actions/boardActions';
import Messages from '../utils/Messages';
import ColumnList from '../lists/ColumnList';
import ColumnListContextProvider from '../context/ColumnListContext';


const propTypes = {
  token: PropTypes.shape({
    access: PropTypes.string.isRequired,
    token: PropTypes.string.isRequired,
  }).isRequired,
  board: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    isReadOnly: PropTypes.bool.isRequired,
    isPrivate: PropTypes.bool.isRequired,
    members: PropTypes.array.isRequired,
    columns: PropTypes.array.isRequired,
    cards: PropTypes.array.isRequired,
  }).isRequired,
  getBoard: PropTypes.func.isRequired,
  getMembers: PropTypes.func.isRequired,
};


class Board extends Component {
  constructor(props) {
    super(props);

    this.addColumnContainer = React.createRef();
  }

  state = {
    status: {
      loading: false,
      success: { // for success resquest
        message: '',
        statusCode: undefined,
      },
      err: { // for resquest errors
        message: '',
        statusCode: undefined,
      },
      redirect: false, // If we can get access to a board then set this true to redirect to all boards page
    },
    popup: {
      isRenamePopupActive: false,
      isReadonlyPopupActive: false,
      isPrivatePopupActive: false,
      isMembersPopupActive: false,
      isMenuPopupActive: false,
    },
  }

  componentDidMount() {
    const { getBoard, token, match } = this.props;

    getBoard(token.token, match.params.id)
      .then((res) => {
        this.setState(state => ({
          ...state,
          status: {
            loading: false,
            success: {
              message: res.data.message,
              statusCode: res.status,
            },
            err: {
              message: '',
              statusCode: undefined,
            },
          },
        }));
      })
      .catch((err) => {
        console.log('error in board', err);

        this.handleError(err);
      });
  }

  componentDidUpdate() {
    const { state } = this;
    const {
      getBoard,
      token,
      match,
      board,
    } = this.props;

    if (!state.status.err.message && match.params.id !== board._id) {
      getBoard(token.token, match.params.id)
        .catch((err) => {
          console.log('error in board', err);

          this.handleError(err);
        });
    }
  }

  handlePopupBtnClick = (e, popupToClose) => {
    const popupType = popupToClose || e.target.dataset.popupType;

    this.setState((state) => {
      const newState = {
        ...state,
      };

      const targetPopupOpened = state.popup[popupType];

      for (const field in state.popup) {
        newState.popup[field] = false;
      }

      if (!targetPopupOpened) newState.popup[popupType] = !state.popup[popupType];

      return newState;
    });
  }

  updateMembers = () => {
    const { getMembers, board, token } = this.props;

    return getMembers(token.token, board._id)
      .then(() => console.log('members updated'))
      .catch((err) => {
        console.log('getMembers error', err);
        this.handleError(err);
      });
  }

  closeMessage = () => {
    this.setState(prevState => ({
      ...prevState,
      status: {
        ...prevState.status,
        err: {
          message: '',
          statusCode: undefined,
        },
        redirect: true,
      },
    }));
  }

  handleError = (err) => {
    this.setState(prevState => ({
      ...prevState,
      status: {
        loading: false,
        success: {
          message: '',
          statusCode: undefined,
        },
        err: {
          message: err.message,
          statusCode: err.status,
        },
      },
    }));
  }

  render() {
    const {
      props,
      state,
      handlePopupBtnClick,
      handleError,
      closeMessage,
    } = this;
    const {
      title,
      isReadOnly,
      isPrivate,
      members,
      owner,
      _id,
    } = props.board;

    if (state.status.redirect) return <Redirect to="/board/all" />;
    if (state.status.loading) return <Loader.PageLoader bg />;
    if (state.status.err.message) return <Messages.ErrorMessage message={state.status.err.message} closeMessage={closeMessage} />;

    return (
      <>
        <div className="board-container position-relative">
          <div className="board-controls-container d-flex flex-wrap align-items-center">

            <div className="board-control-item board-control-item-title">
              <button onClick={handlePopupBtnClick} data-popup-type="isRenamePopupActive" type="button" className={`board-control-button bg-transparent text-white border-0 nav-button board-title ${state.popup.isRenamePopupActive ? 'active' : ''}`}>{title}</button>
            </div>

            <div className="d-flex flex-wrap align-items-center board-control-item board-control-item-title board-control-access-item">
              <span className="board-control-item-divider" />
              <button onClick={handlePopupBtnClick} data-popup-type="isReadonlyPopupActive" type="button" className={`board-control-button bg-transparent text-white border-0 nav-button board-access ${state.popup.isReadonlyPopupActive ? 'active' : ''}`}>{isReadOnly ? 'Readonly' : 'Editable'}</button>
              <span className="board-control-item-divider" />
              <button onClick={handlePopupBtnClick} data-popup-type="isPrivatePopupActive" type="button" className={`board-control-button bg-transparent text-white border-0 nav-button board-access  ${state.popup.isPrivatePopupActive ? 'active' : ''}`}>{isPrivate ? 'Private' : 'Public'}</button>
              <span className="board-control-item-divider" />
            </div>

            <div className="d-flex flex-wrap align-items-center board-control-item board-control-item-title">
              <button onClick={handlePopupBtnClick} data-popup-type="isMembersPopupActive" type="button" className={`board-control-button bg-transparent text-white border-0 nav-button board-access ${state.popup.isMembersPopupActive ? 'active' : ''}`}>Members</button>
            </div>

            <div className="d-flex flex-wrap align-items-center ml-auto board-control-item board-control-item-title">
              <button onClick={handlePopupBtnClick} data-popup-type="isMenuPopupActive" type="button" className={`board-control-button bg-transparent text-white border-0 nav-button board-access ${state.popup.isMenuPopupActive ? 'active' : ''}`}>Menu</button>
            </div>


            {state.popup.isRenamePopupActive && (
              <PopupContainer removeElement={handlePopupBtnClick} closeBtn extraClasses={['board-controls-dropdown']}>
                <RenameBoardForm closePopup={(e) => { handlePopupBtnClick(e, 'isRenamePopupActive'); }} boardTitle={title} />
              </PopupContainer>
            )}

            {state.popup.isReadonlyPopupActive && (
              <PopupContainer removeElement={handlePopupBtnClick} closeBtn extraClasses={['board-controls-dropdown', 'board-controls-dropdown-readonly']}>
                <ReadonlyAccessBoardForm closePopup={(e) => { handlePopupBtnClick(e, 'isReadonlyPopupActive'); }} isReadOnly={isReadOnly} />
              </PopupContainer>
            )}

            {state.popup.isPrivatePopupActive && (
              <PopupContainer removeElement={handlePopupBtnClick} closeBtn extraClasses={['board-controls-dropdown', 'board-controls-dropdown-private']}>
                <PublicAccessBoardForm closePopup={(e) => { handlePopupBtnClick(e, 'isPrivatePopupActive'); }} isPrivate={isPrivate} />
              </PopupContainer>
            )}

            {state.popup.isMembersPopupActive && (
              <PopupContainer removeElement={handlePopupBtnClick} closeBtn extraClasses={['board-controls-dropdown', 'board-controls-dropdown-members']}>
                <MembersForm closePopup={(e) => { handlePopupBtnClick(e, 'isMembersPopupActive'); }} updateMembers={this.updateMembers} members={members} boardId={_id} ownerId={owner} />
              </PopupContainer>
            )}

            {/* {state.isMenuPopupActive && (
            <PopupContainer removeElement={handlePopupBtnClick} closeBtn classesToNotClosePopup={['members-board-input']} extraClasses={['board-controls-dropdown', 'board-controls-dropdown-members']}>
              <MembersForm members={members} />
            </PopupContainer>
          )} */}
          </div>

          <ColumnListContextProvider handleError={handleError}>
            <ColumnList />
          </ColumnListContextProvider>
        </div>
        {state.status.err.message && <Messages.ErrorMessage message={state.status.err.message} closeMessage={closeMessage} />}
      </>
    );
  }
}

const mapStateToProps = state => ({
  token: state.user.token,
  board: state.board,
});

const mapDispatchToProps = dispatch => ({
  getBoard: (token, boardId) => dispatch(boardActions.getBoard(token, boardId)),
  getMembers: (token, userId) => dispatch(boardActions.getMembers(token, userId)),
});


Board.propTypes = propTypes;


export default connect(mapStateToProps, mapDispatchToProps)(Board);
