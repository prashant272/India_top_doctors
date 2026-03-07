"use client";

import { useContext, useCallback } from "react";
import { AuthContext } from "@/app/context/AuthContext";
import * as authService from "@/app/services/auth.service";

export const useAuth = () => {
  const { Userdispatch } = useContext(AuthContext);
  const signIn = useCallback(async (body, role) => {
    try {
      const res = await authService.signIn(body, role);

      if (res.status === 200 && res.data?.success) {
        Userdispatch({
          type: "SIGN_IN",
          payload: res.data.user,
        });
      }

      return res;
    } catch (err) {
      return err?.response;
    }
  }, [Userdispatch]);
  const signUp = useCallback(async (body, role) => {
    try {
      return await authService.signUp(body, role);
    } catch (err) {
      return err?.response;
    }
  }, []);

  const updateProfile = useCallback(async (body) => {
    try {
      const res = await authService.updateProfile(body);

      if (res.status === 200) {
        Userdispatch({
          type: "UPDATE_PROFILE",
          payload: res.data,
        });
      }

      return res;
    } catch (err) {
      return err?.response;
    }
  }, [Userdispatch]);

  const updatePassword = useCallback(async (body) => {
    try {
      return await authService.updatePassword(body);
    } catch (err) {
      return err?.response;
    }
  }, []);

  return {
    signIn,
    signUp,
    updateProfile,
    updatePassword,
  };
};
