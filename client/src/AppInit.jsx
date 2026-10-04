import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loadMe, logout } from "./features/auth/authSlice";

export default function AppInit({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    dispatch(loadMe()).unwrap().catch(() => {
      dispatch(logout());
    });
  }, [dispatch]);

  return children;
}
