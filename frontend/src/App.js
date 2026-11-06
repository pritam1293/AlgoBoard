import React from "react";
import "./App.css";
import AuthSlider from "./component/auth/AuthSlider";
import VerifyEmail from "./component/auth/VerifyEmail";
import VerificationSent from "./component/auth/VerificationSent";
import Dashboard from "./component/pages/Home";
import Contests from "./component/pages/Contests";
import Profile from "./component/profile/Profile";
import TermsOfService from "./component/pages/TermsOfService";
import PrivacyPolicy from "./component/pages/PrivacyPolicy";
import PlatformConnectionsPage from "./component/profile/PlatformConnectionsPage";
import ChangePasswordPage from "./component/profile/ChangePasswordPage";
import DeleteAccountPage from "./component/profile/DeleteAccountPage";
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
            path="/profile/:email/platforms"
            element={
              <ProtectedRoute>
                <PlatformConnectionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:email/platforms/:platform"
            element={
              <ProtectedRoute>
                <PlatformConnectionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:email/change-password"
            element={
              <ProtectedRoute>
                <ChangePasswordPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:email/delete-account"
            element={
              <ProtectedRoute>
                <DeleteAccountPage />
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
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/verify-email-sent" element={<VerificationSent />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
