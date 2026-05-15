"use client";

import { useState } from "react";
import { User, Bell, Shield, CreditCard, Globe, Moon, Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "profile", name: "Profile", icon: User },
  { id: "notifications", name: "Notifications", icon: Bell },
  { id: "security", name: "Security", icon: Shield },
  { id: "billing", name: "Billing", icon: CreditCard },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [postAlerts, setPostAlerts] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-2">Manage your account preferences and workspace configuration.</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Tabs */}
        <div className="w-56 shrink-0 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all text-left",
                  activeTab === tab.id
                    ? "bg-slate-900 text-white shadow-lg"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Content Panel */}
        <div className="flex-1 min-w-0">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-3xl border border-slate-200 p-8 space-y-8 shadow-sm"
          >
            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">Profile Information</h2>
                  <p className="text-sm text-slate-500">Update your personal details and public profile.</p>
                </div>

                <div className="flex items-center gap-6 pb-8 border-b border-slate-100">
                  <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center text-2xl font-bold text-slate-400">
                    JD
                  </div>
                  <div>
                    <button className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all">
                      Change Photo
                    </button>
                    <p className="text-xs text-slate-400 mt-2">JPG, PNG or GIF · Max 2MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    { label: "First Name", value: "Julian" },
                    { label: "Last Name", value: "de Wit" },
                    { label: "Email Address", value: "julian@postflow.io" },
                    { label: "Job Title", value: "Lead Designer" },
                  ].map((field) => (
                    <div key={field.label}>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        {field.label}
                      </label>
                      <input
                        type="text"
                        defaultValue={field.value}
                        className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-slate-900 outline-none transition-all bg-slate-50 focus:bg-white"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Bio
                  </label>
                  <textarea
                    defaultValue="Lead Designer at PostFlow. Passionate about social media strategy and premium brand aesthetics."
                    rows={3}
                    className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-slate-900 outline-none transition-all bg-slate-50 focus:bg-white resize-none"
                  />
                </div>

                {/* Appearance */}
                <div className="pb-6 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Appearance
                  </h3>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <Moon className="w-5 h-5 text-slate-500" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Dark Mode</p>
                        <p className="text-xs text-slate-400">Switch to a darker interface theme</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setDarkMode(!darkMode)}
                      className={cn(
                        "w-12 h-6 rounded-full transition-all relative",
                        darkMode ? "bg-slate-900" : "bg-slate-200"
                      )}
                    >
                      <span className={cn(
                        "absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all",
                        darkMode ? "left-7" : "left-1"
                      )} />
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === "notifications" && (
              <>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">Notification Preferences</h2>
                  <p className="text-sm text-slate-500">Control how and when PostFlow notifies you.</p>
                </div>
                <div className="space-y-4">
                  {[
                    { label: "Email Notifications", desc: "Receive updates and alerts via email", state: emailNotifs, toggle: setEmailNotifs },
                    { label: "Post Publish Alerts", desc: "Get notified when a scheduled post goes live", state: postAlerts, toggle: setPostAlerts },
                    { label: "Weekly Performance Report", desc: "A summary of your analytics sent every Monday", state: weeklyReport, toggle: setWeeklyReport },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => item.toggle(!item.state)}
                        className={cn(
                          "w-12 h-6 rounded-full transition-all relative shrink-0",
                          item.state ? "bg-slate-900" : "bg-slate-200"
                        )}
                      >
                        <span className={cn(
                          "absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all",
                          item.state ? "left-7" : "left-1"
                        )} />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* SECURITY TAB */}
            {activeTab === "security" && (
              <>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">Security</h2>
                  <p className="text-sm text-slate-500">Manage your password and two-factor authentication.</p>
                </div>
                <div className="space-y-4">
                  {["Current Password", "New Password", "Confirm New Password"].map((label) => (
                    <div key={label}>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{label}</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-slate-900 outline-none transition-all bg-slate-50 focus:bg-white"
                      />
                    </div>
                  ))}
                  <div className="p-5 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3 mt-6">
                    <Shield className="w-5 h-5 text-green-600 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-green-900">Two-Factor Authentication</p>
                      <p className="text-xs text-green-700 mt-0.5">Your account is protected with 2FA via authenticator app.</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* BILLING TAB */}
            {activeTab === "billing" && (
              <>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">Billing &amp; Subscription</h2>
                  <p className="text-sm text-slate-500">Manage your plan and payment details.</p>
                </div>
                <div className="p-6 bg-slate-900 rounded-3xl text-white flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Current Plan</p>
                    <p className="text-2xl font-bold">Pro Plan</p>
                    <p className="text-slate-400 text-sm mt-1">€29 / month · Renews June 15, 2026</p>
                  </div>
                  <button className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all">
                    Upgrade
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Scheduled Posts", value: "120 / mo", used: "38" },
                    { label: "Connected Accounts", value: "10 max", used: "2" },
                    { label: "Team Members", value: "5 max", used: "1" },
                  ].map((item) => (
                    <div key={item.label} className="p-5 border-2 border-slate-100 rounded-2xl">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{item.label}</p>
                      <p className="text-2xl font-bold text-slate-900">{item.used}</p>
                      <p className="text-xs text-slate-400 mt-1">of {item.value}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={handleSave}
                className={cn(
                  "px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all",
                  saved
                    ? "bg-green-500 text-white"
                    : "bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-200"
                )}
              >
                {saved ? <><Check className="w-4 h-4" /> Saved!</> : "Save Changes"}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
