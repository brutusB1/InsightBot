// src/components/TypingIndicator.js

import React from 'react';
import { motion } from 'framer-motion';

const TypingIndicator = () => {
  const dotVariants = {
    initial: { y: 0 },
    animate: { y: [0, -10, 0], transition: { duration: 1.5, repeat: Infinity } },
  };

  return (
    <div className="flex items-center space-x-1">
      <motion.div
        className="h-2 w-2 bg-gray-500 dark:bg-gray-400 rounded-full"
        variants={dotVariants}
        initial="initial"
        animate="animate"
      />
      <motion.div
        className="h-2 w-2 bg-gray-500 dark:bg-gray-400 rounded-full"
        variants={dotVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.2 }}
      />
      <motion.div
        className="h-2 w-2 bg-gray-500 dark:bg-gray-400 rounded-full"
        variants={dotVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.4 }}
      />
    </div>
  );
};

export default TypingIndicator;
