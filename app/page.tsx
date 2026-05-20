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
    <div style={{ display: 'flex', height: '100vh', width: '100vw', fontFamily: 'system-ui, -apple-system, sans-serif', margin: 0, backgroundColor: '#090d16', color: '#f8fafc', overflow: 'hidden' }}>
      
      {/* COLUMN 1: SIDEBAR (Premium Cyberpunk Minimalist Base) */}
      <div style={{ width: '280px', backgroundColor: '#030712', padding: '24px 20px', display: 'flex', flexDirection: 'column', borderRight: '1px solid #1e293b', justifyContent: 'space-between', boxShadow: '4px 0 24px rgba(0,0,0,0.4)' }}>
        <div>
          {/* FUSED THREE-IN-ONE BRAND LOGO COMPONENT */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #1e293b' }}>
            <div style={{ display: 'flex', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '8px', borderRadius: '10px', border: '1px solid #10b981', boxShadow: '0 0 12px rgba(16,185,129,0.2)' }}>
              <span style={{ fontSize: '18px' }}>📄</span>
              <span style={{ fontSize: '18px', marginLeft: '-5px', marginRight: '-5px' }}>👤</span>
              <span style={{ fontSize: '18px' }}>💼</span>
            </div>
            <h2 style={{ fontSize: '18px', margin: 0, fontWeight: '800', background: 'linear-gradient(90deg, #38bdf8, #0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '0.5px' }}>Talent-Link AI</h2>
          </div>

          {/* PULSING SYSTEM STATE BADGE */}
          <div style={{ padding: '12px 14px', backgroundColor: 'rgba(30,41,59,0.5)', borderRadius: '8px', fontSize: '12px', color: '#38bdf8', marginBottom: '25px', fontWeight: '600', borderLeft: '4px solid #10b981', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%', boxShadow: '0 0 8px #10b981' }}></span>
            Pipeline Status: Engine Active
          </div>

          {/* VISUAL DATABASE GLOWING STACK */}
          <div style={{ marginBottom: '20px', background: 'linear-gradient(145deg, #0f172a, #030712)', padding: '20px 15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px', filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.3))' }}>🗄️</div>
            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '1px' }}>Astra DB Engine</div>
            <div style={{ fontSize: '15px', color: '#10b981', fontWeight: '800', marginTop: '6px', letterSpacing: '0.5px' }}>10 Live Resumes</div>
          </div>
        </div>

        {/* RECENT CHATS / PROJECT HISTORY */}
        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '20px' }}>
          <div style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', marginBottom: '12px', fontWeight: '700', letterSpacing: '0.5px' }}>Active Projects</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', backgroundColor: '#1e293b', borderRadius: '8px', fontSize: '13px', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'all 0.2s' }}>
              <span style={{ opacity: 0.8 }}>📁</span> Project: React Team
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', backgroundColor: 'transparent', borderRadius: '8px', fontSize: '13px', color: '#64748b', cursor: 'pointer' }}>
              <span style={{ opacity: 0.5 }}>📁</span> Project: SAP Migration
            </div>
          </div>
        </div>
      </div>

      {/* COLUMN 2: CHAT HUB (Glassmorphic Interface Hub) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid #1e293b', backgroundColor: '#0f172a', backgroundImage: 'radial-gradient(at top right, #042f2e 0%, #0f172a 60%)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(3,7,18,0.7)', backdropFilter: 'blur(12px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>💬</span>
            <h1 style={{ fontSize: '16px', margin: 0, fontWeight: '700', color: '#f8fafc' }}>Conversational Intelligence</h1>
          </div>
          <button onClick={() => setMessages([{ role: 'assistant', content: 'Workspace feed refreshed.' }])} style={{ backgroundColor: 'transparent', border: '1px solid #334155', color: '#94a3b8', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}>Reset Feed</button>
        </div>

        {/* MESSAGES LAYER GRID */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: '14px', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-start' }}>
              {m.role !== 'user' && (
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', boxShadow: '0 4px 12px rgba(4,120,87,0.3)', border: '1px solid #10b981' }}>🤖</div>
              )}
              
              <div style={{ 
                maxWidth: '70%', 
                padding: '16px 20px', 
                borderRadius: '14px', 
                fontSize: '13.5px', 
                lineHeight: '1.6', 
                whiteSpace: 'pre-wrap', 
                backgroundColor: m.role === 'user' ? '#047857' : '#ffffff', 
                color: m.role === 'user' ? '#ffffff' : '#0f172a', 
                border: m.role === 'user' ? '1px solid #10b981' : 'none',
                boxShadow: m.role === 'user' ? '0 4px 14px rgba(4,120,87,0.2)' : '0 10px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.3)',
                transform: 'translateY(0)'
              }}>
                {m.content.replace(/### /g, '').replace(/\*\*/g, '')}
                
                {m.role === 'assistant' && (
                  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                    <button onClick={() => copyToClipboard(m.content)} style={{ backgroundColor: 'transparent', border: 'none', color: '#047857', fontSize: '11px', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>📋 Copy Response</button>
                  </div>
                )}
              </div>

              {m.role === 'user' && (
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#0077b6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', boxShadow: '0 4px 12px rgba(0,119,182,0.3)', border: '1px solid #0096c7' }}>👤</div>
              )}
            </div>
          ))}
          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#93c5fd', fontSize: '13px', fontStyle: 'italic', paddingLeft: '50px' }}>
              <span style={{ display: 'inline-block', width: '6px', height: '6px', backgroundColor: '#38bdf8', borderRadius: '50%' }}></span>
              Querying neural vectors...
            </div>
          )}
        </div>

        {/* INPUT PANEL MATRICES (10% White Base Accent Inside Form Boundary) */}
        <form onSubmit={handleSend} style={{ padding: '18px 24px', borderTop: '1px solid #1e293b', display: 'flex', gap: '12px', backgroundColor: '#030712' }}>
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Query details regarding matching matrix indexes..." 
            style={{ flex: 1, padding: '14px 18px', borderRadius: '10px', border: '1px solid #334155', fontSize: '13.5px', backgroundColor: '#ffffff', color: '#0f172a', outline: 'none', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)', transition: 'border-color 0.2s' }} 
          />
          <button type="submit" style={{ backgroundColor: '#047857', border: '1px solid #10b981', padding: '0 26px', borderRadius: '10px', cursor: 'pointer', color: '#fff', fontWeight: '700', fontSize: '13.5px', boxShadow: '0 4px 12px rgba(16,185,129,0.2)' }}>Send</button>
        </form>
      </div>

      {/* COLUMN 3: REQUIREMENT EVALUATION CONTROL MATRIX */}
      <div style={{ width: '420px', display: 'flex', flexDirection: 'column', backgroundColor: '#030712', padding: '24px 20px', boxShadow: '-4px 0 24px rgba(0,0,0,0.4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px', filter: 'drop-shadow(0 0 6px #38bdf8)' }}>⚡</span>
            <h2 style={{ fontSize: '15px', margin: 0, fontWeight: '700', color: '#f8fafc', letterSpacing: '0.3px' }}>AI Match Matrix</h2>
          </div>
          <button onClick={() => { setJdInput(''); setMatchResults([]); }} style={{ backgroundColor: 'transparent', border: 'none', color: '#f87171', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>Reset</button>
        </div>
        <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 18px 0', lineHeight: '1.4' }}>Input job descriptions below. Press **Enter** to instantly deploy database parsing matching evaluations.</p>

        {/* RECTANGLE INPUT COMPONENT (10% Pure White Focused Surface Layer) */}
        <textarea 
          value={jdInput}
          onChange={(e) => setJdInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste targeted job criteria profile here... (Hit Enter to analyze)" 
          style={{ width: '100%', height: '150px', padding: '14px', borderRadius: '10px', border: '1px solid #1e293b', fontSize: '13px', fontFamily: 'inherit', resize: 'none', boxSizing: 'border-box', marginBottom: '14px', backgroundColor: '#ffffff', color: '#0f172a', outline: 'none', lineHeight: '1.6', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}
        />

        {/* NEON BULLET ACTION ACTION CONTROL */}
        <button 
          onClick={handleMatchCandidates}
          disabled={isMatching}
          style={{ width: '100%', backgroundColor: '#047857', color: '#fff', border: '1px solid #10b981', padding: '14px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '13.5px', boxShadow: '0 4px 14px rgba(4,120,87,0.3)', letterSpacing: '0.3px' }}
        >
          {isMatching ? 'Processing Neural Scores...' : '⚡ Match Best Candidates'}
        </button>

        {/* OUTPUT SCORECARD BLOCK COMPONENT */}
        <div style={{ flex: 1, marginTop: '24px', overflowY: 'auto' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.8px' }}>Ranking Metrics Matrix</div>
          
          {matchResults.map((res, index) => (
            <div key={index} style={{ backgroundColor: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                <span style={{ fontWeight: '800', color: '#047857', fontSize: '13px', letterSpacing: '0.3px' }}>{res.title}</span>
                <button onClick={() => copyToClipboard(res.details)} style={{ backgroundColor: 'transparent', border: 'none', color: '#64748b', fontSize: '11px', cursor: 'pointer', fontWeight: '700' }}>📋 Copy Matrix</button>
              </div>
              <div style={{ fontSize: '12.5px', color: '#1e293b', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{res.details}</div>
            </div>
          ))}
          
          {matchResults.length === 0 && (
            <div style={{ border: '2px dashed #1e293b', borderRadius: '10px', padding: '40px 20px', textAlign: 'center', color: '#475569', fontSize: '12.5px', lineHeight: '1.5' }}>
              No evaluations run yet. Paste parameters or hit Enter above to run vector matching analysis.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}