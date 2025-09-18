"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export default function UnReadMessages() {
  interface User {
    name: string;
    email: string;
    userKey: string;
    read: boolean;
  }
  interface Communication {
    from: string;
    message: string;
    read: boolean;
    createdAt: Date;
  }

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [communication, setCommunication] = useState<Communication[]>([]);
  const [chatMessage, setChatMessage] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // ---------------- COOKIE HELPERS (unchanged) ----------------

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

  // ---------------- API CALLS ----------------
  const getUsers = async () => {
    const token = getCookie("session");
    if (!token) return;

    const res = await fetch("/api/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;

    const data = await res.json();
    const unreadUsers = (data.users || []).filter((u: any) => u.read === false);

    setUsers(unreadUsers);
  };

  const getCommunications = useCallback(
    async (userKey: string, incremental = false) => {
      if (loadingMessages) return; // prevent overlapping requests
      setLoadingMessages(true);

      let url = `/api/message?userKey=${userKey}`;
      if (incremental && communication.length > 0) {
        const lastMessageDate =
          communication[communication.length - 1].createdAt;
        url += `&after=${encodeURIComponent(String(lastMessageDate))}`;
      }

      try {
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();

        if (incremental && communication.length > 0) {
          // append only new messages
          setCommunication((prev) => [...prev, ...data.communications]);
        } else {
          // replace full chat
          setCommunication(data.communications || []);
        }
      } finally {
        setLoadingMessages(false);
      }
    },
    [communication, loadingMessages]
  );

  const markAsRead = async (userKey: string) => {
    if (!userKey) return;

    const token = getCookie("session");
    if (!token) return;

    const res = await fetch(`/api/admin/message/read`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userKey }),
    });

    if (!res.ok) return;

    // Update locally
    setUsers((prev) =>
      prev.map((u) => (u.userKey === userKey ? { ...u, read: true } : u))
    );
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    markAsRead(user.userKey);
    getCommunications(user.userKey, false);
  };

  const sendChatMessage = async () => {
    if (!selectedUser || !chatMessage.trim()) return;

    const token = getCookie("session");
    if (!token) return;

    const newMessage: Communication = {
      from: "admin",
      message: chatMessage,
      read: true,
      createdAt: new Date(),
    };

    // Optimistically add message to state
    setCommunication((prev) => [...prev, newMessage]);
    setChatMessage("");

    const res = await fetch("/api/admin/message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message: chatMessage,
        userKey: selectedUser.userKey,
      }),
    });

    if (!res.ok) {
      // rollback on error
      setCommunication((prev) => prev.filter((m) => m !== newMessage));
      return;
    }
  };

  // ---------------- EFFECTS ----------------
  useEffect(() => {
    getUsers();
  }, []);

  useEffect(() => {
    if (!selectedUser) return;

    const fetchMessages = () => getCommunications(selectedUser.userKey, true);
    fetchMessages();

    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [selectedUser]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [communication]);

  // ---------------- UI ----------------
  return (
    <div className="flex h-[90vh] max-w-6xl mx-auto bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-lg">
      {/* Users List */}
      <div
        className={`fixed inset-0 z-40 w-3/4 max-w-xs bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          selectedUser ? "-translate-x-full lg:translate-x-0" : "translate-x-0"
        }`}
      >
        <div className="p-3 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-800 dark:text-gray-100">
          Users
        </div>
        {users.length > 0 ? (
          users.map((user) => (
            <div
              key={user.userKey}
              className={`flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                selectedUser?.userKey === user.userKey
                  ? "bg-gray-100 dark:bg-gray-700"
                  : ""
              }`}
              onClick={() => handleUserClick(user)}
            >
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {user.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {user.email}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {user.userKey}
                </div>
              </div>
              {!user.read && (
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
              )}
            </div>
          ))
        ) : (
          <div className="p-3 text-sm text-gray-500 dark:text-gray-400">
            No users available
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-900">
        {/* Mobile Back Button */}
        {selectedUser && (
          <div className="flex items-center gap-2 p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 lg:hidden">
            <button
              className="text-blue-600 dark:text-blue-400 font-semibold"
              onClick={() => setSelectedUser(null)}
            >
              ← Back
            </button>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {selectedUser.name}
            </span>
          </div>
        )}

        {/* Chat Messages */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600"
        >
          {selectedUser ? (
            communication.length > 0 ? (
              communication.map((c, idx) => {
                const msgDate = new Date(c.createdAt);
                const today = new Date();
                const isToday = msgDate.toDateString() === today.toDateString();
                const showDateDivider =
                  idx === 0 ||
                  new Date(communication[idx - 1].createdAt).toDateString() !==
                    msgDate.toDateString();
                const isUser = c.from === "user";

                const unreadClass = !c.read
                  ? "ring-1 ring-blue-400 dark:ring-blue-600"
                  : "";

                return (
                  <div key={idx}>
                    {showDateDivider && (
                      <div className="text-center text-xs text-gray-500 dark:text-gray-400 my-2">
                        {isToday
                          ? "Today"
                          : msgDate.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                      </div>
                    )}
                    <div
                      className={`flex ${
                        isUser ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-xl shadow-sm text-sm ${
                          isUser
                            ? "bg-blue-600 text-white rounded-br-none"
                            : `bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none ${unreadClass}`
                        }`}
                      >
                        {c.message}
                        <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 text-right">
                          {msgDate.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-20">
                No messages yet.
              </div>
            )
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-20">
              Select a user to start chatting.
            </div>
          )}
        </div>

        {/* Input */}
        {selectedUser && (
          <div className="flex items-center gap-2 p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <input
              type="text"
              placeholder="Type a message..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
              className="flex-1 p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <button
              onClick={sendChatMessage}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-medium transition"
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
