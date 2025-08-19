import { useState, useCallback, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import userService from "../services/userService";

export const usePlatformConnection = () => {
  const { user, updateUser } = useAuth();
  const [platformStates, setPlatformStates] = useState({});
  const [globalMessages, setGlobalMessages] = useState({});

  // Update state for a specific platform
  const updatePlatformState = useCallback((platformId, updates) => {
    setPlatformStates((prev) => ({
      ...prev,
      [platformId]: { ...prev[platformId], ...updates },
    }));
  }, []);

  // Update global success messages
  const updateGlobalMessage = useCallback((platformId, message) => {
    setGlobalMessages((prev) => ({
      ...prev,
      [platformId]: message,
    }));
  }, []);

  // Auto-clear global messages after 3 seconds
  useEffect(() => {
    Object.entries(globalMessages).forEach(([platformId, message]) => {
      if (message) {
        const timer = setTimeout(() => {
          setGlobalMessages((prev) => ({
            ...prev,
            [platformId]: "",
          }));
        }, 3000);
        return () => clearTimeout(timer);
      }
    });
  }, [globalMessages]);

  // Connect platform function
  const connectPlatform = useCallback(
    async (platform, username) => {
      updatePlatformState(platform.id, {
        loading: true,
        message: "",
        messageType: "",
      });

      try {
        // Create payload with only the relevant platform field
        const payload = {
          username: user?.username ?? "",
          codeforcesId: platform.id === "codeforces" ? username : null,
          atcoderId: platform.id === "atcoder" ? username : null,
          codechefId: platform.id === "codechef" ? username : null,
          leetcodeId: platform.id === "leetcode" ? username : null,
        };

        await userService.addCPPlatform(payload);

        // Update user context with new username
        updateUser({
          ...user,
          [platform.usernameField]: username,
        });

        // Update platform state
        updatePlatformState(platform.id, {
          loading: false,
          message: `${platform.name} account connected successfully!`,
          messageType: "success",
          dropdownOpen: false,
          input: "",
        });

        // Set global success message
        updateGlobalMessage(
          platform.id,
          `${platform.name} account connected successfully!`
        );
      } catch (error) {
        updatePlatformState(platform.id, {
          loading: false,
          message: `Error connecting ${platform.name} account!`,
          messageType: "error",
        });
      }
    },
    [user, updateUser, updatePlatformState, updateGlobalMessage]
  );

  // Check if platform is connected
  const isPlatformConnected = useCallback(
    (platform) => {
      return Boolean(user?.[platform.usernameField]);
    },
    [user]
  );

  // Handle dropdown toggle
  const toggleDropdown = useCallback(
    (platformId, isOpen = null) => {
      updatePlatformState(platformId, {
        dropdownOpen:
          isOpen !== null ? isOpen : !platformStates[platformId]?.dropdownOpen,
        input: "",
        message: "",
        messageType: "",
      });
    },
    [platformStates, updatePlatformState]
  );

  // Handle input change
  const updateInput = useCallback(
    (platformId, value) => {
      updatePlatformState(platformId, { input: value });
    },
    [updatePlatformState]
  );

  // Handle cancel action
  const cancelConnection = useCallback(
    (platformId) => {
      updatePlatformState(platformId, {
        dropdownOpen: false,
        input: "",
        message: "",
        messageType: "",
      });
    },
    [updatePlatformState]
  );

  return {
    platformStates,
    globalMessages,
    updatePlatformState,
    connectPlatform,
    isPlatformConnected,
    toggleDropdown,
    updateInput,
    cancelConnection,
  };
};
