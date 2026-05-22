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
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Navigation State
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

  // Helper utility to turn generated markdown text arrays safely into rich HTML nodes
  const renderFormattedContent = (text: string) => {
    const cleanText = text.replace(/[\u00A0\u1680 ]/g, ' ');
    const lines = cleanText.split('\n');

    return lines.map((line, index) => {
      let currentLine = line.trim();

      if (!currentLine) {
        return <div key={index} style={{ height: '12px' }} />;
      }

      // 1. Parse Subheaders (### Title)
      if (currentLine.startsWith('###')) {
        return (
          <h3 key={index} style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginTop: '18px', marginBottom: '8px' }}>
            {currentLine.replace(/^###\s*/, '')}
          </h3>
        );
      }

      // 2. Parse List Elements (- item)
      if (currentLine.startsWith('-') || currentLine.startsWith('*')) {
        const itemContent = currentLine.replace(/^[-\*]\s*/, '');
        return (
          <ul key={index} style={{ margin: '4px 0 4px 18px', padding: 0, listStyleType: 'disc' }}>
            <li style={{ color: '#334155', fontSize: '13.5px' }}>
              {parseInlineStyles(itemContent)}
            </li>
          </ul>
        );
      }

      // 3. Separators (---)
      if (currentLine === '---') {
        return <hr key={index} style={{ border: 'none', borderTop: '1px solid rgba(15,23,42,0.1)', margin: '16px 0' }} />;
      }

      // Standalone paragraph strings
      return (
        <p key={index} style={{ margin: '0 0 8px 0', color: '#334155', fontSize: '13.5px', lineHeight: '1.6' }}>
          {parseInlineStyles(currentLine)}
        </p>
      );
    });
  };

  // Maps down string segment blocks separating markdown raw emphasis indicators (**text**) to bold blocks
  const parseInlineStyles = (text: string) => {
    const parts = text.split(/\*\*([\s\S]*?)\*\*/g);
    if (parts.length > 1) {
      return parts.map((chunk, i) => {
        if (i % 2 === 1) {
          return <strong key={i} style={{ fontWeight: '700', color: '#0f172a' }}>{chunk}</strong>;
        }
        return chunk;
      });
    }

    return text;
  };

  useEffect(() => {
    setMounted(true);
    
    const checkMobileSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobileSize();
    window.addEventListener('resize', checkMobileSize);
    
    const style = document.createElement("style");
    style.innerHTML = `
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        height: 100% !important;
        width: 100% !important;
        background-color: #f8fafc;
      }
      ::-webkit-scrollbar { width: 6px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgba(15, 23, 42, 0.15); border-radius: 10px; }
      ::-webkit-scrollbar-thumb:hover { background: rgba(15, 23, 42, 0.3); }
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
      window.removeEventListener('resize', checkMobileSize);
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    const activeJdsCount = sessions.filter(s => s.jdInput.trim().length > 0).length;
    setTotalVacancies(10 + activeJdsCount);
    setAppliedCandidates(35 + (activeJdsCount * 3));
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
      width: '52px', height: '52px', backgroundColor: '#22c55e', borderRadius: '14px', padding: '8px', boxSizing: 'border-box',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
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
      display: 'flex', height: '100vh', width: '100vw', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 
      margin: 0, backgroundColor: 'transparent', color: '#0f172a', overflow: 'hidden', position: 'relative'
    }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }} />

      {/* ABOUT MODAL PORTAL DIALOG */}
      {isAboutOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '16px', padding: '28px', maxWidth: '500px', width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', border: '1px solid rgba(15, 23, 42, 0.08)'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '900', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ℹ️ About Talent-Link AI
            </h3>
            <p style={{ fontSize: '14px', color: '#334155', lineHeight: '1.6', margin: '0 0 20px 0', fontWeight: '500' }}>
              Talent-Link is an intelligent recruitment orchestration pipeline designed to bridge communication gaps in human capital sourcing. By utilizing structured contextual language vectors, it accelerates compliant job description engineering and simplifies resume alignment processes within an integrated single control center workspace environment.
            </p>
            <button 
              onClick={() => setIsAboutOpen(false)}
              style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', float: 'right' }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* CONTACT US MODAL PORTAL DIALOG */}
      {isContactOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', 
          alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '16px', padding: '28px', maxWidth: '450px', width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', border: '1px solid rgba(15, 23, 42, 0.08)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '900', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📞 System Administration Team
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {['Siddharth Mishra', 'Surya Arun', 'Bhavesh Kumar Tomer'].map((name, idx) => (
                <div key={idx} style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#0f172a', fontSize: '14px', fontWeight: '700' }}>
                  👤 {name}
                </div>
              ))}
            </div>
            <button 
              onClick={() => setIsContactOpen(false)}
              style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', float: 'right' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* LEFT SIDEBAR */}
      <div style={{ 
        width: '300px', backgroundColor: 'rgba(15, 23, 42, 0.92)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        padding: '24px 16px', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255, 255, 255, 0.1)', 
        justifyContent: 'space-between', height: '100%', boxSizing: 'border-box', boxShadow: '4px 0 24px rgba(15, 23, 42, 0.15)',
        zIndex: 10, transition: 'transform 0.3s ease',
        transform: isMobile ? (isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
        left: 0, top: 0, position: isMobile ? 'absolute' : 'relative',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 140px)', overflow: 'hidden' }}>
          
          <div onClick={() => { setActiveView('dashboard'); setIsSidebarOpen(false); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '28px', textAlign: 'center', flexShrink: 0, cursor: 'pointer' }}>
            <TalentLinkLogo />
            <h1 style={{ fontSize: '19px', margin: '10px 0 0 0', fontWeight: '900', letterSpacing: '1.5px', color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>TALENT-LINK</h1>
            <span style={{ fontSize: '11px', color: '#22c55e', marginTop: '4px', fontWeight: '800', letterSpacing: '0.5px' }}>Connect. Hire. Grow.</span>
          </div>

          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', paddingLeft: '6px' }}>Workspaces</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '24px', flexShrink: 0 }}>
            <button 
              onClick={() => { setActiveView('dashboard'); setIsSidebarOpen(false); }}
              style={{
                width: '100%', padding: '12px', textAlign: 'left', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                background: activeView === 'dashboard' ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: activeView === 'dashboard' ? '#22c55e' : '#e2e8f0'
              }}
            >
              📊 Core Control Dashboard
            </button>
            <button 
              onClick={() => { setActiveView('jd-generation'); setIsSidebarOpen(false); }}
              style={{
                width: '100%', padding: '12px', textAlign: 'left', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                background: activeView === 'jd-generation' ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: activeView === 'jd-generation' ? '#22c55e' : '#e2e8f0'
              }}
            >
              📝 Conversational JD AI
            </button>
            <button 
              onClick={() => { setActiveView('match-matrix'); setIsSidebarOpen(false); }}
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
                      onClick={() => {
                        if (activeView === 'jd-generation') setActiveJdId(session.id);
                        if (activeView === 'match-matrix') setActiveMatrixId(session.id);
                        setIsSidebarOpen(false);
                      }}
                      style={{ 
                        padding: '12px', 
                        background: isActive ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.95) 0%, rgba(22, 163, 74, 0.95) 100%)' : 'transparent', 
                        borderLeft: isActive ? '4px solid #ffffff' : '4px solid transparent', 
                        color: isActive ? '#0f172a' : '#e2e8f0', borderRadius: '0 8px 8px 0', fontSize: '13px', 
                        fontWeight: isActive ? '900' : '600', cursor: 'pointer',
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setIsAboutOpen(true)} style={{ flex: 1.2, padding: '10px', background: 'linear-gradient(180deg, rgba(51, 65, 85, 0.6) 0%, rgba(30, 41, 59, 0.8) 100%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#ffffff', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>About Talent-Link</button>
            <button onClick={() => setIsContactOpen(true)} style={{ flex: 0.8, padding: '10px', background: 'linear-gradient(180deg, rgba(51, 65, 85, 0.6) 0%, rgba(30, 41, 59, 0.8) 100%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#ffffff', fontSize: '11px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }}>Contact us</button>
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

      {/* MOBILE BACKDROP LAYER */}
      {isMobile && isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 9, backdropFilter: 'blur(4px)' }}
        />
      )}

      {/* CENTER WORKSPACE FRAME TERMINAL HUB */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'transparent', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
        
        {/* UPPER STRIP AREA */}
        <div style={{ 
          padding: '16px 20px', borderBottom: '1px solid rgba(15, 23, 42, 0.08)', display: 'flex', alignItems: 'center', 
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.75) 100%)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', boxShadow: '0 2px 12px rgba(0, 0, 0, 0.02)', flexShrink: 0
        }}>
          {isMobile && (
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{ background: '#1e293b', border: 'none', color: '#ffffff', padding: '8px 12px', borderRadius: '6px', marginRight: '12px', cursor: 'pointer' }}
            >
              ☰
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
            {activeView !== 'dashboard' && (
              <button onClick={() => setActiveView('dashboard')} style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', border: 'none', color: '#ffffff', padding: '6px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', whiteSpace: 'nowrap' }}>← Hub</button>
            )}
            <div style={{ fontWeight: '900', fontSize: '15px', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {activeView === 'dashboard' && '🏢 TALENT-LINK AI OPERATIONAL CENTER'}
              {activeView === 'jd-generation' && '📝 Conversational JD Studio'}
              {activeView === 'match-matrix' && '⚡ Candidate Match Vector'}
            </div>
          </div>
        </div>

        {/* WORKSPACE CENTRAL ROUTER VIEWS */}
        {activeView === 'dashboard' ? (
          <div style={{ flex: 1, padding: '30px 20px', overflowY: 'auto', boxSizing: 'border-box' }}>
            <div style={{ maxWidth: '950px', margin: '0 auto' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '32px' }}>
                <TalentLinkLogo />
                <h2 style={{ fontSize: '24px', fontWeight: '900', margin: '14px 0 6px 0', color: '#0f172a', letterSpacing: '-0.5px' }}>Welcome back to Talent-Link Workspace</h2>
                <p style={{ color: '#475569', margin: 0, fontSize: '14px', fontWeight: '600' }}>Select an active architecture console link below to manage pipeline frameworks.</p>
              </div>

              {/* INTEGRATED DASHBOARD METRICS SUMMARY */}
              <div style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: '16px', padding: '24px', marginBottom: '30px', color: '#ffffff',
                boxShadow: '0 8px 30px rgba(15,23,42,0.15)', display: 'flex', flexDirection: 'column', gap: '16px'
              }}>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: '#22c55e' }}>📊 Analytics Summary Dashboard</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.06)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700' }}>No. of Vacancies</div>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: '#ffffff', marginTop: '4px' }}>{totalVacancies}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.06)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700' }}>Applied Candidates</div>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: '#22c55e', marginTop: '4px' }}>{appliedCandidates}</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
                  backdropFilter: 'blur(16px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.8)', padding: '24px',
                  boxShadow: '0 12px 40px rgba(15, 23, 42, 0.06)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}>
                  <div>
                    <span style={{ fontSize: '24px', display: 'block', marginBottom: '12px' }}>📝</span>
                    <h3 style={{ fontSize: '16px', fontWeight: '900', margin: '0 0 8px 0', color: '#0f172a' }}>Conversational Talent-Link AI</h3>
                    <p style={{ color: '#475569', fontSize: '13px', lineHeight: '1.5', margin: '0 0 20px 0', fontWeight: '600' }}>
                      Collaborate with context-aware natural language interfaces to design optimized, compliance-mapped corporate job descriptions ready for candidate parsing.
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveView('jd-generation')}
                    style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#0f172a', border: 'none', width: '100%', padding: '12px', borderRadius: '10px', fontWeight: '900', fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(34, 197, 94, 0.35)' }}
                  >
                    Open JD Studio Console →
                  </button>
                </div>

                <div style={{ 
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
                  backdropFilter: 'blur(16px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.8)', padding: '24px',
                  boxShadow: '0 12px 40px rgba(15, 23, 42, 0.06)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}>
                  <div>
                    <span style={{ fontSize: '24px', display: 'block', marginBottom: '12px' }}>⚡</span>
                    <h3 style={{ fontSize: '16px', fontWeight: '900', margin: '0 0 8px 0', color: '#0f172a' }}>Candidate Match Matrix</h3>
                    <p style={{ color: '#475569', fontSize: '13px', lineHeight: '1.5', margin: '0 0 20px 0', fontWeight: '600' }}>
                      Isolate candidate matching loops. Execute structured vector score analysis maps strictly across target parameters and parsed resume database models.
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveView('match-matrix')}
                    style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#22c55e', border: '1px solid rgba(255,255,255,0.05)', width: '100%', padding: '12px', borderRadius: '10px', fontWeight: '900', fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)' }}
                  >
                    Launch Match Sync Engine →
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : activeView === 'jd-generation' ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {currentSession.messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', flexShrink: 0 }}>
                  <div style={{ 
                    maxWidth: '85%', padding: '20px', borderRadius: '14px', 
                    background: m.role === 'user' ? 'linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.9) 100%)' : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(250, 250, 250, 0.9) 100%)', 
                    color: '#0f172a', border: '1px solid rgba(15, 23, 42, 0.08)', boxShadow: '0 8px 32px rgba(15, 23, 42, 0.04)', 
                    backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', position: 'relative'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '20px' }}>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: m.role === 'user' ? '#16a34a' : '#475569', fontWeight: '900' }}>
                        {m.role === 'user' ? 'Operator Query' : 'Nexus AI'}
                      </div>
                      <button onClick={() => copyToClipboard(m.content, `top-${i}`)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '11px', cursor: 'pointer', fontWeight: '800' }}>
                        {copiedId === `top-${i}` ? '✓' : '📋'}
                      </button>
                    </div>
                    
                    <div style={{ paddingBottom: m.role === 'assistant' ? '40px' : '0px' }}>
                      {renderFormattedContent(m.content)}
                    </div>

                    {m.role === 'assistant' && (
                      <div style={{ position: 'absolute', bottom: '12px', right: '12px' }}>
                        <button type="button" onClick={() => copyToClipboard(m.content, `bottom-${i}`)} style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)', border: '1px solid rgba(15, 23, 42, 0.1)', color: '#334155', fontSize: '10px', cursor: 'pointer', fontWeight: '800', padding: '4px 8px', borderRadius: '6px' }}>
                          {copiedId === `bottom-${i}` ? '✓ Copied' : '📋 Copy Text'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <form onSubmit={handleSend} style={{ padding: '16px', borderTop: '1px solid rgba(15, 23, 42, 0.06)', display: 'flex', gap: '10px', background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.9) 100%)', backdropFilter: 'blur(12px)', flexShrink: 0 }}>
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Provide requirements to engineer JDs..." style={{ flex: 1, padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(15, 23, 42, 0.12)', backgroundColor: 'rgba(255, 255, 255, 0.8)', color: '#0f172a', outline: 'none', fontSize: '13.5px', fontWeight: '600' }} />
              <button type="submit" style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', border: 'none', padding: '0 20px', borderRadius: '10px', color: '#0f172a', fontWeight: '900', fontSize: '13.5px', cursor: 'pointer' }}>
                {isLoading ? '...' : 'Send'}
              </button>
            </form>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: isMobile ? 'column' : 'row', height: '100%', overflow: 'hidden' }}>
            <div style={{ 
              width: isMobile ? '100%' : '350px', backgroundColor: 'rgba(248, 250, 252, 0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
              padding: '20px', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(15, 23, 42, 0.08)', borderBottom: isMobile ? '1px solid rgba(15, 23, 42, 0.08)' : 'none', boxSizing: 'border-box', flexShrink: 0
            }}>
              <div>
                <h2 style={{ fontSize: '15px', margin: '0 0 4px 0', fontWeight: '900', color: '#0f172a' }}>Job Spec Parameters</h2>
                <p style={{ fontSize: '11px', color: '#475569', margin: '0 0 14px 0', lineHeight: '1.4', fontWeight: '600' }}>Enter requirement metrics to process compliance alignment loops.</p>
              </div>

              <textarea 
                value={currentSession.jdInput} 
                onChange={(e) => updateCurrentSession({ jdInput: e.target.value })} 
                placeholder="Paste corporate job description targets here..." 
                style={{ 
                  width: '100%', height: isMobile ? '120px' : '200px', padding: '12px', borderRadius: '10px', border: '1px solid rgba(15, 23, 42, 0.1)', 
                  backgroundColor: 'rgba(255, 255, 255, 0.75)', color: '#0f172a', outline: 'none', resize: 'none', boxSizing: 'border-box', 
                  fontSize: '13px', lineHeight: '1.5', fontWeight: '600', marginBottom: '12px'
                }} 
              />

              <button 
                onClick={handleMatchCandidates} 
                style={{ 
                  width: '100%', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#22c55e', border: '1px solid rgba(255,255,255,0.05)', 
                  padding: '12px', borderRadius: '10px', fontWeight: '900', fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)'
                }}
              >
                {isMatching ? 'Processing Vector Analysis...' : '⚡ Generate Matrix'}
              </button>
            </div>

            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', boxSizing: 'border-box' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', fontWeight: '900', marginBottom: '16px' }}>
                Compliance Engine Output Matrix
              </div>
              {currentSession.matchResults.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', background: 'rgba(255,255,255,0.5)', borderRadius: '12px', border: '1px dashed rgba(15,23,42,0.1)', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>
                  No vector metrics compiled yet. Submit parameters to load syncing models.
                </div>
              ) : (
                currentSession.matchResults.map((res, idx) => (
                  <div key={idx} style={{ padding: '20px', background: '#ffffff', borderRadius: '12px', border: '1px solid rgba(15,23,42,0.06)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: '900', color: '#0f172a' }}>{res.title}</h4>
                    <div style={{ fontSize: '13.5px', color: '#334155', lineHeight: '1.6', fontWeight: '600' }}>
                      {renderFormattedContent(res.details)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}