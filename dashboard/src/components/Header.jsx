import React from "react";
import image from "../assets/react.svg";

export default function Header() {
  return (
    <header className="flex items-center justify-between bg-white shadow-sm px-6 py-3">
      {/* Left: App Name or Navigation Title */}
      <h1 className="text-lg font-semibold text-gray-700">Dashboard</h1>

      {/* Right: Profile */}
      <div className="flex items-center gap-3">
        <span className="text-gray-600">Profile</span>
        <img
          src="../assets/react.svg"
          alt="Profile"
          className="w-10 h-10 rounded-full border"
        />
      </div>
    </header>
  );
}
