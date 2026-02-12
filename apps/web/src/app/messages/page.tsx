'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, MessageSquare, Phone, User, Calendar, Filter } from 'lucide-react';
import { format } from 'date-fns';

interface Message {
  id: string;
  leadId: string;
  leadName: string;
  leadPhone: string;
  message: string;
  direction: 'inbound' | 'outbound';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  createdAt: Date;
}

const messagesApi = {
  getAll: async (businessId: string): Promise<Message[]> => {
    const res = await fetch(`/api/whatsapp/messages?businessId=${businessId}`);
    if (!res.ok) throw new Error('Failed to fetch messages');
    return res.json();
  },
  send: async (data: { businessId: string; leadId: string; message: string }) => {
    const res = await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
  },
};

export default function MessagesPage() {
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [directionFilter, setDirectionFilter] = useState<'all' | 'inbound' | 'outbound'>('all');
  const queryClient = useQueryClient();
  const businessId = 'temp-business-id'; // Get from context

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', businessId],
    queryFn: () => messagesApi.getAll(businessId),
  });

  const sendMutation = useMutation({
    mutationFn: messagesApi.send,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      setMessageText('');
    },
  });

  const filteredMessages = messages.filter((msg) =>
    directionFilter === 'all' ? true : msg.direction === directionFilter
  );

  const groupedMessages = filteredMessages.reduce((acc, msg) => {
    const leadId = msg.leadId;
    if (!acc[leadId]) {
      acc[leadId] = {
        leadName: msg.leadName,
        leadPhone: msg.leadPhone,
        messages: [],
      };
    }
    acc[leadId].messages.push(msg);
    return acc;
  }, {} as Record<string, { leadName: string; leadPhone: string; messages: Message[] }>);

  const handleSendMessage = () => {
    if (!selectedLead || !messageText.trim()) return;
    
    sendMutation.mutate({
      businessId,
      leadId: selectedLead,
      message: messageText,
    });
  };

  return (
    <div className="h-full flex">
      {/* Sidebar - Contact List */}
      <div className="w-1/3 border-r bg-white flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold mb-4">Messages</h2>
          
          {/* Filter */}
          <div className="flex gap-2 mb-4">
            {['all', 'inbound', 'outbound'].map((filter) => (
              <button
                key={filter}
                onClick={() => setDirectionFilter(filter as any)}
                className={`px-3 py-1 rounded text-sm ${
                  directionFilter === filter
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {Object.entries(groupedMessages).map(([leadId, data]) => {
            const lastMessage = data.messages[data.messages.length - 1];
            
            return (
              <div
                key={leadId}
                onClick={() => setSelectedLead(leadId)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                  selectedLead === leadId ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="font-semibold truncate">{data.leadName}</div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(lastMessage.createdAt), 'HH:mm')}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {data.leadPhone}
                    </div>
                    <div className="text-sm text-gray-600 truncate mt-1">
                      {lastMessage.direction === 'outbound' && '✓ '}
                      {lastMessage.message}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedLead ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold">
                    {groupedMessages[selectedLead]?.leadName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {groupedMessages[selectedLead]?.leadPhone}
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {groupedMessages[selectedLead]?.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      msg.direction === 'outbound'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-800 border'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">{msg.message}</div>
                    <div
                      className={`text-xs mt-1 ${
                        msg.direction === 'outbound' ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {format(new Date(msg.createdAt), 'HH:mm')}
                      {msg.direction === 'outbound' && (
                        <span className="ml-1">
                          {msg.status === 'sent' && '✓'}
                          {msg.status === 'delivered' && '✓✓'}
                          {msg.status === 'read' && '✓✓ Read'}
                          {msg.status === 'failed' && '✗'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || sendMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg flex items-center gap-2"
                >
                  <Send className="h-5 w-5" />
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
