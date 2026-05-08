"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Send, Upload, FileText, Bot, User, Loader2, Bug, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "bot",
      content: "Hello! I'm your Debugging Assistant. I've indexed the project debugging guide. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:8000/ask", {
        question: input,
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: response.data.answer,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error asking question:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: "Sorry, I encountered an error while processing your request.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("http://localhost:8000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Document uploaded and indexed successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload document.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-[#050505] overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />

      <div className="z-10 w-full max-w-5xl h-[85vh] flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-80 flex flex-col gap-4">
          <div className="glass-card p-6 rounded-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3 text-indigo-400">
              <Bug size={24} />
              <h2 className="text-xl font-bold tracking-tight">DebugRAG</h2>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Upload your career or project docs to start debugging with AI precision.
            </p>
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="mt-2 flex items-center justify-center gap-2 w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-medium transition-all duration-200 active:scale-95 shadow-lg shadow-indigo-500/20"
            >
              {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
              {isUploading ? "Indexing..." : "Upload .docx"}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".docx" 
              className="hidden" 
            />
          </div>

          <div className="glass-card p-6 rounded-2xl flex-1 overflow-hidden hidden md:flex flex-col gap-4">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Active Context</h3>
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
              <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                <FileText size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">debugging.docx</p>
                <p className="text-[10px] text-zinc-500 uppercase">FAISS Indexed</p>
              </div>
            </div>
            
            <div className="mt-auto pt-4 border-t border-white/5">
              <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                <Terminal size={12} />
                <span>GROQ ENGINE: MIXTRAL-8X7B</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 glass-card rounded-2xl flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-zinc-300">AI Assistant Online</span>
            </div>
            <div className="text-[10px] text-zinc-500 font-mono">V1.0.4-STABLE</div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "flex gap-4 max-w-[85%]",
                    msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg",
                    msg.role === "user" ? "bg-indigo-600" : "bg-zinc-800 border border-white/10"
                  )}>
                    {msg.role === "user" ? <User size={16} /> : <Bot size={16} className="text-indigo-400" />}
                  </div>
                  <div className={cn(
                    "p-4 rounded-2xl text-sm leading-relaxed",
                    msg.role === "user" 
                      ? "bg-indigo-600 text-white rounded-tr-none shadow-indigo-500/10 shadow-xl" 
                      : "bg-white/5 border border-white/10 text-zinc-200 rounded-tl-none"
                  )}>
                    {msg.content}
                    <div className={cn(
                      "text-[10px] mt-2 opacity-50",
                      msg.role === "user" ? "text-indigo-100" : "text-zinc-500"
                    )}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="flex gap-4"
              >
                <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center shrink-0">
                  <Bot size={16} className="text-indigo-400" />
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl rounded-tl-none">
                  <Loader2 className="animate-spin text-indigo-400" size={18} />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-white/10 bg-white/5">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about project errors or code..."
                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-4 pr-14 text-sm focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-zinc-600"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg transition-all active:scale-90"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="text-[10px] text-center mt-3 text-zinc-600">
              Powered by Groq Cloud & Local FAISS Database
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
