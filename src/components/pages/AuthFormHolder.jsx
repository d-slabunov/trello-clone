import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { isEmail } from 'validator';
import Loader from '../utils/Loader';
import actions from '../../actions/authActions';
import Messages from '../utils/Messages';


const propTypes = {
  switchForm: PropTypes.func.isRequired,
  authForm: PropTypes.func.isRequired,
  formActions: PropTypes.shape({
    signup: PropTypes.func.isRequired,
    login: PropTypes.func.isRequired,
    forgotPassword: PropTypes.func.isRequired,
  }).isRequired,
};


// I use this component with state that stores user input data in order to save data if user switches form
class AuthFormHolder extends Component {
  constructor(props) {
    super(props);

    this._mounted = false; // For preventing async actions if component unmounted
  }

  state = {
    userData: {
      email: '',
      nickname: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
    },
    status: {
      loading: false,
      success: { // for success resquests
        message: '',
        statusCode: undefined,
      },
      err: { // for resquests or validation errors
        message: '',
        statusCode: undefined,
      },
    },
  }

  componentDidMount() {
    this._mounted = true;
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  onChange = (e) => {
    const { target } = e;

    this.setState(state => ({
      ...state,
      userData: {
        ...state.userData,
        [target.name]: target.value,
      },
    }));
  }

  // Invoke this method in form components
  onSubmit = (e, formType) => {
    e.preventDefault();
    const { userData } = this.state;
    const message = this.validate(userData, formType);

    if (message) {
      this.setState(state => ({
        ...state,
        status: {
          ...state.status,
          err: {
            ...state.err,
            message,
          },
        },
      }));
      return;
    }

    // Handle form action
    switch (formType) {
      case 'SIGNUP':
        this.handleSignup(userData);
        break;
      case 'LOGIN':
        this.handleLogin(userData);
        break;
      case 'FORGOT_PASSWORD':
        this.handleForgotPassword(userData);
        break;

      default:
        break;
    }

    // Set loading state and show loader
    this.setState(state => ({
      ...state,
      status: {
        ...state.status,
        loading: true,
      },
    }));
  }

  // Handle signup form submition
  handleSignup = (userData) => {
    const { formActions } = this.props;
    const { signup } = formActions;

    signup(userData)
      .then((res) => {
        const { message } = res.data;

        this.setState(state => ({
          ...state,
          userData: {
            email: '',
            nickname: '',
            password: '',
            confirmPassword: '',
            firstName: '',
            lastName: '',
          },
          status: {
            loading: false,
            err: {
              message: '',
              statusCode: undefined,
            },
            success: {
              statusCode: res.status,
              message,
            },
          },
        }));
      })
      .catch((err) => {
        this.handleRequestError(err);
      });
  }

  // Handle login form submition
  handleLogin = (userData) => {
    const { formActions } = this.props;
    const { login } = formActions;

    login(userData)
      .then((res) => {
        if (!this._mounted) return; // Prevent unmounted component from async action like setState

        if (res.data.confirmed === false) { // If user is not confirmed tell him confirm his email
          const { message } = res.data;

          this.setState(state => ({
            ...state,
            status: {
              err: {
                ...state.status.err,
                statusCode: 200,
              },
              loading: false,
              success: {
                statusCode: res.status,
                message,
              },
            },
          }));
        } else { // If user is comfirmed and passed correct email and password then login
          this.setState(state => ({
            ...state,
            status: {
              err: {
                message: '',
                statusCode: undefined,
              },
              loading: false,
              success: {
                message: '',
                statusCode: undefined,
              },
            },
          }));
        }
      })
      .catch((err) => {
        this.handleRequestError(err);
      });
  }

  // Handle reset password form submition
  handleForgotPassword = (userData) => {
    const { formActions } = this.props;
    const { forgotPassword } = formActions;

    forgotPassword(userData)
      .then((res) => {
        const { message } = res.data;
        this.setState(state => ({
          ...state,
          status: {
            err: {
              ...state.status.err,
              statusCode: 200,
            },
            loading: false,
            success: {
              message,
              statusCode: undefined,
            },
          },
        }));
      })
      .catch((err) => {
        this.handleRequestError(err);
      });
  }

  handleRequestError = (err) => {
    this.setState(state => ({
      ...state,
      status: {
        ...state.status,
        loading: false,
        err: {
          statusCode: err.status,
          message: err.message,
        },
      },
    }));
  }

  // Validate inputs
  validate = ({ email, nickname, password, confirmPassword }, formType) => {
    if (!isEmail(email)) return 'Invalid email';

    switch (formType) {
      case 'SIGNUP':
        if (nickname === '') {
          return 'Nickname is required';
        }
        if (password.length < 8) {
          return 'Password is too short';
        }
        if (password !== confirmPassword) {
          return 'Password and confirmed password are different';
        }
        break;

      case 'LOGIN':
        if (password.length < 8) {
          return 'Password is too short';
        }
        break;

      default:
        break;
    }

    return '';
  }

  // Close info message and reset success and err state if it's needed - clearInputs flag
  closeMessage = (clearInputs) => {
    const userData = {
      email: '',
      nickname: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
    };

    const status = {
      success: {
        statusCode: undefined,
        message: '',
      },
      err: {
        statusCode: undefined,
        message: '',
      },
    };

    this.setState(state => (clearInputs ? { userData, status } : { ...state, status }));
  }

  render() {
    const {
      state,
      props,
      onChange,
      onSubmit,
      closeMessage,
    } = this;

    const { switchForm } = props;
    const { userData, status } = state;
    const { loading, err, success } = status;
    const AuthForm = props.authForm;

    return (
      <>
        <AuthForm switchForm={switchForm} userData={userData} err={err} formMethods={{ onChange, onSubmit }} />

        {/* If error occured show an error message */}
        {/* If user did not managed to login because he did confirm his email show info message */}
        {/* If operation seccessed (err have to not have a statusCode) show success message */}
        {err.message && <Messages.ErrorMessage message={err.message} closeMessage={closeMessage} />}
        {err.statusCode === 200 && <Messages.InfoMessage message={success.message} closeMessage={closeMessage} clearInputs />}
        {success.statusCode === 200 && !err.statusCode && <Messages.SuccessMessage message={success.message} closeMessage={closeMessage} clearInputs />}

        {loading && <Loader.FormLoader bg />}
      </>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  formActions: {
    signup: userData => dispatch(actions.signup(userData)),
    login: userData => dispatch(actions.login(userData)),
    forgotPassword: userData => dispatch(actions.forgotPassword(userData)),
  },
});


AuthFormHolder.propTypes = propTypes;


export default connect(null, mapDispatchToProps)(AuthFormHolder);
