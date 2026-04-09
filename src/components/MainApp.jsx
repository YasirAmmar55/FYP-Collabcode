import React, { useState, useEffect, useRef } from 'react';
import { FaUsers, FaTerminal, FaVideo, FaRobot, FaUserPlus, FaStop, FaDownload, FaUpload } from 'react-icons/fa';
import SidebarPanel from './SidebarPanel';
import Editor from './Editor';
import OutputPanel from './OutputPanel';
import VideoPanel from './VideoPanel';
import Chatbot from './Chatbot';
import InviteModal from './InviteModal';
import './MainApp.css';

const MainApp = ({ user, role, onLogout, showToast }) => {
  // ========== STATES ==========
  const [panels, setPanels] = useState({
    sidebar: true,
    output: true,
    video: true
  });
  const [showChatbot, setShowChatbot] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  
  //  participants 
  const [participants] = useState([
    { id: 1, name: user?.name || 'Yasir', role: role === 'teacher' ? 'host' : 'student', avatar: user?.avatar || 'U', isOnline: true, permissions: { mic: true, camera: true, screen: true, code: true } },
    { id: 2, name: 'Abdullah', role: 'student', avatar: 'S1', isOnline: true, permissions: { mic: true, camera: false, screen: false, code: true } },
    { id: 3, name: 'kamran', role: 'student', avatar: 'S2', isOnline: true, permissions: { mic: false, camera: false, screen: false, code: true } }
  ]);
  
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load room from localStorage
  useEffect(() => {
    const savedRoom = localStorage.getItem('currentRoom');
    if (savedRoom) {
      setCurrentRoom(JSON.parse(savedRoom));
    } else {
      //  demo room code
      setCurrentRoom({ id: 'DEMO123', name: 'Room' });
    }
  }, []);

  const togglePanel = (panel) => {
    setPanels(prev => ({
      ...prev,
      [panel]: !prev[panel]
    }));
  };

  const handleEndRoom = () => {
    if (window.confirm('Are you sure you want to end this room?')) {
      localStorage.removeItem('currentRoom');
      onLogout();
      showToast('Room ended successfully');
    }
  };

  //  download (saves current editor content)
  const handleDownloadCode = () => {
    const currentCode = editorRef.current?.getValue() || '';
    if (!currentCode) {
      showToast('No code to download');
      return;
    }
    const blob = new Blob([currentCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code_${Date.now()}.js`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Code downloaded');
  };

  //  upload (loads file into editor)
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      if (editorRef.current) {
        editorRef.current.setValue(content);
      }
      showToast(`Loaded: ${file.name}`);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="main-app">
      <header className="app-header">
  <div className="logo">
    <i className="fas fa-code"></i>
    <span>CollabCode</span>
    {currentRoom && <span className="room-name-badge">{currentRoom.name}</span>}
  </div>

        <div className="header-controls">
          {/* connection status */}
          <div className="connection-status">
            <span className="status-indicator connected"></span>
            <span>offline</span>
            <span className="participants-count">👥 {participants.length}</span>
          </div>

          <div className="panel-controls">
            <button className={`panel-toggle ${panels.sidebar ? 'active' : ''}`} onClick={() => togglePanel('sidebar')} title="Toggle Sidebar">
              <FaUsers />
            </button>
            <button className={`panel-toggle ${panels.output ? 'active' : ''}`} onClick={() => togglePanel('output')} title="Toggle Output">
              <FaTerminal />
            </button>
            <button className={`panel-toggle ${panels.video ? 'active' : ''}`} onClick={() => togglePanel('video')} title="Toggle Video">
              <FaVideo />
            </button>
            <button className={`panel-toggle ${showChatbot ? 'active' : ''}`} onClick={() => setShowChatbot(!showChatbot)} title="AI Assistant">
              <FaRobot />
            </button>
          </div>

          <button className="btn btn-outline" onClick={() => setShowInviteModal(true)}>
            <FaUserPlus /> Invite
          </button>
          <button className="btn btn-danger" onClick={handleEndRoom}>
            <FaStop /> End Room
          </button>
          <button className="btn btn-outline" onClick={handleDownloadCode}>
            <FaDownload /> Download
          </button>
          <button className="btn btn-outline" onClick={() => fileInputRef.current?.click()}>
            <FaUpload /> Upload
          </button>

          <div className="user-info">
            <div className="user-avatar">{user?.avatar || 'U'}</div>
            <span className="user-name">{user?.name || 'User'}</span>
            <div className="user-dropdown">
              <div className="dropdown-item" onClick={onLogout}>
                <i className="fas fa-sign-out-alt"></i> Logout
              </div>
            </div>
          </div>
        </div>
      </header>

      <input ref={fileInputRef} type="file" style={{ display: 'none' }} accept=".js,.jsx,.html,.css,.json,.txt,.py" onChange={handleFileUpload} />

      <div className="main-container">
        {panels.sidebar && <SidebarPanel participants={participants} role={role} showToast={showToast} user={user} />}
        <Editor ref={editorRef} user={user} role={role} showToast={showToast} />
        {panels.output && <OutputPanel showToast={showToast} />}
        {panels.video && <VideoPanel participants={participants} role={role} showToast={showToast} currentUser={user} />}
      </div>

      <div className="app-footer">
        <div className="connection-status">
          <span className="status-indicator connected"></span>
          <span>connecting...</span>
        </div>
        <div className="copyright">&copy; KYA - Collaborative Coding Platform </div>
      </div>

      {showChatbot && <Chatbot onClose={() => setShowChatbot(false)} />}
      {showInviteModal && <InviteModal room={currentRoom} onClose={() => setShowInviteModal(false)} showToast={showToast} />}
    </div>
  );
};

export default MainApp;