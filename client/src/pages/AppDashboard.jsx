import { useSelector } from "react-redux";

export default function AppDashboard() {
  const user = useSelector((s) => s.auth.user);

  return (
    <div style={{ padding: 40 }}>
      <h1>Dashboard</h1>
      <p>Hello, {user?.name || user?.email}</p>

      <p>Aici vor fi lecțiile, progresul etc.</p>
    </div>
  );
}
