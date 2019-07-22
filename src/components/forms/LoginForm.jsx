import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const LoginForm = (props) => {
  const [mounted, setMounted] = useState(false);

  const { formMethods, userData, switchForm } = props;
  const { onChange, onSubmit } = formMethods;
  const {
    email,
    password,
  } = userData;

  // Fadein component
  setTimeout(() => setMounted(true), 50);

  return (
    <form action="" onSubmit={onSubmit} className={`mb-3 ${mounted && 'active'}`}>
      <label htmlFor="email" className="d-block w-100">
        <input onChange={onChange} type="email" name="email" id="email" className="w-100 px-2" value={email} />
        <span className="form-label-text">Email</span>
      </label>

      <label htmlFor="password" className="d-block w-100">
        <input onChange={onChange} type="password" name="password" id="password" className="w-100 px-2" value={password} />
        <span className="form-label-text">Password</span>
      </label>

      <button type="submit" className="btn btn-primary btn-block mt-4 mb-3">Log in</button>

      <Link to="/" onClick={(e) => { e.preventDefault(); switchForm({ resetPassword: true }); }}>Forgor password</Link>
    </form>
  );
};

export default LoginForm;