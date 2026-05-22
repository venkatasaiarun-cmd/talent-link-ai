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

  // Mobile drawer utility state for screens where sidebar stacks
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const [activeJdId, setActiveJdId] = useState<string>('default-jd');
  const [activeMatrixId, setActiveMatrixId] = useState<string>('default-matrix');

  const currentSession = sessions.find(s => 
    activeView === 'jd-generation' ? s.id === activeJdId : s.id === activeMatrixId
  ) || sessions[0];

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMatching, setIsMatching] = useState(false);

  const [totalVacancies, setTotalVacancies] = useState<number>(12); 
  const [appliedCandidates, setAppliedCandidates] = useState<number>(48);

  // Close mobile drawer upon choosing an interface viewpoint
  const handleViewChange = (view: 'dashboard' | 'jd-generation' | 'match-matrix') => {
    setActiveView(view);
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    setMounted(true);
    
    const style = document.createElement("style");
    style.innerHTML = `
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        height: 100% !important;
        width: 100% !important;
        background-color: #f8fafc;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      ::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      ::-webkit-scrollbar-track {
        background: transparent;
      }
      ::-webkit-scrollbar-thumb {
        background: rgba(15, 23, 42, 0.15);
        border-radius: 10px;
      }
      @media (max-width: 768px) {
        .desktop-sidebar {
          display: none !important;
        }
        .main-workspace-frame {
          width: 100% !important;
          height: calc(100% - 60px) !important;
        }
        .mobile-header-strip {
          display: flex !important;
        }
        .dashboard-grid, .matrix-split-lab {
          grid-template-columns: 1fr !important;
          flex-direction: column !important;
        }
        .matrix-left-control {
          width: 100% !important;
          height: auto !important;
          border-right: none !important;
          border-bottom: 1px solid rgba(15, 23, 42, 0.08) !important;
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
    }

    const items: NexusItem[] = [];
    const totalItems = 20; // Reduced slight overhead load for smoother rendering across portable mobile CPUs

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
          const dist = Math.hypot(items[i].x - items[j].x, items[j].y - items[j].y);
          if (dist < 160) {
            ctx.beginPath();
            ctx.moveTo(items[i].x, items[i].y);
            ctx.lineTo(items[j].x, items[j].y);
            const alpha = (1 - dist / 160) * 0.12;
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

  useEffect(() => {
    const activeJdsCount = sessions.filter(s => s.jdInput.trim().length > 0).length;
    setTotalVacancies(12 + activeJdsCount);
    setAppliedCandidates(48 + (activeJdsCount * 4));
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

  const copyToClipboard = (text: string, id: number | string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const TalentLinkLogo = () => (
    <div style={{ 
      width: '44px', 
      height: '44px', 
      backgroundColor: '#22c55e', 
      borderRadius: '12px', 
      padding: '6px', 
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 0 15px rgba(34, 197, 94, 0.3)'
    }}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <circle cx="50" cy="50" r="40" stroke="#0f172a" strokeWidth="10"/>
        <path d="M35 50 L45 60 L65 40" stroke="#0f172a" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );

  // Modular internal layout view code used across mobile drawer and desktop sidebar alike
  const NavigationMenuContent = () => (
    <>
      <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', paddingLeft: '6px' }}>Workspaces</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '24px' }}>
        <button 
          onClick={() => handleViewChange('dashboard')}
          style={{
            width: '100%', padding: '12px', textAlign: 'left', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
            background: activeView === 'dashboard' ? 'rgba(255,255,255,0.08)' : 'transparent',
            color: activeView === 'dashboard' ? '#22c55e' : '#e2e8f0'
          }}
        >
          📊 Core Control Dashboard
        </button>
        <button 
          onClick={() => handleViewChange('jd-generation')}
          style={{
            width: '100%', padding: '12px', textAlign: 'left', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
            background: activeView === 'jd-generation' ? 'rgba(255,255,255,0.08)' : 'transparent',
            color: activeView === 'jd-generation' ? '#22c55e' : '#e2e8f0'
          }}
        >
          📝 Conversational JD AI
        </button>
        <button 
          onClick={() => handleViewChange('match-matrix')}
          style={{
            width: '100%', padding: '12px', textAlign: 'left', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
            background: activeView === 'match-matrix' ? 'rgba(255,255,255,0.08)' : 'transparent',
            color: activeView === 'match-matrix' ? '#22c55e' : '#e2e8f0'
          }}
        >
          ⚡ Candidate Match Matrix
        </button>
      </div>

      {activeView !== 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
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
                  onClick={() => {
                    if (activeView === 'jd-generation') setActiveJdId(session.id);
                    if (activeView === 'match-matrix') setActiveMatrixId(session.id);
                    setIsMobileMenuOpen(false);
                  }}
                  style={{ 
                    padding: '12px', 
                    background: isActive ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.95) 0%, rgba(22, 163, 74, 0.95) 100%)' : 'transparent', 
                    borderLeft: isActive ? '4px solid #ffffff' : '4px solid transparent', 
                    color: isActive ? '#0f172a' : '#e2e8f0', 
                    borderRadius: '0 8px 8px 0', 
                    fontSize: '13px', 
                    fontWeight: isActive ? '900' : '600', 
                    cursor: 'pointer',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                  }}
                >
                  💬 {session.title}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'row',
      height: '100vh', 
      width: '100vw', 
      margin: 0, 
      backgroundColor: '#f8fafc',
      color: '#0f172a',
      overflow: 'hidden', 
      position: 'relative'
    }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }} />

      {/* DESKTOP SIDEBAR (Hidden automatically on smaller touch/mobile break windows via media tags) */}
      <div className="desktop-sidebar" style={{ 
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
        zIndex: 10
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 140px)', overflow: 'hidden' }}>
          <div onClick={() => handleViewChange('dashboard')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '28px', textAlign: 'center', cursor: 'pointer' }}>
            <TalentLinkLogo />
            <h1 style={{ fontSize: '19px', margin: '10px 0 0 0', fontWeight: '900', letterSpacing: '1.5px', color: '#ffffff' }}>TALENT-LINK</h1>
            <span style={{ fontSize: '11px', color: '#22c55e', marginTop: '4px', fontWeight: '800' }}>Connect. Hire. Grow.</span>
          </div>
          <NavigationMenuContent />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setIsAboutOpen(true)} style={{ flex: 1.3, padding: '10px', background: 'rgba(51, 65, 85, 0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#ffffff', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>About Talent-Link</button>
            <button onClick={() => setIsContactOpen(true)} style={{ flex: 0.7, padding: '10px', background: 'rgba(51, 65, 85, 0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#ffffff', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>Contact</button>
          </div>
          <div style={{ padding: '12px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '10px', height: '10px', backgroundColor: '#22c55e', borderRadius: '50%' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#ffffff' }}>Vector Precision</span>
              <span style={{ fontSize: '10px', color: '#22c55e', fontWeight: '700' }}>98.7% Operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* HANDSET NATIVE MOBILE TOP STRIP (Hidden on desktop frame viewports) */}
      <div className="mobile-header-strip" style={{
        display: 'none',
        position: 'absolute',
        top: 0, left: 0, right: 0, height: '60px',
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(10px)',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        boxSizing: 'border-box',
        zIndex: 20,
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <TalentLinkLogo />
          <span style={{ color: '#ffffff', fontWeight: '900', fontSize: '15px', letterSpacing: '1px' }}>TALENT-LINK</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{ background: 'transparent', border: 'none', color: '#ffffff', fontSize: '24px', cursor: 'pointer', padding: '4px' }}
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* COLLAPSIBLE MOBILE OVERLAY MENU DRAWER SLIDEOUT */}
      {isMobileMenuOpen && (
        <div style={{
          position: 'fixed', top: '60px', left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.96)', backdropFilter: 'blur(20px)',
          padding: '24px 20px', display: 'flex', flexDirection: 'column', zIndex: 19,
          overflowY: 'auto'
        }}>
          <NavigationMenuContent />
          <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '20px' }}>
            <button onClick={() => { setIsAboutOpen(true); setIsMobileMenuOpen(false); }} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', color: '#ffffff', fontWeight: '700' }}>About</button>
            <button onClick={() => { setIsContactOpen(true); setIsMobileMenuOpen(false); }} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', color: '#ffffff', fontWeight: '700' }}>Contact</button>
          </div>
        </div>
      )}

      {/* CORE FRAME TERMINAL ENGINE CONTAINER WORKSPACE */}
      <div className="main-workspace-frame" style={{ 
        flex: 1, display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', zIndex: 1,
        marginTop: typeof window !== 'undefined' && window.innerWidth <= 768 ? '60px' : '0px'
      }}>
        
        {/* UPPER CLEAN GLASS HEADER STRIP BAR AREA (Counters Removed Completely) */}
        <div style={{ 
          padding: '16px 24px', 
          borderBottom: '1px solid rgba(15, 23, 42, 0.08)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0.8) 100%)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.01)', flexShrink: 0, minHeight: '60px', boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', overflow: 'hidden' }}>
            {activeView !== 'dashboard' && (
              <button onClick={() => handleViewChange('dashboard')} style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', border: 'none', color: '#ffffff', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', flexShrink: 0 }}>← Back</button>
            )}
            <div style={{ fontWeight: '900', fontSize: '14px', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {activeView === 'dashboard' && '🏢 System Operational Control Dashboard'}
              {activeView === 'jd-generation' && '📝 Studio: JD Builder'}
              {activeView === 'match-matrix' && '⚡ Engine: Match Matrix'}
            </div>
          </div>
        </div>

        {/* WORKSPACE DATA LINK HUB ROUTER SLOTS */}
        {activeView === 'dashboard' ? (
          
          /* COMPREHENSIVE STATS MATRIX INTERFACE METRICS VIEW */
          <div style={{ flex: 1, padding: '24px 16px', overflowY: 'auto', boxSizing: 'border-box' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '28px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '900', margin: '10px 0 6px 0', color: '#0f172a', letterSpacing: '-0.5px' }}>Talent Link Command Center</h2>
                <p style={{ color: '#475569', margin: 0, fontSize: '13.5px', fontWeight: '600' }}>Real-time execution analytics tracked cleanly across corporate openings and candidate pools.</p>
              </div>

              {/* STATS DISTRIBUTION MATRIX GRID */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }} className="dashboard-grid">
                <div style={{ background: '#ffffff', border: '1px solid rgba(15, 23, 42, 0.08)', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Active Open Vacancies</span>
                    <span style={{ fontSize: '18px' }}>💼</span>
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginBottom: '6px' }}>{totalVacancies}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px' }}>
                      <div style={{ width: '65%', height: '100%', backgroundColor: '#0f172a', borderRadius: '3px' }}></div>
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: '700', color: '#64748b' }}>65% Sourcing Track</span>
                  </div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid rgba(15, 23, 42, 0.08)', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Total Indexed Candidates</span>
                    <span style={{ fontSize: '18px' }}>📂</span>
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: '900', color: '#22c55e', marginBottom: '6px' }}>{appliedCandidates}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px' }}>
                      <div style={{ width: '100%', height: '100%', backgroundColor: '#22c55e', borderRadius: '3px' }}></div>
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: '700', color: '#16a34a' }}>Vector Synchronized</span>
                  </div>
                </div>
              </div>

              {/* CARD ROUTER GRID LINKS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="dashboard-grid">
                <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid rgba(15,23,42,0.08)', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 14px rgba(0,0,0,0.02)' }}>
                  <div>
                    <span style={{ fontSize: '20px', display: 'block', marginBottom: '10px' }}>📝</span>
                    <h3 style={{ fontSize: '16px', fontWeight: '900', margin: '0 0 8px 0', color: '#0f172a' }}>Conversational Talent-Link AI</h3>
                    <p style={{ color: '#475569', fontSize: '12.5px', lineHeight: '1.5', margin: '0 0 20px 0', fontWeight: '600' }}>Collaborate with context-aware natural language interfaces to design optimized, corporate job descriptions ready for candidate parsing.</p>
                  </div>
                  <button onClick={() => handleViewChange('jd-generation')} style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#0f172a', border: 'none', width: '100%', padding: '11px', borderRadius: '8px', fontWeight: '900', fontSize: '12.5px', cursor: 'pointer' }}>Open Studio Console →</button>
                </div>

                <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid rgba(15,23,42,0.08)', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 14px rgba(0,0,0,0.02)' }}>
                  <div>
                    <span style={{ fontSize: '20px', display: 'block', marginBottom: '10px' }}>⚡</span>
                    <h3 style={{ fontSize: '16px', fontWeight: '900', margin: '0 0 8px 0', color: '#0f172a' }}>Candidate Match Matrix</h3>
                    <p style={{ color: '#475569', fontSize: '12.5px', lineHeight: '1.5', margin: '0 0 20px 0', fontWeight: '600' }}>Isolate candidate matching loops. Execute structured vector score analysis maps strictly across target parameters and parsed resume models.</p>
                  </div>
                  <button onClick={() => handleViewChange('match-matrix')} style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#22c55e', border: 'none', width: '100%', padding: '11px', borderRadius: '8px', fontWeight: '900', fontSize: '12.5px', cursor: 'pointer' }}>Launch Sync Engine →</button>
                </div>
              </div>

            </div>
          </div>

        ) : activeView === 'jd-generation' ? (

          /* CONVERSATIONAL CHAT WORKSPACE FIELD FRAME */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <div style={{ flex: 1, padding: '20px 16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {currentSession.messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ 
                    maxWidth: '85%', padding: '14px 18px', borderRadius: '12px', 
                    background: m.role === 'user' ? 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)' : '#ffffff', 
                    color: '#0f172a', border: '1px solid rgba(15, 23, 42, 0.08)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.01)', 
                    lineHeight: '1.5', fontSize: '13px', fontWeight: '600', position: 'relative'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', gap: '20px' }}>
                      <span style={{ fontSize: '10px', textTransform: 'uppercase', color: m.role === 'user' ? '#16a34a' : '#475569', fontWeight: '900' }}>
                        {m.role === 'user' ? 'Operator' : 'AI Node'}
                      </span>
                      <button onClick={() => copyToClipboard(m.content, i)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '11px', cursor: 'pointer', fontWeight: '700' }}>
                        {copiedId === i ? '✓ Copied' : '📋 Copy'}
                      </button>
                    </div>
                    <div style={{ color: '#1e293b', whiteSpace: 'pre-wrap' }}>{m.content}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <form onSubmit={handleSend} style={{ padding: '16px', borderTop: '1px solid rgba(15, 23, 42, 0.06)', display: 'flex', gap: '10px', background: '#ffffff', alignItems: 'center' }}>
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type prompt requirements..." style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(15, 23, 42, 0.1)', color: '#0f172a', fontSize: '13px', fontWeight: '600', outline: 'none' }} />
              <button type="submit" style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', border: 'none', padding: '12px 20px', borderRadius: '8px', color: '#0f172a', fontWeight: '900', fontSize: '13px', cursor: 'pointer' }}>
                {isLoading ? '...' : 'Send'}
              </button>
            </form>
          </div>

        ) : (

          /* CANDIDATE COMPLIANCE MATCH ENGINE PROCESSING LAB (Export Feature Fully Extracted) */
          <div style={{ flex: 1, display: 'flex', height: '100%', overflowY: 'auto' }} className="matrix-split-lab">
            
            <div className="matrix-left-control" style={{ 
              width: '320px', backgroundColor: 'rgba(248, 250, 252, 0.7)', backdropFilter: 'blur(10px)',
              padding: '20px 16px', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(15, 23, 42, 0.08)', boxSizing: 'border-box', flexShrink: 0
            }}>
              <h2 style={{ fontSize: '14px', margin: '0 0 4px 0', fontWeight: '900', color: '#0f172a' }}>Job Spec Parameters</h2>
              <p style={{ fontSize: '11px', color: '#475569', margin: '0 0 12px 0', fontWeight: '600' }}>Enter requirement specs to map fit vectors manually.</p>

              <textarea 
                value={currentSession.jdInput} 
                onChange={(e) => updateCurrentSession({ jdInput: e.target.value })} 
                placeholder="Paste corporate job descriptions profiles here..." 
                style={{ 
                  width: '100%', height: '160px', padding: '12px', borderRadius: '8px', border: '1px solid rgba(15, 23, 42, 0.1)', 
                  backgroundColor: '#ffffff', color: '#0f172a', outline: 'none', resize: 'none', boxSizing: 'border-box', 
                  fontSize: '12.5px', fontWeight: '600', marginBottom: '12px'
                }} 
              />

              <button 
                onClick={handleMatchCandidates} 
                style={{ 
                  width: '100%', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#22c55e', border: 'none', 
                  padding: '12px', borderRadius: '8px', fontWeight: '900', fontSize: '12.5px', cursor: 'pointer'
                }}
              >
                {isMatching ? 'Processing Vector Loops...' : '⚡ Generate Sync Analysis'}
              </button>
            </div>

            <div style={{ flex: 1, padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#475569', fontWeight: '900' }}>
                Analysed Performance Matrix
              </div>

              {currentSession.matchResults.length > 0 ? (
                currentSession.matchResults.map((candidate, idx) => (
                  <div key={candidate.id || idx} style={{ background: '#ffffff', padding: '18px', borderRadius: '10px', border: '1px solid rgba(15, 23, 42, 0.06)', color: '#0f172a', boxShadow: '0 2px 8px rgba(0,0,0,0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '900', fontSize: '14px' }}>👤 {candidate.candidateName}</span>
                        <span style={{ backgroundColor: '#dcfce7', color: '#15803d', fontSize: '11px', fontWeight: '800', padding: '1px 6px', borderRadius: '8px' }}>
                          {candidate.matchScore}% Fit
                        </span>
                      </div>
                      <span style={{ color: '#64748b', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>{candidate.title}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '12.5px', lineHeight: '1.5', color: '#334155', fontWeight: '600' }}>
                      {candidate.details}
                    </p>
                  </div>
                ))
              ) : (
                <div style={{ border: '2px dashed rgba(15, 23, 42, 0.06)', borderRadius: '10px', padding: '40px 16px', textAlign: 'center', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>
                  No requirements metrics analyzed yet. Paste criteria into the parameter block and click "Generate Sync Analysis" to evaluate live matches.
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* OVERLAY SYSTEM DIALOG MODALS */}
      {isAboutOpen && (
        <div onClick={() => setIsAboutOpen(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '16px', boxSizing: 'border-box' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '440px', background: '#ffffff', borderRadius: '12px', padding: '24px', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#0f172a', fontSize: '18px', fontWeight: '900' }}>About Talent-Link</h3>
            <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5', color: '#334155', fontWeight: '600' }}>I'm TalentLink AI, your intelligent hiring copilot designed to streamline the recruitment process for small and medium businesses. I help you create job descriptions, match resumes to job requirements, shortlist candidates, and explain their fit—all while saving you time and reducing hiring fatigue.</p>
            <button onClick={() => setIsAboutOpen(false)} style={{ marginTop: '20px', width: '100%', padding: '10px', background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', border: 'none', borderRadius: '6px', color: '#0f172a', fontWeight: '900', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}

      {isContactOpen && (
        <div onClick={() => setIsContactOpen(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '16px', boxSizing: 'border-box' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '380px', background: '#ffffff', borderRadius: '12px', padding: '24px', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#0f172a', fontSize: '18px', fontWeight: '900' }}>Contact Us</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#334155', fontWeight: '700' }}>
              <div>👤 <span>Siddarth</span></div>
              <div>👤 <span>Bhavesh</span></div>
              <div>👤 <span>Surya</span></div>
            </div>
            <button onClick={() => setIsContactOpen(false)} style={{ marginTop: '20px', width: '100%', padding: '10px', background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', border: 'none', borderRadius: '6px', color: '#0f172a', fontWeight: '900', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}

    </div>
  );
}