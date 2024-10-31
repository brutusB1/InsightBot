// src/components/Message.js

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';

const Message = ({ role, content, timestamp }) => {
  const isUser = role === 'user';
  const avatar = isUser
    ? 'https://i.pravatar.cc/40?img=3' // Placeholder user avatar
    : 'https://i.pravatar.cc/40?img=5'; // Placeholder assistant avatar

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      {!isUser && (
        <img src={avatar} alt="Assistant Avatar" className="h-8 w-8 rounded-full mr-2" />
      )}
      <div
        className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg shadow ${
          isUser
            ? 'bg-purple-600 text-white rounded-br-none'
            : 'bg-gray-200 text-gray-800 rounded-bl-none dark:bg-gray-700 dark:text-gray-200'
        }`}
      >
        <ReactMarkdown children={content} remarkPlugins={[remarkGfm]} />
        <div className="text-xs text-gray-500 mt-1 text-right">
          {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      {isUser && (
        <img src={avatar} alt="User Avatar" className="h-8 w-8 rounded-full ml-2" />
      )}
    </motion.div>
  );
};

export default Message;
