import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase/client';
import { Send } from 'lucide-react';
import { format } from 'date-fns';

interface Message {
  id: string;
  message: string;
  created_at: string;
  user_id?: string;
  user: {
    full_name: string;
    avatar_url: string;
  };
}

interface GameChatProps {
  gameId: string;
  onClose: () => void;
}

export default function GameChat({ gameId, onClose }: GameChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();

    // Fetch existing messages
    fetchMessages();

    // Mock subscription for development
    const mockSubscription = setInterval(() => {
      // This is just for development, will be replaced by real subscription
    }, 5000);

    return () => {
      clearInterval(mockSubscription);
    };
  }, [gameId]);

  const fetchMessages = async () => {
    try {
      // For development, use mock data instead of actual fetch
      const mockMessages = [
        {
          id: '1',
          message: "Hey everyone, I will be there at 6pm sharp!",
          created_at: new Date().toISOString(),
          user_id: '123',
          user: {
            full_name: 'John Doe',
            avatar_url: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
          }
        },
        {
          id: '2',
          message: "I might be 10 minutes late, traffic is bad",
          created_at: new Date(Date.now() - 300000).toISOString(),
          user_id: '456',
          user: {
            full_name: 'Sarah Williams',
            avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
          }
        }
      ];
      setMessages(mockMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // For development, just add the message locally
    const mockMessage = {
      id: Date.now().toString(),
      message: newMessage.trim(),
      created_at: new Date().toISOString(),
      user_id: user?.id || 'current-user',
      user: {
        full_name: user?.user_metadata?.full_name || user?.email || 'You',
        avatar_url: user?.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      }
    };

    setMessages((current) => [...current, mockMessage]);
    setNewMessage('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-nike-gray-800 rounded-lg shadow-xl w-full max-w-lg h-[80vh] flex flex-col transition-colors duration-300">
        {/* Header */}
        <div className="p-4 border-b border-nike-gray-200 dark:border-nike-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-nike-black dark:text-nike-white">Game Chat</h3>
          <button
            onClick={onClose}
            className="text-nike-gray-400 hover:text-nike-gray-500 dark:hover:text-nike-gray-300"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.user_id === user?.id ? 'justify-end' : ''
              }`}
            >
              {message.user_id !== user?.id && (
                <img
                  src={message.user.avatar_url || 'https://via.placeholder.com/40'}
                  alt=""
                  className="h-8 w-8 rounded-full"
                />
              )}
              <div
                className={`flex flex-col ${
                  message.user_id === user?.id ? 'items-end' : ''
                }`}
              >
                <div
                  className={`rounded-lg px-4 py-2 max-w-sm ${
                    message.user_id === user?.id
                      ? 'bg-nike-red text-white'
                      : 'bg-nike-gray-100 dark:bg-nike-gray-700 text-nike-black dark:text-nike-white'
                  }`}
                >
                  <p className="text-sm">{message.message}</p>
                </div>
                <span className="text-xs text-nike-gray-500 dark:text-nike-gray-400 mt-1">
                  {format(new Date(message.created_at), 'h:mm a')}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={sendMessage} className="p-4 border-t border-nike-gray-200 dark:border-nike-gray-700">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-full border-nike-gray-300 dark:border-nike-gray-600 bg-white dark:bg-nike-gray-700 text-nike-black dark:text-nike-white placeholder-nike-gray-500 dark:placeholder-nike-gray-400 focus:border-nike-red focus:ring-nike-red"
            />
            <button
              type="submit"
              className="rounded-full bg-nike-red p-2 text-white hover:bg-nike-black transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}