import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, getUserRole } from "../firebase/auth";
import "../styles/AuthPages.css";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await loginUser(email, password);
      const user = userCredential.user;

      // Check user role
      const role = await getUserRole(user.uid);

      if (role === "admin") {
        navigate("/admin-dashboard");
      } else if (role === "student") {
        setError("Access denied. This is an admin login. Please use student login.");
        return;
      } else if (role === null) {
        setError("Access denied. Admin account required.");
        return;
      } else {
        setError("Access denied. Admin account required.");
        return;
      }
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        setError("Email not registered.");
      } else if (error.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else if (error.code === "auth/invalid-email") {
        setError("Invalid email format.");
      } else {
        setError(error.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card admin-card">
        <div className="admin-badge">Admin Panel</div>
        <h2 className="auth-title">Admin Login</h2>
        <p className="auth-subtitle">Manage tour trips and student accounts</p>

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="auth-button admin-button"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? Contact the system administrator.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
