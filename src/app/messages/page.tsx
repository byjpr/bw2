"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export default function Messages() {
  const [message, setMessage] = useState("");
  
  // This would be a query to fetch the user's messages
  // For now, we'll use mock data
  const messagesData = [
    {
      id: "1",
      from: { id: "admin1", name: "Admin User", role: "ASSOCIATION_ADMIN" },
      content: "Your application to London Central has been received.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    },
    {
      id: "2",
      from: { id: "user1", name: "You", role: "USER" },
      content: "Thank you! When can I expect to hear back?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
    },
    {
      id: "3",
      from: { id: "admin1", name: "Admin User", role: "ASSOCIATION_ADMIN" },
      content: "We'll review your application within the next 2-3 days.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23), // 23 hours ago
    },
  ];
  
  // This would be a mutation to send a message
  const sendMessageMutation = {
    mutate: (content: string) => {
      console.log("Sending message:", content);
      setMessage("");
    },
    isLoading: false,
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessageMutation.mutate(message);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Thread: London Central Application</h2>
        </div>
        
        <div className="h-96 p-4 overflow-y-auto">
          {messagesData.map((msg) => (
            <div 
              key={msg.id} 
              className={`mb-4 flex ${msg.from.role === "USER" ? "justify-end" : "justify-start"}`}
            >
              <div 
                className={`max-w-3/4 rounded-lg p-3 ${
                  msg.from.role === "USER" 
                    ? "bg-blue-100 text-blue-900" 
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <div className="font-semibold text-sm mb-1">
                  {msg.from.name}
                </div>
                <div>
                  {msg.content}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {msg.timestamp.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 border rounded"
              required
            />
            <button
              type="submit"
              disabled={sendMessageMutation.isLoading || !message.trim()}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              Send
            </button>
          </form>
        </div>
      </div>
      
      <div className="mt-6 text-center text-sm text-gray-600">
        <p>You can only message admins during applications and events.</p>
      </div>
    </div>
  );
}