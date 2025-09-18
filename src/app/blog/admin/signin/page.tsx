"use client";

import { useState } from "react";

export default function AdminSignIn() {
  const [email, setEmail] = useState("");
  const [key, setKey] = useState("");
  const [errors, setErrors] = useState<{ email?: string; key?: string }>({});

  const setCookie = (name: string, data: object) => {
    const expires = new Date(2147483647000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(
      JSON.stringify(data)
    )}; path=/; expires=${expires}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { email?: string; key?: string } = {};
    if (!email) newErrors.email = "Email is required.";
    if (!key) newErrors.key = "Admin key is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, key }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData?.error || "Failed to sign in");
        return;
      }

      const res = await response.json();
      setCookie("session", res.session || "");

      window.location.href = "/blog/admin/dashboard";
    } catch (err) {
      alert("Something went wrong.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100">
        Admin Sign In
      </h1>

      <div className="bg-white dark:bg-gray-900 shadow-md rounded-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-3 border rounded-xl focus:ring focus:ring-blue-300 bg-gray-50 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 ${
                errors.email ? "border-red-500" : ""
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>

          {/* Admin Key Field */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Admin Password
            </label>
            <input
              type="password"
              placeholder="Enter your admin key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className={`w-full p-3 border rounded-xl focus:ring focus:ring-blue-300 bg-gray-50 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 ${
                errors.key ? "border-red-500" : ""
              }`}
            />
            {errors.key && <p className="text-red-500 text-sm">{errors.key}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl shadow-md transition"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
