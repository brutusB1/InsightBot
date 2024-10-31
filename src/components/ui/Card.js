// src/components/ui/Card.js

import React from 'react';

export const Card = ({ children, className }) => (
  <div className={`bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 ${className}`}>
    {children}
  </div>
);
