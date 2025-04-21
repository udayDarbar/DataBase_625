import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import './App.css';
import { ROUTES } from './config/Routes';
import Layout from './components/common/Layout/Layout';
import { UserProvider } from './contexts/UserContext';
import { cleanClerkUrlParams } from './utils/clerkUtils';

function App() {
  // Call the utility function
  cleanClerkUrlParams();

  return (
    <UserProvider>
      <Router>
        <Routes>
          {/* Publicly declared login/sign-up routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/sign-up" element={<Signup />} />

          {/* Default route */}
          <Route
            path="/"
            element={
              <>
                <SignedIn>
                  <Navigate to="/dashboard" replace />
                </SignedIn>
                <SignedOut>
                  <Navigate to="/login" replace />
                </SignedOut>
              </>
            }
          />

          {/* Protected application routes */}
          <Route
            path="/*"
            element={
              <>
                <SignedIn>
                  <Layout>
                    <Routes>
                      {/* Dynamic routes from ROUTES object */}
                      {Object.values(ROUTES).map(({ path, element: Element }) => (
                        <Route key={path} path={path} element={<Element />} />
                      ))}
                      
                      {/* No "not found" route for now */}
                    </Routes>
                  </Layout>
                </SignedIn>
                <SignedOut>
                  <Navigate to="/login" replace />
                </SignedOut>
              </>
            }
          />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;