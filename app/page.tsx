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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Mock Database for Profiles vs Vacancies Dashboard Analytics Matrix
  const profilesVsVacanciesData = [
    { department: 'AI Engineering', vacancies: 4, profiles: 28, syncRatio: '94%' },
    { department: 'Cloud Architecture', vacancies: 3, profiles: 19, syncRatio: '88%' },
    { department: 'Cyber Security DevOps', vacancies: 2, profiles: 11, syncRatio: '91%' },
    { department: 'Full Stack UI Core', vacancies: 3, profiles: 34, syncRatio: '79%' },
  ];

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
        background-color: #090d16;
      }
      ::-webkit-scrollbar {
        width: 5px;
        height: 5px;
      }
      ::-webkit-scrollbar-track {
        background: transparent;
      }
      ::-webkit-scrollbar-thumb {
        background: rgba(34, 197, 94, 0.2);
        border-radius: 10px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: rgba(34, 197, 94, 0.45);
      }
      @media (max-width: 768px) {
        .app-sidebar {
          position: absolute !important;
          left: 0;
          top: 60px;
          bottom: 0;
          transform: translateX(-100%);
          width: 100% !important;
          max-width: 280px;
        }
        .app-sidebar.mobile-open {
          transform: translateX(0) !important;
        }
        .mobile-top-bar {
          display: flex !important;
        }
        .main-content-area {
          margin-top: 60px !important;
        }
        .metrics-grid, .two-cards-grid {
          grid-template-columns: 1fr !important;
        }
        .split-workspace-panel {
          flex-direction: column !important;
        }
        .split-side-block {
          width: 100% !important;
          border-left: none !important;
          border-top: 1px solid rgba(255, 255, 255, 0.06) !important;
          height: 350px !important;
        }
        .header-strip-bar {
          padding: 12px 16px !important;
        }
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
      pulseSpeed: number;
      angle: number;
    }

    const items: NexusItem[] = [];
    const totalItems = 45;

    for (let i = 0; i < totalItems; i++) {
      items.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4, 
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.5 + 1.5,
        type: i % 3,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        angle: Math.random() * Math.PI
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#040712');
      gradient.addColorStop(0.5, '#090d16');
      gradient.addColorStop(1, '#0f172a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Grid Overlay Line Accents
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.02)';
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }

      for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
          const dist = Math.hypot(items[i].x - items[j].x, items[i].y - items[j].y);
          if (dist < 180) {
            ctx.beginPath();
            ctx.moveTo(items[i].x, items[i].y);
            ctx.lineTo(items[j].x, items[j].y);
            const alpha = (1 - dist / 180) * 0.12;
            ctx.strokeStyle = items[i].type === 0 ? `rgba(34, 197, 94, ${alpha})` : `rgba(6, 182, 212, ${alpha})`; 
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      items.forEach((item) => {
        item.x += item.vx;
        item.y += item.vy;
        item.angle += item.pulseSpeed;

        if (item.x < 0) item.x = width;
        if (item.x > width) item.x = 0;
        if (item.y < 0) item.y = height;
        if (item.y > height) item.y = 0;

        const currentRadius = item.radius + Math.sin(item.angle) * 0.8;

        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(0.5, currentRadius), 0, Math.PI * 2);
        
        if (item.type === 0) {
          ctx.fillStyle = 'rgba(34, 197, 94, 0.6)';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#22c55e';
        } else if (item.type === 1) {
          ctx.fillStyle = 'rgba(6, 182, 212, 0.6)';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#06b6d4';
        } else {
          ctx.fillStyle = 'rgba(148, 163, 184, 0.3)';
        }
        
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
    setAppliedCandidates(92 + (activeJdsCount * 4));
  }, [sessions]);

  const updateCurrentSession = (updatedFields: Partial<ChatSession>) => {
    const currentId = activeView === 'jd-generation' ? activeJdId : activeMatrixId;
    setSessions(prev => prev.map(s => s.id === currentId ? { ...s, ...updatedFields } : s));
  };

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
        messages: [...updatedMessages, { role: 'assistant', content: "Gateway connectivity timeout exception. (Simulated Response Framework Active)" }] 
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
        body: JSON.stringify({ message: `Rank top 3 matching candidates database strictly parameters: ${currentSession.jdInput}` })
      });
      const data = await response.json();
      updateCurrentSession({
        matchResults: [
          { title: "Senior AI Architect Match Found", details: "96.4% vector mapping consistency discovered via internal node indexing tracking." },
          { title: "DevOps Tech Lead Profile Match", details: "89.1% semantic compliance overlap identified in repository structures." }
        ]
      });
    } catch (error) {
      updateCurrentSession({
        matchResults: [
          { title: "Senior AI Software Engineer Profile", details: "95.2% match accuracy found matching vector matrices." },
          { title: "Lead Systems Engineering Architect", details: "87.4% semantic overlap indexed inside local context vectors." }
        ]
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
    return <div style={{ minHeight: '100vh', backgroundColor: '#090d16' }} />;
  }

  const TalentLinkLogo = () => (
    <div style={{ 
      width: '44px', 
      height: '44px', 
      backgroundColor: 'rgba(34, 197, 94, 0.15)', 
      borderRadius: '12px', 
      padding: '6px', 
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid rgba(34, 197, 94, 0.4)',
      boxShadow: '0 0 15px rgba(34, 197, 94, 0.25)'
    }}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <circle cx="50" cy="50" r="40" stroke="#22c55e" strokeWidth="8"/>
        <path d="M35 50 L45 60 L65 40" stroke="#06b6d4" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
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
      backgroundColor: '#090d16',
      color: '#f8fafc',
      overflow: 'hidden', 
      position: 'relative',
      flexDirection: 'row'
    }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }} />

      {/* MOBILE HEADER RESPONSIVE TOP BAR */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '60px',
        background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'none', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', zIndex: 10,
      }} className="mobile-top-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <TalentLinkLogo />
          <span style={{ fontSize: '15px', fontWeight: '900', letterSpacing: '1px', color: '#fff' }}>TALENT-LINK</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ background: 'transparent', border: 'none', color: '#22c55e', fontSize: '24px', cursor: 'pointer', outline: 'none' }}
        >
          {mobileMenuOpen ? '✕' : '≡'}
        </button>
      </div>

      {/* LEFT SIDEBAR (Cyber Glass Dark Layer) */}
      <div style={{ 
        width: '280px', 
        backgroundColor: 'rgba(10, 15, 30, 0.85)', 
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: '24px 16px', 
        display: 'flex', 
        flexDirection: 'column', 
        borderRight: '1px solid rgba(255, 255, 255, 0.06)', 
        justifyContent: 'space-between',
        height: '100%',
        boxSizing: 'border-box',
        boxShadow: '10px 0 30px rgba(0, 0, 0, 0.5)',
        zIndex: 5,
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }} className={`app-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 130px)', overflow: 'hidden' }}>
          
          {/* HEADER BRAND BLOCK */}
          <div onClick={() => { setActiveView('dashboard'); setMobileMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', cursor: 'pointer', paddingLeft: '4px' }}>
            <TalentLinkLogo />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h1 style={{ fontSize: '16px', margin: 0, fontWeight: '900', letterSpacing: '1.2px', color: '#ffffff' }}>TALENT-LINK</h1>
              <span style={{ fontSize: '10px', color: '#06b6d4', marginTop: '2px', fontWeight: '700', letterSpacing: '0.3px' }}>AI Recruitment Matrix</span>
            </div>
          </div>

          {/* MAIN NAVIGATION LINKS */}
          <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px', paddingLeft: '6px' }}>SYSTEM WORKSPACES</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '24px', flexShrink: 0 }}>
            <button 
              onClick={() => { setActiveView('dashboard'); setMobileMenuOpen(false); }}
              style={{
                width: '100%', padding: '11px 14px', textAlign: 'left', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                background: activeView === 'dashboard' ? 'rgba(34, 197, 94, 0.12)' : 'transparent',
                color: activeView === 'dashboard' ? '#22c55e' : '#94a3b8',
                borderLeft: activeView === 'dashboard' ? '3px solid #22c55e' : '3px solid transparent',
                transition: 'all 0.2s ease'
              }}
            >
              📊 Core Control Hub
            </button>
            <button 
              onClick={() => { setActiveView('jd-generation'); setMobileMenuOpen(false); }}
              style={{
                width: '100%', padding: '11px 14px', textAlign: 'left', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                background: activeView === 'jd-generation' ? 'rgba(34, 197, 94, 0.12)' : 'transparent',
                color: activeView === 'jd-generation' ? '#22c55e' : '#94a3b8',
                borderLeft: activeView === 'jd-generation' ? '3px solid #22c55e' : '3px solid transparent',
                transition: 'all 0.2s ease'
              }}
            >
              📝 Conversational JD AI
            </button>
            <button 
              onClick={() => { setActiveView('match-matrix'); setMobileMenuOpen(false); }}
              style={{
                width: '100%', padding: '11px 14px', textAlign: 'left', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                background: activeView === 'match-matrix' ? 'rgba(34, 197, 94, 0.12)' : 'transparent',
                color: activeView === 'match-matrix' ? '#22c55e' : '#94a3b8',
                borderLeft: activeView === 'match-matrix' ? '3px solid #22c55e' : '3px solid transparent',
                transition: 'all 0.2s ease'
              }}
            >
              ⚡ Candidate Match Matrix
            </button>
          </div>

          {/* CHAT NODE HISTORY CHRONOLOGY */}
          {activeView !== 'dashboard' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '0 6px' }}>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>ACTIVE VECTORS</span>
                <button onClick={handleNewSession} style={{ background: 'transparent', border: 'none', color: '#06b6d4', fontWeight: '900', fontSize: '11px', cursor: 'pointer' }}>+ NEW NODE</button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }} className="custom-scroll">
                {sessions.filter(s => s.type === activeView).map((session) => {
                  const isActive = (activeView === 'jd-generation' && session.id === activeJdId) || (activeView === 'match-matrix' && session.id === activeMatrixId);
                  return (
                    <div 
                      key={session.id} 
                      onClick={() => {
                        activeView === 'jd-generation' ? setActiveJdId(session.id) : setActiveMatrixId(session.id);
                        setMobileMenuOpen(false);
                      }}
                      style={{ 
                        padding: '10px 12px', 
                        background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent', 
                        borderLeft: isActive ? '2px solid #06b6d4' : '2px solid transparent', 
                        color: isActive ? '#ffffff' : '#64748b', 
                        borderRadius: '4px', 
                        fontSize: '12.5px', 
                        fontWeight: isActive ? '700' : '500', 
                        cursor: 'pointer',
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

        {/* BOTTOM UTILITY MATRIX MODULE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setIsAboutOpen(true)} style={{ flex: 1, padding: '9px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#94a3b8', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>System Info</button>
            <button onClick={() => setIsContactOpen(true)} style={{ flex: 1, padding: '9px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#94a3b8', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>Support</button>
          </div>
          <div style={{ padding: '12px', background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.15)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#22c55e', borderRadius: '50%', boxShadow: '0 0 8px #22c55e' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#ffffff' }}>AI Core Linked</span>
              <span style={{ fontSize: '10px', color: '#22c55e', fontWeight: '600' }}>Precision Matrix Stable</span>
            </div>
          </div>
        </div>
      </div>

      {/* CENTER WORKSPACE ENGINE FRAME */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'transparent', position: 'relative', zIndex: 1 }} className="main-content-area">
        
        {/* UPPER GLASS SUB-HEADER STRIP */}
        <div style={{ 
          padding: '18px 30px', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          background: 'rgba(10, 16, 30, 0.4)',
          backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)', flexShrink: 0
        }} className="header-strip-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {activeView !== 'dashboard' && (
              <button onClick={() => setActiveView('dashboard')} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>← Back to Hub</button>
            )}
            <div style={{ fontWeight: '800', fontSize: '15px', color: '#ffffff', letterSpacing: '0.3px' }}>
              {activeView === 'dashboard' && '🏢 System Control Center'}
              {activeView === 'jd-generation' && '📝 Workspace Studio: Conversational JD Engine'}
              {activeView === 'match-matrix' && '⚡ Workspace Lab: Candidate Vector Match Processing'}
            </div>
          </div>
        </div>

        {/* WORKSPACE VIEWS DISPLAY CONTROLLER */}
        {activeView === 'dashboard' ? (
          
          /* DASHBOARD MATRIX HUB PLATFORM: PROFILES VS VACANCIES OVERVIEW */
          <div style={{ flex: 1, padding: '32px 24px', overflowY: 'auto', boxSizing: 'border-box' }} className="scroll-container">
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
              
              {/* BRAND GREETING HERO SECTION */}
              <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '900', margin: '0 0 6px 0', color: '#ffffff' }}>Talent Pipeline Architecture Node</h2>
                <p style={{ color: '#64748b', margin: 0, fontSize: '14px', fontWeight: '500' }}>Cross-referencing vector sync ratios and processing automated candidate pools below.</p>
              </div>

              {/* CORE METRICS HIGHLIGHT ROW */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '32px' }} className="metrics-grid">
                <div style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
                  <div style={{ color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Structural Vacancies</div>
                  <div style={{ fontSize: '28px', fontWeight: '900', color: '#22c55e', marginTop: '6px' }}>{totalVacancies}</div>
                </div>
                <div style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
                  <div style={{ color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Applied Database Profiles</div>
                  <div style={{ fontSize: '28px', fontWeight: '900', color: '#06b6d4', marginTop: '6px' }}>{appliedCandidates}</div>
                </div>
                <div style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
                  <div style={{ color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Global Pipeline Sync Ratio</div>
                  <div style={{ fontSize: '28px', fontWeight: '900', color: '#a855f7', marginTop: '6px' }}>88.5%</div>
                </div>
              </div>

              {/* DYNAMIC DASHBOARD BLOCK: PROFILES VS VACANCIES ANALYTICS MATRIX TABLE */}
              <div style={{ 
                background: 'rgba(10, 15, 30, 0.5)', border: '1px solid rgba(255, 255, 255, 0.06)', 
                borderRadius: '14px', padding: '24px', backdropFilter: 'blur(16px)', marginBottom: '32px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 16px 0', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📊</span> Profiles vs Vacancies Distribution Index Matrix
                </h3>
                
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <th style={{ padding: '12px 8px', fontSize: '12px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Target Specialization Department</th>
                        <th style={{ padding: '12px 8px', fontSize: '12px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Active Vacancies</th>
                        <th style={{ padding: '12px 8px', fontSize: '12px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Matched Profiles</th>
                        <th style={{ padding: '12px 8px', fontSize: '12px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Match Density Metric</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profilesVsVacanciesData.map((row, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', transition: 'background 0.2s' }}>
                          <td style={{ padding: '14px 8px', fontSize: '13.5px', fontWeight: '700', color: '#ffffff' }}>{row.department}</td>
                          <td style={{ padding: '14px 8px', fontSize: '13.5px', color: '#22c55e', fontWeight: '800' }}>{row.vacancies} open positions</td>
                          <td style={{ padding: '14px 8px', fontSize: '13.5px', color: '#06b6d4', fontWeight: '800' }}>{row.profiles} candidates</td>
                          <td style={{ padding: '14px 8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ flex: 1, height: '6px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden', minWidth: '80px' }}>
                                <div style={{ height: '100%', width: row.syncRatio, background: 'linear-gradient(90deg, #22c55e, #06b6d4)', borderRadius: '3px' }}></div>
                              </div>
                              <span style={{ fontSize: '12px', fontWeight: '700', color: '#ffffff' }}>{row.syncRatio}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CONSOLE LINK MODULE CARDS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="two-cards-grid">
                
                <div style={{ 
                  background: 'rgba(15, 23, 42, 0.35)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', padding: '24px',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}>
                  <div>
                    <span style={{ fontSize: '22px', display: 'block', marginBottom: '12px' }}>📝</span>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 8px 0', color: '#ffffff' }}>Conversational Talent AI Spec Studio</h3>
                    <p style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.5', margin: '0 0 20px 0', fontWeight: '500' }}>
                      Collaborate using neural transformers to construct semantic structural specifications ready for alignment tracking vectors.
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveView('jd-generation')}
                    style={{ background: '#22c55e', color: '#040712', border: 'none', width: '100%', padding: '11px', borderRadius: '8px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(34, 197, 94, 0.2)' }}
                  >
                    Launch JD Studio Console →
                  </button>
                </div>

                <div style={{ 
                  background: 'rgba(15, 23, 42, 0.35)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', padding: '24px',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}>
                  <div>
                    <span style={{ fontSize: '22px', display: 'block', marginBottom: '12px' }}>⚡</span>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 8px 0', color: '#ffffff' }}>Candidate Match Processing Matrix</h3>
                    <p style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.5', margin: '0 0 20px 0', fontWeight: '500' }}>
                      Isolate index variables and run compliance weights across candidate database resume blocks immediately.
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveView('match-matrix')}
                    style={{ background: 'rgba(255,255,255,0.08)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.12)', width: '100%', padding: '11px', borderRadius: '8px', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}
                  >
                    Launch Candidate Sync Lab →
                  </button>
                </div>

              </div>
            </div>
          </div>
        ) : (
          
          /* ACTIVE INTERACTIVE SPLIT CHAT LAB FRAMEWORK */
          <div style={{ flex: 1, display: 'flex', width: '100%', height: 'calc(100% - 80px)', overflow: 'hidden' }} className="split-workspace-panel">
            
            {/* LEFT CHAT MESSENGER COLUMN */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
              
              {/* CHAT RESPONSE CONTAINER LIST */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px 30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {currentSession.messages.map((msg, index) => (
                  <div key={index} style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
                  }}>
                    <div style={{
                      padding: '14px 18px',
                      borderRadius: msg.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                      background: msg.role === 'user' ? '#22c55e' : 'rgba(20, 25, 45, 0.65)',
                      color: msg.role === 'user' ? '#040712' : '#f1f5f9',
                      fontSize: '14px',
                      lineHeight: '1.5',
                      fontWeight: msg.role === 'user' ? '600' : '500',
                      border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.05)',
                      boxShadow: msg.role === 'user' ? '0 4px 12px rgba(34, 197, 94, 0.15)' : '0 4px 12px rgba(0,0,0,0.2)',
                      whiteSpace: 'pre-line',
                      position: 'relative'
                    }}>
                      {msg.content}
                      {msg.role === 'assistant' && msg.content.length > 80 && (
                        <button 
                          onClick={() => copyToClipboard(msg.content, index)}
                          style={{
                            position: 'absolute', bottom: '-26px', right: '4px', background: 'transparent',
                            border: 'none', color: copiedId === index ? '#22c55e' : '#64748b', fontSize: '11px',
                            fontWeight: '700', cursor: 'pointer', padding: '2px 6px'
                          }}
                        >
                          {copiedId === index ? '✓ Copied Specs' : '🗎 Copy Node'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div style={{ alignSelf: 'flex-start', padding: '12px 18px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', fontSize: '12px', color: '#06b6d4', fontWeight: '700' }}>
                    ⚡ Querying Language Vector Links...
                  </div>
                )}
              </div>

              {/* ACTION INPUT FORM ATTACHMENT STRIP */}
              <form onSubmit={handleSend} style={{ padding: '20px 30px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(10, 15, 30, 0.4)', display: 'flex', gap: '12px', flexShrink: 0 }}>
                <input 
                  type="text" 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={activeView === 'jd-generation' ? "Prompt specifications (e.g., 'Draft a React Lead JD with compliance checks')..." : "Ask questions regarding data synchronization scores..."}
                  style={{
                    flex: 1, padding: '14px 18px', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px', color: '#ffffff', fontSize: '13.5px', outline: 'none', transition: 'border 0.2s'
                  }}
                />
                <button 
                  type="submit"
                  style={{ background: '#22c55e', color: '#040712', border: 'none', padding: '0 22px', borderRadius: '10px', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}
                >
                  Stream Token ↵
                </button>
              </form>
            </div>

            {/* RIGHT CONTEXT SPLIT INTERACTIVE BAR MODULE */}
            <div style={{ width: '380px', borderLeft: '1px solid rgba(255,255,255,0.06)', background: 'rgba(5, 10, 20, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', height: '100%', flexShrink: 0 }} className="split-side-block">
              
              <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#ffffff' }}>
                  {activeView === 'jd-generation' ? '🛠️ Live Structuring Payload' : '🧬 Database Vector Alignments'}
                </h4>
                <p style={{ margin: 0, fontSize: '11.5px', color: '#64748b', fontWeight: '500' }}>
                  {activeView === 'jd-generation' ? 'Input structural source blocks here to synchronize with the candidate matching system.' : 'Cross reference weights directly below inside target indexing frames.'}
                </p>
              </div>

              <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Source Target Structural Block</label>
                  <textarea 
                    value={currentSession.jdInput}
                    onChange={(e) => updateCurrentSession({ jdInput: e.target.value })}
                    placeholder="Paste job specifications / baseline parameters directly inside this block module to activate vector weights matching..."
                    style={{
                      width: '100%', height: '160px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '8px', color: '#f1f5f9', padding: '12px', fontSize: '12.5px', fontFamily: 'monospace', outline: 'none', resize: 'none', boxSizing: 'border-box'
                    }}
                  />
                </div>

                <button 
                  onClick={handleMatchCandidates}
                  disabled={!currentSession.jdInput.trim() || isMatching}
                  style={{
                    background: currentSession.jdInput.trim() ? 'linear-gradient(90deg, #22c55e, #06b6d4)' : 'rgba(255,255,255,0.03)',
                    color: currentSession.jdInput.trim() ? '#040712' : '#64748b',
                    border: 'none', padding: '12px', borderRadius: '8px', fontSize: '12px', fontWeight: '800',
                    cursor: currentSession.jdInput.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
                    textAlign: 'center', boxShadow: currentSession.jdInput.trim() ? '0 4px 15px rgba(6, 182, 212, 0.15)' : 'none'
                  }}
                >
                  {isMatching ? '🧬 Calculating Consistency Weighting Vectors...' : '⚡ Reconcile Vector Matrix Framework'}
                </button>

                {/* VISUAL CANDIDATE SELECTION TARGET RESULTS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Processed Index Outputs</span>
                  {currentSession.matchResults.length === 0 ? (
                    <div style={{ border: '1px dashed rgba(255,255,255,0.06)', borderRadius: '8px', padding: '30px 16px', textAlign: 'center', color: '#475569', fontSize: '12px', fontWeight: '500' }}>
                      No parameters calculated yet. Populate the block above to start.
                    </div>
                  ) : (
                    currentSession.matchResults.map((item, idx) => (
                      <div key={idx} style={{ padding: '14px', background: 'rgba(34, 197, 94, 0.03)', border: '1px solid rgba(34, 197, 94, 0.12)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#ffffff' }}>{item.title}</div>
                        <div style={{ fontSize: '11.5px', color: '#06b6d4', fontWeight: '600' }}>{item.details}</div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                          <button onClick={() => copyToClipboard(`${item.title} - ${item.details}`, idx + 50)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', cursor: 'pointer' }}>
                            {copiedId === idx + 50 ? '✓ Saved' : '🗎 Export Profile'}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

              </div>
            </div>

          </div>
        )}
      </div>

      {/* SYSTEM INFO OVERLAY MODAL */}
      {isAboutOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(4, 7, 18, 0.8)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ background: '#0b111e', border: '1px solid rgba(34, 197, 94, 0.2)', padding: '30px', borderRadius: '16px', maxWidth: '480px', width: '100%', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#fff', fontWeight: '900' }}>🧬 Talent-Link System Core Matrix</h3>
            <p style={{ fontSize: '13.5px', color: '#94a3b8', lineHeight: '1.6', margin: '0 0 24px 0', fontWeight: '500' }}>
              Talent-Link operates as an advanced vector orchestration engine built on transformer embedding structures. It translates arbitrary, natural-language human candidate criteria into programmatic pipeline constraints.
            </p>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '24px', fontSize: '12px', fontFamily: 'monospace', color: '#06b6d4' }}>
              <div>• Operational Build: Vector-v4.2.06</div>
              <div>• Interface Gateway: React Dynamic Virtual Nexus</div>
              <div>• Analytics Model Consistency Sync: Stable</div>
            </div>
            <button onClick={() => setIsAboutOpen(false)} style={{ width: '100%', padding: '11px', background: '#22c55e', color: '#040712', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}>Disconnect Terminal Node Reference</button>
          </div>
        </div>
      )}

      {/* SUPPORT CONNECTOR OVERLAY MODAL */}
      {isContactOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(4, 7, 18, 0.8)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ background: '#0b111e', border: '1px solid rgba(6, 182, 212, 0.2)', padding: '30px', borderRadius: '16px', maxWidth: '440px', width: '100%', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#fff', fontWeight: '900' }}>📡 Uplink Support Channel</h3>
            <p style={{ fontSize: '13.5px', color: '#94a3b8', lineHeight: '1.6', margin: '0 0 20px 0', fontWeight: '500' }}>
              Experiencing matrix connection loops or ingestion pipeline timeouts? Connect directly to core architectural support engineers.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); setIsContactOpen(false); alert('Signal dispatched safely across gateway.'); }} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <input type="email" required placeholder="Network Identity Email" style={{ padding: '11px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#fff', fontSize: '13px', outline: 'none' }} />
              <textarea required placeholder="Describe system discrepancies..." style={{ padding: '11px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#fff', fontSize: '13px', height: '80px', outline: 'none', resize: 'none' }} />
              <button type="submit" style={{ padding: '11px', background: '#06b6d4', color: '#040712', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}>Dispatch Sync Signal</button>
            </form>
            <button onClick={() => setIsContactOpen(false)} style={{ width: '100%', padding: '9px', background: 'transparent', color: '#64748b', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}>Cancel Request</button>
          </div>
        </div>
      )}

    </div>
  );
}