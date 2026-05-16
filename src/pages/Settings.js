import React from "react";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex">

      {/* Sidebar */}
      <div className="w-64 bg-[#111827] text-white p-6">
        <h1 className="text-3xl font-bold">SwasthSetu</h1>
        <p className="text-gray-400 text-sm mt-1">
          Healthcare Admin
        </p>

        <div className="mt-10 space-y-3">

          <button
            onClick={() => navigate("/dashboard")}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-800"
          >
            Dashboard
          </button>

          <button
            onClick={() => navigate("/patients")}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-800"
          >
            Patients
          </button>

          <button
            onClick={() => navigate("/doctors")}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-800"
          >
            Doctors
          </button>

          <button
            onClick={() => navigate("/appointments")}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-800"
          >
            Appointments
          </button>

          <button
            onClick={() => navigate("/reports")}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-800"
          >
            Reports
          </button>

          <button className="w-full text-left px-4 py-3 rounded-lg bg-emerald-600">
            Settings
          </button>

        </div>
      </div>

      {/* Main */}
      <div className="flex-1 p-8">

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

          <h1 className="text-3xl font-bold text-gray-800">
            Settings
          </h1>

          <p className="text-gray-500 mt-2">
            Manage your account preferences and security settings.
          </p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Name
              </label>

              <input
                type="text"
                value="Aalok Poonia"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>

              <input
                type="email"
                value="admin@swasthsetu.com"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Change Password
              </label>

              <input
                type="password"
                placeholder="Enter new password"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notifications
              </label>

              <select className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none">
                <option>Enabled</option>
                <option>Disabled</option>
              </select>
            </div>

          </div>

          <button className="mt-8 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium">
            Save Changes
          </button>

        </div>

      </div>
    </div>
  );
};

export default Settings;