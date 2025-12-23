import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../firebase/auth";
import "../styles/AuthPages.css";

const AdminSignup = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    adminCode: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const ADMIN_CODE = "ADMIN2025"; // Change this to your secure admin code

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!formData.fullName.trim()) {
      setError("Full name is required.");
      setLoading(false);
      return;
    }

    if (formData.adminCode !== ADMIN_CODE) {
      setError("Invalid admin code. Access denied.");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      await registerUser(
        formData.email,
        formData.password,
        "admin",
        {
          fullName: formData.fullName,
        }
      );

      navigate("/admin-login");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setError("Email already registered.");
      } else if (error.code === "auth/weak-password") {
        setError("Password is too weak. Use at least 6 characters.");
      } else if (error.code === "auth/invalid-email") {
        setError("Invalid email format.");
      } else {
        setError(error.message || "Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card admin-card">
        <div className="admin-badge">Admin Registration</div>
        <h2 className="auth-title">Admin Sign Up</h2>
        <p className="auth-subtitle">Create your admin account</p>

        <form onSubmit={handleSignup} className="auth-form">
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="adminCode">Admin Code</label>
            <input
              type="password"
              id="adminCode"
              name="adminCode"
              placeholder="Enter admin code"
              value={formData.adminCode}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="auth-button admin-button"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/admin-login">Login here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default AdminSignup;
