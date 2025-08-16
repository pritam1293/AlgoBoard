import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../common/Navbar";
import { useAuth } from "../../context/AuthContext";
import userService from "../../services/userService";

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cfMessage, setCFMessage] = useState("");
  const [cfMessageType, setCFMessageType] = useState(""); // "success" or "error"
  const [cfGlobalMessage, setCFGlobalMessage] = useState("");
  const [atcoderDropdownOpen, setAtcoderDropdownOpen] = useState(false);
  const [atcoderInput, setAtcoderInput] = useState("");
  const [atcoderLoading, setAtcoderLoading] = useState(false);
  const [atcoderMessage, setAtcoderMessage] = useState("");
  const [atcoderMessageType, setAtcoderMessageType] = useState("");
  const [atcoderGlobalMessage, setAtcoderGlobalMessage] = useState("");
  const [codechefDropdownOpen, setCodechefDropdownOpen] = useState(false);
  const [codechefInput, setCodechefInput] = useState("");
  const [codechefLoading, setCodechefLoading] = useState(false);
  const [codechefMessage, setCodechefMessage] = useState("");
  const [codechefMessageType, setCodechefMessageType] = useState("");
  const [codechefGlobalMessage, setCodechefGlobalMessage] = useState("");
  const [leetcodeDropdownOpen, setLeetcodeDropdownOpen] = useState(false);
  const [leetcodeInput, setLeetcodeInput] = useState("");
  const [leetcodeLoading, setLeetcodeLoading] = useState(false);
  const [leetcodeMessage, setLeetcodeMessage] = useState("");
  const [leetcodeMessageType, setLeetcodeMessageType] = useState("");
  const [leetcodeGlobalMessage, setLeetcodeGlobalMessage] = useState("");
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Check if platforms are already connected
  const isCFConnected = Boolean(user?.codeforcesUsername);
  const isAtcoderConnected = Boolean(user?.atcoderUsername);
  const isCodechefConnected = Boolean(user?.codechefUsername);
  const isLeetcodeConnected = Boolean(user?.leetcodeUsername);
  
  useEffect(() => {
    if (codechefGlobalMessage) {
      const timer = setTimeout(() => setCodechefGlobalMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [codechefGlobalMessage]);

  useEffect(() => {
    if (leetcodeGlobalMessage) {
      const timer = setTimeout(() => setLeetcodeGlobalMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [leetcodeGlobalMessage]);

  const handleSubmit = async () => {
    if (!username.trim()) return;

    setIsLoading(true);
    setCFMessage("");
    setCFMessageType("");
    try {
      await userService.addCPPlatform({
        username: String(user?.username ?? ""),
        codeforcesId: String(username.trim()),
        codechefId: null,
        atcoderId: null,
        leetcodeId: null,
      });
      setIsDropdownOpen(false);
      setUsername("");
      setCFMessage("Codeforces account connected successfully!");
      setCFMessageType("success");
      setCFGlobalMessage("Codeforces account connected successfully!");
      // Immediately update user context so button stays Connected forever
      updateUser({ ...user, codeforcesUsername: username.trim() });
    } catch (error) {
      setCFMessage("Error connecting Codeforces account!");
      setCFMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (cfGlobalMessage) {
      const timer = setTimeout(() => setCFGlobalMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [cfGlobalMessage]);

  useEffect(() => {
    if (atcoderGlobalMessage) {
      const timer = setTimeout(() => setAtcoderGlobalMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [atcoderGlobalMessage]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleConnect = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleCancel = () => {
    setIsDropdownOpen(false);
    setUsername("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900">
      <Navbar user={user} onLogout={logout} />


      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back to Home Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/home")}
            className="flex items-center text-neutral-400 hover:text-white transition duration-200"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Home
          </button>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white text-2xl font-bold">
                    {user?.firstName?.[0]?.toUpperCase() || "?"}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  {/* <p className="text-0.3xl font-semibold text-white">@{user?.username}</p> */}
                  {/* <p className="text-0.3xl font-semibold text-white">{user?.email}</p> */}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  First Name
                </label>
                <p className="text-white py-2">{user?.firstName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Last Name
                </label>
                <p className="text-white py-2">{user?.lastName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Username
                </label>
                <p className="text-white py-2">@{user?.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Email
                </label>
                <p className="text-white py-2">{user?.email}</p>
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center">
                  <div
                    className={`mr-2 w-4 h-4 rounded ${
                      user?.student ? "bg-blue-600" : "bg-neutral-600"
                    }`}
                  >
                    {user?.student && (
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm font-medium text-neutral-300">
                    STUDENT
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Connections */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
            <h3 className="text-xl font-semibold text-white mb-4">
              Platform Connections
            </h3>
            {cfGlobalMessage && (
              <div className="mb-4 text-green-400 text-sm font-semibold">
                {cfGlobalMessage}
              </div>
            )}
            {atcoderGlobalMessage && (
              <div className="mb-4 text-green-400 text-sm font-semibold">
                {atcoderGlobalMessage}
              </div>
            )}
            {codechefGlobalMessage && (
              <div className="mb-4 text-green-400 text-sm font-semibold">
                {codechefGlobalMessage}
              </div>
            )}
            {leetcodeGlobalMessage && (
              <div className="mb-4 text-green-400 text-sm font-semibold">
                {leetcodeGlobalMessage}
              </div>
            )}
            <p className="text-neutral-400 mb-4">
              Connect your competitive programming accounts to track your
              progress
            </p>

            <div className="flex flex-col gap-4 w-full">
              {/* Codeforces */}
              <div className="relative">
                <div className="flex items-center justify-between p-4 bg-neutral-700 rounded-lg w-full">
                  <div className="flex items-center gap-3">
                    <img
                      src="/images/platforms/codeforces_logo.png"
                      alt="Codeforces"
                      className="w-8 h-8 mr-3"
                    />
                    <span className="text-white">Codeforces</span>
                    {(isCFConnected || cfGlobalMessage) && (
                      <span className="px-3 py-1 bg-green-600 text-green-200 font-semibold text-sm rounded cursor-not-allowed ml-2">
                        Connected
                      </span>
                    )}
                  </div>
                  {isCFConnected || cfGlobalMessage ? (
                    <button
                      onClick={() => {
                        setIsDropdownOpen(true);
                        setUsername("");
                        setCFMessage("");
                        setCFMessageType("");
                      }}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition duration-200 ml-2"
                      disabled={!!cfGlobalMessage}
                    >
                      Change Username?
                    </button>
                  ) : (
                    <button
                      ref={buttonRef}
                      onClick={handleConnect}
                      className={`px-3 py-1 text-white text-sm rounded transition duration-200 ${
                        cfGlobalMessage
                          ? "bg-green-600 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                      disabled={!!cfGlobalMessage}
                    >
                      Connect
                    </button>
                  )}
                </div>

                {/* Dropdown for Codeforces username input (for both connect and change) */}
                {isDropdownOpen && (
                  <div
                    ref={dropdownRef}
                    className="mt-2 bg-neutral-700 rounded-lg border border-neutral-600 p-4 shadow-lg"
                  >
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Codeforces Username
                      </label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Enter your Codeforces username"
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autoFocus
                        disabled={isLoading}
                      />
                    </div>
                    {cfMessage && (
                      <div
                        className={`mb-2 text-sm ${
                          cfMessageType === "success"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {cfMessage}
                      </div>
                    )}
                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-neutral-400 hover:text-white transition duration-200"
                        disabled={isLoading}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={!username.trim() || isLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200 disabled:bg-neutral-600 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <svg
                              className="w-4 h-4 animate-spin"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                            Saving...
                          </>
                        ) : (
                          "Save"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* AtCoder */}
              <div className="relative">
                <div className="flex items-center justify-between p-4 bg-neutral-700 rounded-lg w-full">
                  <div className="flex items-center gap-3">
                    <img
                      src="/images/platforms/atcoder_logo.png"
                      alt="AtCoder"
                      className="w-8 h-8 mr-3"
                    />
                    <span className="text-white">AtCoder</span>
                    {(isAtcoderConnected || atcoderGlobalMessage) && (
                      <span className="px-3 py-1 bg-green-600 text-green-200 font-semibold text-sm rounded cursor-not-allowed ml-2">
                        Connected
                      </span>
                    )}
                  </div>
                  {isAtcoderConnected || atcoderGlobalMessage ? (
                    <button
                      onClick={() => {
                        setAtcoderDropdownOpen(true);
                        setAtcoderInput("");
                        setAtcoderMessage("");
                        setAtcoderMessageType("");
                      }}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition duration-200 ml-2"
                      disabled={!!atcoderGlobalMessage}
                    >
                      Change Username?
                    </button>
                  ) : (
                    <button
                      onClick={() => setAtcoderDropdownOpen(true)}
                      className={`px-3 py-1 text-white text-sm rounded transition duration-200 ${
                        atcoderGlobalMessage
                          ? "bg-green-600 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                      disabled={!!atcoderGlobalMessage}
                    >
                      Connect
                    </button>
                  )}
                </div>
                {atcoderDropdownOpen && (
                  <div className="mt-2 bg-neutral-700 rounded-lg border border-neutral-600 p-4 shadow-lg">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        AtCoder Username
                      </label>
                      <input
                        type="text"
                        value={atcoderInput}
                        onChange={(e) => setAtcoderInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            // Trigger the same logic as the Save button
                            if (!atcoderInput.trim()) return;
                            setAtcoderLoading(true);
                            setAtcoderMessage("");
                            setAtcoderMessageType("");
                            userService.addCPPlatform({
                              username: String(user?.username ?? ""),
                              codeforcesId: null,
                              codechefId: null,
                              atcoderId: String(atcoderInput.trim()),
                              leetcodeId: null,
                            }).then(() => {
                              setAtcoderDropdownOpen(false);
                              setAtcoderInput("");
                              setAtcoderMessage("AtCoder account connected successfully!");
                              setAtcoderMessageType("success");
                              setAtcoderGlobalMessage("AtCoder account connected successfully!");
                              updateUser({
                                ...user,
                                atcoderUsername: atcoderInput.trim(),
                              });
                            }).catch(() => {
                              setAtcoderMessage("Error connecting AtCoder account!");
                              setAtcoderMessageType("error");
                            }).finally(() => {
                              setAtcoderLoading(false);
                            });
                          } else if (e.key === "Escape") {
                            setAtcoderDropdownOpen(false);
                            setAtcoderInput("");
                            setAtcoderMessage("");
                            setAtcoderMessageType("");
                          }
                        }}
                        placeholder="Enter your AtCoder username"
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autoFocus
                        disabled={atcoderLoading}
                      />
                    </div>
                    {atcoderMessage && (
                      <div
                        className={`mb-2 text-sm ${
                          atcoderMessageType === "success"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {atcoderMessage}
                      </div>
                    )}
                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() => {
                          setAtcoderDropdownOpen(false);
                          setAtcoderInput("");
                          setAtcoderMessage("");
                          setAtcoderMessageType("");
                        }}
                        className="px-4 py-2 text-neutral-400 hover:text-white transition duration-200"
                        disabled={atcoderLoading}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          if (!atcoderInput.trim()) return;
                          setAtcoderLoading(true);
                          setAtcoderMessage("");
                          setAtcoderMessageType("");
                          try {
                            await userService.addCPPlatform({
                              username: String(user?.username ?? ""),
                              codeforcesId: null,
                              codechefId: null,
                              atcoderId: String(atcoderInput.trim()),
                              leetcodeId: null,
                            });
                            setAtcoderDropdownOpen(false);
                            setAtcoderInput("");
                            setAtcoderMessage(
                              "AtCoder account connected successfully!"
                            );
                            setAtcoderMessageType("success");
                            setAtcoderGlobalMessage(
                              "AtCoder account connected successfully!"
                            );
                            updateUser({
                              ...user,
                              atcoderUsername: atcoderInput.trim(),
                            });
                          } catch (error) {
                            setAtcoderMessage(
                              "Error connecting AtCoder account!"
                            );
                            setAtcoderMessageType("error");
                          } finally {
                            setAtcoderLoading(false);
                          }
                        }}
                        disabled={!atcoderInput.trim() || atcoderLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200 disabled:bg-neutral-600 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {atcoderLoading ? (
                          <>
                            <svg
                              className="w-4 h-4 animate-spin"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                            Saving...
                          </>
                        ) : (
                          "Save"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* CodeChef - Fixed */}
              <div className="relative">
                <div className="flex items-center justify-between p-4 bg-neutral-700 rounded-lg w-full">
                  <div className="flex items-center gap-3">
                    <img
                      src="/images/platforms/codechef_logo.jpg"
                      alt="CodeChef"
                      className="w-8 h-8 mr-3 rounded"
                    />
                    <span className="text-white">CodeChef</span>
                    {(isCodechefConnected || codechefGlobalMessage) && (
                      <span className="px-3 py-1 bg-green-600 text-green-200 font-semibold text-sm rounded cursor-not-allowed ml-2">
                        Connected
                      </span>
                    )}
                  </div>
                  {isCodechefConnected || codechefGlobalMessage ? (
                    <button
                      onClick={() => {
                        setCodechefDropdownOpen(true);
                        setCodechefInput("");
                        setCodechefMessage("");
                        setCodechefMessageType("");
                      }}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition duration-200 ml-2"
                      disabled={!!codechefGlobalMessage}
                    >
                      Change Username?
                    </button>
                  ) : (
                    <button
                      onClick={() => setCodechefDropdownOpen(true)}
                      className={`px-3 py-1 text-white text-sm rounded transition duration-200 ${
                        codechefGlobalMessage
                          ? "bg-green-600 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                      disabled={!!codechefGlobalMessage}
                    >
                      Connect
                    </button>
                  )}
                </div>
                {codechefDropdownOpen && (
                  <div className="mt-2 bg-neutral-700 rounded-lg border border-neutral-600 p-4 shadow-lg">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        CodeChef Username
                      </label>
                      <input
                        type="text"
                        value={codechefInput}
                        onChange={(e) => setCodechefInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            // Trigger the same logic as the Save button
                            if (!codechefInput.trim()) return;
                            setCodechefLoading(true);
                            setCodechefMessage("");
                            setCodechefMessageType("");
                            userService.addCPPlatform({
                              username: String(user?.username ?? ""),
                              codeforcesId: null,
                              codechefId: String(codechefInput.trim()),
                              atcoderId: null,
                              leetcodeId: null,
                            }).then(() => {
                              setCodechefDropdownOpen(false);
                              setCodechefInput("");
                              setCodechefMessage("CodeChef account connected successfully!");
                              setCodechefMessageType("success");
                              setCodechefGlobalMessage("CodeChef account connected successfully!");
                              updateUser({
                                ...user,
                                codechefUsername: codechefInput.trim(),
                              });
                            }).catch(() => {
                              setCodechefMessage("Error connecting CodeChef account!");
                              setCodechefMessageType("error");
                            }).finally(() => {
                              setCodechefLoading(false);
                            });
                          } else if (e.key === "Escape") {
                            setCodechefDropdownOpen(false);
                            setCodechefInput("");
                            setCodechefMessage("");
                            setCodechefMessageType("");
                          }
                        }}
                        placeholder="Enter your CodeChef username"
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autoFocus
                        disabled={codechefLoading}
                      />
                    </div>
                    {codechefMessage && (
                      <div
                        className={`mb-2 text-sm ${
                          codechefMessageType === "success"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {codechefMessage}
                      </div>
                    )}
                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() => {
                          setCodechefDropdownOpen(false);
                          setCodechefInput("");
                          setCodechefMessage("");
                          setCodechefMessageType("");
                        }}
                        className="px-4 py-2 text-neutral-400 hover:text-white transition duration-200"
                        disabled={codechefLoading}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          if (!codechefInput.trim()) return;
                          setCodechefLoading(true);
                          setCodechefMessage("");
                          setCodechefMessageType("");
                          try {
                            await userService.addCPPlatform({
                              username: String(user?.username ?? ""),
                              codeforcesId: null,
                              codechefId: String(codechefInput.trim()),
                              atcoderId: null,
                              leetcodeId: null,
                            });
                            setCodechefDropdownOpen(false);
                            setCodechefInput("");
                            setCodechefMessage(
                              "CodeChef account connected successfully!"
                            );
                            setCodechefMessageType("success");
                            setCodechefGlobalMessage(
                              "CodeChef account connected successfully!"
                            );
                            updateUser({
                              ...user,
                              codechefUsername: codechefInput.trim(),
                            });
                          } catch (error) {
                            setCodechefMessage(
                              "Error connecting CodeChef account!"
                            );
                            setCodechefMessageType("error");
                          } finally {
                            setCodechefLoading(false);
                          }
                        }}
                        disabled={!codechefInput.trim() || codechefLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200 disabled:bg-neutral-600 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {codechefLoading ? (
                          <>
                            <svg
                              className="w-4 h-4 animate-spin"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                            Saving...
                          </>
                        ) : (
                          "Save"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* LeetCode - Fixed */}
              <div className="relative">
                <div className="flex items-center justify-between p-4 bg-neutral-700 rounded-lg w-full">
                  <div className="flex items-center gap-3">
                    <img
                      src="/images/platforms/LeetCode_logo.png"
                      alt="LeetCode"
                      className="w-8 h-8 mr-3"
                    />
                    <span className="text-white">LeetCode</span>
                    {(isLeetcodeConnected || leetcodeGlobalMessage) && (
                      <span className="px-3 py-1 bg-green-600 text-green-200 font-semibold text-sm rounded cursor-not-allowed ml-2">
                        Connected
                      </span>
                    )}
                  </div>
                  {isLeetcodeConnected || leetcodeGlobalMessage ? (
                    <button
                      onClick={() => {
                        setLeetcodeDropdownOpen(true);
                        setLeetcodeInput("");
                        setLeetcodeMessage("");
                        setLeetcodeMessageType("");
                      }}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition duration-200 ml-2"
                      disabled={!!leetcodeGlobalMessage}
                    >
                      Change Username?
                    </button>
                  ) : (
                    <button
                      onClick={() => setLeetcodeDropdownOpen(true)}
                      className={`px-3 py-1 text-white text-sm rounded transition duration-200 ${
                        leetcodeGlobalMessage
                          ? "bg-green-600 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                      disabled={!!leetcodeGlobalMessage}
                    >
                      Connect
                    </button>
                  )}
                </div>
                {leetcodeDropdownOpen && (
                  <div className="mt-2 bg-neutral-700 rounded-lg border border-neutral-600 p-4 shadow-lg">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        LeetCode Username
                      </label>
                      <input
                        type="text"
                        value={leetcodeInput}
                        onChange={(e) => setLeetcodeInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            // Trigger the same logic as the Save button
                            if (!leetcodeInput.trim()) return;
                            setLeetcodeLoading(true);
                            setLeetcodeMessage("");
                            setLeetcodeMessageType("");
                            userService.addCPPlatform({
                              username: String(user?.username ?? ""),
                              codeforcesId: null,
                              codechefId: null,
                              atcoderId: null,
                              leetcodeId: String(leetcodeInput.trim()),
                            }).then(() => {
                              setLeetcodeDropdownOpen(false);
                              setLeetcodeInput("");
                              setLeetcodeMessage("LeetCode account connected successfully!");
                              setLeetcodeMessageType("success");
                              setLeetcodeGlobalMessage("LeetCode account connected successfully!");
                              updateUser({
                                ...user,
                                leetcodeUsername: leetcodeInput.trim(),
                              });
                            }).catch(() => {
                              setLeetcodeMessage("Error connecting LeetCode account!");
                              setLeetcodeMessageType("error");
                            }).finally(() => {
                              setLeetcodeLoading(false);
                            });
                          } else if (e.key === "Escape") {
                            setLeetcodeDropdownOpen(false);
                            setLeetcodeInput("");
                            setLeetcodeMessage("");
                            setLeetcodeMessageType("");
                          }
                        }}
                        placeholder="Enter your LeetCode username"
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autoFocus
                        disabled={leetcodeLoading}
                      />
                    </div>
                    {leetcodeMessage && (
                      <div
                        className={`mb-2 text-sm ${
                          leetcodeMessageType === "success"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {leetcodeMessage}
                      </div>
                    )}
                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() => {
                          setLeetcodeDropdownOpen(false);
                          setLeetcodeInput("");
                          setLeetcodeMessage("");
                          setLeetcodeMessageType("");
                        }}
                        className="px-4 py-2 text-neutral-400 hover:text-white transition duration-200"
                        disabled={leetcodeLoading}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          if (!leetcodeInput.trim()) return;
                          setLeetcodeLoading(true);
                          setLeetcodeMessage("");
                          setLeetcodeMessageType("");
                          try {
                            await userService.addCPPlatform({
                              username: String(user?.username ?? ""),
                              codeforcesId: null,
                              codechefId: null,
                              atcoderId: null,
                              leetcodeId: String(leetcodeInput.trim()),
                            });
                            setLeetcodeDropdownOpen(false);
                            setLeetcodeInput("");
                            setLeetcodeMessage(
                              "LeetCode account connected successfully!"
                            );
                            setLeetcodeMessageType("success");
                            setLeetcodeGlobalMessage(
                              "LeetCode account connected successfully!"
                            );
                            updateUser({
                              ...user,
                              leetcodeUsername: leetcodeInput.trim(),
                            });
                          } catch (error) {
                            setLeetcodeMessage(
                              "Error connecting LeetCode account!"
                            );
                            setLeetcodeMessageType("error");
                          } finally {
                            setLeetcodeLoading(false);
                          }
                        }}
                        disabled={!leetcodeInput.trim() || leetcodeLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200 disabled:bg-neutral-600 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {leetcodeLoading ? (
                          <>
                            <svg
                              className="w-4 h-4 animate-spin"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                            Saving...
                          </>
                        ) : (
                          "Save"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;