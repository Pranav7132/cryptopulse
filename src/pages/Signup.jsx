import { useState } from "react";
import logo from "../components/logooo.jpg";
import { useNavigate } from "react-router-dom";
const getPasswordStrength = (password) => {
  if (!password) return null;
  if (password.length < 6) return "weak";
  if (password.length < 10) return "medium";
  return /[0-9!@#$%^&*]/.test(password) ? "strong" : "medium";
};

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const strength = getPasswordStrength(password);
  const navigate = useNavigate();
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");

      setSuccess("Account created successfully. Redirecting to login…");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl dark:bg-slate-900">
        <div className="mb-6 flex justify-center">
  <img
    src={logo}
    alt="CryptoPulse Logo"
    className="h-14 w-14 rounded-full shadow-md"
  />
</div>
        <button
  onClick={() => navigate("/")}
  className="mb-4 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
>
  ← Back to Home
</button>

        <h2 className="mb-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Create your own Account!
        </h2>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
          Join CryptoPulse and track your favorite coins
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-900/20">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-600 dark:bg-green-900/20">
  <span>✓</span>
  <span>{success}</span>
</div>
        )}

        <form
  onSubmit={handleSubmit}
  className="space-y-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800"
>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />

          <div>
  <div className="relative">
    <input
      type={showPassword ? "text" : "password"}
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 pr-10 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
    />

    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400"
    >
      {showPassword ? "Hide" : "Show"}
    </button>
  </div>

  {strength && (
    <p
      className={`mt-1 text-xs ${
        strength === "weak"
          ? "text-red-500"
          : strength === "medium"
          ? "text-yellow-500"
          : "text-green-600"
      }`}
    >
      Password strength:{" "}
      <span className="font-medium capitalize">{strength}</span>
      {strength === "weak" && " (min 6 characters)"}
      {strength === "medium" && " (add numbers or symbols)"}
      {strength === "strong" && " ✓"}
    </p>
  )}
</div>


          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="font-medium text-blue-600 hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signup;
