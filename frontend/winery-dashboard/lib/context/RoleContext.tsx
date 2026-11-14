"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type Role = "user" | "winery" | "winery_admin" | "admin" | null;

interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
}

interface RoleContextType {
  role: Role;
  user: UserProfile | null;
  setRole: (role: Role) => void;
  isLoggedIn: boolean;
  login: (role: Role) => void;
  logout: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

const roleProfiles: Record<NonNullable<Role>, UserProfile> = {
  user: { name: "Wine Enthusiast", email: "user@example.com" },
  winery: { name: "Winery Estate", email: "estate@vinosphere.in" },
  winery_admin: { name: "Winery Administrator", email: "admin@estate.in" },
  admin: { name: "Platform Admin", email: "admin@vinosphere.in" },
};

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(null);

  const login = (r: Role) => setRole(r);
  const logout = () => setRole(null);

  return (
    <RoleContext.Provider
      value={{
        role,
        user: role ? roleProfiles[role] : null,
        setRole,
        isLoggedIn: role !== null,
        login,
        logout,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}
