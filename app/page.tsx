'use client';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function TalentLink() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Talent-Link Core UI Active. Chat with the AI or use the evaluation panel below to match candidates.' }
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
    <div style={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      minHeight: '100vh', 
      width: '100vw', 
      fontFamily: 'system-ui, -apple-system, sans-serif', 
      margin: 0, 
      backgroundColor: '#090d16', 
      color: '#f8fafc', 
      overflowX: 'hidden' 
    }}>
      
      {/* COLUMN 1: SIDEBAR */}
      <div style={{ 
        flex: '1 1 250px', 
        boxSizing: 'border-box',
        backgroundColor: '#030712', 
        padding: '24px 20px', 
        display: 'flex', 
        flexDirection: 'column', 
        borderRight: '1px solid #1e293b', 
        borderBottom: '1px solid #1e293b',
        justifyContent: 'space-between', 
        boxShadow: '4px 0 24px rgba(0,0,0,0.4)' 
      }}>
        <div>
          {/* BRAND LOGO COMPONENT */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #1e293b' }}>
            <div style={{ display: 'flex', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '8px', borderRadius: '10px', border: '1px solid #10b981', boxShadow: '0 0 12px rgba(16,185,129,0.2)' }}>
              <span style={{ fontSize: '18px' }}>📄</span>
              <span style={{ fontSize: '18px', marginLeft: '-5px', marginRight: '-5px' }}>👤</span>
              <span style={{ fontSize: '18px' }}>💼</span>
            </div>
            <h2 style={{ fontSize: '18px', margin: 0, fontWeight: '800', background: 'linear-gradient(90deg, #38bdf8, #0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '0.5px' }}>Talent-Link AI</h2>
          </div>

          {/* SYSTEM STATE BADGE */}
          <div style={{ padding: '12px 14px', backgroundColor: 'rgba(30,41,59,0.5)', borderRadius: '8px', fontSize: '12px', color: '#38bdf8', marginBottom: '25px', fontWeight: '600', borderLeft: '4px solid #10b981', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%', boxShadow: '0 0 8px #10b981' }}></span>
            Pipeline Status: Engine Active
          </div>

          {/* VISUAL DATABASE STACK */}
          <div style={{ marginBottom: '20px', background: 'linear-gradient(145deg, #0f172a, #030712)', padding: '20px 15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px', filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.3))' }}>🗄️</div>
            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '1px' }}>Astra DB Engine</div>
            <div style={{ fontSize: '15px', color: '#10b981', fontWeight: '800', marginTop: '6px', letterSpacing: '0.5px' }}>10 Live Resumes</div>
          </div>
        </div>

        {/* ACTIVE PROJECTS */}
        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '20px' }}>
          <div style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', marginBottom: '12px', fontWeight: '700', letterSpacing: '0.5px' }}>Active Projects</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', backgroundColor: '#1e293b', borderRadius: '8px', fontSize: '13px', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ opacity: 0.8 }}>📁</span> Project: React Team
            </div>
          </div>
        </div>
      </div>

      {/* COLUMN 2: CHAT HUB */}
      <div style={{ 
        flex: '2 1 350px', 
        boxSizing: 'border-box',
        display: 'flex', 
        flexDirection: 'column', 
        height: '70vh', 
        minHeight: '450px',
        borderRight: '1px solid #1e293b', 
        borderBottom: '1px solid #1e293b',
        backgroundColor: '#0f172a', 
        backgroundImage: 'radial-gradient(at top right, #042f2e 0%, #0f172a 60%)' 
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(3,7,18,0.7)', backdropFilter: 'blur(12px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>💬</span>
            <h1 style={{ fontSize: '16px', margin: 0, fontWeight: '700', color: '#f8fafc' }}>Conversational Intelligence</h1>
          </div>
          <button onClick={() => setMessages([{ role: 'assistant', content: 'Workspace feed refreshed.' }])} style={{ backgroundColor: 'transparent', border: '1px solid #334155', color: '#94a3b8', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>Reset</button>
        </div>

        {/* MESSAGES LAYER GRID */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: '14px', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-start' }}>
              {m.role !== 'user' && (
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', border: '1px solid #10b981', flexShrink: 0 }}>🤖</div>
              )}
              
              <div style={{ 
                maxWidth: '85%', 
                padding: '14px 18px', 
                borderRadius: '14px', 
                fontSize: '13.5px', 
                lineHeight: '1.6', 
                backgroundColor: m.role === 'user' ? '#047857' : '#ffffff', 
                color: m.role === 'user' ? '#ffffff' : '#0f172a', 
                border: m.role === 'user' ? '1px solid #10b981' : 'none',
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              }}>
                {m.role === 'user' ? (
                  <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
                ) : (
                  /* PREMIUM ASYNC MARKDOWN RENDERING FOR CHAT FLOW */
                  <div className="prose prose-slate max-w-none text-sm leading-relaxed 
                    [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:border-b [&_h3]:border-slate-200 [&_h3]:pb-1 [&_h3]:mt-4 [&_h3]:mb-2
                    [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-1 [&_strong]:text-blue-600 [&_strong]:font-semibold">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                )}
                
                {m.role === 'assistant' && (
                  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                    <button onClick={() => copyToClipboard(m.content)} style={{ backgroundColor: 'transparent', border: 'none', color: '#047857', fontSize: '11px', cursor: 'pointer', fontWeight: '700' }}>📋 Copy</button>
                  </div>
                )}
              </div>

              {m.role === 'user' && (
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#0077b6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', border: '1px solid #0096c7', flexShrink: 0 }}>👤</div>
              )}
            </div>
          ))}
          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#93c5fd', fontSize: '13px', fontStyle: 'italic' }}>
              Querying neural vectors...
            </div>
          )}
        </div>

        {/* INPUT FORM PANEL */}
        <form onSubmit={handleSend} style={{ padding: '18px 24px', borderTop: '1px solid #1e293b', display: 'flex', gap: '12px', backgroundColor: '#030712' }}>
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Query vector schemas..." 
            style={{ flex: 1, padding: '12px 16px', borderRadius: '10px', border: '1px solid #334155', fontSize: '13.5px', backgroundColor: '#ffffff', color: '#0f172a', outline: 'none' }} 
          />
          <button type="submit" style={{ backgroundColor: '#047857', border: '1px solid #10b981', padding: '0 20px', borderRadius: '10px', cursor: 'pointer', color: '#fff', fontWeight: '700', fontSize: '13.5px' }}>Send</button>
        </form>
      </div>

      {/* COLUMN 3: REQUIREMENT EVALUATION CONTROL MATRIX */}
      <div style={{ 
        flex: '1 1 320px', 
        boxSizing: 'border-box',
        display: 'flex', 
        flexDirection: 'column', 
        backgroundColor: '#030712', 
        padding: '24px 20px', 
        boxShadow: '-4px 0 24px rgba(0,0,0,0.4)' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px', filter: 'drop-shadow(0 0 6px #38bdf8)' }}>⚡</span>
            <h2 style={{ fontSize: '15px', margin: 0, fontWeight: '700', color: '#f8fafc' }}>AI Match Matrix</h2>
          </div>
          <button onClick={() => { setJdInput(''); setMatchResults([]); }} style={{ backgroundColor: 'transparent', border: 'none', color: '#f87171', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>Reset</button>
        </div>
        <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 18px 0', lineHeight: '1.4' }}>Input job descriptions below to analyze matching criteria scores.</p>

        <textarea 
          value={jdInput}
          onChange={(e) => setJdInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste targeted job criteria profile here..." 
          style={{ width: '100%', height: '120px', padding: '14px', borderRadius: '10px', border: '1px solid #1e293b', fontSize: '13px', fontFamily: 'inherit', resize: 'none', boxSizing: 'border-box', marginBottom: '14px', backgroundColor: '#ffffff', color: '#0f172a', outline: 'none', lineHeight: '1.6' }}
        />

        <button 
          onClick={handleMatchCandidates}
          disabled={isMatching}
          style={{ width: '100%', backgroundColor: '#047857', color: '#fff', border: '1px solid #10b981', padding: '14px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '13.5px' }}
        >
          {isMatching ? 'Processing Neural Scores...' : '⚡ Match Best Candidates'}
        </button>

        {/* OUTPUT SCORECARD BLOCK COMPONENT */}
        <div style={{ marginTop: '24px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '12px' }}>Ranking Metrics Matrix</div>
          
          {matchResults.map((res, index) => (
            <div key={index} style={{ backgroundColor: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 10px 15px rgba(0,0,0,0.3)', marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                <span style={{ fontWeight: '800', color: '#047857', fontSize: '13px' }}>{res.title}</span>
                <button onClick={() => copyToClipboard(res.details)} style={{ backgroundColor: 'transparent', border: 'none', color: '#64748b', fontSize: '11px', cursor: 'pointer', fontWeight: '700' }}>📋 Copy</button>
              </div>
              
              {/* PREMIUM ASYNC MARKDOWN RENDERING FOR SCORECARD COMPONENT */}
              <div className="prose prose-slate max-w-none text-xs leading-relaxed 
                [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:border-b [&_h3]:border-slate-100 [&_h3]:pb-1 [&_h3]:mt-3 [&_h3]:mb-1.5
                [&_ul]:list-disc [&_ul]:pl-4 [&_li]:my-0.5 [&_strong]:text-blue-600 [&_strong]:font-semibold text-slate-800">
                <ReactMarkdown>{res.details}</ReactMarkdown>
              </div>
            </div>
          ))}
          
          {matchResults.length === 0 && (
            <div style={{ border: '2px dashed #1e293b', borderRadius: '10px', padding: '30px 20px', textAlign: 'center', color: '#475569', fontSize: '12.5px' }}>
              No evaluations run yet.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}