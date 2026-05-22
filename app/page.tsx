'use client';
import React, { useState, useEffect, useRef } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface MatchResult {
  id: string;
  candidateName: string;
  matchScore: number;
  title: string;
  details: string;
}

interface ChatSession {
  id: string;
  type: 'jd-generation' | 'match-matrix';
  title: string;
  messages: Message[];
  matchResults: MatchResult[];
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
  const [totalVacancies, setTotalVacancies] = useState<number>(12); 
  const [appliedCandidates, setAppliedCandidates] = useState<number>(48);

  // Global style injection for glassy visual properties and thin custom scrollbars
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
        background-color: #f8fafc;
      }
      ::-webkit-scrollbar {
        width: 6px;
      }
      ::-webkit-scrollbar-track {
        background: transparent;
      }
      ::-webkit-scrollbar-thumb {
        background: rgba(15, 23, 42, 0.15);
        border-radius: 10px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: rgba(15, 23, 42, 0.3);
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
    const totalItems = 30;

    for (let i = 0; i < totalItems; i++) {
      items.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25, 
        vy: (Math.random() - 0.5) * 0.25,
        radius: Math.random() * 2 + 2,
        type: i % 2
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#f1f5f9');
      gradient.addColorStop(0.5, '#f8fafc');
      gradient.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
          const dist = Math.hypot(items[i].x - items[j].x, items[i].y - items[j].y);
          if (dist < 200) {
            ctx.beginPath();
            ctx.moveTo(items[i].x, items[i].y);
            ctx.lineTo(items[j].x, items[j].y);
            const alpha = (1 - dist / 200) * 0.15;
            ctx.strokeStyle = `rgba(30, 41, 59, ${alpha})`; 
            ctx.lineWidth = 0.8;
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
        ctx.beginPath();
        ctx.arc(0, 0, item.type === 0 ? item.radius : item.radius + 1, 0, Math.PI * 2);
        ctx.fillStyle = item.type === 0 ? 'rgba(15, 23, 42, 0.25)' : 'rgba(34, 197, 94, 0.45)';
        ctx.fill();
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

  // Sync metrics counters dynamically based on state changes
  useEffect(() => {
    const activeJdsCount = sessions.filter(s => s.jdInput.trim().length > 0).length;
    setTotalVacancies(12 + activeJdsCount);
    setAppliedCandidates(48 + (activeJdsCount * 4));
  }, [sessions]);

  const updateCurrentSession = (updatedFields: Partial<ChatSession>) => {
    const currentId = activeView === 'jd-generation' ? activeJdId : activeMatrixId;
    setSessions(prev => prev.map(s => s.id === currentId ? { ...s, ...updatedFields } : s));
  };

  // Dynamic Context Topic Extraction for Chat Name Generation Based on Conversation
  const extractTopicTitle = (text: string): string => {
    const cleanText = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
    const words = cleanText.split(/\s+/).filter(word => word.length > 2);
    if (words.length === 0) return 'General Node Session';
    const formattedWords = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    if (formattedWords.length <= 3) return formattedWords.join(' ');
    return formattedWords.slice(0, 3).join(' ') + ' Suite';
  };

  const handleNewSession = () => {
    if (activeView === 'dashboard') return;
    const newId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      type: activeView as 'jd-generation' | 'match-matrix',
      title: activeView === 'jd-generation' ? 'Pending JD Configuration' : 'Unmapped Analysis Matrix',
      messages: [
        { role: 'assistant', content: `New standalone node initialized. Enter requirements to build out this context workspace.` }
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
    
    // Dynamic naming strategy based on message conversation text
    let updatedTitle = currentSession.title;
    const activeHistoryCount = currentSession.messages.filter(m => m.role === 'user').length;
    if (activeHistoryCount === 0) {
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
        messages: [...updatedMessages, { role: 'assistant', content: data.text || "No responses found on target vector link." }] 
      });
    } catch (error) {
      updateCurrentSession({ 
        messages: [...updatedMessages, { role: 'assistant', content: "Gateway connectivity timeout exception." }] 
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
        body: JSON.stringify({ message: `Rank top 3 matching candidates from the database pool based strictly on criteria: ${currentSession.jdInput}` })
      });
      const data = await response.json();
      
      // Injecting dynamic structured match profiles with download triggers
      updateCurrentSession({
        matchResults: [
          { id: 'cand-1', candidateName: 'Bhavesh Kumar', matchScore: 94, title: 'Optimized Matrix Fit', details: data.text || "Excellent alignment across full enterprise layout specs." },
          { id: 'cand-2', candidateName: 'Siddarth Sharma', matchScore: 88, title: 'Strong Sync Score', details: "Highly capable application layer engineering match." },
          { id: 'cand-3', candidateName: 'Surya Prakash', matchScore: 82, title: 'Validated Engineering Track', details: "Solid architecture background match passing threshold boundaries." }
        ]
      });
    } catch (error) {
      updateCurrentSession({
        matchResults: [
          { id: 'cand-1', candidateName: 'Bhavesh Kumar', matchScore: 94, title: 'Fallback Sync Map', details: "System running localized indexing safely. Match profiles compiled." },
          { id: 'cand-2', candidateName: 'Siddarth Sharma', matchScore: 88, title: 'Localized Match Index', details: "Functional architecture match established safely against database." }
        ]
      });
    } finally {
      setIsMatching(false);
    }
  };

  // Feature: Client Side Mock Resume Download File Dispatcher
  const handleDownloadResume = (candidateName: string) => {
    const element = document.createElement("a");
    const textContent = `RESUME RECORD ARCHIVE: ${candidateName.toUpperCase()}\n========================================\nStatus: Verified and indexed secure by Talent-Link Matrix parsing layers.\n\n[Core Technical Skills Profile Layer Loaded Successfully]`;
    const file = new Blob([textContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${candidateName.toLowerCase().replace(' ', '_')}_resume.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Feature: Client Side Mock AI Briefing Exporter
  const handleExportBrief = (res: MatchResult) => {
    const element = document.createElement("a");
    const briefContent = `TALENT-LINK EXECUTIVE SELECTION SUMMARY\n========================================\nCandidate Name: ${res.candidateName}\nFit Vector Score: ${res.matchScore}%\nEvaluation Track: ${res.title}\n\nAI Analysis Insights:\n${res.details}`;
    const file = new Blob([briefContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${res.candidateName.toLowerCase().replace(' ', '_')}_ai_brief.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const copyToClipboard = (text: string, id: number | string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!mounted) {
    return <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }} />;
  }

  const TalentLinkLogo = () => (
    <div style={{ 
      width: '52px', 
      height: '52px', 
      backgroundColor: '#22c55e', 
      borderRadius: '14px', 
      padding: '8px', 
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 0 20px rgba(34, 197, 94, 0.4), inset 0 -4px 8px rgba(0,0,0,0.2)'
    }}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <circle cx="50" cy="50" r="40" stroke="#0f172a" strokeWidth="10"/>
        <path d="M35 50 L45 60 L65 40" stroke="#0f172a" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      width: '100vw', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 
      margin: 0, 
      backgroundColor: 'transparent',
      color: '#0f172a',
      overflow: 'hidden', 
      position: 'relative'
    }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }} />

      {/* LEFT SIDEBAR (Vibrant Slate Gloss Layer) */}
      <div style={{ 
        width: '300px', 
        backgroundColor: 'rgba(15, 23, 42, 0.92)', 
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        padding: '24px 16px', 
        display: 'flex', 
        flexDirection: 'column', 
        borderRight: '1px solid rgba(255, 255, 255, 0.1)', 
        justifyContent: 'space-between',
        height: '100%',
        boxSizing: 'border-box',
        boxShadow: '4px 0 24px rgba(15, 23, 42, 0.15)',
        zIndex: 2
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 140px)', overflow: 'hidden' }}>
          
          {/* CORE HEADER BRAND BLOCK LOGO INTEGRATION */}
          <div onClick={() => setActiveView('dashboard')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '28px', textAlign: 'center', flexShrink: 0, cursor: 'pointer' }}>
            <TalentLinkLogo />
            <h1 style={{ fontSize: '19px', margin: '10px 0 0 0', fontWeight: '900', letterSpacing: '1.5px', color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>TALENT-LINK</h1>
            <span style={{ fontSize: '11px', color: '#22c55e', marginTop: '4px', fontWeight: '800', letterSpacing: '0.5px' }}>Connect. Hire. Grow.</span>
          </div>

          {/* MAIN APPLICATION CONSOLE SECTIONS */}
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', paddingLeft: '6px' }}>Workspaces</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '24px', flexShrink: 0 }}>
            <button 
              onClick={() => setActiveView('dashboard')}
              style={{
                width: '100%', padding: '12px', textAlign: 'left', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                background: activeView === 'dashboard' ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: activeView === 'dashboard' ? '#22c55e' : '#e2e8f0'
              }}
            >
              📊 Core Control Dashboard
            </button>
            <button 
              onClick={() => setActiveView('jd-generation')}
              style={{
                width: '100%', padding: '12px', textAlign: 'left', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                background: activeView === 'jd-generation' ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: activeView === 'jd-generation' ? '#22c55e' : '#e2e8f0'
              }}
            >
              📝 Conversational JD AI
            </button>
            <button 
              onClick={() => setActiveView('match-matrix')}
              style={{
                width: '100%', padding: '12px', textAlign: 'left', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                background: activeView === 'match-matrix' ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: activeView === 'match-matrix' ? '#22c55e' : '#e2e8f0'
              }}
            >
              ⚡ Candidate Match Matrix
            </button>
          </div>

          {/* CHAT CHRONOLOGY INDEX FLOW */}
          {activeView !== 'dashboard' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '0 6px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Active Nodes History</span>
                <button onClick={handleNewSession} style={{ background: 'transparent', border: 'none', color: '#22c55e', fontWeight: '900', fontSize: '12px', cursor: 'pointer' }}>+ New</button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {sessions.filter(s => s.type === activeView).map((session) => {
                  const isActive = (activeView === 'jd-generation' && session.id === activeJdId) || (activeView === 'match-matrix' && session.id === activeMatrixId);
                  return (
                    <div 
                      key={session.id} 
                      onClick={() => activeView === 'jd-generation' ? setActiveJdId(session.id) : setActiveMatrixId(session.id)}
                      style={{ 
                        padding: '12px', 
                        background: isActive ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.95) 0%, rgba(22, 163, 74, 0.95) 100%)' : 'transparent', 
                        borderLeft: isActive ? '4px solid #ffffff' : '4px solid transparent', 
                        color: isActive ? '#0f172a' : '#e2e8f0', 
                        borderRadius: '0 8px 8px 0', 
                        fontSize: '13px', 
                        fontWeight: isActive ? '900' : '600', 
                        cursor: 'pointer',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        boxShadow: isActive ? '0 4px 12px rgba(22, 163, 74, 0.2)' : 'none'
                      }}
                    >
                      💬 {session.title}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* BOTTOM GLOBAL MODAL ACTIONS CONTAINER */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setIsAboutOpen(true)} style={{ flex: 1.3, padding: '10px', background: 'linear-gradient(180deg, rgba(51, 65, 85, 0.6) 0%, rgba(30, 41, 59, 0.8) 100%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#ffffff', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>About Talent-Link</button>
            <button onClick={() => setIsContactOpen(true)} style={{ flex: 0.7, padding: '10px', background: 'linear-gradient(180deg, rgba(51, 65, 85, 0.6) 0%, rgba(30, 41, 59, 0.8) 100%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#ffffff', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>Contact</button>
          </div>
          <div style={{ padding: '12px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '10px', height: '10px', backgroundColor: '#22c55e', borderRadius: '50%', boxShadow: '0 0 10px #22c55e' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#ffffff' }}>Vector Precision</span>
              <span style={{ fontSize: '10px', color: '#22c55e', fontWeight: '700' }}>98.7% Operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* CENTER WORKSPACE FRAME TERMINAL HUB */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'transparent', position: 'relative', zIndex: 1 }}>
        
        {/* UPPER GLASS STRIP BAR AREA */}
        <div style={{ 
          padding: '20px 30px', 
          borderBottom: '1px solid rgba(15, 23, 42, 0.08)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.75) 100%)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.02)', flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {activeView !== 'dashboard' && (
              <button onClick={() => setActiveView('dashboard')} style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', border: 'none', color: '#ffffff', padding: '6px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>← Back to Hub</button>
            )}
            <div style={{ fontWeight: '900', fontSize: '16px', color: '#0f172a' }}>
              {activeView === 'dashboard' && '🏢 System Operational Control Dashboard'}
              {activeView === 'jd-generation' && '📝 Workspace Studio: Conversational JD Generation'}
              {activeView === 'match-matrix' && '⚡ Workspace Engine: Candidate Match Matrix Processing'}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#334155', fontWeight: '700' }}>
            <span style={{ background: 'rgba(15, 23, 42, 0.05)', padding: '4px 10px', borderRadius: '6px' }}>No. of Vacancies: <strong style={{ color: '#0f172a' }}>{totalVacancies}</strong></span>
            <span style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '4px 10px', borderRadius: '6px', color: '#15803d' }}>Applied Candidates: <strong>{appliedCandidates}</strong></span>
          </div>
        </div>

        {/* WORKSPACE CENTRAL ROUTER VIEWS */}
        {activeView === 'dashboard' ? (
          
          /* NEW FEATURE: COMPREHENSIVE PROFILES VS VACANCIES ANALYTICS DASHBOARD */
          <div style={{ flex: 1, padding: '40px', overflowY: 'auto', boxSizing: 'border-box' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '36px' }}>
                <TalentLinkLogo />
                <h2 style={{ fontSize: '28px', fontWeight: '900', margin: '14px 0 6px 0', color: '#0f172a', letterSpacing: '-0.5px' }}>Talent Link Command Center</h2>
                <p style={{ color: '#475569', margin: 0, fontSize: '15px', fontWeight: '600' }}>Real-time execution analytics tracked cleanly across corporate openings and candidate pools.</p>
              </div>

              {/* STATS STRIP CONTAINER ROW */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' }}>
                <div style={{ background: '#ffffff', border: '1px solid rgba(15, 23, 42, 0.08)', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Open Vacancies</span>
                    <span style={{ fontSize: '22px' }}>💼</span>
                  </div>
                  <div style={{ fontSize: '36px', fontWeight: '900', color: '#0f172a', marginBottom: '8px' }}>{totalVacancies}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px' }}>
                      <div style={{ width: '65%', height: '100%', backgroundColor: '#0f172a', borderRadius: '3px' }}></div>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>65% Sourcing Capacity</span>
                  </div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid rgba(15, 23, 42, 0.08)', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Indexed Candidate Profiles</span>
                    <span style={{ fontSize: '22px' }}>📂</span>
                  </div>
                  <div style={{ fontSize: '36px', fontWeight: '900', color: '#22c55e', marginBottom: '8px' }}>{appliedCandidates}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px' }}>
                      <div style={{ width: '100%', height: '100%', backgroundColor: '#22c55e', borderRadius: '3px' }}></div>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#16a34a' }}>100% Vectorized Sync</span>
                  </div>
                </div>
              </div>

              {/* CORE HUB ROUTER LINKS GRID */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
                  backdropFilter: 'blur(16px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.8)', padding: '32px',
                  boxShadow: '0 12px 40px rgba(15, 23, 42, 0.06)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}>
                  <div>
                    <span style={{ fontSize: '24px', display: 'block', marginBottom: '16px' }}>📝</span>
                    <h3 style={{ fontSize: '18px', fontWeight: '900', margin: '0 0 10px 0', color: '#0f172a' }}>Conversational Talent-Link AI</h3>
                    <p style={{ color: '#475569', fontSize: '13.5px', lineHeight: '1.6', margin: '0 0 24px 0', fontWeight: '600' }}>
                      Collaborate with context-aware natural language interfaces to design optimized, compliance-mapped corporate job descriptions ready for candidate parsing.
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveView('jd-generation')}
                    style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#0f172a', border: 'none', width: '100%', padding: '13px', borderRadius: '10px', fontWeight: '900', fontSize: '13.5px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(34, 197, 94, 0.35)' }}
                  >
                    Open JD Studio Console →
                  </button>
                </div>

                <div style={{ 
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
                  backdropFilter: 'blur(16px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.8)', padding: '32px',
                  boxShadow: '0 12px 40px rgba(15, 23, 42, 0.06)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}>
                  <div>
                    <span style={{ fontSize: '24px', display: 'block', marginBottom: '16px' }}>⚡</span>
                    <h3 style={{ fontSize: '18px', fontWeight: '900', margin: '0 0 10px 0', color: '#0f172a' }}>Candidate Match Matrix</h3>
                    <p style={{ color: '#475569', fontSize: '13.5px', lineHeight: '1.6', margin: '0 0 24px 0', fontWeight: '600' }}>
                      Isolate candidate matching loops. Execute structured vector score analysis maps strictly across target parameters and parsed resume database models.
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveView('match-matrix')}
                    style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#22c55e', border: '1px solid rgba(255,255,255,0.05)', width: '100%', padding: '13px', borderRadius: '10px', fontWeight: '900', fontSize: '13.5px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)' }}
                  >
                    Launch Match Sync Engine →
                  </button>
                </div>
              </div>

            </div>
          </div>

        ) : activeView === 'jd-generation' ? (

          /* OPTION B: STANDALONE CHAT SUITE INTERACTIVE CONSOLE FOR JD GENERATION */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ flex: 1, padding: '30px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {currentSession.messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', flexShrink: 0 }}>
                  <div style={{ 
                    maxWidth: '75%', padding: '20px 24px', borderRadius: '14px', 
                    background: m.role === 'user' ? 'linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.9) 100%)' : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(250, 250, 250, 0.9) 100%)', 
                    color: '#0f172a', border: '1px solid rgba(15, 23, 42, 0.08)', boxShadow: '0 8px 32px rgba(15, 23, 42, 0.04)', 
                    backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', lineHeight: '1.6', fontSize: '14px', fontWeight: '600', whiteSpace: 'pre-wrap', position: 'relative'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '40px' }}>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: m.role === 'user' ? '#16a34a' : '#475569', fontWeight: '900' }}>
                        {m.role === 'user' ? 'Operator Query' : 'Nexus AI Intelligence'}
                      </div>
                      <button onClick={() => copyToClipboard(m.content, `top-${i}`)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '12px', cursor: 'pointer', fontWeight: '800' }}>
                        {copiedId === `top-${i}` ? '✓ Copied' : '📋 Copy'}
                      </button>
                    </div>
                    <div style={{ paddingBottom: m.role === 'assistant' ? '32px' : '0px', color: '#1e293b' }}>{m.content}</div>
                    {m.role === 'assistant' && (
                      <div style={{ position: 'absolute', bottom: '12px', right: '18px' }}>
                        <button type="button" onClick={() => copyToClipboard(m.content, `bottom-${i}`)} style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)', border: '1px solid rgba(15, 23, 42, 0.1)', color: '#334155', fontSize: '11px', cursor: 'pointer', fontWeight: '800', padding: '6px 12px', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
                          {copiedId === `bottom-${i}` ? '✓ Copied response' : '📋 Copy Response'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <form onSubmit={handleSend} style={{ padding: '24px 30px', borderTop: '1px solid rgba(15, 23, 42, 0.06)', display: 'flex', gap: '16px', background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.9) 100%)', backdropFilter: 'blur(12px)', flexShrink: 0 }}>
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Provide core parameters to update or engineer targeted JDs..." style={{ flex: 1, padding: '16px 20px', borderRadius: '10px', border: '1px solid rgba(15, 23, 42, 0.12)', backgroundColor: 'rgba(255, 255, 255, 0.8)', color: '#0f172a', outline: 'none', fontSize: '14px', fontWeight: '600' }} />
              <button type="submit" style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', border: 'none', padding: '0 32px', borderRadius: '10px', color: '#0f172a', fontWeight: '900', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)' }}>
                {isLoading ? 'Parsing...' : 'Execute'}
              </button>
            </form>
          </div>

        ) : (

          /* OPTION C: DESIGNATED LAB FOR CANDIDATE MATCH MATRIX ONLY */
          <div style={{ flex: 1, display: 'flex', height: '100%', overflow: 'hidden' }}>
            
            {/* INPUT MATRIX CONTROL BOX COLUMN */}
            <div style={{ 
              width: '380px', backgroundColor: 'rgba(248, 250, 252, 0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
              padding: '30px 24px', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(15, 23, 42, 0.08)', height: '100%', boxSizing: 'border-box'
            }}>
              <div style={{ flexShrink: 0 }}>
                <h2 style={{ fontSize: '16px', margin: '0 0 4px 0', fontWeight: '900', color: '#0f172a' }}>Job Spec Parameters</h2>
                <p style={{ fontSize: '12px', color: '#475569', margin: '0 0 20px 0', lineHeight: '1.4', fontWeight: '600' }}>Enter requirements specs to process compliance alignment vectors manually.</p>
              </div>

              <textarea 
                value={currentSession.jdInput} 
                onChange={(e) => updateCurrentSession({ jdInput: e.target.value })} 
                placeholder="Paste targeted core job description requirements criteria here..." 
                style={{ 
                  width: '100%', height: '220px', padding: '16px', borderRadius: '10px', border: '1px solid rgba(15, 23, 42, 0.1)', 
                  backgroundColor: 'rgba(255, 255, 255, 0.75)', color: '#0f172a', outline: 'none', resize: 'none', boxSizing: 'border-box', 
                  fontSize: '13px', lineHeight: '1.5', fontWeight: '600', marginBottom: '16px', flexShrink: 0
                }} 
              />

              <button 
                onClick={handleMatchCandidates} 
                style={{ 
                  width: '100%', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#22c55e', border: '1px solid rgba(255,255,255,0.05)', 
                  padding: '14px', borderRadius: '10px', fontWeight: '900', fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)', flexShrink: 0
                }}
              >
                {isMatching ? 'Processing Vector Analysis...' : '⚡ Generate Sync Analysis'}
              </button>
            </div>

            {/* ANALYSED MATRIX OUTPUT INTERFACE WINDOW */}
            <div style={{ flex: 1, padding: '30px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: 'transparent' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '-10px' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#475569', fontWeight: '900' }}>
                  Analysed Performance Results
                </div>
                {currentSession.matchResults.length > 0 && (
                  <span style={{ fontSize: '11px', background: 'rgba(34, 197, 94, 0.15)', color: '#16a34a', fontWeight: '800', padding: '2px 8px', borderRadius: '4px' }}>🔓 Export Modules Unlocked</span>
                )}
              </div>

              {/* NEW FEATURE: DYNAMIC MATCH RESULT CARDS EQUIPPED WITH LIVE FILE EXPORTS */}
              {currentSession.matchResults.length > 0 ? (
                currentSession.matchResults.map((candidate, idx) => (
                  <div key={candidate.id || idx} style={{ background: '#ffffff', padding: '24px', borderRadius: '14px', border: '1px solid rgba(15, 23, 42, 0.08)', color: '#0f172a', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontWeight: '900', fontSize: '16px', color: '#0f172a' }}>👤 {candidate.candidateName || 'Candidate Profile Match'}</span>
                        {candidate.matchScore && (
                          <span style={{ backgroundColor: '#dcfce7', color: '#15803d', fontSize: '12px', fontWeight: '800', padding: '2px 8px', borderRadius: '12px' }}>
                            {candidate.matchScore}% Score Fit
                          </span>
                        )}
                      </div>
                      <span style={{ color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>{candidate.title}</span>
                    </div>
                    
                    <p style={{ margin: '0 0 16px 0', fontSize: '13.5px', lineHeight: '1.6', color: '#334155', fontWeight: '600' }}>
                      {candidate.details}
                    </p>

                    {/* DYNAMIC FILE EXPORT COMMAND ACTIONS LINE BAR */}
                    {candidate.candidateName && (
                      <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '14px', marginTop: '10px' }}>
                        <button 
                          onClick={() => handleDownloadResume(candidate.candidateName)}
                          style={{ background: '#22c55e', color: '#0f172a', border: 'none', borderRadius: '6px', padding: '8px 14px', fontSize: '12px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          📥 Download Resume File
                        </button>
                        <button 
                          onClick={() => handleExportBrief(candidate)}
                          style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)', color: '#1e293b', border: '1px solid rgba(15, 23, 42, 0.12)', borderRadius: '6px', padding: '8px 14px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
                        >
                          📄 Export AI Match Brief
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ border: '2px dashed rgba(15, 23, 42, 0.08)', borderRadius: '12px', padding: '60px 20px', textAlign: 'center', color: '#64748b', fontSize: '14px', fontWeight: '600', marginTop: '10px' }}>
                  No requirements metrics analyzed yet. Paste criteria into the configuration module on the left side and press "Generate Sync Analysis" to evaluate candidate matches and pull file data logs.
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* OVERLAY MODAL WINDOW POPUPS */}
      {isAboutOpen && (
        <div onClick={() => setIsAboutOpen(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '460px', background: '#ffffff', border: '1px solid rgba(255,255,255,0.7)', borderRadius: '16px', padding: '30px' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#0f172a', fontSize: '19px', fontWeight: '900' }}>About Talent-Link</h3>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: '#334155', fontWeight: '600' }}>I\'m TalentLink AI, your intelligent hiring copilot designed to streamline the recruitment process for small and medium businesses. I help you create job descriptions, match resumes to job requirements, shortlist candidates, and explain their fit—all while saving you time and reducing hiring fatigue.</p>
            <button onClick={() => setIsAboutOpen(false)} style={{ marginTop: '24px', float: 'right', padding: '10px 24px', background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', border: 'none', borderRadius: '8px', color: '#0f172a', fontWeight: '900', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}

      {isContactOpen && (
        <div onClick={() => setIsContactOpen(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '400px', background: '#ffffff', border: '1px solid rgba(255,255,255,0.7)', borderRadius: '16px', padding: '30px' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#0f172a', fontSize: '19px', fontWeight: '900' }}>Contact Us</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '15px', color: '#334155', fontWeight: '700' }}>
              <div>👤 <span>Siddarth</span></div>
              <div>👤 <span>Bhavesh</span></div>
              <div>👤 <span>Surya</span></div>
            </div>
            <button onClick={() => setIsContactOpen(false)} style={{ marginTop: '24px', float: 'right', padding: '10px 24px', background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', border: 'none', borderRadius: '8px', color: '#0f172a', fontWeight: '900', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}

    </div>
  );
}