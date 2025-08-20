/*"use client";
import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useUser } from "@clerk/nextjs";

export default function ChatPage() {
  const [socket, setSocket] = useState(null);
  const [roomID, setRoomID] = useState("");
  const [username, setUsername] = useState("");
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const { user } = useUser();
  const messagesEndRef = useRef(null);

  const currentUserId= user.id;

  // Get orgId & username
  useEffect(() => {
    const storedOrg = localStorage.getItem("selectedOrg");
    let orgId = "";

    try {
      const parsed = JSON.parse(storedOrg);
      orgId = parsed?._id || storedOrg;
    } catch {
      orgId = storedOrg;
    }

    if (!orgId) {
      alert("Room ID is missing in localStorage!");
      return;
    }

    setRoomID(orgId);
    setUsername(user?.fullName || user?.username || "Anonymous");
  }, [user]);

  // Fetch stored messages on load
  useEffect(() => {
    if (!roomID) return;

    fetch(`/api/store-retrive-chat?orgId=${roomID}`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(data);
      })
      .catch((err) => console.error("Fetch messages error:", err));
  }, [roomID]);

  // Connect socket
  useEffect(() => {
    if (!roomID || !username) return;

    const socketInstance = io("http://localhost:8000");
    setSocket(socketInstance);

    socketInstance.emit("join-room", roomID, username);

    socketInstance.on("chat-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    /*socketInstance.on("user-joined", (joinedUsername) => {
      setMessages((prev) => [
        ...prev,
        { username: "System", mess: `${joinedUsername} joined the chat.` },
      ]);
    });// add this * /

    return () => {
      socketInstance.disconnect();
    };
  }, [roomID, username]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!messageInput.trim() || !socket || !roomID || !username) return;

    const newMsg = {
      organizationId: roomID,
      userid: user.id,
      mess: messageInput.trim(),
      username: username,
      timestamp: new Date(),
    };

    // Emit to other users
    socket.emit("user-message", newMsg);

    // Save in DB
    try {
      await fetch(`/api/store-retrive-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMsg),
      });
    } catch (err) {
      console.error("Message save failed:", err);
    }

    // Show own message instantly
    setMessages((prev) => [...prev, newMsg]);
    setMessageInput("");
  };

  return (
    <div className="w-full max-w-[1100px] mx-auto mt-8 mb-8 font-sans p-6 border border-gray-300 rounded-lg shadow-lg">
  <h1 className="text-center text-gray-800 text-2xl md:text-3xl font-bold mb-6">💬 Chatting</h1>

  <div className="min-h-[350px] max-h-[400px] overflow-y-auto p-4 border border-gray-200 rounded-md mb-4 bg-white">
    {messages.length === 0 && (
      <p className="text-gray-500 text-center">No messages yet.</p>
    )}

    {messages.map((msg, idx) => {
      const isMine = msg.userid === currentUserId; // replace `currentUser` with your username variable
      return (
        <div
          key={idx}
          className={`flex ${isMine ? "justify-end" : "justify-start"} mb-2`}
        >
          <div
            className={`px-4 py-2 rounded-lg max-w-xs break-words text-white ${
              isMine ? "bg-blue-500" : "bg-gray-500"
            }`}
          >
            <p className="text-sm font-semibold">{msg.username}</p>
            <p>{msg.mess || msg.message}</p>
          </div>
        </div>
      );
    })}

    <div ref={messagesEndRef} />
  </div>

  <div className="flex flex-col sm:flex-row gap-2">
    <input
      type="text"
      placeholder="Enter message..."
      value={messageInput}
      onChange={(e) => setMessageInput(e.target.value)}
      className="flex-grow p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base"
      onKeyDown={(e) => {
        if (e.key === "Enter") sendMessage();
      }}
    />
    <button
      onClick={sendMessage}
      className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition-colors text-base font-semibold"
    >
      Send
    </button>
  </div>
</div>

  );
}
*/

"use client";
import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useUser } from "@clerk/nextjs";

export default function ChatPage() {
  const [socket, setSocket] = useState(null);
  const [roomID, setRoomID] = useState("");
  const [username, setUsername] = useState("");
  const [orgName, setOrgName] = useState("");  // ✅ use state here
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const { user } = useUser();
  const messagesEndRef = useRef(null);

  const currentUserId = user.id;

  // Get orgId & username
  useEffect(() => {
    const storedOrg = localStorage.getItem("selectedOrg");
    let orgId = "";
    let org = "";

    try {
      const parsed = JSON.parse(storedOrg);
      orgId = parsed?._id || storedOrg;
      org = parsed?.name || storedOrg;
    } catch {
      orgId = storedOrg;
      org = storedOrg;
    }

    if (!orgId) {
      alert("Room ID is missing in localStorage!");
      return;
    }

    setRoomID(orgId);
    setOrgName(org);  // ✅ now updates state
    setUsername(user?.fullName || user?.username || "Anonymous");
  }, [user]);

  // Fetch stored messages on load
  useEffect(() => {
    if (!roomID) return;

    fetch(`/api/store-retrive-chat?orgId=${roomID}`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(data);
      })
      .catch((err) => console.error("Fetch messages error:", err));
  }, [roomID]);

  // Connect socket
  useEffect(() => {
    if (!roomID || !username) return;

    const socketInstance = io("http://localhost:8000");
    setSocket(socketInstance);

    socketInstance.emit("join-room", roomID, username);

    socketInstance.on("chat-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [roomID, username]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!messageInput.trim() || !socket || !roomID || !username) return;

    const newMsg = {
      organizationId: roomID,
      userid: user.id,
      mess: messageInput.trim(),
      username: username,
      timestamp: new Date(),
    };

    socket.emit("user-message", newMsg);

    try {
      await fetch(`/api/store-retrive-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMsg),
      });
    } catch (err) {
      console.error("Message save failed:", err);
    }

    setMessages((prev) => [...prev, newMsg]);
    setMessageInput("");
  };

  return (
    <div className="w-full max-w-[1100px] mx-auto mt-10 mb-10 font-sans p-6 border border-gray-300 rounded-2xl shadow-xl bg-gradient-to-br from-gray-50 to-gray-100">
      {/* ✅ Org name printed */}
      <h1 className="text-center text-gray-900 text-3xl md:text-4xl font-extrabold mb-6">
        {orgName ? `💬 ${orgName} Chat` : "💬 Chat"}
      </h1>

      {/* ✅ Reduced height */}
      <div className="min-h-[350px] max-h-[450px] overflow-y-auto p-6 border border-gray-300 rounded-xl mb-5 bg-white shadow-inner">
        {messages.length === 0 && (
          <p className="text-gray-500 text-center text-lg">
            No messages yet. Start the conversation!
          </p>
        )}

        {messages.map((msg, idx) => {
          const isMine = msg.userid === currentUserId;
          return (
            <div
              key={idx}
              className={`flex ${isMine ? "justify-end" : "justify-start"} mb-3`}
            >
              <div
                className={`px-5 py-3 rounded-2xl shadow-md max-w-md break-words text-white ${
                  isMine ? "bg-blue-600 text-right" : "bg-gray-600 text-left"
                }`}
              >
                <p className="text-sm font-semibold mb-1">{msg.username}</p>
                <p className="text-lg">{msg.mess || msg.message}</p>
                <p className="text-xs text-gray-200 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Type a message..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          className="flex-grow p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg shadow-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-colors text-lg font-bold shadow-md"
        >
          Send
        </button>
      </div>
    </div>
  );
}
