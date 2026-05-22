'use client';
import React, { useState, useEffect, useRef } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  matchResults: any[];
  jdInput: string;
}

export default function TalentLink() {
  const [mounted, setMounted] = useState(false);
  const [copiedId, setCopiedId] = useState<number | string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Modal states
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Chat History & Session Tracking
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: 'default-session',
      title: 'New Recruitment Chat',
      messages: [
        { role: 'assistant', content: 'Talent-Link Core UI Active. Chat with the AI or use the evaluation panel below to match candidates.' }
      ],
      matchResults: [],
      jdInput: ''
    }
  ]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('default-session');

  const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMatching, setIsMatching] = useState(false);

  // Global style injection to absolutely kill the window/body scroll bar
  useEffect(() => {
    setMounted(true);
    
    // Inject style to lock the main HTML/Body from scrolling completely
    const style = document.createElement("style");
    style.innerHTML = `
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        height: 100% !important;
        width: 100% !important;
        overflow: hidden !important;
      }
    `;
    document.head.appendChild(style);
    
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    interface NexusItem {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      type: number;
    }

    const items: NexusItem[] = [];
    const totalItems = 25;

    for (let i = 0; i < totalItems; i++) {
      items.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.2, 
        vy: (Math.random() - 0.5) * 0.2,
        radius: Math.random() * 2 + 2,
        type: i % 2
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
          const dist = Math.hypot(items[i].x - items[j].x, items[i].y - items[j].y);
          if (dist < 180) {
            ctx.beginPath();
            ctx.moveTo(items[i].x, items[i].y);
            ctx.lineTo(items[j].x, items[j].y);
            const alpha = (1 - dist / 180) * 0.12;
            ctx.strokeStyle = `rgba(15, 23, 42, ${alpha})`; 
            ctx.lineWidth = 1.0;
            ctx.stroke();
          }
        }
      }

      items.forEach((item) => {
        item.x += item.vx;
        item.y += item.vy;

        if (item.x < 0) item.x = width;
        if (item.x > width) item.x = 0;
        if (item.y < 0) item.y = height;
        if (item.y > height) item.y = 0;

        ctx.save();
        ctx.translate(item.x, item.y);

        if (item.type === 0) {
          ctx.beginPath();
          ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(15, 23, 42, 0.4)'; 
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, item.radius + 1, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(34, 197, 94, 0.6)';
          ctx.fill();
        }
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      document.head.removeChild(style);
    };
  }, []);

  const updateCurrentSession = (updatedFields: Partial<ChatSession>) => {
    setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, ...updatedFields } : s));
  };

  const handleNewSession = () => {
    const newId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: 'New Chat',
      messages: [
        { role: 'assistant', content: 'Initialization complete. Ready to evaluate pipeline profiles against vacancies.' }
      ],
      matchResults: [],
      jdInput: ''
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newId);
  };

  const handleDeleteSession = (e: React.MouseEvent, idToDelete: string) => {
    e.stopPropagation();
    const absoluteRemaining = sessions.filter(s => s.id !== idToDelete);
    if (absoluteRemaining.length === 0) {
      const fallbackId = `session-${Date.now()}`;
      setSessions([
        {
          id: fallbackId,
          title: 'New Recruitment Chat',
          messages: [{ role: 'assistant', content: 'Talent-Link Core UI Active. Chat with the AI or use the evaluation panel below to match candidates.' }],
          matchResults: [],
          jdInput: ''
        }
      ]);
      setCurrentSessionId(fallbackId);
    } else {
      setSessions(absoluteRemaining);
      if (currentSessionId === idToDelete) {
        setCurrentSessionId(absoluteRemaining[0].id);
      }
    }
  };

  const extractTopicTitle = (text: string): string => {
    const cleanText = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
    const words = cleanText.split(/\s+/).filter(word => word.length > 2);
    if (words.length === 0) return 'General Inquiry';
    const formattedWords = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    if (formattedWords.length <= 3) return formattedWords.join(' ');
    return formattedWords.slice(0, 3).join(' ');
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: input };
    const updatedMessages = [...currentSession.messages, userMsg];
    
    let updatedTitle = currentSession.title;
    const realUserMessagesCount = currentSession.messages.filter(m => m.role === 'user').length;
    
    if (realUserMessagesCount === 0) {
      updatedTitle = extractTopicTitle(input);
    }

    updateCurrentSession({ messages: updatedMessages, title: updatedTitle });
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/langflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });
      const data = await response.json();
      updateCurrentSession({ 
        messages: [...updatedMessages, { role: 'assistant', content: data.text || "No output returned." }] 
      });
    } catch (error) {
      updateCurrentSession({ 
        messages: [...updatedMessages, { role: 'assistant', content: "Error connecting to gateway." }] 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMatchCandidates = async () => {
    if (!currentSession.jdInput.trim() || isMatching) return;
    setIsMatching(true);
    
    try {
      const response = await fetch('/api/langflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `Rank top 3 candidates out of the 10 in the database for this specific JD. Provide names and matching score percentages: ${currentSession.jdInput}` })
      });
      const data = await response.json();
      updateCurrentSession({
        matchResults: [{ title: "Analysis Complete", details: data.text || "Matches processed." }]
      });
    } catch (error) {
      updateCurrentSession({
        matchResults: [{ title: "Error", details: "Could not fetch rank matrix." }]
      });
    } finally {
      setIsMatching(false);
    }
  };

  const copyToClipboard = (text: string, id: number | string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!mounted) {
    return <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }} />;
  }

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      width: '100vw', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 
      margin: 0, 
      backgroundColor: '#ffffff',
      color: '#0f172a',
      overflow: 'hidden', // Page layer strictly hidden
      position: 'relative'
    }}>
      
      {/* CANVAS BACKGROUND */}
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }} />

      {/* LEFT SIDEBAR */}
      <div style={{ 
        width: '290px', 
        backgroundColor: '#0f172a', 
        padding: '24px 16px', 
        display: 'flex', 
        flexDirection: 'column', 
        borderRight: '2px solid #000000', 
        justifyContent: 'space-between',
        height: '100%',
        boxSizing: 'border-box',
        zIndex: 1
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 130px)', overflow: 'hidden' }}>
          {/* BRAND ICON BLOCK */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px', textAlign: 'center', flexShrink: 0 }}>
            <div style={{ 
              width: '50px', 
              height: '50px', 
              marginBottom: '10px', 
              backgroundColor: '#22c55e', 
              borderRadius: '12px', 
              padding: '8px', 
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
                <circle cx="50" cy="50" r="40" stroke="#0f172a" strokeWidth="10"/>
                <path d="M35 50 L45 60 L65 40" stroke="#0f172a" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 style={{ fontSize: '18px', margin: '0', fontWeight: '900', letterSpacing: '1.5px', color: '#ffffff' }}>TALENT-LINK</h1>
            <span style={{ fontSize: '11px', color: '#22c55e', marginTop: '2px', fontWeight: '800', letterSpacing: '0.5px' }}>HIGH CONTRAST ACTIVE</span>
          </div>

          {/* NEW CHAT BUTTON */}
          <button 
            onClick={handleNewSession}
            style={{ 
              width: '100%', 
              backgroundColor: '#22c55e', 
              color: '#0f172a', 
              border: 'none', 
              padding: '14px', 
              borderRadius: '8px', 
              fontWeight: '900', 
              fontSize: '14px', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '6px',
              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)',
              marginBottom: '20px',
              flexShrink: 0,
              transition: 'background-color 0.1s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#16a34a'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#22c55e'; }}
          >
            <strong>+</strong> New Chat
          </button>

          {/* HISTORY INDEX FEED */}
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', paddingLeft: '6px', flexShrink: 0 }}>Chat History</span>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', paddingRight: '4px' }}>
            {sessions.map((session) => {
              const isActive = session.id === currentSessionId;
              return (
                <div 
                  key={session.id} 
                  onClick={() => setCurrentSessionId(session.id)}
                  style={{ 
                    padding: '12px', 
                    backgroundColor: isActive ? '#22c55e' : 'transparent', 
                    borderLeft: isActive ? '5px solid #ffffff' : '5px solid transparent', 
                    color: isActive ? '#0f172a' : '#e2e8f0', 
                    borderRadius: '0 6px 6px 0', 
                    fontSize: '13px', 
                    fontWeight: isActive ? '900' : '600', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexShrink: 0,
                    transition: 'all 0.1s'
                  }}
                  onMouseEnter={(e) => { if(!isActive) e.currentTarget.style.backgroundColor = '#1e293b'; }}
                  onMouseLeave={(e) => { if(!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginRight: '8px' }}>
                    💬 {session.title}
                  </span>
                  <button
                    onClick={(e) => handleDeleteSession(e, session.id)}
                    style={{ background: 'transparent', border: 'none', color: isActive ? '#0f172a' : '#f87171', cursor: 'pointer', fontSize: '11px', fontWeight: '900' }}
                  >
                    ❌
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* UTILITIES CONTROLS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={() => setIsAboutOpen(true)} style={{ flex: 1, padding: '10px', backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '6px', color: '#ffffff', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>About</button>
            <button onClick={() => setIsContactOpen(true)} style={{ flex: 1, padding: '10px', backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '6px', color: '#ffffff', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>Contact</button>
          </div>
          <div style={{ padding: '12px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '10px', height: '10px', backgroundColor: '#22c55e', borderRadius: '50%', boxShadow: '0 0 8px #22c55e' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#ffffff' }}>Vector Precision</span>
              <span style={{ fontSize: '10px', color: '#22c55e', fontWeight: '700' }}>98.7% Operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* CENTER MAIN WORKSPACE */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'transparent', position: 'relative', zIndex: 1 }}>
        {/* UPPER STRIP HEADER */}
        <div style={{ 
          padding: '20px 30px', 
          borderBottom: '2px solid #0f172a', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          backgroundColor: '#ffffff',
          flexShrink: 0
        }}>
          <div style={{ fontWeight: '900', fontSize: '16px', color: '#0f172a' }}>Conversational Talent-Link AI</div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#0f172a', fontWeight: '700' }}>
            <span>Active Vacancies: <strong>22</strong></span>
            <span>•</span>
            <span>Pipeline Feeds: <strong style={{ color: '#16a34a' }}>+15</strong></span>
          </div>
        </div>

        {/* RESPONSE SCROLL WINDOW (This is the ONLY area that activates scroll lines for big outputs) */}
        <div style={{ 
          flex: 1, 
          padding: '30px', 
          overflowY: 'auto', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '24px' 
        }}>
          {currentSession.messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', flexShrink: 0 }}>
              <div style={{ 
                maxWidth: '75%', 
                padding: '18px 22px', 
                borderRadius: '8px', 
                backgroundColor: m.role === 'user' ? '#f8fafc' : '#ffffff', 
                color: '#0f172a',
                border: '2px solid #0f172a', 
                boxShadow: '4px 4px 0px #0f172a', 
                lineHeight: '1.6',
                fontSize: '14px',
                fontWeight: '600',
                whiteSpace: 'pre-wrap'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', gap: '40px' }}>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: m.role === 'user' ? '#16a34a' : '#475569', fontWeight: '900' }}>
                    {m.role === 'user' ? 'Operator Query' : 'Nexus AI Intelligence'}
                  </div>
                  <button 
                    onClick={() => copyToClipboard(m.content, i)}
                    style={{ background: 'transparent', border: 'none', color: '#0f172a', fontSize: '12px', cursor: 'pointer', fontWeight: '800', textDecoration: 'underline' }}
                  >
                    {copiedId === i ? '✓ Copied' : '📋 Copy'}
                  </button>
                </div>
                {m.content}
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM INPUT TERMINAL FRAME */}
        <form onSubmit={handleSend} style={{ padding: '24px 30px', borderTop: '2px solid #0f172a', display: 'flex', gap: '16px', backgroundColor: '#ffffff', flexShrink: 0 }}>
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Cross-reference candidates, screen talent profiles, or parse requirements..." 
            style={{ 
              flex: 1, 
              padding: '16px 20px', 
              borderRadius: '8px', 
              border: '2px solid #0f172a', 
              backgroundColor: '#ffffff', 
              color: '#0f172a', 
              outline: 'none', 
              fontSize: '14px',
              fontWeight: '700'
            }}
          />
          <button 
            type="submit" 
            style={{ 
              backgroundColor: '#22c55e', 
              border: '2px solid #0f172a', 
              padding: '0 32px', 
              borderRadius: '8px', 
              color: '#0f172a', 
              fontWeight: '900', 
              fontSize: '14px', 
              cursor: 'pointer', 
              boxShadow: '3px 3px 0px #0f172a',
              transition: 'all 0.1s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#16a34a'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#22c55e'; }}
          >
            {isLoading ? 'Parsing...' : 'Execute'}
          </button>
        </form>
      </div>

      {/* CANDIDATE MATCH MATRIX SIDE PANEL */}
      <div style={{ 
        width: '350px', 
        backgroundColor: '#f8fafc', 
        padding: '30px 24px', 
        display: 'flex', 
        flexDirection: 'column', 
        borderLeft: '2px solid #0f172a',
        height: '100%',
        boxSizing: 'border-box',
        zIndex: 1
      }}>
        <div style={{ flexShrink: 0 }}>
          <h2 style={{ fontSize: '16px', margin: '0 0 6px 0', fontWeight: '900', color: '#0f172a' }}>Candidate Match Matrix</h2>
          <p style={{ fontSize: '12px', color: '#334155', margin: '0 0 20px 0', lineHeight: '1.4', fontWeight: '600' }}>Input job criteria specifications to process high-dimensional vector alignments.</p>
        </div>
        
        <textarea 
          value={currentSession.jdInput} 
          onChange={(e) => updateCurrentSession({ jdInput: e.target.value })} 
          placeholder="Paste targeted core job description requirements here..." 
          style={{ 
            width: '100%', 
            height: '160px', 
            padding: '16px', 
            borderRadius: '8px', 
            border: '2px solid #0f172a', 
            backgroundColor: '#ffffff', 
            color: '#0f172a', 
            outline: 'none', 
            resize: 'none', 
            boxSizing: 'border-box', 
            fontSize: '13px', 
            lineHeight: '1.5',
            fontWeight: '700',
            flexShrink: 0
          }} 
        />
        
        <button 
          onClick={handleMatchCandidates} 
          style={{ 
            width: '100%', 
            backgroundColor: '#0f172a', 
            color: '#22c55e', 
            border: '2px solid #0f172a', 
            padding: '14px', 
            borderRadius: '8px', 
            fontWeight: '900', 
            fontSize: '13px', 
            marginTop: '16px', 
            cursor: 'pointer', 
            boxShadow: '3px 3px 0px #22c55e',
            flexShrink: 0,
            transition: 'all 0.1s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1e293b'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0f172a'; }}
        >
          {isMatching ? 'Processing Sync Matrix...' : '⚡ Generate Sync Analysis'}
        </button>

        {/* SIDE BAR MATRIX RESPONSES EVALUATION AREA */}
        <div style={{ marginTop: '24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', paddingRight: '2px' }}>
          {currentSession.matchResults.length > 0 ? (
            currentSession.matchResults.map((res, index) => (
              <div key={index} style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '8px', border: '2px solid #0f172a', color: '#0f172a', boxShadow: '3px 3px 0px #0f172a', flexShrink: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ color: '#16a34a', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}>{res.title}</div>
                  <button onClick={() => copyToClipboard(res.details, `matrix-${index}`)} style={{ background: 'transparent', border: 'none', color: '#0f172a', fontSize: '12px', cursor: 'pointer', fontWeight: '800', textDecoration: 'underline' }}>
                    {copiedId === `matrix-${index}` ? '✓ Copied' : '📋 Copy'}
                  </button>
                </div>
                <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5', color: '#0f172a', fontWeight: '600', whiteSpace: 'pre-wrap' }}>{res.details}</p>
              </div>
            ))
          ) : (
            <div style={{ border: '2px dashed #0f172a', borderRadius: '8px', padding: '30px 20px', textAlign: 'center', color: '#0f172a', fontSize: '13px', marginTop: '10px', fontWeight: '700' }}>
              No evaluations processed in this candidate match matrix.
            </div>
          )}
        </div>
      </div>

      {/* SYSTEM UTILITY MODALS */}
      {isAboutOpen && (
        <div onClick={() => setIsAboutOpen(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '450px', backgroundColor: '#ffffff', border: '3px solid #0f172a', borderRadius: '12px', padding: '30px', boxShadow: '8px 8px 0px #0f172a' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#0f172a', fontSize: '18px', fontWeight: '900' }}>About Talent-Link</h3>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: '#0f172a', fontWeight: '600' }}>
              I'm TalentLink AI, your intelligent hiring copilot designed to streamline the recruitment process for small and medium businesses. I help you create job descriptions, match resumes to job requirements, shortlist candidates, and explain their fit—all while saving you time and reducing hiring fatigue.
            </p>
            <button onClick={() => setIsAboutOpen(false)} style={{ marginTop: '24px', float: 'right', padding: '10px 24px', backgroundColor: '#22c55e', border: '2px solid #0f172a', borderRadius: '6px', color: '#0f172a', fontWeight: '900', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}

      {isContactOpen && (
        <div onClick={() => setIsContactOpen(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '400px', backgroundColor: '#ffffff', border: '3px solid #0f172a', borderRadius: '12px', padding: '30px', boxShadow: '8px 8px 0px #0f172a' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#0f172a', fontSize: '18px', fontWeight: '900' }}>Contact Us</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '16px', color: '#0f172a', fontWeight: '700' }}>
              <div>👤 <span>Siddarth</span></div>
              <div>👤 <span>Bhavesh</span></div>
              <div>👤 <span>Surya</span></div>
            </div>
            <button onClick={() => setIsContactOpen(false)} style={{ marginTop: '24px', float: 'right', padding: '10px 24px', backgroundColor: '#22c55e', border: '2px solid #0f172a', borderRadius: '6px', color: '#0f172a', fontWeight: '900', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}

    </div>
  );
}