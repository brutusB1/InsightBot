// src/components/tabs/Reports.js

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const Reports = ({ reports }) => {
  if (reports.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400">No reports to display.</p>;
  }

  return (
    <div className="space-y-6">
      {reports.map((report, index) => (
        <div key={index} className="border rounded-lg p-5 bg-gray-100 dark:bg-gray-700 shadow-inner">
          <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">Report {index + 1}</h3>
          {report.url ? (
            <a
              href={report.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 underline"
            >
              View Report {index + 1}
            </a>
          ) : (
            <div className="prose dark:prose-dark">
              <ReactMarkdown children={report.content} remarkPlugins={[remarkGfm]} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Reports;
