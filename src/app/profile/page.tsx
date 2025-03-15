"use client";

import { useAuth } from "@/lib/AuthContext";

export default function Profile() {
  const { user } = useAuth();
  return (
    <div>
      <h1>Profile</h1>
    </div>
  );
}
