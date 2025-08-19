import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../common/Navbar";
import BackButton from "../common/BackButton";
import { useAuth } from "../../context/AuthContext";
import { usePlatformConnection } from "../../hooks/usePlatformConnection";
import UserInfo from "./UserInfo";
import PlatformConnections from "./PlatformConnections";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const {
    platformStates,
    globalMessages,
    connectPlatform,
    isPlatformConnected,
    toggleDropdown,
    updateInput,
    cancelConnection,
  } = usePlatformConnection();
  return (
    <div className="min-h-screen bg-neutral-900">
      <Navbar user={user} onLogout={logout} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton onBack={() => navigate("/home")} />
        <UserInfo user={user} />
        <PlatformConnections
          user={user}
          platformStates={platformStates}
          globalMessages={globalMessages}
          onConnect={connectPlatform}
          onToggleDropdown={toggleDropdown}
          onUpdateInput={updateInput}
          onCancel={cancelConnection}
          isPlatformConnected={isPlatformConnected}
        />
      </div>
    </div>
  );
};

export default Profile;
