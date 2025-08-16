import React, { useEffect, useState } from 'react';
import './AllMessages.css';

export default function AllMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMessages() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/moderacija/messages`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to fetch messages');
        const data = await res.json();
        setMessages(data.messages || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchMessages();
  }, []);

  if (loading) return <div>Loading messages...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="all-messages">
      <h2>All Messages</h2>
      {messages.length === 0 ? (
        <div>No messages found.</div>
      ) : (
        <ul>
          {messages.map((msg, idx) => (
            <li key={idx}>
              <strong>{msg.fullname || msg.name || 'Unknown'}:</strong> {msg.subject}<br />
              <span>{msg.message}</span>
              <div style={{fontSize: '0.8em', color: '#888'}}>{msg.email}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
