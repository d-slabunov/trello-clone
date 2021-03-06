import React, { Component } from 'react';
import PropTypes from 'prop-types';
import '../../styles/searchInput.sass';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';


const propTypes = {
  hideSearchBtn: PropTypes.bool,
  hideCrossBtn: PropTypes.bool,
  textColor: PropTypes.string,
  inputValue: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
  classList: PropTypes.string,
  focusAfterCleared: PropTypes.bool,
  focusAfterActivated: PropTypes.bool,
};

const defaultProps = {
  hideSearchBtn: false,
  hideCrossBtn: false,
  textColor: '',
  placeholder: '',
  id: '',
  name: '',
  classList: '',
  focusAfterCleared: false,
  focusAfterActivated: false,
};


class TextInput extends Component {
  constructor(props) {
    super(props);

    this.inputElement = React.createRef();
    this.crossBtn = React.createRef();
    this.searchBtn = React.createRef();
  }

  componentDidMount() {
    const { props } = this;

    if (props.focusAfterActivated) this.inputElement.current.focus();
    if (props.selectOnMounted) this.inputElement.current.select();
  }

  onFocus = (e) => {
    const { props } = this;

    if (props.inputValue || (!props.inputValue && props.hideSearchBtn)) {
      this.searchBtn.current.classList.remove('active');
      this.crossBtn.current.classList.add('active');
    }

    if (props.onFocus) props.onFocus(e);
  }

  onBlur = (e) => {
    const { props } = this;

    if (!props.inputValue) {
      this.searchBtn.current.classList.add('active');
      this.crossBtn.current.classList.remove('active');
    }

    if (props.onBlur) props.onBlur(e);
  }

  onSearchBtnClick = () => {
    const { props } = this;

    if (props.onSearchBtnClick) props.onSearchBtnClick();
    this.inputElement.current.focus();
  }

  onCrossBtnClick = (e) => {
    const { props } = this;

    if (props.onCrossBtnClick) props.onCrossBtnClick(e);
    if (props.focusAfterCleared) this.inputElement.current.focus();
  }

  render() {
    const emptyValue = '';
    const { props } = this;
    const {
      hideSearchBtn,
      hideCrossBtn,
      textColor = emptyValue,
      inputValue = emptyValue,
      onChange,
      placeholder,
      id,
      name,
      classList,
    } = props;

    const {
      onFocus,
      onBlur,
      onCrossBtnClick,
      onSearchBtnClick,
    } = this;

    const crossBtnActive = inputValue ? 'active' : '';
    const searchBtnActive = !inputValue ? 'active' : '';

    return (
      <div className="search-input-container position-relative">
        <input
          ref={this.inputElement}
          style={{ color: textColor }}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          type="text"
          className={`nav-link ${classList}`}
          placeholder={placeholder || 'Search'}
          value={inputValue}
          id={id || ''}
          name={name || ''}
        />

        <div ref={this.crossBtn} className={`icon-container ${crossBtnActive}`}>
          <FontAwesomeIcon style={{ display: hideCrossBtn ? 'none' : '' }} onClick={onCrossBtnClick} className="dropdown-search-icon clear-input-button" icon={faTimes} />
        </div>

        <div ref={this.searchBtn} className={`icon-container ${searchBtnActive}`}>
          <FontAwesomeIcon style={{ display: hideSearchBtn ? 'none' : '' }} onClick={onSearchBtnClick} className="dropdown-search-icon search-button" icon={faSearch} />
        </div>
      </div>
    );
  }
}


TextInput.defaultProps = defaultProps;
TextInput.propTypes = propTypes;


export default TextInput;
