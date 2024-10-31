// src/components/ui/Input.js

import React from 'react';

export const Input = React.forwardRef(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={`border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 dark:bg-gray-700 dark:text-gray-200 ${className}`}
    {...props}
  />
));

Input.displayName = 'Input'; // For better debugging and accessibility
