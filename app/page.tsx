'use client';
import React, { useState, useEffect, useRef } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatSession {
  id: string;
  type: 'jd-generation' | 'match-matrix';
  title: string;
  messages: Message[];
  matchResults: any[];
  jdInput: string;
}

export default function TalentLink() {
  const [mounted, setMounted] = useState(false);
  const [copiedId, setCopiedId] = useState<number | string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Navigation State: 'dashboard' | 'jd-generation' | 'match-matrix'
  const [activeView, setActiveView] = useState<'dashboard' | 'jd-generation' | 'match-matrix'>('dashboard');

  // Modal states
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Chat History & Workspace Tracking
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: 'default-jd',
      type: 'jd-generation',
      title: 'JD Architecture Desk',
      messages: [
        { role: 'assistant', content: 'Welcome to the Conversational JD Studio. Provide your job title, target department, and core technical requirements to generate optimized compliance-mapped specifications.' }
      ],
      matchResults: [],
      jdInput: ''
    },
    {
      id: 'default-matrix',
      type: 'match-matrix',
      title: 'Vector Sync Matrix Workspace',
      messages: [
        { role: 'assistant', content: 'Matrix Sandbox Initialized. Paste your Job Description requirements on the side module to cross-reference top resume fits.' }
      ],
      matchResults: [],
      jdInput: ''
    }
  ]);

  // Active session router based on chosen workspace view
  const [activeJdId, setActiveJdId] = useState<string>('default-jd');
  const [activeMatrixId, setActiveMatrixId] = useState<string>('default-matrix');

  const currentSession = sessions.find(s => 
    activeView === 'jd-generation' ? s.id === activeJdId : s.id === activeMatrixId
  ) || sessions[0];

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMatching, setIsMatching] = useState(false);

  // Dynamic Database Counter States
  const [totalVacancies, setTotalVacancies] = useState<number>(14); 
  const [appliedCandidates, setAppliedCandidates] = useState<number>(52);

  // Interactive Glass Background engine
  useEffect(() => {
    setMounted(true);
    
    const style = document.createElement("style");
    style.innerHTML = `
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        height: 100% !important;
        width: 100% !important;
        overflow: hidden !important;
        background-color: #0f172a;
      }
      ::-webkit-scrollbar {
        width: 6px;
      }
      ::-webkit-scrollbar-track {
        background: transparent;
      }
      ::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.2);
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
    const totalItems = 35;

    for (let i = 0; i < totalItems; i++) {
      items.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.15, 
        vy: (Math.random() - 0.5) * 0.15,
        radius: Math.random() * 2 + 1.5,
        type: i % 2
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(0.5, '#1e293b');
      gradient.addColorStop(1, '#020617');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
          const dist = Math.hypot(items[i].x - items[j].x, items[i].y - items[j].y);
          if (dist < 220) {
            ctx.beginPath();
            ctx.moveTo(items[i].x, items[i].y);
            ctx.lineTo(items[j].x, items[j].y);
            const alpha = (1 - dist / 220) * 0.08;
            ctx.strokeStyle = `rgba(34, 197, 94, ${alpha})`; 
            ctx.lineWidth = 0.6;
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

        ctx.beginPath();
        ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
        ctx.fillStyle = item.type === 0 ? 'rgba(255, 255, 255, 0.15)' : 'rgba(34, 197, 94, 0.3)';
        ctx.fill();
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

  // Sync metrics changes
  useEffect(() => {
    const activeJdsCount = sessions.filter(s => s.jdInput.trim().length > 0).length;
    setTotalVacancies(12 + activeJdsCount);
    setAppliedCandidates(45 + (activeJdsCount * 4));
  }, [sessions]);

  const updateCurrentSession = (updatedFields: Partial<ChatSession>) => {
    const currentId = activeView === 'jd-generation' ? activeJdId : activeMatrixId;
    setSessions(prev => prev.map(s => s.id === currentId ? { ...s, ...updatedFields } : s));
  };

  const handleNewSession = () => {
    if (activeView === 'dashboard') return;
    const newId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      type: activeView as 'jd-generation' | 'match-matrix',
      title: activeView === 'jd-generation' ? 'New JD Suite' : 'New Matrix Sync',
      messages: [
        { role: 'assistant', content: `New ${activeView === 'jd-generation' ? 'JD Generation' : 'Candidate Matching'} node established.` }
      ],
      matchResults: [],
      jdInput: ''
    };
    setSessions(prev => [newSession, ...prev]);
    if (activeView === 'jd-generation') setActiveJdId(newId);
    if (activeView === 'match-matrix') setActiveMatrixId(newId);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: input };
    const updatedMessages = [...currentSession.messages, userMsg];
    
    updateCurrentSession({ messages: updatedMessages });
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
        messages: [...updatedMessages, { role: 'assistant', content: data.text || "No response metric returned from node system." }] 
      });
    } catch (error) {
      updateCurrentSession({ 
        messages: [...updatedMessages, { role: 'assistant', content: "Gateway connectivity timeout error." }] 
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
        body: JSON.stringify({ message: `Rank top 3 matching candidates from the vector pool for: ${currentSession.jdInput}` })
      });
      const data = await response.json();
      updateCurrentSession({
        matchResults: [{ title: "Sync matrix resolved", details: data.text || "Matches structured safely." }]
      });
    } catch (error) {
      updateCurrentSession({
        matchResults: [{ title: "System Flag", details: "Unable to complete database matching matrix parsing loop." }]
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
    return <div style={{ minHeight: '100vh', backgroundColor: '#0f172a' }} />;
  }

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      width: '100vw', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 
      margin: 0, 
      backgroundColor: 'transparent',
      color: '#ffffff',
      overflow: 'hidden', 
      position: 'relative'
    }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }} />

      {/* GLOBAL GLOSSY NAVIGATION SIDEBAR */}
      <div style={{ 
        width: '280px', 
        backgroundColor: 'rgba(15, 23, 42, 0.75)', 
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between',
        height: '100%',
        padding: '24px 16px',
        boxSizing: 'border-box',
        zIndex: 2
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 140px)', overflow: 'hidden' }}>
          
          {/* APP BRAND HEADER */}
          <div onClick={() => setActiveView('dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', cursor: 'pointer' }}>
            <div style={{ 
              width: '40px', height: '40px', backgroundColor: '#22c55e', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 15px rgba(34, 197, 94, 0.4)'
            }}>
              <svg viewBox="0 0 100 100" fill="none" style={{ width: '60%', height: '60%' }}>
                <circle cx="50" cy="50" r="40" stroke="#0f172a" strokeWidth="12"/>
                <path d="M35 50 L45 60 L65 40" stroke="#0f172a" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: '16px', margin: '0', fontWeight: '900', letterSpacing: '1px' }}>TALENT-LINK</h1>
              <span style={{ fontSize: '10px', color: '#22c55e', fontWeight: '700' }}>Enterprise Suite</span>
            </div>
          </div>

          {/* MAIN MODULE ROUTER INDEX */}
          <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', paddingLeft: '4px' }}>Workspaces</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '24px' }}>
            <button 
              onClick={() => setActiveView('dashboard')}
              style={{
                width: '100%', padding: '12px', textAlign: 'left', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                background: activeView === 'dashboard' ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: activeView === 'dashboard' ? '#22c55e' : '#94a3b8',
                transition: 'all 0.1s'
              }}
            >
              📊 Core Control Dashboard
            </button>
            <button 
              onClick={() => setActiveView('jd-generation')}
              style={{
                width: '100%', padding: '12px', textAlign: 'left', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                background: activeView === 'jd-generation' ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: activeView === 'jd-generation' ? '#22c55e' : '#94a3b8',
                transition: 'all 0.1s'
              }}
            >
              📝 Conversational JD AI
            </button>
            <button 
              onClick={() => setActiveView('match-matrix')}
              style={{
                width: '100%', padding: '12px', textAlign: 'left', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                background: activeView === 'match-matrix' ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: activeView === 'match-matrix' ? '#22c55e' : '#94a3b8',
                transition: 'all 0.1s'
              }}
            >
              ⚡ Candidate Match Matrix
            </button>
          </div>

          {/* CHAT SESSION HISTORY INDEX (Only shows up inside active workspace views) */}
          {activeView !== 'dashboard' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', padding: '0 4px' }}>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Active Nodes</span>
                <button onClick={handleNewSession} style={{ background: 'transparent', border: 'none', color: '#22c55e', fontWeight: '800', fontSize: '11px', cursor: 'pointer' }}>+ New</button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {sessions.filter(s => s.type === activeView).map((session) => {
                  const isActive = (activeView === 'jd-generation' && session.id === activeJdId) || (activeView === 'match-matrix' && session.id === activeMatrixId);
                  return (
                    <div 
                      key={session.id}
                      onClick={() => activeView === 'jd-generation' ? setActiveJdId(session.id) : setActiveMatrixId(session.id)}
                      style={{
                        padding: '10px 12px', borderRadius: '6px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer',
                        background: isActive ? 'rgba(34, 197, 94, 0.15)' : 'transparent',
                        color: isActive ? '#ffffff' : '#94a3b8',
                        borderLeft: isActive ? '3px solid #22c55e' : '3px solid transparent',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}
                    >
                      🔮 {session.title}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* BOTTOM UTILITY MATRIX TERMINAL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={() => setIsAboutOpen(true)} style={{ flex: 1, padding: '9px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#cbd5e1', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>About Talent-Link</button>
            <button onClick={() => setIsContactOpen(true)} style={{ flex: 0.8, padding: '9px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#cbd5e1', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>Contact</button>
          </div>
          <div style={{ padding: '10px', background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#22c55e', borderRadius: '50%', boxShadow: '0 0 8px #22c55e' }} />
            <span style={{ fontSize: '11px', color: '#a7f3d0', fontWeight: '700' }}>Cloud Synced Operational</span>
          </div>
        </div>
      </div>

      {/* CORE WORKSPACE FRAME CONTAINER */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', zIndex: 1 }}>
        
        {/* TOP STATUS HEADER STRIP */}
        <div style={{ 
          padding: '18px 30px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(10px)', flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {activeView !== 'dashboard' && (
              <button onClick={() => setActiveView('dashboard')} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#ffffff', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>← Back to Hub</button>
            )}
            <span style={{ fontWeight: '800', fontSize: '14.5px', color: '#f8fafc' }}>
              {activeView === 'dashboard' && '🏢 System Operational Control Matrix'}
              {activeView === 'jd-generation' && '📝 Workspace Studio: Conversational JDs'}
              {activeView === 'match-matrix' && '⚡ Workspace Studio: Candidate Match Processing Engine'}
            </span>
          </div>
          
          {/* REAL-TIME PIPELINE LIVE COUNTERS */}
          <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
            <span style={{ background: 'rgba(255,255,255,0.05)', padding: '5px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)', color: '#94a3b8' }}>Vacancies Tracked: <strong style={{ color: '#ffffff' }}>{totalVacancies}</strong></span>
            <span style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '5px 12px', borderRadius: '6px', border: '1px solid rgba(34, 197, 94, 0.15)', color: '#4ade80' }}>Candidates Indexed: <strong style={{ color: '#ffffff' }}>{appliedCandidates}</strong></span>
          </div>
        </div>

        {/* CONDITIONALLY RENDER VIEW WORKSPACES */}
        {activeView === 'dashboard' ? (
          
          /* VIEW 1: THE ENTERPRISE DASHBOARD PORTAL HUB */
          <div style={{ flex: 1, padding: '50px 40px', overflowY: 'auto', boxSizing: 'border-box' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <div style={{ marginBottom: '36px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: '900', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>Welcome back to Talent-Link Workspace</h2>
                <p style={{ color: '#94a3b8', margin: 0, fontSize: '15px', fontWeight: '500' }}>Select an active orchestration terminal below to start managing your talent pipelines.</p>
              </div>

              {/* CARD DECK CONTAINER */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.0fr 1.0fr', gap: '24px' }}>
                
                {/* CARD 1: CONVERSATIONAL JD GENERATION */}
                <div style={{ 
                  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.85) 100%)',
                  backdropFilter: 'blur(16px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', padding: '32px',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ width: '45px', height: '45px', borderRadius: '10px', backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', fontSize: '20px' }}>📝</div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 10px 0', color: '#ffffff' }}>Conversational Talent-Link AI</h3>
                    <p style={{ color: '#94a3b8', fontSize: '13.5px', lineHeight: '1.6', margin: '0 0 24px 0', fontWeight: '500' }}>
                      Collaborate with a context-aware AI architecture to generate tailored, precise, and industry-optimized job descriptions ready to map straight to your applicant pipeline.
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveView('jd-generation')}
                    style={{ background: '#22c55e', color: '#0f172a', border: 'none', width: '100%', padding: '12px', borderRadius: '8px', fontWeight: '800', fontSize: '13.5px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(34,197,94,0.3)', transition: 'opacity 0.1s' }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    Open JD Studio Console →
                  </button>
                </div>

                {/* CARD 2: CANDIDATE MATCHING VECTOR SYNC MATRIX */}
                <div style={{ 
                  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.85) 100%)',
                  backdropFilter: 'blur(16px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', padding: '32px',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ width: '45px', height: '45px', borderRadius: '10px', backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', fontSize: '20px' }}>⚡</div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 10px 0', color: '#ffffff' }}>Candidate Match Matrix</h3>
                    <p style={{ color: '#94a3b8', fontSize: '13.5px', lineHeight: '1.6', margin: '0 0 24px 0', fontWeight: '500' }}>
                      Execute vector semantic scoring pipelines. Cross-reference database resumes instantly against target requirements parameters to generate ranked matrices.
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveView('match-matrix')}
                    style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)', width: '100%', padding: '12px', borderRadius: '8px', fontWeight: '800', fontSize: '13.5px', cursor: 'pointer', transition: 'background 0.1s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#1e293b'} onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'}
                  >
                    Launch Match Sync Engine →
                  </button>
                </div>

              </div>
            </div>
          </div>

        ) : (
          
          /* VIEW 2 & 3: THE INTERACTIVE CONSOLE CHAT SPACES */
          <div style={{ flex: 1, display: 'flex', height: '100%', overflow: 'hidden' }}>
            
            {/* CENTRAL WORKSPACE FEED */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'transparent', height: '100%' }}>
              <div style={{ flex: 1, padding: '30px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {currentSession.messages.map((m, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ 
                      maxWidth: '75%', padding: '16px 20px', borderRadius: '12px', 
                      background: m.role === 'user' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(30, 41, 59, 0.6)', 
                      color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.06)', backdropFilter: 'blur(10px)',
                      lineHeight: '1.6', fontSize: '13.5px', fontWeight: '500', whiteSpace: 'pre-wrap', position: 'relative'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', gap: '40px' }}>
                        <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: m.role === 'user' ? '#4ade80' : '#94a3b8', fontWeight: '800' }}>
                          {m.role === 'user' ? 'Operator Query' : 'System Intelligence'}
                        </span>
                        <button onClick={() => copyToClipboard(m.content, `top-${i}`)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '11px', cursor: 'pointer', fontWeight: '700' }}>
                          {copiedId === `top-${i}` ? '✓ Copied' : '📋 Copy'}
                        </button>
                      </div>
                      <div style={{ paddingBottom: m.role === 'assistant' ? '28px' : '0px', color: '#e2e8f0' }}>{m.content}</div>
                      {m.role === 'assistant' && (
                        <div style={{ position: 'absolute', bottom: '10px', right: '14px' }}>
                          <button onClick={() => copyToClipboard(m.content, `bottom-${i}`)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#cbd5e1', fontSize: '10.5px', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px' }}>
                            {copiedId === `bottom-${i}` ? '✓ Copied response' : '📋 Copy Response'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* CONSOLE INPUT ROW TERMINAL */}
              <form onSubmit={handleSend} style={{ padding: '20px 30px', background: 'rgba(15,23,42,0.3)', borderTop: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', display: 'flex', gap: '14px' }}>
                <input 
                  type="text" value={input} onChange={(e) => setInput(e.target.value)} 
                  placeholder={activeView === 'jd-generation' ? "Ask the AI to design requirements, rewrite job functions, change layout..." : "Instruct candidate screening adjustments, pipeline matrix instructions..."}
                  style={{ flex: 1, padding: '14px 18px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(15,23,42,0.6)', color: '#ffffff', outline: 'none', fontSize: '13.5px' }}
                />
                <button type="submit" style={{ background: '#22c55e', color: '#0f172a', border: 'none', padding: '0 24px', borderRadius: '8px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(34,197,94,0.2)' }}>
                  {isLoading ? 'Processing...' : 'Execute'}
                </button>
              </form>
            </div>

            {/* CANDIDATE COMPLIANCE PANEL (Only displayed inside candidate-matching views) */}
            {activeView === 'match-matrix' && (
              <div style={{ 
                width: '340px', backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(16px)', padding: '24px', display: 'flex', flexDirection: 'column', 
                borderLeft: '1px solid rgba(255,255,255,0.06)', height: '100%', boxSizing: 'border-box'
              }}>
                <div style={{ flexShrink: 0 }}>
                  <h2 style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 4px 0' }}>Job Spec Parameters</h2>
                  <p style={{ fontSize: '11.5px', color: '#64748b', margin: '0 0 16px 0', lineHeight: '1.4' }}>Paste core target operational descriptions below to run candidate vector cross evaluations.</p>
                </div>
                <textarea 
                  value={currentSession.jdInput} onChange={(e) => updateCurrentSession({ jdInput: e.target.value })} 
                  placeholder="Paste targeted core job description compliance criteria here..." 
                  style={{ width: '100%', height: '150px', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(15,23,42,0.5)', color: '#ffffff', outline: 'none', resize: 'none', boxSizing: 'border-box', fontSize: '12.5px', lineHeight: '1.4', fontWeight: '500' }} 
                />
                <button 
                  onClick={handleMatchCandidates}
                  style={{ width: '100%', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)', padding: '12px', borderRadius: '8px', fontWeight: '800', fontSize: '12.5px', marginTop: '12px', cursor: 'pointer', transition: 'all 0.1s' }}
                >
                  {isMatching ? 'Rebuilding Sync Index...' : '⚡ Generate Sync Analysis'}
                </button>

                <div style={{ marginTop: '20px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {currentSession.matchResults.length > 0 ? (
                    currentSession.matchResults.map((res, idx) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ color: '#4ade80', fontSize: '10.5px', fontWeight: '800', textTransform: 'uppercase' }}>{res.title}</span>
                          <button onClick={() => copyToClipboard(res.details, `matrix-${idx}`)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '11px', cursor: 'pointer' }}>📋 Copy</button>
                        </div>
                        <p style={{ margin: 0, fontSize: '12px', lineHeight: '1.4', color: '#cbd5e1', whiteSpace: 'pre-wrap' }}>{res.details}</p>
                      </div>
                    ))
                  ) : (
                    <div style={{ border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px', padding: '24px 16px', textAlign: 'center', color: '#64748b', fontSize: '12px', marginTop: '10px' }}>
                      No evaluation matrices computed yet inside this specific sandbox node.
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      {/* SYSTEM APPLICATION MODALS */}
      {isAboutOpen && (
        <div onClick={() => setIsAboutOpen(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '460px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.4)' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#ffffff', fontSize: '18px', fontWeight: '800' }}>About Talent-Link</h3>
            <p style={{ margin: 0, fontSize: '13.5px', lineHeight: '1.6', color: '#94a3b8' }}>
              I'm TalentLink AI, your intelligent hiring copilot designed to streamline the recruitment process for small and medium businesses. I help you create job descriptions, match resumes to job requirements, shortlist candidates, and explain their fit—all while saving you time and reducing hiring fatigue.
            </p>
            <button onClick={() => setIsAboutOpen(false)} style={{ marginTop: '24px', float: 'right', padding: '10px 24px', background: '#22c55e', border: 'none', borderRadius: '6px', color: '#0f172a', fontWeight: '800', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}

      {isContactOpen && (
        <div onClick={() => setIsContactOpen(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '400px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.4)' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#ffffff', fontSize: '18px', fontWeight: '800' }}>Contact Us</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#cbd5e1' }}>
              <div>👤 <span>Siddarth</span></div>
              <div>👤 <span>Bhavesh</span></div>
              <div>👤 <span>Surya</span></div>
            </div>
            <button onClick={() => setIsContactOpen(false)} style={{ marginTop: '24px', float: 'right', padding: '10px 24px', background: '#22c55e', border: 'none', borderRadius: '6px', color: '#0f172a', fontWeight: '800', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}

    </div>
  );
}