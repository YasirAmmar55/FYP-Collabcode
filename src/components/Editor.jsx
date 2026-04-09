import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { FaPlay, FaSave, FaTrash } from 'react-icons/fa';
import './Editor.css';

const Editor = forwardRef(({ user, role, showToast }, ref) => {
  const [language, setLanguage] = useState('javascript');
  const [fileName, setFileName] = useState('script.js');
  const [code, setCode] = useState(`// Welcome to CollabCode!
// Write your code here
console.log("Hello, World!");`);

  const [htmlCode, setHtmlCode] = useState(`<!DOCTYPE html>
<html>
<head><title>My Page</title><link rel="stylesheet" href="style.css"></head>
<body><h1>Hello World</h1><script src="script.js"></script></body>
</html>`);
  
  const [cssCode, setCssCode] = useState(`body { font-family: Arial; margin: 20px; background: #f0f0f0; }
h1 { color: #2ecc71; }`);
  
  const [jsCode, setJsCode] = useState(`console.log("Hello, World!");
function greet(name) { return "Hello, " + name; }`);

  const editorRef = useRef(null);

  const languages = [
    { value: 'html', label: 'HTML', extension: 'html', fileName: 'index.html' },
    { value: 'css', label: 'CSS', extension: 'css', fileName: 'style.css' },
    { value: 'javascript', label: 'JavaScript', extension: 'js', fileName: 'script.js' }
  ];

  useEffect(() => {
    if (language === 'html') setCode(htmlCode);
    else if (language === 'css') setCode(cssCode);
    else if (language === 'javascript') setCode(jsCode);
  }, [language]);

  useImperativeHandle(ref, () => ({
    getValue: () => editorRef.current?.getValue() || code,
    setValue: (newCode) => {
      if (editorRef.current) editorRef.current.setValue(newCode);
      setCode(newCode);
    },
    getLanguage: () => language
  }));

  const handleLanguageChange = (e) => {
    if (language === 'html') setHtmlCode(code);
    else if (language === 'css') setCssCode(code);
    else if (language === 'javascript') setJsCode(code);
    
    const newLang = e.target.value;
    setLanguage(newLang);
    const lang = languages.find(l => l.value === newLang);
    setFileName(lang.fileName);
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    if (language === 'html') setHtmlCode(newCode);
    else if (language === 'css') setCssCode(newCode);
    else if (language === 'javascript') setJsCode(newCode);
  };

  const handleRunCode = () => {
    const outputFrame = document.getElementById('output-frame');
    const outputContent = document.getElementById('output-content');
    
    if (language === 'html') {
      let combinedHTML = htmlCode;
      if (combinedHTML.includes('href="style.css"')) {
        combinedHTML = combinedHTML.replace('<link rel="stylesheet" href="style.css">', `<style>\n${cssCode}\n</style>`);
      }
      if (combinedHTML.includes('src="script.js"')) {
        combinedHTML = combinedHTML.replace('<script src="script.js"></script>', `<script>\n${jsCode}\n</script>`);
      }
      const blob = new Blob([combinedHTML], { type: 'text/html' });
      outputFrame.src = URL.createObjectURL(blob);
      outputFrame.style.display = 'block';
      outputContent.style.display = 'none';
      showToast('Preview updated!');
    } else if (language === 'javascript') {
      outputFrame.style.display = 'none';
      outputContent.style.display = 'block';
      const logs = [];
      const originalLog = console.log;
      console.log = (...args) => { logs.push(args.join(' ')); originalLog(...args); };
      try {
        eval(jsCode);
        outputContent.innerHTML = logs.length ? logs.join('<br>') : '✅ Code executed successfully';
      } catch (error) {
        outputContent.innerHTML = `❌ Error: ${error.message}`;
      }
      console.log = originalLog;
    }
  };

  const handleSaveCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Saved as ${fileName}`);
  };

  const handleClearCode = () => {
    if (editorRef.current) editorRef.current.setValue('');
    showToast('Editor cleared');
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  return (
    <div className="editor-container">
      <div className="editor-header">
        <div className="file-info">
          <i className="fas fa-file-code"></i>
          <span className="file-name">{fileName}</span>
        </div>
        <div className="editor-toolbar">
          <select className="language-selector" value={language} onChange={handleLanguageChange}>
            {languages.map(lang => <option key={lang.value} value={lang.value}>{lang.label}</option>)}
          </select>
          <button className="btn btn-primary" onClick={handleRunCode} title="Run"><FaPlay /></button>
          <button className="btn btn-outline" onClick={handleSaveCode} title="Save"><FaSave /></button>
          <button className="btn btn-outline" onClick={handleClearCode} title="Clear"><FaTrash /></button>
        </div>
      </div>
      <div className="editor-wrapper">
        <MonacoEditor height="100%" language={language} theme="vs-dark" value={code} onChange={handleCodeChange} onMount={handleEditorDidMount} options={{ automaticLayout: true, fontSize: 14, minimap: { enabled: false }, wordWrap: 'on' }} />
      </div>
    </div>
  );
});

export default Editor;