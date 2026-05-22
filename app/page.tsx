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

    // Dynamic Context Nexus Elements representing a combination of Jobs, Resumes, and Candidates
    interface NexusItem {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      type: 'job' | 'resume' | 'candidate';
      label: string;
    }

    const items: NexusItem[] = [];
    const totalItems = 33;
    const entities: ('job' | 'resume' | 'candidate')[] = ['job', 'resume', 'candidate'];
    const labels = { job: '💼 JOB', resume: '📄 CV', candidate: '👤 CANDIDATE' };

    for (let i = 0; i < totalItems; i++) {
      const type = entities[i % 3];
      items.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3, 
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 4 + 6, // larger nodes for rich graphic entities
        type: type,
        label: labels[type]
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

      // Draw cross-referencing alignment vectors between Job, Resumes, and Candidates
      for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
          // Cross link nodes of different types to showcase match orchestration
          if (items[i].type !== items[j].type) {
            const dist = Math.hypot(items[i].x - items[j].x, items[i].y - items[j].y);
            if (dist < 220) {
              ctx.beginPath();
              ctx.moveTo(items[i].x, items[i].y);
              ctx.lineTo(items[j].x, items[j].y);
              const alpha = (1 - dist / 220) * 0.18;
              
              // Dynamic line styling matching the connection paths
              ctx.strokeStyle = `rgba(30, 41, 59, ${alpha})`;
              ctx.lineWidth = 0.9;
              ctx.stroke();
            }
          }
        }
      }

      // Draw customized graphic entities
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
        if (item.type === 'job') {
          // Draw Square/Target for Jobs
          ctx.rect(-item.size, -item.size, item.size * 2, item.size * 2);
          ctx.fillStyle = 'rgba(59, 130, 246, 0.25)'; // Blue tint
          ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
        } else if (item.type === 'resume') {
          // Draw Document/Triangle for Resumes
          ctx.moveTo(0, -item.size);
          ctx.lineTo(item.size, item.size);
          ctx.lineTo(-item.size, item.size);
          ctx.closePath();
          ctx.fillStyle = 'rgba(34, 197, 94, 0.25)'; // Green tint
          ctx.strokeStyle = 'rgba(34, 197, 94, 0.5)';
        } else {
          // Draw Circle/Persona for Candidates
          ctx.arc(0, 0, item.size, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(99, 102, 241, 0.25)'; // Indigo tint
          ctx.strokeStyle = 'rgba(99, 102, 241, 0.5)';
        }
        
        ctx.fill();
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Tiny indicator text labels for clear context
        ctx.fillStyle = 'rgba(71, 85, 105, 0.35)';
        ctx.font = 'bold 8px -apple-system, BlinkMacSystemFont';
        ctx.fillText(item.label, item.size + 4, 3);
        
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

  // Resets the compiled match results for the matrix view
  const handleResetMatchMatrix = () => {
    updateCurrentSession({
      matchResults: []
    });
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
              Talent-Link is an intelligent recruitment orchestration pipeline designed to bridge communication gaps in human capital sourcing.
              By utilizing structured contextual language vectors, it accelerates compliant job description engineering and simplifies resume alignment processes within an integrated single control center workspace environment.
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
        <div onClick={() => setIsSidebarOpen(false)} style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 9, backdropFilter: 'blur(4px)' }} />
      )}

      {/* CENTER WORKSPACE FRAME TERMINAL HUB */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'transparent', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
        
        {/* UPPER STRIP AREA */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(15, 23, 42, 0.08)', display: 'flex', alignItems: 'center', background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.75) 100%)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', boxShadow: '0 2px 12px rgba(0, 0, 0, 0.02)', flexShrink: 0 }}>
          {isMobile && (
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: '#1e293b', border: 'none', color: '#ffffff', padding: '8px 12px', borderRadius: '6px', marginRight: '12px', cursor: 'pointer' }}> ☰ </button>
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
              <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: '16px', padding: '24px', marginBottom: '30px', color: '#ffffff', boxShadow: '0 8px 30px rgba(15,23,42,0.15)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                  padding: '24px', borderRadius: '16px', border: '1px solid rgba(15,23,42,0.06)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.02)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontSize: '24px', marginBottom: '12px' }}>📝</div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '17px', fontWeight: '900', color: '#0f172a' }}>Conversational JD AI</h3>
                    <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: '1.5', fontWeight: '500' }}>
                      Construct robust context-mapped job profiles interactively via natural chat dialog interfaces synced safely to local governance guidelines.
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveView('jd-generation')} 
                    style={{ marginTop: '20px', width: '100%', padding: '11px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 12px rgba(15,23,42,0.15)' }}
                  >
                    Open Architect Studio
                  </button>
                </div>

                <div style={{ 
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                  padding: '24px', borderRadius: '16px', border: '1px solid rgba(15,23,42,0.06)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.02)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontSize: '24px', marginBottom: '12px' }}>⚡</div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '17px', fontWeight: '900', color: '#0f172a' }}>Candidate Match Matrix</h3>
                    <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: '1.5', fontWeight: '500' }}>
                      Paste specific parameter scopes directly into vector mapping loops to analyze the overall alignment score matrices of your applicant databases instantly.
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveView('match-matrix')} 
                    style={{ marginTop: '20px', width: '100%', padding: '11px', background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 12px rgba(22,163,74,0.2)' }}
                  >
                    Launch Vector Sync Engine
                  </button>
                </div>

              </div>
            </div>
          </div>
        ) : activeView === 'jd-generation' ? (
          /* DUAL PANEL LAYOUT FOR CONVERSATIONAL JD AI WORKSPACE */
          <div style={{ flex: 1, display: 'flex', flexDirection: isMobile ? 'column' : 'row', height: '100%', overflow: 'hidden' }}>
            
            {/* LEFT CHAT CONTROL BOX */}
            <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', height: '100%', borderRight: isMobile ? 'none' : '1px solid rgba(15,23,42,0.06)', background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(8px)' }}>
              
              {/* CHAT THREAD PORT */}
              <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {currentSession.messages.map((msg, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '80%', padding: '14px 16px', fontSize: '13.5px', lineHeight: '1.5',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.01)',
                      background: msg.role === 'user' ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' : '#ffffff',
                      color: msg.role === 'user' ? '#ffffff' : '#334155',
                      border: msg.role === 'user' ? 'none' : '1px solid rgba(15,23,42,0.05)',
                      borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px'
                    }}>
                      <div style={{ fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px', opacity: msg.role === 'user' ? 0.7 : 0.5 }}>
                        {msg.role === 'user' ? 'Operator Context Input' : 'Talent-Link Assistant Pipeline'}
                      </div>
                      <div style={{ whiteSpace: 'pre-wrap' }}>
                        {msg.role === 'assistant' ? renderFormattedContent(msg.content) : msg.content}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(15,23,42,0.05)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '6px', height: '6px', backgroundColor: '#64748b', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both' }}></div>
                      <div style={{ width: '6px', height: '6px', backgroundColor: '#64748b', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.2s' }}></div>
                      <div style={{ width: '6px', height: '6px', backgroundColor: '#64748b', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.4s' }}></div>
                      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Reconciling vector pipelines...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* INPUT BAR TERMINAL */}
              <form onSubmit={handleSend} style={{ padding: '16px 20px', borderTop: '1px solid rgba(15,23,42,0.06)', background: '#ffffff', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask to refine the profile requirements or map technical skills..."
                  disabled={isLoading}
                  style={{ flex: 1, padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', fontWeight: '500', outline: 'none', background: '#f8fafc' }}
                />
                <button 
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#ffffff', border: 'none', padding: '12px 20px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', opacity: (!input.trim() || isLoading) ? 0.6 : 1 }}
                >
                  Transmit Node
                </button>
              </form>
            </div>

            {/* RIGHT WORKSPACE PREVIEW MATRIX */}
            <div style={{ flex: 0.8, padding: '20px', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box', background: 'rgba(248,250,252,0.25)' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', fontWeight: '900', marginBottom: '10px' }}>
                Active Document Live Matrix Output
              </div>
              <div style={{ flex: 1, background: '#ffffff', borderRadius: '12px', border: '1px solid rgba(15,23,42,0.06)', padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
                {currentSession.messages.filter(m => m.role === 'assistant').length <= 1 ? (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#94a3b8', textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>📄</div>
                    <div style={{ fontSize: '13px', fontWeight: '700' }}>Matrix compilation workspace empty.</div>
                    <div style={{ fontSize: '11px', marginTop: '4px' }}>Submit target parameters into the context terminal thread to compile structural data schemas.</div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '6px' }}>
                      <button 
                        onClick={() => copyToClipboard(currentSession.messages.filter(m => m.role === 'assistant').map(m => m.content).join('\n\n'), 'all-jd')}
                        style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', color: '#475569' }}
                      >
                        {copiedId === 'all-jd' ? '✓ Copied Schema' : '🗎 Copy Entire Matrix Block'}
                      </button>
                    </div>
                    {currentSession.messages.filter(m => m.role === 'assistant').map((m, i) => (
                      <div key={i} style={{ borderBottom: '1px dashed #e2e8f0', paddingBottom: '12px', marginBottom: '12px' }}>
                        {renderFormattedContent(m.content)}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

          </div>
        ) : (
          /* INTERACTION INTERFACE FOR CANDIDATE MATCH MATRIX WORKSPACE VIEW */
          <div style={{ flex: 1, display: 'flex', flexDirection: isMobile ? 'column' : 'row', height: '100%', overflow: 'hidden' }}>
            
            {/* PARAMETER CONFIGURATION FIELD MODULE */}
            <div style={{ flex: 0.9, padding: '20px', borderRight: isMobile ? 'none' : '1px solid rgba(15,23,42,0.06)', background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', fontWeight: '900', marginBottom: '8px' }}>
                  Target Pipeline Criteria Matrix Parameters
                </label>
                <textarea 
                  value={currentSession.jdInput}
                  onChange={(e) => updateCurrentSession({ jdInput: e.target.value })}
                  placeholder="Paste criteria guidelines here..."
                  style={{ width: '100%', height: '240px', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', fontWeight: '600', resize: 'none', background: '#ffffff', boxSizing: 'border-box', outline: 'none', color: '#334155', lineHeight: '1.5' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button 
                  onClick={handleMatchCandidates}
                  disabled={isMatching || !currentSession.jdInput.trim()}
                  style={{
                    width: '100%', padding: '12px', background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#ffffff',
                    border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '900', cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(34, 197, 94, 0.3)', opacity: (!currentSession.jdInput.trim() || isMatching) ? 0.6 : 1
                  }}
                >
                  {isMatching ? 'Processing Vector Alignment Clusters...' : '⚡ SYNCHRONIZE ALIGNMENT MATRIX'}
                </button>

                {/* RESET MATCH MATRIX BUTTON */}
                <button 
                  onClick={handleResetMatchMatrix}
                  disabled={isMatching || currentSession.matchResults.length === 0}
                  style={{
                    width: '100%', padding: '12px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#ffffff',
                    border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '900', cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(239, 68, 68, 0.2)', opacity: (currentSession.matchResults.length === 0 || isMatching) ? 0.5 : 1,
                    transition: 'opacity 0.2s ease'
                  }}
                >
                  🗑 RESET MATCH MATRIX
                </button>
              </div>

              <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>💡 Analytical Workflow Hint</div>
                <div style={{ fontSize: '11px', color: '#475569', lineHeight: '1.5', fontWeight: '500' }}>
                  Inject technical stacks, strict testing patterns, or specific experience levels to rank multi-tiered vector parameters instantly against available applicant tables.
                </div>
              </div>
            </div>

            {/* OUTPUT COMPLIANCE SCOREBOARD GRAPH FRAME */}
            <div style={{ flex: 1.1, padding: '20px', overflowY: 'auto', boxSizing: 'border-box' }}>
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
                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginTop: '10px' }}>
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