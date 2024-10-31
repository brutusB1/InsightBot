// src/components/InsightBot.js

import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Upload, Mic, MicOff, Volume2 } from 'lucide-react';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import Message from './Message';
import TypingIndicator from './TypingIndicator';
import ImageGallery from './tabs/ImageGallery';
import Reports from './tabs/Reports';
import DarkModeToggle from './ui/DarkModeToggle';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css'; // Import default styles
import { motion } from 'framer-motion';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const InsightBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [assistant, setAssistant] = useState(null);
  const [thread, setThread] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState([]); // State for images
  const [reports, setReports] = useState([]); // State for reports
  const [listening, setListening] = useState(false); // State for voice input
  const [ttsEnabled, setTtsEnabled] = useState(true); // State for text-to-speech toggle
  const [charts, setCharts] = useState([]); // State for charts
  const [typing, setTyping] = useState(false); // State for typing indicator

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, charts, typing]);

  // Helper function to extract media from assistant's response
  const extractMedia = (content) => {
    // Extract image URLs using markdown image syntax ![alt](url)
    const imageRegex = /!\[.*?\]\((.*?)\)/g;
    let match;
    while ((match = imageRegex.exec(content)) !== null) {
      setImages((prev) => [...prev, { url: match[1], description: 'Generated Image' }]);
    }

    // Extract report URLs using markdown link syntax [View Report](url)
    const reportRegex = /\[View Report\]\((.*?)\)/g;
    while ((match = reportRegex.exec(content)) !== null) {
      setReports((prev) => [
        ...prev,
        { url: match[1], content: `Report downloaded from [${match[1]}](${match[1]})` },
      ]);
    }

    // Extract chart data using a custom syntax or JSON within the message
    // Example: [Chart: {"type":"bar","data":{...},"options":{...}}]
    const chartRegex = /\[Chart:\s*(\{.*?\})\]/g;
    while ((match = chartRegex.exec(content)) !== null) {
      try {
        const chartData = JSON.parse(match[1]);
        setCharts((prev) => [...prev, chartData]);
      } catch (error) {
        console.error('Failed to parse chart data:', error);
      }
    }
  };

  // File upload handling
  const uploadFile = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('purpose', 'assistants');

      const response = await fetch('https://api.openai.com/v1/files', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error('File upload error:', error);
      return null;
    }
  };

  // Initialize assistant and thread
  useEffect(() => {
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    if (!apiKey) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'API key is missing. Please set it in the environment variables.',
          timestamp: new Date(),
        },
      ]);
      return;
    }

    const init = async () => {
      setLoading(true);
      try {
        // Create assistant
        const assistantResponse = await fetch('https://api.openai.com/v1/assistants', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            'OpenAI-Beta': 'assistants=v1',
          },
          body: JSON.stringify({
            name: 'InsightBot',
            instructions:
              `You are a laid-back but Snoopdogg-esque professional AI assistant working at a SaaS company specializing in sales engagement for senior living facilities. Your primary responsibilities include:

1. **Analyzing Video Engagement Data:**
   - Examine and interpret video interactions to gauge prospect interest and behavior patterns.
   - Utilize advanced analytics to identify trends and key insights from engagement data.

2. **Providing Insights:**
   - Offer personalized, actionable next steps for sales representatives to effectively engage with each prospect.
   - Present data-driven recommendations to optimize sales strategies and improve engagement outcomes.

3. **Acting as a Sales Development Representative (SDR):**
   - When appropriate, assist sales reps by handling legwork, conducting in-depth analysis, and preparing necessary materials to support the sales process.
   - Manage follow-ups and nurture leads to ensure a steady pipeline of prospects.

4. **Facilitating Move-Ins:**
   - Support the transition process for seniors and their adult children into senior living facilities by providing relevant information, assistance, and coordination.
   - Ensure a smooth and stress-free move-in experience through effective communication and logistical support.

5. **Voice Interaction:**
   - Engage with users through natural and intuitive voice interactions, allowing for hands-free access to information and insights.
   - Respond to voice commands to perform tasks such as data analysis, generating reports, and providing recommendations.

6. **Creating Visualizations:**
   - Generate clear and compelling visualizations (e.g., charts, graphs, dashboards) to represent engagement data and insights.
   - Customize visual reports based on user preferences and specific analytical needs.
   - Integrate visual aids into presentations and reports to enhance understanding and decision-making.

**Communication Style:**
- **Casual and Informative:** Maintain a relaxed, conversational tone inspired by Snoopdogg, making complex data and insights easy to understand.
- **Professional and Reliable:** Ensure all interactions are trustworthy and uphold a high standard of professionalism despite the casual demeanor.
- **Interactive and Engaging:** Utilize voice and visual elements to create a dynamic and interactive user experience.

**Ultimate Goal:**
Enhance the sales process by increasing move-ins through insightful data analysis, personalized support for sales representatives, seamless assistance in transitioning seniors and their families into senior living communities, and providing an engaging user experience through voice and visual tools.

**Additional Guidelines:**
- **Clarity and Conciseness:** Prioritize clear and concise communication in all interactions.
- **Adaptability:** Adjust your tone and presentation style to match the context while maintaining your laid-back persona.
- **Actionable Recommendations:** Ensure all suggestions and insights are practical and aligned with the company's objectives.
- **User-Friendly Visuals:** Create visualizations that are easy to interpret and effectively convey the necessary information.
- **Responsive Voice Interactions:** Provide accurate and timely responses to voice commands, ensuring a seamless user experience.`,
            model: 'gpt-4-turbo',
            tools: [{ type: 'retrieval' }],
          }),
        });

        if (!assistantResponse.ok) {
          throw new Error(`Assistant creation failed: ${assistantResponse.statusText}`);
        }

        const assistantData = await assistantResponse.json();
        setAssistant(assistantData);

        // Create thread
        const threadResponse = await fetch('https://api.openai.com/v1/threads', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'OpenAI-Beta': 'assistants=v1',
          },
        });

        if (!threadResponse.ok) {
          throw new Error(`Thread creation failed: ${threadResponse.statusText}`);
        }

        const threadData = await threadResponse.json();
        setThread(threadData);

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Hello! I’m InsightBot. You can upload sales data files, ask me questions, or request visualizations.',
            timestamp: new Date(),
          },
        ]);
      } catch (error) {
        console.error('Init error:', error);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Oops, failed to initialize the assistant. Please check your API key.',
            timestamp: new Date(),
          },
        ]);
      }
      setLoading(false);
    };

    init();
  }, []);

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    setUploading(true);

    try {
      // Upload each file and get file IDs
      const fileIds = await Promise.all(selectedFiles.map(uploadFile));
      const validFileIds = fileIds.filter((id) => id !== null);

      // Update assistant with new files
      if (assistant && validFileIds.length > 0) {
        const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
        const updateResponse = await fetch(`https://api.openai.com/v1/assistants/${assistant.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            'OpenAI-Beta': 'assistants=v1',
          },
          body: JSON.stringify({
            file_ids: [...(assistant.file_ids || []), ...validFileIds],
          }),
        });

        if (!updateResponse.ok) {
          throw new Error(`Assistant update failed: ${updateResponse.statusText}`);
        }

        setFiles((prev) => [...prev, ...selectedFiles.map((f) => f.name)]);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `Great! Added ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}. How can I assist you with them? You can ask questions, request visualizations, or use quick actions below.`,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error('File handling error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an issue with your files. Please try uploading them again.',
          timestamp: new Date(),
        },
      ]);
    }
    setUploading(false);
  };

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition API not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      sendMessage(transcript);
      setListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };
  }, [assistant, thread]);

  const toggleListening = () => {
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  const toggleTts = () => {
    setTtsEnabled(!ttsEnabled);
  };

  const speak = (text) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech Synthesis API not supported in this browser.');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = async (userInput = null) => {
    const messageContent = userInput || input;
    if (!messageContent.trim() || !assistant || !thread) return;

    setLoading(true);
    const userMessage = {
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    if (!userInput) setInput('');

    try {
      const apiKey = process.env.REACT_APP_OPENAI_API_KEY;

      // Add message to thread
      const addMessageResponse = await fetch(
        `https://api.openai.com/v1/threads/${thread.id}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            'OpenAI-Beta': 'assistants=v1',
          },
          body: JSON.stringify({
            role: 'user',
            content: messageContent,
          }),
        }
      );

      if (!addMessageResponse.ok) {
        throw new Error(`Adding message failed: ${addMessageResponse.statusText}`);
      }

      // Run the assistant
      const runResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'OpenAI-Beta': 'assistants=v1',
        },
        body: JSON.stringify({
          assistant_id: assistant.id,
        }),
      });

      if (!runResponse.ok) {
        throw new Error(`Running assistant failed: ${runResponse.statusText}`);
      }

      const runData = await runResponse.json();

      setTyping(true); // Show typing indicator

      // Poll for completion with a timeout
      const pollForCompletion = async () => {
        const maxAttempts = 30; // 30 seconds timeout
        let attempts = 0;
        while (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const statusResponse = await fetch(
            `https://api.openai.com/v1/threads/${thread.id}/runs/${runData.id}`,
            {
              headers: {
                Authorization: `Bearer ${apiKey}`,
                'OpenAI-Beta': 'assistants=v1',
              },
            }
          );

          if (!statusResponse.ok) {
            throw new Error(`Status check failed: ${statusResponse.statusText}`);
          }

          const statusData = await statusResponse.json();
          if (statusData.status === 'completed') {
            return statusData;
          }
          attempts += 1;
        }
        throw new Error('Assistant response timed out.');
      };

      const completedRun = await pollForCompletion();

      setTyping(false); // Hide typing indicator

      // Get messages
      const messagesResponse = await fetch(
        `https://api.openai.com/v1/threads/${thread.id}/messages`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'OpenAI-Beta': 'assistants=v1',
          },
        }
      );

      if (!messagesResponse.ok) {
        throw new Error(`Fetching messages failed: ${messagesResponse.statusText}`);
      }

      const messagesData = await messagesResponse.json();

      // Find the latest assistant message
      const latestMessage = messagesData.data.find(
        (msg) =>
          msg.role === 'assistant' &&
          !messages.some((m) => m.content === msg.content[0].text.value)
      );

      if (latestMessage) {
        const assistantContent = latestMessage.content[0].text.value;
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: assistantContent,
            timestamp: new Date(),
          },
        ]);

        // Extract media (images, reports, charts)
        extractMedia(assistantContent);

        // Speak the assistant's response if TTS is enabled
        if (ttsEnabled) {
          speak(assistantContent);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Hmm, I didn’t catch that. Could you rephrase?',
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setTyping(false); // Ensure typing indicator is hidden on error
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Oops, something went wrong. Please try again later.',
          timestamp: new Date(),
        },
      ]);
    }
    setLoading(false);
  };

  // Define Quick Action Buttons
  const quickActions = [
    { label: 'Show Sales Report', action: () => sendMessage('Show me the sales report.') },
    { label: 'Generate Visualization', action: () => sendMessage('Generate a sales chart.') },
    { label: 'Summarize Data', action: () => sendMessage('Summarize the uploaded sales data.') },
    // Add more as needed
  ];

  return (
    <Card className="max-w-4xl mx-auto p-6 shadow-lg rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-white">InsightBot</h1>
        <DarkModeToggle />
      </div>
      <Tabs>
        <TabList className="flex space-x-4 border-b-2 border-purple-300 mb-4">
          <Tab className="py-2 px-4 cursor-pointer focus:outline-none">Chat</Tab>
          <Tab className="py-2 px-4 cursor-pointer focus:outline-none">Images</Tab>
          <Tab className="py-2 px-4 cursor-pointer focus:outline-none">Reports</Tab>
          <Tab className="py-2 px-4 cursor-pointer focus:outline-none">Visualizations</Tab>
        </TabList>

        <TabPanel>
          {/* File Upload */}
          <div className="mb-4">
            <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-purple-400 rounded-lg cursor-pointer hover:bg-purple-50 transition-colors">
              <Upload className="h-6 w-6 text-purple-600" />
              <span className="text-purple-700">Drop files here or click to upload</span>
              <input
                type="file"
                onChange={handleFileChange}
                multiple
                className="hidden"
                accept=".pdf,.csv,.txt,.json"
                aria-label="File Upload"
              />
            </label>
            {uploading && (
              <div className="mt-2 flex items-center text-sm text-purple-700">
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Uploading files...
              </div>
            )}
            {files.length > 0 && (
              <div className="mt-2 text-sm text-purple-700">
                Uploaded: {files.join(', ')}
              </div>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="mb-4 flex flex-wrap gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* Chat Window */}
          <div className="h-96 overflow-y-auto mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-inner">
            {messages.map((msg, i) => (
              <Message
                key={i}
                role={msg.role}
                content={msg.content}
                timestamp={msg.timestamp}
              />
            ))}
            {typing && <TypingIndicator />}
            {loading && !typing && (
              <div className="flex items-center justify-center mt-4">
                <Loader2 className="animate-spin h-6 w-6 text-purple-600" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input and Voice Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleListening}
              className={`p-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                listening ? 'bg-red-500 hover:bg-red-600' : ''
              }`}
              aria-label="Toggle Voice Input"
            >
              {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask InsightBot anything..."
              disabled={loading || !assistant || !thread}
              className="flex-1 focus:ring-2 focus:ring-purple-600"
              aria-label="Message Input"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading || !assistant || !thread}
              className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send Message"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>

          {/* TTS Toggle */}
          <div className="mt-2 flex items-center space-x-2">
            <Volume2 className="h-5 w-5 text-purple-600" />
            <label htmlFor="tts-toggle" className="text-purple-700 dark:text-purple-300">
              Read Responses Aloud
            </label>
            <input
              id="tts-toggle"
              type="checkbox"
              checked={ttsEnabled}
              onChange={toggleTts}
              className="toggle-checkbox hidden"
            />
            <label htmlFor="tts-toggle" className="toggle-label block w-12 h-6 rounded-full bg-gray-300 dark:bg-gray-600 cursor-pointer"></label>
          </div>
        </TabPanel>

        <TabPanel>
          <ImageGallery images={images} />
        </TabPanel>

        <TabPanel>
          <Reports reports={reports} />
        </TabPanel>

        <TabPanel>
          {charts.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No visualizations to display.</p>
          ) : (
            <div className="space-y-6">
              {charts.map((chart, index) => (
                <div key={index} className="border rounded-lg p-5 bg-gray-100 dark:bg-gray-700 shadow-inner">
                  <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">
                    Visualization {index + 1}
                  </h3>
                  {chart.type === 'bar' && (
                    <Bar
                      data={chart.data}
                      options={chart.options}
                      className="w-full h-64"
                    />
                  )}
                  {chart.type === 'line' && (
                    <Line
                      data={chart.data}
                      options={chart.options}
                      className="w-full h-64"
                    />
                  )}
                  {/* Add more chart types as needed */}
                </div>
              ))}
            </div>
          )}
        </TabPanel>
      </Tabs>
    </Card>
  );
};

export default InsightBot;
