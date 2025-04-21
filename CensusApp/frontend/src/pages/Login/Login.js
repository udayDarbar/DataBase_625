import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import Footer from '../../components/common/footer/Footer';
import './Login.css';

function Login() {
  return (
    <>
      <div className="login-wrapper">
        <div className="login-page-container">
          <main className="login-main">
            <SignIn signUpUrl="/sign-up" />
          </main>
        </div>
        <Footer />
      </div>
    </>
  );
}

export default Login;