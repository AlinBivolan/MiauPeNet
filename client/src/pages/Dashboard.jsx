import { useDispatch, useSelector } from "react-redux";
import { logout, loadMe } from "../features/auth/authSlice";
import { useEffect } from "react";

export default function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  useEffect(() => {
    if (!user) dispatch(loadMe());
  }, [user, dispatch]);

  return (
    <div style={{ maxWidth: 600, margin: "60px auto" }}>
      <h1>Dashboard</h1>
      <p>{user ? `Hello, ${user.name || user.email}` : "Loading user..."}</p>
      <button onClick={() => dispatch(logout())}>Logout</button>
    </div>
  );
}