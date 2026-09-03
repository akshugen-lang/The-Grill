"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { currentUser, logout } from "@/lib/session";

export default function AuthStatus() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    setEmail(currentUser());
  }, []);

  const handleSignOut = () => {
    logout();
    router.push("/login");
  };

  if (!email) return null;

  return (
    <div className="flex items-center gap-3 bg-[#151B18] border border-[#2A332D] px-3 py-1.5 rounded-md text-xs mono">
      <span className="text-[#647169]">Logged in as</span>
      <span className="text-[#EAE6DC] font-medium">{email}</span>
      <button
        onClick={handleSignOut}
        className="ml-2 px-2 py-0.5 rounded bg-[#212B25] hover:bg-[#2A332D] text-[#9BA69D] hover:text-[#EAE6DC] border border-[#2A332D] transition-colors cursor-pointer"
      >
        Sign out
      </button>
    </div>
  );
}
