"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function SignInPage() {
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleGoogleSignIn = () => {
  };

  const handleFacebookSignIn = () => {
  };

  return (
    <div className="signin-page">
      <div className="header-section">
        <div className="logo-container">
          <Image
            src="https://api.builder.io/api/v1/image/assets/TEMP/b1cde45ef9298eb26a0bff4e422bb36f8d7bec37?width=566"
            alt="TalentMatch Logo"
            width={283}
            height={283}
            className="brand-logo"
          />
        </div>
        <h1 className="brand-name">TalentMatch</h1>
        <p className="tagline">
          Discover and connect with talented people to build the perfect team
        </p>
      </div>

      <div className="content-section">
        <h2 className="page-title">Sign In</h2>
        <p className="welcome-text">Welcome to Talent Match</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label htmlFor="email" className="input-label">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="yourmail@gmail.com"
              className="text-input email-input"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password" className="input-label">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="************"
              className="text-input password-input"
            />
          </div>

          <div className="remember-section">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="remember-checkbox"
            />
            <label htmlFor="remember" className="remember-label">Remember me</label>
          </div>

          <button type="submit" className="primary-button">
            Sign In
          </button>
        </form>

        <p className="social-divider">Or sign in with</p>

        <div className="social-auth-buttons">
          <button onClick={handleGoogleSignIn} className="social-auth-button google-button">
            Google
          </button>
          <button onClick={handleFacebookSignIn} className="social-auth-button facebook-button">
            Facebook
          </button>
        </div>

        <p className="account-prompt">
          Don t have an account? <Link href="/signup" className="signup-link">Sign Up</Link>
        </p>
      </div>

      <style jsx>{`
        .signin-page {
          min-height: 100vh;
          background: #F8F9FD;
          padding: 23px 100px 0;
          font-family: var(--font-nunito), Nunito, -apple-system, Roboto, Helvetica, sans-serif;
        }

        .header-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 201px;
        }

        .logo-container {
          width: 283px;
          height: 283px;
          margin-bottom: 20px;
        }

        .brand-logo {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .brand-name {
          font-size: 64px;
          font-weight: 700;
          line-height: 20px;
          text-align: center;
          background: linear-gradient(135deg, #14ADD6 0%, #384295 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 61px 0;
        }

        .tagline {
          font-size: 14px;
          font-weight: 400;
          line-height: 24px;
          color: #262626;
          text-align: center;
          max-width: 454px;
          margin: 0;
        }

        .content-section {
          max-width: 1239px;
          margin: 0 auto;
        }

        .page-title {
          font-size: 64px;
          font-weight: 700;
          line-height: 20px;
          color: #000;
          margin: 0 0 61px 0;
        }

        .welcome-text {
          font-size: 24px;
          font-weight: 400;
          line-height: 24px;
          color: #898989;
          margin: 0 0 71px 0;
        }

        .auth-form {
          width: 100%;
          margin-bottom: 0;
        }

        .input-group {
          margin-bottom: 67px;
        }

        .input-label {
          display: block;
          font-size: 24px;
          font-weight: 400;
          line-height: 24px;
          color: #262626;
          margin-bottom: 16px;
        }

        .text-input {
          width: 100%;
          height: 68px;
          padding: 0 32px;
          border-radius: 18px;
          background: #EAEAEA;
          border: none;
          font-size: 24px;
          font-weight: 400;
          line-height: 24px;
          color: #262626;
          font-family: var(--font-nunito), Nunito, -apple-system, Roboto, Helvetica, sans-serif;
        }

        .text-input::placeholder {
          color: #898989;
        }

        .email-input::placeholder {
          text-decoration: underline;
        }

        .text-input:focus {
          outline: none;
        }

        .remember-section {
          display: flex;
          align-items: center;
          margin-bottom: 85px;
        }

        .remember-checkbox {
          width: 31px;
          height: 34px;
          border-radius: 3px;
          border: 1px solid #000;
          background: transparent;
          cursor: pointer;
          margin: 0 15px 0 0;
          flex-shrink: 0;
        }

        .remember-label {
          font-size: 24px;
          font-weight: 400;
          line-height: 24px;
          color: #262626;
          cursor: pointer;
        }

        .primary-button {
          width: 100%;
          height: 68px;
          border-radius: 18px;
          background: #3567FF;
          border: none;
          font-size: 24px;
          font-weight: 400;
          line-height: 24px;
          color: #F8F9FD;
          text-align: center;
          text-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
          cursor: pointer;
          margin-bottom: 85px;
          font-family: var(--font-nunito), Nunito, -apple-system, Roboto, Helvetica, sans-serif;
        }

        .primary-button:hover {
          opacity: 0.95;
        }

        .social-divider {
          font-size: 24px;
          font-weight: 400;
          line-height: 24px;
          color: #898989;
          text-align: center;
          margin: 0 0 57px 0;
        }

        .social-auth-buttons {
          display: flex;
          gap: 19px;
          margin-bottom: 68px;
        }

        .social-auth-button {
          flex: 1;
          height: 68px;
          border-radius: 18px;
          border: 1px solid #000;
          background: rgba(234, 234, 234, 0);
          font-size: 24px;
          font-weight: 400;
          line-height: 24px;
          color: #000;
          text-align: center;
          cursor: pointer;
          font-family: var(--font-nunito), Nunito, -apple-system, Roboto, Helvetica, sans-serif;
        }

        .social-auth-button:hover {
          background: rgba(234, 234, 234, 0.2);
        }

        .account-prompt {
          font-size: 24px;
          font-weight: 400;
          line-height: 24px;
          color: #898989;
          text-align: center;
          margin: 0;
        }

        .signup-link {
          color: #3567FF;
          text-decoration: none;
        }

        .signup-link:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .signin-page {
            padding: 20px;
          }

          .header-section {
            margin-bottom: 80px;
          }

          .brand-name {
            font-size: 48px;
            margin-bottom: 30px;
          }

          .page-title {
            font-size: 48px;
          }

          .logo-container {
            width: 200px;
            height: 200px;
          }

          .social-auth-buttons {
            flex-direction: column;
            gap: 16px;
          }

          .input-label,
          .remember-label,
          .text-input,
          .primary-button,
          .social-auth-button,
          .social-divider,
          .account-prompt,
          .welcome-text {
            font-size: 18px;
          }

          .text-input,
          .primary-button,
          .social-auth-button {
            height: 56px;
          }

          .remember-checkbox {
            width: 24px;
            height: 24px;
          }

          .input-group {
            margin-bottom: 40px;
          }

          .remember-section {
            margin-bottom: 50px;
          }

          .primary-button {
            margin-bottom: 50px;
          }

          .social-divider {
            margin-bottom: 30px;
          }

          .social-auth-buttons {
            margin-bottom: 40px;
          }
        }
      `}</style>
    </div>
  );
}
 
