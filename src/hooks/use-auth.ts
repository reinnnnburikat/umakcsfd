"use client";

import { useSession, signOut, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";
  const user = session?.user;

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) {
        router.push("/dashboard");
        return { success: true };
      }

      return {
        success: false,
        error: result?.error || "Invalid credentials",
      };
    },
    [router]
  );

  const logout = useCallback(async () => {
    await signOut({ redirect: false });
    router.push("/login");
  }, [router]);

  const hasRole = (roles: string | string[]) => {
    if (!user?.role) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  const isStaff = hasRole(["STAFF", "ADMIN", "SUPER_ADMIN"]);
  const isAdmin = hasRole(["ADMIN", "SUPER_ADMIN"]);
  const isSuperAdmin = hasRole("SUPER_ADMIN");

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    hasRole,
    isStaff,
    isAdmin,
    isSuperAdmin,
  };
}
