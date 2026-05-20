'use client';
import React, { useState } from 'react';

export default function TalentLink() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Talent-Link Core UI Active. Chat with the AI or use the evaluation panel on the right to match candidates.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [jdInput, setJdInput] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [matchResults, setMatchResults] = useState<any[]>([]);

  // 1. CONVERSATIONAL PIPELINE ENGINE
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = { role: 'user', content: input };
    const currentMessages = [...messages, userMsg];
    setMessages(currentMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/langflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });
      const data = await response.json();
      setMessages([...currentMessages, { role: 'assistant', content: data.text || "No output returned." }]);
    } catch (error) {
      setMessages([...currentMessages, { role: 'assistant', content: "Error connecting to gateway." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. VECTOR MATRIX MATCHING ENGINE
  const handleMatchCandidates = async () => {
    if (!jdInput.trim() || isMatching) return;
    setIsMatching(true);
    
    try {
      const response = await fetch('/api/langflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `Rank top 3 candidates out of the 10 in the database for this specific JD. Provide names and matching score percentages: ${jdInput}` })
      });
      const data = await response.json();
      
      setMatchResults([
        { title: "Analysis Complete", details: data.text || "Matches processed." }
      ]);
    } catch (error) {
      setMatchResults([{ title: "Error", details: "Could not fetch rank matrix." }]);
    } finally {
      setIsMatching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleMatchCandidates();
    }
  };

  const copyToClipboard = (text: string) => {
    const cleanText = text.replace(/### /g, '').replace(/\*\*/g, '');
    navigator.clipboard.writeText(cleanText);
    alert('Copied to clipboard!');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', fontFamily: 'sans-serif', margin: 0, backgroundColor: '#0f172a' }}>
      
      {/* COLUMN 1: SIDEBAR (Logo, Status, and Vector Cache Stack) */}
      <div style={{ width: '260px', backgroundColor: '#020617', color: '#ffffff', padding: '20px', display: 'flex', flexDirection: 'column', borderRight: '1px solid #1e293b', justifyContent: 'space-between' }}>
        <div>
          {/* FUSED THREE-IN-ONE BRAND LOGO COMPONENT */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid #1e293b' }}>
            <div style={{ display: 'flex', background: '#0f172a', padding: '6px', borderRadius: '8px', border: '1px solid #10b981' }}>
              <span style={{ fontSize: '16px' }}>📄</span>
              <span style={{ fontSize: '16px', marginLeft: '-4px', marginRight: '-4px' }}>👤</span>
              <span style={{ fontSize: '16px' }}>💼</span>
            </div>
            <h2 style={{ fontSize: '18px', margin: 0, fontWeight: '800', color: '#38bdf8', letterSpacing: '0.5px' }}>Talent-Link AI</h2>
          </div>

          <div style={{ padding: '10px', backgroundColor: '#1e293b', borderRadius: '6px', fontSize: '12px', color: '#93c5fd', marginBottom: '25px', fontWeight: '600', borderLeft: '3px solid #10b981' }}>
            🟢 Vector Pipeline: Active
          </div>

          {/* VISUAL DATABASE STACK COMPONENT */}
          <div style={{ marginBottom: '20px', backgroundColor: '#0f172a', padding: '15px', borderRadius: '8px', border: '1px solid #1e293b', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', marginBottom: '5px' }}>🗄️</div>
            <div style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1px' }}>Astra DB Storage</div>
            <div style={{ fontSize: '14px', color: '#10b981', fontWeight: 'bold', marginTop: '4px' }}>10 Live Resumes</div>
          </div>
        </div>

        {/* RECENT CHATS / PROJECT HISTORY GRID */}
        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '15px' }}>
          <div style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', marginBottom: '10px', fontWeight: 'bold', letterSpacing: '0.5px' }}>Recent Chat History</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', backgroundColor: '#1e293b', borderRadius: '6px', fontSize: '12px', color: '#cbd5e1', cursor: 'pointer' }}>
              <span>📁</span> Project: React Team
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', backgroundColor: '#0f172a', borderRadius: '6px', fontSize: '12px', color: '#64748b', cursor: 'pointer' }}>
              <span>📁</span> Project: SAP Migration
            </div>
          </div>
        </div>
      </div>

      {/* COLUMN 2: CONVERSATIONAL INTELLIGENCE FEED */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid #1e293b', backgroundColor: '#1e293b' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#020617' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>💬</span>
            <h1 style={{ fontSize: '16px', margin: 0, fontWeight: '700', color: '#38bdf8' }}>Middle Chat Hub</h1>
          </div>
          <button onClick={() => setMessages([{ role: 'assistant', content: 'Conversation workspace reset successfully.' }])} style={{ backgroundColor: 'transparent', border: '1px solid #334155', color: '#94a3b8', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>Clear Feed</button>
        </div>

        {/* CHAT DISPLAY LOG WITH DYNAMIC PROFILE AVATARS */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-start' }}>
              {m.role !== 'user' && (
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>🤖</div>
              )}
              
              <div style={{ 
                maxWidth: '75%', 
                padding: '14px 18px', 
                borderRadius: '12px', 
                fontSize: '13px', 
                lineHeight: '1.6', 
                whiteSpace: 'pre-wrap', 
                backgroundColor: m.role === 'user' ? '#047857' : '#ffffff', 
                color: m.role === 'user' ? '#ffffff' : '#1e293b', 
                border: m.role === 'user' ? 'none' : '1px solid #cbd5e1',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
              }}>
                {m.content.replace(/### /g, '').replace(/\*\*/g, '')}
                
                {m.role === 'assistant' && (
                  <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                    <button onClick={() => copyToClipboard(m.content)} style={{ backgroundColor: 'transparent', border: 'none', color: '#047857', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>📋 Copy Response</button>
                  </div>
                )}
              </div>

              {m.role === 'user' && (
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>👤</div>
              )}
            </div>
          ))}
          {isLoading && <div style={{ color: '#93c5fd', fontSize: '12px', fontStyle: 'italic', paddingLeft: '44px' }}>Extracting details from vector database...</div>}
        </div>

        {/* INPUT INTERFACE SECTION */}
        <form onSubmit={handleSend} style={{ padding: '15px', borderTop: '1px solid #1e293b', display: 'flex', gap: '10px', backgroundColor: '#020617' }}>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask anything about candidate matching profile queries..." style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #334155', fontSize: '13px', backgroundColor: '#ffffff', color: '#000000', outline: 'none' }} />
          <button type="submit" style={{ backgroundColor: '#047857', border: 'none', padding: '0 22px', borderRadius: '8px', cursor: 'pointer', color: '#fff', fontWeight: 'bold', fontSize: '13px' }}>Send</button>
        </form>
      </div>

      {/* COLUMN 3: REQUIREMENT EVALUATION CONTROL MATRIX */}
      <div style={{ width: '400px', display: 'flex', flexDirection: 'column', backgroundColor: '#020617', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '16px' }}>⚡</span>
            <h2 style={{ fontSize: '15px', margin: 0, fontWeight: '700', color: '#38bdf8' }}>Right Requirement Matrix Panel</h2>
          </div>
          <button onClick={() => { setJdInput(''); setMatchResults([]); }} style={{ backgroundColor: 'transparent', border: 'none', color: '#f87171', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>Reset</button>
        </div>
        <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 15px 0' }}>Paste standard enterprise job description criteria text down below.</p>

        {/* MAIN REQUIREMENT INPUT FIELD (10% Pure White Accent) */}
        <textarea 
          value={jdInput}
          onChange={(e) => setJdInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="INPUT JD: Paste profile requirements here... (Press Enter to trigger analytical lookup)" 
          style={{ width: '100%', height: '140px', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b', fontSize: '13px', fontFamily: 'sans-serif', resize: 'none', boxSizing: 'border-box', marginBottom: '12px', backgroundColor: '#ffffff', color: '#000000', outline: 'none', lineHeight: '1.5' }}
        />

        {/* DYNAMIC PIPELINE SUBMIT BUTTON */}
        <button 
          onClick={handleMatchCandidates}
          disabled={isMatching}
          style={{ width: '100%', backgroundColor: '#047857', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', boxShadow: '0 4px 6px -1px rgba(16,185,129,0.2)' }}
        >
          {isMatching ? 'Processing Vector Matches...' : '⚡ Match Best Candidates'}
        </button>

        {/* OUTPUT SCORECARD CARD DISPLAY STRUCTURE */}
        <div style={{ flex: 1, marginTop: '20px', overflowY: 'auto' }}>
          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.5px' }}>Analysis Output Grid</div>
          
          {matchResults.map((res, index) => (
            <div key={index} style={{ backgroundColor: '#ffffff', padding: '15px', borderRadius: '8px', border: '1px solid #cbd5e1', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                <span style={{ fontWeight: 'bold', color: '#047857', fontSize: '13px' }}>{res.title}</span>
                <button onClick={() => copyToClipboard(res.details)} style={{ backgroundColor: 'transparent', border: 'none', color: '#64748b', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>📋 Copy Matrix</button>
              </div>
              <div style={{ fontSize: '12px', color: '#1e293b', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{res.details}</div>
            </div>
          ))}
          
          {matchResults.length === 0 && (
            <div style={{ border: '2px dashed #1e293b', borderRadius: '8px', padding: '40px 20px', textAlign: 'center', color: '#475569', fontSize: '12px' }}>
              No evaluations run yet. Paste requirement specifications or press Enter to generate matching matrix score cards.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}