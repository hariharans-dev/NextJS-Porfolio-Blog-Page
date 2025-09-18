"use client";

import { useEffect, useRef, useState } from "react";
import { Copy } from "lucide-react";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    content?: string;
    key?: string;
  }>({});
  const [userKey, setUserKey] = useState<String | null>(null);
  const [key, setKey] = useState("");
  const [continueChat, setContinueChat] = useState(false);
  const [copied, setCopied] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  interface Communication {
    from: string;
    message: string;
    createdAt: Date;
  }

  const [communication, setCommunication] = useState<Communication[]>([]);

  const setCookie = (name: string, data: object) => {
    const expires = new Date(2147483647000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(
      JSON.stringify(data)
    )}; path=/; expires=${expires}`;
  };

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

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    const newErrors: { email?: string; content?: string } = {};
    if (!email) newErrors.email = "Email is required.";
    if (!message) newErrors.content = "Message is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    const response = await fetch("/api/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message }),
    });

    if (!response.ok) return;

    const res = await response.json();
    const userKey = res.userKey;

    setCookie("user", { name, email, userKey });
    window.location.reload();
  };

  const sendChatMessage = async () => {
    if (!chatMessage.trim()) return;

    const res = await fetch("/api/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message: chatMessage, userKey }),
    });

    if (!res.ok) return;

    setChatMessage("");
    getCommunications();
  };

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key) {
      setErrors({ key: "Key is required." });
      return;
    }
    setErrors({});

    const response = await fetch(
      `/api/userkey?userKey=${encodeURIComponent(String(key))}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      setErrors({ key: "No chat linked with this key." });
      return;
    }

    const res = await response.json();
    setCookie("user", { name: res.name, email: res.email, userKey: key });
    window.location.reload();
  };

  const getCommunications = async () => {
    const cookie = getCookie("user");
    if (!cookie) return;

    setEmail(cookie.email);
    setName(cookie.name);

    const response = await fetch(
      `/api/message?userKey=${encodeURIComponent(cookie.userKey)}`,
      { method: "GET" }
    );

    if (!response.ok) return;

    const data = await response.json();
    setCommunication(data.communications || []);
  };

  const handleCopy = () => {
    if (!userKey) return;
    navigator.clipboard.writeText(String(userKey));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500); // Hide after 1.5s
  };

  useEffect(() => {
    const cookie = getCookie("user");
    if (cookie && cookie.userKey) setUserKey(cookie.userKey);

    const fetchCommunications = () => {
      getCommunications();
    };
    fetchCommunications();

    const intervalId = setInterval(fetchCommunications, 10000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [communication]);

  return (
    <div className="bg-white dark:bg-black min-h-screen text-gray-900 dark:text-gray-100 relative">
      <main className="max-w-xl mx-auto px-4 md:px-5 py-6 space-y-6">
        <h1 className="text-3xl font-bold text-center tracking-tight text-gray-900 dark:text-gray-100">
          Contact Us
        </h1>

        {userKey == null ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow p-5 space-y-5">
            <form
              onSubmit={continueChat ? handleContinue : handleSubmit}
              className="space-y-4"
            >
              {/* Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {continueChat ? "Continue Chat" : "Start New Chat"}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={continueChat}
                    onChange={() => setContinueChat(!continueChat)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-gray-300 dark:bg-gray-700 peer-focus:ring-1 peer-focus:ring-blue-500 rounded-full peer-checked:bg-blue-500 transition-colors"></div>
                  <span className="absolute left-1 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></span>
                </label>
              </div>

              {continueChat ? (
                <>
                  {/* Key input */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Chat Key
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your chat key"
                      value={key}
                      onChange={(e) => {
                        setKey(e.target.value);
                        setErrors({ key: "" });
                      }}
                      className="w-full p-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring focus:ring-blue-500 text-sm text-gray-900 dark:text-gray-100"
                    />
                    {errors.key && (
                      <p className="text-red-500 text-xs">{errors.key}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg shadow transition text-sm"
                  >
                    Continue Chat
                  </button>
                </>
              ) : (
                <>
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Name (optional)
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring focus:ring-blue-500 text-sm text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full p-2.5 bg-gray-100 dark:bg-gray-800 border rounded-lg focus:ring focus:ring-blue-500 text-sm text-gray-900 dark:text-gray-100 ${
                        errors.email
                          ? "border-red-500"
                          : "border-gray-300 dark:border-gray-700"
                      }`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs">{errors.email}</p>
                    )}
                  </div>

                  {/* Message */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Message
                    </label>
                    <textarea
                      placeholder="Type your message..."
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        setErrors({ content: "" });
                      }}
                      className={`w-full p-2.5 bg-gray-100 dark:bg-gray-800 border rounded-lg h-24 resize-none focus:ring focus:ring-blue-500 text-sm text-gray-900 dark:text-gray-100 ${
                        errors.content
                          ? "border-red-500"
                          : "border-gray-300 dark:border-gray-700"
                      }`}
                    />
                    {errors.content && (
                      <p className="text-red-500 text-xs">{errors.content}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg shadow transition text-sm"
                  >
                    Send Message
                  </button>
                </>
              )}
            </form>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Continue chat box */}
            <div className="flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 rounded-lg">
              <span className="text-xs text-gray-900 dark:text-gray-100">
                Continue chat in other devices using this key:
              </span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[11px] font-mono bg-gray-100 dark:bg-black border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-gray-100">
                  {userKey}
                </span>
                <div className="relative">
                  <button
                    onClick={handleCopy}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <Copy size={14} />
                  </button>
                  <div
                    className={`absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-xs px-2 py-1 rounded shadow transition-opacity duration-300 ${
                      copied ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                  >
                    Copied!
                  </div>
                </div>
                <button
                  onClick={() => {
                    document.cookie = "user=; path=/; max-age=0";
                    window.location.reload();
                  }}
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                >
                  Exit
                </button>
              </div>
            </div>

            {/* Chat Window */}
            <div className="flex flex-col h-[400px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3">
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto space-y-2"
              >
                {communication.length > 0 &&
                  communication.map((c, idx) => {
                    const msgDate = new Date(c.createdAt);
                    const today = new Date();
                    const isToday =
                      msgDate.toDateString() === today.toDateString();

                    const showDateDivider =
                      idx === 0 ||
                      new Date(
                        communication[idx - 1].createdAt
                      ).toDateString() !== msgDate.toDateString();

                    // Determine alignment and style
                    const isUser = c.from === "user";
                    const isAdmin = c.from === "admin";

                    return (
                      <div key={idx}>
                        {showDateDivider && (
                          <div className="text-center text-[11px] text-gray-500 dark:text-gray-400 my-1">
                            {isToday ? "Today" : msgDate.toLocaleDateString()}
                          </div>
                        )}

                        <div
                          className={`flex ${
                            isUser ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[70%] p-2 rounded-lg text-xs shadow ${
                              isUser
                                ? "bg-blue-600 text-white rounded-br-none"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none"
                            }`}
                          >
                            <span>{c.message}</span>
                            <span className="text-[9px] text-gray-400 dark:text-gray-500 block mt-1">
                              {msgDate.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <input
                  type="text"
                  placeholder="Type message..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
                  className="flex-1 p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100"
                />
                <button
                  onClick={sendChatMessage}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg text-sm transition"
                >
                  ➤
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
