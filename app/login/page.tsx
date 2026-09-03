"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/session";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [role, setRole] = useState<"student" | "developer">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Enter an email and password to continue.");
      return;
    }
    login(email.trim());
    router.push("/");
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundColor: "#0D110F", color: "#EAE6DC" }}
    >
      <div
        className="w-full max-w-md border p-8"
        style={{ backgroundColor: "#151B18", borderColor: "#2A332D" }}
      >
        <div
          className="flex gap-1 mb-6 border-b"
          style={{ borderColor: "#212B25" }}
        >
          <button
            type="button"
            onClick={() => setTab("login")}
            className={`text-sm px-4 py-2.5 border-b-2 ${
              tab === "login" ? "font-semibold" : ""
            }`}
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              color: tab === "login" ? "#EAE6DC" : "#647169",
              borderColor: tab === "login" ? "#EAE6DC" : "transparent",
            }}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => setTab("register")}
            className={`text-sm px-4 py-2.5 border-b-2 ${
              tab === "register" ? "font-semibold" : ""
            }`}
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              color: tab === "register" ? "#EAE6DC" : "#647169",
              borderColor: tab === "register" ? "#EAE6DC" : "transparent",
            }}
          >
            Register
          </button>
        </div>

        <p
          className="text-[11px] mb-3"
          style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#647169" }}
        >
          I AM A:
        </p>

        <div className="flex flex-col gap-3 mb-6">
          {(["student", "developer"] as const).map((r) => (
            <button
              type="button"
              key={r}
              onClick={() => setRole(r)}
              className="flex items-center gap-3 text-left cursor-pointer"
            >
              <span
                className="w-4 h-4 rounded-full border flex items-center justify-center"
                style={{ borderColor: role === r ? "#7C9B7E" : "#647169" }}
              >
                {role === r && (
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: "#7C9B7E" }}
                  />
                )}
              </span>
              <span
                className="text-[15px] capitalize"
                style={{ color: role === r ? "#EAE6DC" : "#9BA69D" }}
              >
                {r}
              </span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email or phone"
            className="w-full border text-sm px-4 py-3.5 outline-none"
            style={{
              backgroundColor: "#0D110F",
              borderColor: "#2A332D",
              color: "#EAE6DC",
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full border text-sm px-4 py-3.5 outline-none"
            style={{
              backgroundColor: "#0D110F",
              borderColor: "#2A332D",
              color: "#EAE6DC",
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          />

          {error && (
            <p
              className="text-xs"
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                color: "#B05A48",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full text-sm font-bold py-3.5 cursor-pointer transition-colors hover:opacity-90"
            style={{
              backgroundColor: "#EAE6DC",
              color: "#0D110F",
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            Log in
          </button>
        </form>

        <button
          type="button"
          className="block w-full text-center text-xs mt-5 cursor-pointer transition-colors hover:opacity-80"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            color: "#9BA69D",
          }}
        >
          Forgot password?
        </button>

        <div className="flex items-center gap-3 mt-6">
          <span
            className="flex-1 h-px"
            style={{ backgroundColor: "#212B25" }}
          />
          <span
            className="text-[11px]"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              color: "#647169",
            }}
          >
            OR
          </span>
          <span
            className="flex-1 h-px"
            style={{ backgroundColor: "#212B25" }}
          />
        </div>
      </div>
    </main>
  );
}
