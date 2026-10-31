import React from "react";
import "./App.css";
import AuthSlider from "./component/auth/AuthSlider";
import Dashboard from "./component/pages/Home";
import Contests from "./component/pages/Contests";
import Search from "./component/pages/Search";
import Profile from "./component/profile/Profile";
import TermsOfService from "./component/pages/TermsOfService";
import PrivacyPolicy from "./component/pages/PrivacyPolicy";
import AccountSettings from "./component/profile/AccountSettings";
import PlatformProfileSearch from "./component/pages/PlatformProfileSearch";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./component/auth/ProtectedRoute";
import PublicRoute from "./component/auth/PublicRoute";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            element={
              <PublicRoute>
                <AuthSlider />
              </PublicRoute>
            }
          >
            <Route path="/login" />
            <Route path="/signup" />
          </Route>
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:email"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account-settings"
            element={
              <ProtectedRoute>
                <AccountSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contests"
            element={
              <ProtectedRoute>
                <Contests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <Search />
              </ProtectedRoute>
            }
          />
          <Route
            path="/platform-search"
            element={
              <ProtectedRoute>
                <PlatformProfileSearch />
              </ProtectedRoute>
            }
          />
          <Route
            path="/platform-search/:platform"
            element={
              <ProtectedRoute>
                <PlatformProfileSearch />
              </ProtectedRoute>
            }
          />
          <Route
            path="/platform-search/:platform/:username"
            element={
              <ProtectedRoute>
                <PlatformProfileSearch />
              </ProtectedRoute>
            }
          />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
