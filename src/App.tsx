import React from 'react';
import CommandChecker from './components/CommandChecker';

const App: React.FC = () => {
  return (
    <div className="container-fluid min-vh-100 bg-light">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-10 col-xl-8">
            <header className="text-center mb-5">
              <h1 className="display-4 fw-bold text-primary">CMDC</h1>
              <p className="lead text-muted">
                Enter a command below to have AI analyze it and determine if it's safe to execute
              </p>
            </header>

            <CommandChecker />

            <footer className="mt-5 pt-4 border-top text-center text-muted">
              <p>Powered by Google Gemini AI • Always verify critical commands before execution</p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;