import React, { useState } from "react";
import { UserProfile, CloudFile, RecentActivityItem } from "./types";
import { LoginPage } from "./components/LoginPage";
import { DashboardView } from "./components/DashboardView";
import { INITIAL_FILES, INITIAL_ACTIVITIES } from "./data/cloudData";
import { ThemeProvider } from "./context/ThemeContext";

export default function App() {
  // Authentication State: Defaults to an active demo session so the user immediately sees the requested dashboard
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem("cloud_optima_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed === null) return null;
        return parsed;
      }
      return {
        name: "Alex Vance",
        email: "alex.vance@cloudoptima.io",
        role: "Principal Cloud Architect",
        company: "Enterprise Cloud Systems",
        cloudTenants: 6,
        provider: "Single Sign-On",
        lastLogin: "Active Now",
      };
    } catch {
      return null;
    }
  });

  // Global Files and Activities State
  const [files, setFiles] = useState<CloudFile[]>(INITIAL_FILES);
  const [activities, setActivities] = useState<RecentActivityItem[]>(INITIAL_ACTIVITIES);

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    try {
      localStorage.setItem("cloud_optima_user", JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
  };

  const handleContinueAsGuest = () => {
    const guestUser: UserProfile = {
      name: "Sandbox Guest",
      email: "guest@cloudoptima.demo",
      role: "Guest Cloud Auditor",
      company: "Cloud Sandbox Operations",
      cloudTenants: 6,
      provider: "Guest Access",
      lastLogin: "Active Now",
    };
    setCurrentUser(guestUser);
    try {
      localStorage.setItem("cloud_optima_user", JSON.stringify(guestUser));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    try {
      localStorage.setItem("cloud_optima_user", "null");
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateFile = (updated: CloudFile) => {
    setFiles((prev) => {
      const exists = prev.some((f) => f.id === updated.id);
      if (exists) {
        return prev.map((f) => (f.id === updated.id ? updated : f));
      }
      return [updated, ...prev];
    });
  };

  const handleUpdateMultipleFiles = (updatedList: CloudFile[]) => {
    setFiles((prev) => {
      const updateMap = new Map(updatedList.map((f) => [f.id, f]));
      return prev.map((f) => updateMap.get(f.id) || f);
    });
  };

  const handleAddActivities = (newActs: RecentActivityItem[]) => {
    setActivities((prev) => [...newActs, ...prev]);
  };

  return (
    <ThemeProvider>
      {!currentUser ? (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onContinueAsGuest={handleContinueAsGuest}
        />
      ) : (
        <DashboardView
          user={currentUser}
          files={files}
          activities={activities}
          onUpdateFile={handleUpdateFile}
          onUpdateFiles={handleUpdateMultipleFiles}
          onAddActivities={handleAddActivities}
          onSignOut={handleSignOut}
        />
      )}
    </ThemeProvider>
  );
}

