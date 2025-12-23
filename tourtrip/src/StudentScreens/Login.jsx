import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, getUserRole } from "../firebase/auth";
import "../styles/AuthPages.css";

const StudentLogin = () => {
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

      // If role is student or null (data might not be loaded yet), allow access
      if (role === "student" || role === null) {
        navigate("/student-dashboard");
      } else if (role === "admin") {
        setError("Access denied. This is a student login. Please use admin login.");
        return;
      } else {
        setError("Access denied. Student account required.");
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
      <div className="auth-card">
        <h2 className="auth-title">Student Login</h2>
        <p className="auth-subtitle">Access your tour trip management account</p>

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
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
            className="auth-button"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/student-signup">Sign up here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
