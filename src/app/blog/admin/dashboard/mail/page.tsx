"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export default function UnReadMessages() {
  interface User {
    name: string;
    email: string;
    userKey: string;
  }

  interface MailCommunication {
    userKey: string;
    from: string;
    subject: string;
    text: string;
    html: string;
    createdAt: Date;
  }

  interface NewMailMessage {
    subject: string;
    text: string;
    html: string;
  }

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [communication, setCommunication] = useState<MailCommunication[]>([]);
  const [newMailMessage, setNewMailMessage] = useState<NewMailMessage>({
    subject: "",
    text: "",
    html: "",
  });
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

    const res = await fetch("/api/admin/mail/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;

    const data = await res.json();
    setUsers(data.users);
  };

  const getCommunications = useCallback(
    async (userKey: string, incremental = false) => {
      if (loadingMessages) return;
      setLoadingMessages(true);

      let url = `/api/admin/mail?userKey=${userKey}`;
      if (incremental && communication.length > 0) {
        const lastMessageDate =
          communication[communication.length - 1].createdAt;
        url += `&after=${encodeURIComponent(String(lastMessageDate))}`;
      }

      try {
        const token = getCookie("session");
        if (!token) return;

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return;

        const data = await res.json();

        if (incremental && communication.length > 0) {
          // append only new messages
          setCommunication((prev) => [...prev, ...data.mail]);
        } else {
          // replace full chat
          setCommunication(data.mail || []);
        }
      } finally {
        setLoadingMessages(false);
      }
    },
    [communication, loadingMessages]
  );

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    getCommunications(user.userKey, false);
  };

  const sendChatMessage = async () => {
    if (!selectedUser || !newMailMessage) return;

    const token = getCookie("session");
    if (!token) return;

    const newMail: MailCommunication = {
      userKey: selectedUser.userKey,
      from: "admin",
      subject: newMailMessage.subject,
      text: newMailMessage.text,
      html: newMailMessage.html,
      createdAt: new Date(),
    };

    // Optimistically add message to state
    setCommunication((prev) => [...prev, newMail]);
    setNewMailMessage({
      subject: "",
      text: "",
      html: "",
    });

    const res = await fetch("/api/admin/mail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newMail),
    });

    if (!res.ok) {
      setCommunication((prev) => prev.filter((m) => m !== newMail));
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

                return (
                  <div key={idx}>
                    {showDateDivider && (
                      <div className="text-center text-xs text-gray-500 dark:text-gray-400 my-3">
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
                        className={`max-w-[75%] p-4 rounded-xl shadow-md text-sm space-y-3 ${
                          isUser
                            ? "bg-blue-600 text-white rounded-br-none"
                            : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none"
                        }`}
                      >
                        {/* Subject */}
                        <div>
                          <div
                            className={`text-xs uppercase tracking-wide text-gray-400 ${
                              isUser ? "dark:text-white" : "dark:text-gray-500"
                            } `}
                          >
                            Subject
                          </div>
                          <div className="text-base font-bold">
                            {c.subject || "No Subject"}
                          </div>
                        </div>

                        {/* Text Content */}
                        {c.text && (
                          <div className="border-t border-gray-300 dark:border-gray-700 pt-2">
                            <div
                              className={`text-xs uppercase tracking-wide text-gray-400 ${
                                isUser
                                  ? "dark:text-white"
                                  : "dark:text-gray-500"
                              } `}
                            >
                              Text
                            </div>
                            <p className="leading-relaxed">{c.text}</p>
                          </div>
                        )}

                        {/* HTML Content */}
                        {c.html && (
                          <div className="border-t border-gray-300 dark:border-gray-700 pt-2">
                            <div
                              className={`text-xs uppercase tracking-wide text-gray-400 ${
                                isUser
                                  ? "dark:text-white"
                                  : "dark:text-gray-500"
                              } mb-1`}
                            >
                              HTML
                            </div>
                            <div
                              className="prose prose-sm dark:prose-invert bg-gray-100 dark:bg-gray-900 p-2 rounded-md border border-gray-200 dark:border-gray-700"
                              dangerouslySetInnerHTML={{ __html: c.html }}
                            />
                          </div>
                        )}

                        {/* Time */}
                        <div className="text-[10px] text-gray-400 dark:text-gray-500 text-right">
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
          <div className="flex flex-col gap-1 p-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            {/* Subject input */}
            <input
              type="text"
              placeholder="Subject"
              value={newMailMessage?.subject}
              onChange={(e) =>
                setNewMailMessage({
                  ...newMailMessage,
                  subject: e.target.value,
                })
              }
              className="p-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
            />

            {/* Text input */}
            <textarea
              placeholder="Plain text (optional)"
              value={newMailMessage.text}
              onChange={(e) =>
                setNewMailMessage({ ...newMailMessage, text: e.target.value })
              }
              className="p-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition resize-none"
              rows={2}
            />

            {/* HTML input */}
            <textarea
              placeholder="HTML content..."
              value={newMailMessage.html}
              onChange={(e) =>
                setNewMailMessage({ ...newMailMessage, html: e.target.value })
              }
              className="p-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition resize-none"
              rows={3}
            />

            {/* Send button */}
            <div className="flex justify-end">
              <button
                onClick={sendChatMessage}
                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
