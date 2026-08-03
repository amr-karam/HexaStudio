import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

// Define the props interface
interface PremiumChatProps {
  currentUser: User;
  messages: Message[];
  onSendMessage: (content: string, attachments?: FileAttachment[]) => void;
  onReaction?: (messageId: string, reaction: Reaction) => void;
}

// Define the message interface
interface Message {
  id: string;
  sender: User;
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  reactions?: Reaction[];
  attachments?: FileAttachment[];
}

// Define the user interface
interface User {
  id: string;
  name: string;
  avatar: string;
}

// Define the file attachment interface
interface FileAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  preview?: string;
}

// Define the reaction interface
interface Reaction {
  emoji: string;
  users: string[];
}

const PremiumChat: React.FC<PremiumChatProps> = ({
  currentUser,
  messages,
  onSendMessage,
  onReaction,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim() || attachments.length > 0) {
      onSendMessage(inputValue, attachments);
      setInputValue('');
      setAttachments([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newAttachments = Array.from(e.target.files).map(file => ({
        id: Date.now().toString(),
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      }));
      setAttachments(prev => [...prev, ...newAttachments]);
    }
  };

  const handleAddReaction = (messageId: string, emoji: string) => {
    if (onReaction) {
      onReaction(messageId, { emoji, users: [currentUser.id] });
    }
  };

  const removeAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(attachment => attachment.id !== attachmentId));
  };

  const renderMessage = (message: Message) => {
    const isCurrentUser = message.sender.id === currentUser.id;

    return (
      <div
        key={message.id}
        className={`mb-4 flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
      >
        {!isCurrentUser && (
          <Image
            src={message.sender.avatar}
            alt={message.sender.name}
            width={32}
            height={32}
            unoptimized
            className="w-8 h-8 rounded-full mr-2"
          />
        )}
        <div
          className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-lg p-3 ${
            isCurrentUser
              ? 'bg-blue-500 text-white rounded-br-none'
              : 'bg-gray-200 text-gray-800 rounded-bl-none'
          }`}
        >
          {message.attachments && message.attachments.length > 0 && (
            <div className="mb-2">
              {message.attachments.map(attachment => (
                <div key={attachment.id} className="mb-2">
                  {attachment.type.startsWith('image/') ? (
                    <Image
                      src={attachment.preview || attachment.url}
                      alt={attachment.name}
                      width={320}
                      height={240}
                      unoptimized
                      className="max-w-xs rounded"
                    />
                  ) : (
                    <div className="flex items-center p-2 bg-gray-100 rounded">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm6 6H7v2h6v-2zm-3 2v2H7v-2h2zm2 0h2v2h-2v-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div>
                        <p className="font-medium">{attachment.name}</p>
                        <p className="text-xs text-gray-500">{attachment.type}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="whitespace-pre-wrap">{message.content}</div>
          <div className={`flex items-center justify-end mt-1 text-xs`}>
            <span className="mr-2">{new Date(message.timestamp).toLocaleTimeString()}</span>
            {message.status === 'read' && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 18.686l-7.828-7.828a4 4 0 010-5.656z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M10 6.343L8.828 5.172a4 4 0 115.656 5.656L10 18.686l-1.172-1.171a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex mt-1">
              {message.reactions.map((reaction) => (
                <button
                  key={`${message.id}-${reaction.emoji}`}
                  onClick={() => handleAddReaction(message.id, reaction.emoji)}
                  className="flex items-center justify-center w-6 h-6 mr-1 rounded-full bg-gray-300 hover:bg-gray-400"
                >
                  <span className="text-xs">{reaction.emoji}</span>
                  <span className="text-xs ml-1">{reaction.users.length}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map(renderMessage)}
        {isTyping && (
          <div className="flex items-center mb-4">
            <Image
              src={currentUser.avatar}
              alt={currentUser.name}
              width={32}
              height={32}
              unoptimized
              className="w-8 h-8 rounded-full mr-2"
            />
            <div className="flex space-x-1">
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {attachments.length > 0 && (
        <div className="p-2 border-t border-gray-200 bg-gray-50">
          <div className="flex overflow-x-auto pb-2">
            {attachments.map(attachment => (
              <div key={attachment.id} className="relative mr-2">
                {attachment.type.startsWith('image/') ? (
                  <Image
                    src={attachment.preview || attachment.url}
                    alt={attachment.name}
                    width={80}
                    height={80}
                    unoptimized
                    className="w-20 h-20 object-cover rounded"
                  />
                ) : (
                  <div className="flex items-center p-2 w-20 h-20 bg-gray-100 rounded">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm6 6H7v2h6v-2zm-3 2v2H7v-2h2zm2 0h2v2h-2v-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
                <button
                  onClick={() => removeAttachment(attachment.id)}
                  className="absolute -top-2 -right-2 bg-white rounded-full p-0.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-end">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 mr-2 text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 1.5" />
            </svg>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            className="hidden"
          />

          <div className="flex-1">
            <div className="flex rounded-lg overflow-hidden border border-gray-300 focus-within:border-blue-500">
              <textarea
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setIsTyping(e.target.value.length > 0);
                }}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 p-2 resize-none min-h-[44px] max-h-32 outline-none"
                rows={1}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() && attachments.length === 0}
                className={`p-2 ${inputValue.trim() || attachments.length > 0 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5.355-1.152a1 1 0 011.17.077l2.6 1.152a1 1 0 001.406-1.17l-2.35-4.848a1 1 0 00-.391-.78l-4.16-1.851a1 1 0 01-.334-.67l1.43-2.967a1 1 0 00-.653-1.093l-5.48-1.115A1 1 0 003.28 7.935l1.97 4.2a1 1 0 001.257.934l5.357-1.152a1 1 0 011.17.077l2.6 1.152z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumChat;
