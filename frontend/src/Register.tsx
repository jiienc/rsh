"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";

export default function Register() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleCaptcha = (token: string | null) => {
    setCaptchaToken(token);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!captchaToken) {
      setError("Please complete the CAPTCHA");
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("captchaToken", captchaToken);
      if (file) {
        formDataToSend.append("file", file);
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setSuccess("Registration successful! Please log in.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold text-center">Sign Up</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        {success && <p className="text-green-500 text-center">{success}</p>}
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full p-2 border rounded"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full p-2 border rounded"
            onChange={handleChange}
            required
          />
          <input
            type="file"
            className="w-full p-2 border rounded"
            onChange={handleFileChange}
            accept="image/*"
          />
          <ReCAPTCHA
            sitekey="6LeHHfoqAAAAAPobBia7LwGEuobj5W2VVGmHd2cC"
            onChange={handleCaptcha}
          />
          <button
            type="submit"
            className="w-full p-2 bg-indigo-600 text-white rounded"
          >
            Sign up
          </button>
        </form>
        <p className="mt-4 text-center">
          Already have an account?{" "}
          <span
            className="text-indigo-600 cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Log in
          </span>
        </p>
      </div>
    </div>
  );
}
