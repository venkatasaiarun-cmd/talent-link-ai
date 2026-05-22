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

  // Mobile navigation overlay control
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

  // Mock static distribution array for Profiles vs Vacancies Dashboard Matrix
  const performanceDistribution = [
    { title: 'Product Engineering', vacancies: 3, profiles: 14, color: '#22c55e' },
    { title: 'Cloud Infrastructure', vacancies: 2, profiles: 11, color: '#3b82f6' },
    { title: 'AI / Intelligent Agents', vacancies: 4, profiles: 18, color: '#a855f7' },
    { title: 'Data Analytics Labs', vacancies: 3, profiles: 9, color: '#f59e0b' },
  ];

  const [activeJdId, setActiveJdId] = useState<string>('default-jd');
  const [activeMatrixId, setActiveMatrixId] = useState<string>('default-matrix');

  const currentSession = sessions.find(s => 
    activeView === 'jd-generation' ? s.id === activeJdId : s.id === activeMatrixId
  ) || sessions[0];

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMatching, setIsMatching] = useState(false);

  const [totalVacancies, setTotalVacancies] = useState<number>(12); 
  const [appliedCandidates, setAppliedCandidates] = useState<number>(52);

  // Global style injection for fluid responsive break points and standard custom styling overrides
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
      ::-webkit-scrollbar-thumb:hover {
        background: rgba(15, 23, 42, 0.3);
      }
      @media (max-width: 900px) {
        .responsive-sidebar-wrapper {
          display: none !important;
        }
        .responsive-mobile-header-strip {
          display: flex !important;
        }
        .responsive-center-frame-view {
          padding-top: 60px !important;
        }
        .responsive-grid-layout-stack {
          grid-template-columns: 1fr !important;
          gap: 16px !important;
        }
        .responsive-flex-lab-stack {
          flex-direction: column !important;
          overflow-y: auto !important;
        }
        .responsive-lab-control-panel {
          width: 100% !important;
          border-right: none !important;
          border-bottom: 1px solid rgba(15, 23, 42, 0.08) !important;
          height: auto !important;
          padding: 20px 16px !important;
        }
        .responsive-padded-workspace-container {
          padding: 20px 16px !important;
        }
        .responsive-chat-form-strip {
          padding: 16px !important;
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
    const totalItems = 15; // Kept highly optimal for mobile view handling rendering safely

    for (let i = 0; i < totalItems; i++) {
      items.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.2, 
        vy: (Math.random() - 0.5) * 0.2,
        radius: Math.random() * 2 + 1.5,
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
          if (dist < 180) {
            ctx.beginPath();
            ctx.moveTo(items[i].x, items[i].y);
            ctx.lineTo(items[j].x, items[j].y);
            const alpha = (1 - dist / 180) * 0.1;
            ctx.strokeStyle = `rgba(30, 41, 59, ${alpha})`; 
            ctx.lineWidth = 0.7;
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
        ctx.fillStyle = item.type === 0 ? 'rgba(15, 23, 42, 0.18)' : 'rgba(34, 197, 94, 0.35)';
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
    setAppliedCandidates(52 + (activeJdsCount * 3));
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
        matchResults: [{ title: "Analysis Matrix Complete", details: data.text || "Successfully sorted target candidate parameters." }]
      });
    } catch (error) {
      updateCurrentSession({
        matchResults: [{ title: "System Alert", details: "Unable to reconcile context vector matrix loops safely." }]
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
    return <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }} />;
  }

  const TalentLinkLogo = () => (
    <div style={{ 
      width: '46px', 
      height: '46px', 
      backgroundColor: '#22c55e', 
      borderRadius: '12px', 
      padding: '6px', 
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 0 16px rgba(34, 197, 94, 0.4)'
    }}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <circle cx="50" cy="50" r="40" stroke="#0f172a" strokeWidth="10"/>
        <path d="M35 50 L45 60 L65 40" stroke="#0f172a" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );

  const SharedSidebarNavLayout = () => (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px', textAlign: 'center', flexShrink: 0, cursor: 'pointer' }} onClick={() => { setActiveView('dashboard'); setIsMobileMenuOpen(false); }}>
        <TalentLinkLogo />
        <h1 style={{ fontSize: '18px', margin: '10px 0 0 0', fontWeight: '900', letterSpacing: '1px', color: '#ffffff' }}>TALENT-LINK</h1>
        <span style={{ fontSize: '11px', color: '#22c55e', marginTop: '2px', fontWeight: '800' }}>Connect. Hire. Grow.</span>
      </div>

      <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', paddingLeft: '6px' }}>Workspaces</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px', flexShrink: 0 }}>
        <button 
          onClick={() => { setActiveView('dashboard'); setIsMobileMenuOpen(false); }}
          style={{
            width: '100%', padding: '12px', textAlign: 'left', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
            background: activeView === 'dashboard' ? 'rgba(255,255,255,0.08)' : 'transparent',
            color: activeView === 'dashboard' ? '#22c55e' : '#e2e8f0'
          }}
        >
          📊 Core Control Dashboard
        </button>
        <button 
          onClick={() => { setActiveView('jd-generation'); setIsMobileMenuOpen(false); }}
          style={{
            width: '100%', padding: '12px', textAlign: 'left', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
            background: activeView === 'jd-generation' ? 'rgba(255,255,255,0.08)' : 'transparent',
            color: activeView === 'jd-generation' ? '#22c55e' : '#e2e8f0'
          }}
        >
          📝 Conversational JD AI
        </button>
        <button 
          onClick={() => { setActiveView('match-matrix'); setIsMobileMenuOpen(false); }}
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
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', marginBottom: '16px' }}>
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

      {/* DESKTOP PERMANENT SIDEBAR */}
      <div className="responsive-sidebar-wrapper" style={{ 
        width: '300px', 
        backgroundColor: 'rgba(15, 23, 42, 0.94)', 
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
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 130px)', overflow: 'hidden' }}>
          <SharedSidebarNavLayout />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexShrink: 0 }}>
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

      {/* MOBILE HEADER TOP STRIP VIEWPORT */}
      <div className="responsive-mobile-header-strip" style={{
        display: 'none', position: 'absolute', top: 0, left: 0, right: 0, height: '60px',
        backgroundColor: 'rgba(15, 23, 42, 0.96)', backdropFilter: 'blur(12px)',
        alignItems: 'center', justifyContent: 'space-between', padding: '0 16px',
        boxSizing: 'border-box', zIndex: 30, borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setActiveView('dashboard')}>
          <div style={{ width: '32px', height: '32px', backgroundColor: '#22c55e', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '14px', color: '#0f172a' }}>✔</span>
          </div>
          <span style={{ color: '#ffffff', fontWeight: '900', fontSize: '14px', letterSpacing: '1px' }}>TALENT-LINK</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{ background: 'transparent', border: 'none', color: '#ffffff', fontSize: '22px', cursor: 'pointer', padding: '8px' }}
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* MOBILE POP-OUT NAVIGATION DRAWER OVERLAY */}
      {isMobileMenuOpen && (
        <div style={{
          position: 'fixed', top: '60px', left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.98)', backdropFilter: 'blur(20px)',
          padding: '24px 16px', display: 'flex', flexDirection: 'column', zIndex: 25, overflowY: 'auto'
        }}>
          <SharedSidebarNavLayout />
          <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '24px' }}>
            <button onClick={() => { setIsAboutOpen(true); setIsMobileMenuOpen(false); }} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', color: '#ffffff', fontWeight: '700', fontSize: '12px' }}>About</button>
            <button onClick={() => { setIsContactOpen(true); setIsMobileMenuOpen(false); }} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', color: '#ffffff', fontWeight: '700', fontSize: '12px' }}>Contact</button>
          </div>
        </div>
      )}

      {/* CORE FRAME ARCHITECTURE CONTAINER */}
      <div className="responsive-center-frame-view" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'transparent', position: 'relative', zIndex: 1 }}>
        
        {/* UPPER CLEAN GLASS HEADER BAR */}
        <div style={{ 
          padding: '16px 24px', 
          borderBottom: '1px solid rgba(15, 23, 42, 0.08)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0.78) 100%)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.01)', flexShrink: 0, minHeight: '60px', boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', overflow: 'hidden' }}>
            {activeView !== 'dashboard' && (
              <button onClick={() => setActiveView('dashboard')} style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', border: 'none', color: '#ffffff', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', flexShrink: 0 }}>← Back to Hub</button>
            )}
            <div style={{ fontWeight: '900', fontSize: '14px', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {activeView === 'dashboard' && '🏢 System Operational Control Dashboard'}
              {activeView === 'jd-generation' && '📝 Workspace Studio: Conversational JD Generation'}
              {activeView === 'match-matrix' && '⚡ Workspace Engine: Match Matrix'}
            </div>
          </div>
        </div>

        {/* COMPONENT MANAGER VIEW SLOTS */}
        {activeView === 'dashboard' ? (
          
          /* OPTION A: ENHANCED PROFILES VS VACANCIES DASHBOARD MATRIX */
          <div className="responsive-padded-workspace-container" style={{ flex: 1, padding: '40px 24px', overflowY: 'auto', boxSizing: 'border-box' }}>
            <div style={{ maxWidth: '950px', margin: '0 auto' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '26px', fontWeight: '900', margin: '0 0 6px 0', color: '#0f172a', letterSpacing: '-0.5px' }}>Profiles vs Vacancies Analytics Matrix</h2>
                <p style={{ color: '#475569', margin: 0, fontSize: '14px', fontWeight: '600' }}>Live structural mapping of system indexed resumes against open department metrics.</p>
              </div>

              {/* CORE METRICS ANALYTICS BARS LAYOUT */}
              <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid rgba(15, 23, 42, 0.08)', padding: '24px', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.02)', marginBottom: '32px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 20px 0' }}>Department Deployment Scale</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {performanceDistribution.map((item, index) => {
                    const ratioPercent = Math.min(100, Math.round((item.vacancies / item.profiles) * 100));
                    return (
                      <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                          <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#1e293b' }}>{item.title}</span>
                          <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>
                            <strong style={{ color: item.color }}>{item.vacancies} Openings</strong> / {item.profiles} Profiles Checked
                          </span>
                        </div>
                        
                        <div style={{ width: '100%', height: '12px', backgroundColor: '#f1f5f9', borderRadius: '6px', position: 'relative', overflow: 'hidden', border: '1px solid rgba(15,23,42,0.03)' }}>
                          {/* Profile Bar Segment */}
                          <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '100%', backgroundColor: '#e2e8f0', borderRadius: '6px' }}></div>
                          {/* Vacancy Fill Segment */}
                          <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${ratioPercent}%`, backgroundColor: item.color, borderRadius: '6px', transition: 'width 1s ease' }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ACTION LINKS ROW MODULES */}
              <div className="responsive-grid-layout-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)', backdropFilter: 'blur(16px)', borderRadius: '16px', border: '1px solid rgba(15,23,42,0.06)', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 8px 24px rgba(0,0,0,0.01)' }}>
                  <div>
                    <span style={{ fontSize: '22px', display: 'block', marginBottom: '12px' }}>📝</span>
                    <h3 style={{ fontSize: '16px', fontWeight: '900', margin: '0 0 8px 0', color: '#0f172a' }}>Conversational Talent-Link AI</h3>
                    <p style={{ color: '#475569', fontSize: '13px', lineHeight: '1.5', margin: '0 0 20px 0', fontWeight: '600' }}>Collaborate with natural language interfaces to design optimized job descriptions ready for immediate parsing mapping loops.</p>
                  </div>
                  <button onClick={() => setActiveView('jd-generation')} style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#0f172a', border: 'none', width: '100%', padding: '12px', borderRadius: '8px', fontWeight: '900', fontSize: '13px', cursor: 'pointer' }}>Open Studio Console →</button>
                </div>

                <div style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)', backdropFilter: 'blur(16px)', borderRadius: '16px', border: '1px solid rgba(15,23,42,0.06)', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 8px 24px rgba(0,0,0,0.01)' }}>
                  <div>
                    <span style={{ fontSize: '22px', display: 'block', marginBottom: '12px' }}>⚡</span>
                    <h3 style={{ fontSize: '16px', fontWeight: '900', margin: '0 0 8px 0', color: '#0f172a' }}>Candidate Match Matrix</h3>
                    <p style={{ color: '#475569', fontSize: '13px', lineHeight: '1.5', margin: '0 0 20px 0', fontWeight: '600' }}>Isolate tracking. Evaluate structured vector score distribution matrices strictly across live resume models instantly.</p>
                  </div>
                  <button onClick={() => setActiveView('match-matrix')} style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#22c55e', border: 'none', width: '100%', padding: '12px', borderRadius: '8px', fontWeight: '900', fontSize: '13px', cursor: 'pointer' }}>Launch Match Engine →</button>
                </div>
              </div>

            </div>
          </div>

        ) : activeView === 'jd-generation' ? (

          /* OPTION B: CHAT SPECIFICATION PANEL */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <div className="responsive-padded-workspace-container" style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {currentSession.messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', flexShrink: 0 }}>
                  <div style={{ 
                    maxWidth: '85%', padding: '16px 20px', borderRadius: '12px', 
                    background: m.role === 'user' ? 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)' : '#ffffff', 
                    color: '#0f172a', border: '1px solid rgba(15, 23, 42, 0.08)', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.02)', 
                    lineHeight: '1.5', fontSize: '13.5px', fontWeight: '600', position: 'relative'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', gap: '30px' }}>
                      <span style={{ fontSize: '10px', textTransform: 'uppercase', color: m.role === 'user' ? '#16a34a' : '#475569', fontWeight: '900' }}>
                        {m.role === 'user' ? 'Operator Query' : 'AI Intelligence'}
                      </span>
                      <button onClick={() => copyToClipboard(m.content, i)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '11px', cursor: 'pointer', fontWeight: '800' }}>
                        {copiedId === i ? '✓ Copied' : '📋 Copy'}
                      </button>
                    </div>
                    <div style={{ color: '#1e293b', whiteSpace: 'pre-wrap' }}>{m.content}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <form onSubmit={handleSend} className="responsive-chat-form-strip" style={{ padding: '20px 24px', borderTop: '1px solid rgba(15, 23, 42, 0.06)', display: 'flex', gap: '12px', background: '#ffffff', flexShrink: 0 }}>
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Provide requirements to update or build JDs..." style={{ flex: 1, padding: '14px 18px', borderRadius: '8px', border: '1px solid rgba(15, 23, 42, 0.12)', color: '#0f172a', outline: 'none', fontSize: '13.5px', fontWeight: '600' }} />
              <button type="submit" style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', border: 'none', padding: '0 24px', borderRadius: '8px', color: '#0f172a', fontWeight: '900', fontSize: '13.5px', cursor: 'pointer' }}>
                {isLoading ? '...' : 'Execute'}
              </button>
            </form>
          </div>

        ) : (

          /* OPTION C: CANDIDATE SPLIT MATRIX PROCESSING LAB */
          <div className="responsive-flex-lab-stack" style={{ flex: 1, display: 'flex', height: '100%', overflow: 'hidden' }}>
            
            <div className="responsive-lab-control-panel" style={{ 
              width: '360px', backgroundColor: 'rgba(248, 250, 252, 0.85)', backdropFilter: 'blur(16px)',
              padding: '24px', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(15, 23, 42, 0.08)', height: '100%', boxSizing: 'border-box', flexShrink: 0
            }}>
              <h2 style={{ fontSize: '15px', margin: '0 0 4px 0', fontWeight: '900', color: '#0f172a' }}>Job Spec Parameters</h2>
              <p style={{ fontSize: '11.5px', color: '#475569', margin: '0 0 16px 0', lineHeight: '1.4', fontWeight: '600' }}>Enter requirement configurations to check alignment loops maps manually.</p>

              <textarea 
                value={currentSession.jdInput} 
                onChange={(e) => updateCurrentSession({ jdInput: e.target.value })} 
                placeholder="Paste targeted core job description requirements parameters criteria here..." 
                style={{ 
                  width: '100%', height: '200px', padding: '14px', borderRadius: '8px', border: '1px solid rgba(15, 23, 42, 0.1)', 
                  backgroundColor: '#ffffff', color: '#0f172a', outline: 'none', resize: 'none', boxSizing: 'border-box', 
                  fontSize: '13px', lineHeight: '1.5', fontWeight: '600', marginBottom: '14px'
                }} 
              />

              <button 
                onClick={handleMatchCandidates} 
                style={{ 
                  width: '100%', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#22c55e', border: 'none', 
                  padding: '12px', borderRadius: '8px', fontWeight: '900', fontSize: '13px', cursor: 'pointer'
                }}
              >
                {isMatching ? 'Processing Matrices...' : '⚡ Generate Sync Analysis'}
              </button>
            </div>

            <div className="responsive-padded-workspace-container" style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#475569', fontWeight: '900' }}>
                Analysed Performance Matrix
              </div>

              {currentSession.matchResults.length > 0 ? (
                currentSession.matchResults.map((result, idx) => (
                  <div key={idx} style={{ background: '#ffffff', padding: '16px', borderRadius: '10px', border: '1px solid rgba(15, 23, 42, 0.06)', color: '#0f172a' }}>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: '900' }}>{result.title}</h4>
                    <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5', color: '#334155', fontWeight: '600' }}>{result.details}</p>
                  </div>
                ))
              ) : (
                <div style={{ border: '2px dashed rgba(15, 23, 42, 0.06)', borderRadius: '10px', padding: '40px 16px', textAlign: 'center', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>
                  No requirement configurations analyzed yet. Update parameters block and execute sync matrix mapping.
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* OVERLAY DIALOG MODALS */}
      {isAboutOpen && (
        <div onClick={() => setIsAboutOpen(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '16px', boxSizing: 'border-box' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '440px', background: '#ffffff', borderRadius: '12px', padding: '24px', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#0f172a', fontSize: '18px', fontWeight: '900' }}>About Talent-Link</h3>
            <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5', color: '#334155', fontWeight: '600' }}>I&apos;m TalentLink AI, your intelligent hiring copilot designed to streamline the recruitment process for small and medium businesses. I help you create job descriptions, match resumes to job requirements, shortlist candidates, and explain their fit—all while saving you time and reducing hiring fatigue.</p>
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