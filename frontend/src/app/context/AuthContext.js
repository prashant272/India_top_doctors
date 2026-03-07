"use client";

import React, {
  createContext,
  useEffect,
  useReducer,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import * as authService from "@/app/services/auth.service";

const defaultState = {
  token: null,
  refreshToken: null,
  userId: null,
  email: null,
  name: null,
  profileImage: null,
  role: null,
  roleData: {},
  isPremium: false,
  isActive: false,
  currentPlan: null,
  currentPlanName: "Basic Plan",
  planDetails: null,
  planStartDate: null,
  planExpiryDate: null,
  features: {},
};

export const AuthContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case "SIGN_IN": {
      const signinState = { ...action.payload };
      if (typeof window !== "undefined") {
        localStorage.setItem("UserData", JSON.stringify(signinState));
        if (signinState.token) {
          document.cookie = `token=${signinState.token}; path=/; SameSite=Lax; Secure`;
        }
        if (signinState.refreshToken) {
          localStorage.setItem("refreshToken", signinState.refreshToken);
        }
        if (signinState.userId) {
          document.cookie = `userId=${signinState.userId}; path=/; SameSite=Lax`;
        }
        if (signinState.role) {
          document.cookie = `userRole=${signinState.role}; path=/; SameSite=Lax`;
        }
        document.cookie = `isPremium=${signinState.isPremium ?? false}; path=/; SameSite=Lax`;
      }
      return signinState;
    }

    case "INIT": {
      return { ...action.payload };
    }

    case "SET_PREMIUM": {
      const premiumState = {
        ...state,
        isPremium: "isPremium" in action.payload ? action.payload.isPremium : state.isPremium,
        isActive: "isActive" in action.payload ? action.payload.isActive : state.isActive,
        currentPlan: "currentPlan" in action.payload ? action.payload.currentPlan : state.currentPlan,
        currentPlanName: "currentPlanName" in action.payload ? action.payload.currentPlanName : state.currentPlanName,
        planDetails: "planDetails" in action.payload ? action.payload.planDetails : state.planDetails,
        planStartDate: "planStartDate" in action.payload ? action.payload.planStartDate : state.planStartDate,
        planExpiryDate: "planExpiryDate" in action.payload ? action.payload.planExpiryDate : state.planExpiryDate,
        features: "features" in action.payload ? action.payload.features : state.features,
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("UserData", JSON.stringify(premiumState));
        document.cookie = `isPremium=${premiumState.isPremium}; path=/; SameSite=Lax`;
      }
      return premiumState;
    }

    case "PLAN_EXPIRED": {
      const expiredState = {
        ...state,
        isPremium: false,
        isActive: false,
        currentPlan: null,
        currentPlanName: "Basic Plan",
        planDetails: null,
        planStartDate: null,
        planExpiryDate: null,
        features: {},
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("UserData", JSON.stringify(expiredState));
        document.cookie = `isPremium=false; path=/; SameSite=Lax`;
      }
      return expiredState;
    }

    case "UPDATE_PLAN": {
      const planState = {
        ...state,
        isPremium: true,
        currentPlan: action.payload.currentPlan,
        planDetails: action.payload.planDetails,
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("UserData", JSON.stringify(planState));
        document.cookie = `isPremium=true; path=/; SameSite=Lax`;
      }
      return planState;
    }

    case "UPDATE_PROFILE": {
      const updatedState = { ...state, ...action.payload };
      if (typeof window !== "undefined") {
        localStorage.setItem("UserData", JSON.stringify(updatedState));
      }
      return updatedState;
    }

    case "REFRESH_TOKEN": {
      const refreshedState = {
        ...state,
        token: action.payload.token,
        ...(action.payload.refreshToken && {
          refreshToken: action.payload.refreshToken,
        }),
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("UserData", JSON.stringify(refreshedState));
        document.cookie = `token=${action.payload.token}; path=/; SameSite=Lax; Secure`;
        if (action.payload.refreshToken) {
          localStorage.setItem("refreshToken", action.payload.refreshToken);
        }
      }
      return refreshedState;
    }

    case "SIGN_OUT": {
      if (typeof window !== "undefined") {
        localStorage.removeItem("UserData");
        localStorage.removeItem("refreshToken");
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
        document.cookie = "userId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
        document.cookie = "userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
        document.cookie = "isPremium=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
      }
      return {
        token: null,
        refreshToken: null,
        userId: null,
        email: null,
        name: null,
        profileImage: null,
        role: null,
        roleData: {},
        isPremium: false,
        isActive: false,
        currentPlan: null,
        currentPlanName: "Basic Plan",
        planDetails: null,
        planStartDate: null,
        planExpiryDate: null,
        features: {},
      };
    }

    default:
      return state;
  }
}

export const AuthProvider = ({ children }) => {
  const [initialStateLoaded, setInitialStateLoaded] = useState(false);
  const [state, Userdispatch] = useReducer(reducer, defaultState);
  const router = useRouter();

  const refreshAccessToken = useCallback(async () => {
    if (typeof window === "undefined") return false;
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return false;
    try {
      const res = await authService.refreshToken(refreshToken);
      if (res.status === 200 && res.data?.success) {
        Userdispatch({
          type: "REFRESH_TOKEN",
          payload: {
            token: res.data.token,
            refreshToken: res.data.refreshToken,
          },
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error("Refresh token failed");
      return false;
    }
  }, []);

  const initializeUserData = useCallback(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("UserData");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          Userdispatch({ type: "INIT", payload: parsed });
        } catch {
          console.warn("Invalid UserData in localStorage");
        }
      }
      setInitialStateLoaded(true);
    }
  }, []);

  useEffect(() => {
    initializeUserData();
  }, [initializeUserData]);

  useEffect(() => {
    if (!state.token || !state.refreshToken) return;
    const interval = setInterval(() => {
      refreshAccessToken();
    }, 23.5 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [state.token, state.refreshToken, refreshAccessToken]);

  const logout = useCallback(() => {
    Userdispatch({ type: "SIGN_OUT" });
    router.replace("/");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        UserAuthData: state,
        Userdispatch,
        logout,
        refreshAccessToken,
        initialStateLoaded,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
