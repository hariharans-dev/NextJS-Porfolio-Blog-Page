"use client";

import {
  Users,
  Mail,
  MessageSquare,
  Activity,
  Plus,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [isPublishing, setIsPublishing] = useState(false);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const [popupType, setPopupType] = useState<"success" | "error">("success");
  const [userCount, setUserCount] = useState("-");
  const [messageCount, setMessageCount] = useState("-");
  const [mailCount, setMailCount] = useState("-");

  const getCookie = (name: string) => {
    const match = document.cookie.match(
      new RegExp(
        "(?:^|; )" + name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1") + "=([^;]*)"
      )
    );
    if (!match) return null;
    try {
      return JSON.parse(decodeURIComponent(match[1]));
    } catch {
      return null;
    }
  };

  async function handlePublish() {
    if (
      !confirm(
        "Are you sure you want to publish the latest post and email all users?"
      )
    )
      return;

    try {
      setIsPublishing(true);
      const token = getCookie("session");
      if (!token) {
        setIsPublishing(false);
        return;
      }

      const res = await fetch("/api/admin/mail/latestPost", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to publish");

      setPopupMessage(
        `✅ Post published and emails sent to ${data.count} users!`
      );
      setPopupType("success");
    } catch (err) {
      setPopupMessage("❌ Failed to publish or send emails. Check logs.");
      setPopupType("error");
    } finally {
      setIsPublishing(false);
    }
  }

  const getUserCount = async () => {
    try {
      const token = getCookie("session");
      if (!token) {
        setIsPublishing(false);
        return;
      }

      const res = await fetch("/api/admin/users/count", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setUserCount(data.count);
      if (!res.ok) throw new Error(data.error || "Failed to publish");
    } catch (error) {}
  };

  const getMessageCount = async () => {
    try {
      const token = getCookie("session");
      if (!token) {
        setIsPublishing(false);
        return;
      }

      const res = await fetch("/api/admin/message/count", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setMessageCount(data.count);
      if (!res.ok) throw new Error(data.error || "Failed to publish");
    } catch (error) {}
  };

  const getMailCount = async () => {
    try {
      const token = getCookie("session");
      if (!token) {
        setIsPublishing(false);
        return;
      }

      const res = await fetch("/api/admin/mail/count", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setMailCount(data.count);
      if (!res.ok) throw new Error(data.error || "Failed to publish");
    } catch (error) {}
  };

  useEffect(() => {
    if (popupMessage) {
      const timer = setTimeout(() => setPopupMessage(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [popupMessage]);

  useEffect(() => {
    getUserCount();
    getMessageCount();
    getMailCount();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Monitor users, messages, and site activity.
        </p>

        {/* Publish New Post Button */}
        <button
          onClick={handlePublish}
          disabled={isPublishing}
          className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
        >
          <Plus size={18} />
          {isPublishing ? "Publishing..." : "Publish & Notify"}
        </button>

        {/* Popup Notification */}
        {popupMessage && (
          <div
            className={`absolute right-0 top-14 px-4 py-3 rounded-xl shadow-md border transition-opacity duration-500 ${
              popupType === "success"
                ? "bg-green-100 border-green-400 text-green-700"
                : "bg-red-100 border-red-400 text-red-700"
            }`}
          >
            <div className="flex items-center gap-2">
              {popupType === "success" ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <span className="text-sm">{popupMessage}</span>
            </div>
          </div>
        )}
      </header>

      {/* Stats Overview */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4 rounded-2xl shadow flex items-center gap-3">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
            <Users className="text-blue-600 dark:text-blue-300" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Users
            </p>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {userCount}
            </h2>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4 rounded-2xl shadow flex items-center gap-3">
          <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
            <Mail className="text-green-600 dark:text-green-300" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Messages
            </p>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {messageCount}
            </h2>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4 rounded-2xl shadow flex items-center gap-3">
          <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl">
            <MessageSquare
              className="text-purple-600 dark:text-purple-300"
              size={24}
            />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Mails
            </p>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {mailCount}
            </h2>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4 rounded-2xl shadow flex items-center gap-3">
          <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-xl">
            <Activity
              className="text-orange-600 dark:text-orange-300"
              size={24}
            />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Site Health
            </p>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Good
            </h2>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow p-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Recent Activity
        </h2>
        <ul className="space-y-3 text-sm">
          <li className="flex justify-between">
            <span className="text-gray-700 dark:text-gray-300">
              John Doe sent a message
            </span>
            <span className="text-gray-500 dark:text-gray-400">2m ago</span>
          </li>
          <li className="flex justify-between">
            <span className="text-gray-700 dark:text-gray-300">
              New user registered
            </span>
            <span className="text-gray-500 dark:text-gray-400">15m ago</span>
          </li>
          <li className="flex justify-between">
            <span className="text-gray-700 dark:text-gray-300">
              Admin replied to support ticket
            </span>
            <span className="text-gray-500 dark:text-gray-400">1h ago</span>
          </li>
        </ul>
      </section>

      {/* Placeholder for Future Tables */}
      <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow p-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Manage Users
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          This is where you can add, remove, or edit users. (Coming soon)
        </p>
      </section>
    </div>
  );
}
