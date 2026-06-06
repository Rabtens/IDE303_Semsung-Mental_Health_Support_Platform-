import React, { useState, useCallback, useRef, useEffect } from 'react';
import { FaPhone, FaVideo, FaPaperPlane, FaMicrophone, FaMicrophoneSlash, FaCamera, FaXmark, FaClock, FaStar, FaTrashCan } from 'react-icons/fa6';
import { supabase } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import '../styles/CounsellingPage.css';

const VOICE_BUCKET = 'voice-messages';

// Upload a recorded audio blob to Supabase Storage.
// Returns { url, path } on success, or null if Supabase isn't configured / fails.
async function uploadVoiceMessage(blob, ownerKey) {
  if (!supabase || !process.env.REACT_APP_SUPABASE_URL) return null;
  try {
    const ext = (blob.type && blob.type.includes('ogg')) ? 'ogg' : 'webm';
    const path = `${ownerKey}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage
      .from(VOICE_BUCKET)
      .upload(path, blob, { contentType: blob.type || 'audio/webm', upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from(VOICE_BUCKET).getPublicUrl(path);
    return { url: data.publicUrl, path };
  } catch (err) {
    console.warn('Voice upload failed, falling back to local URL:', err.message);
    return null;
  }
}

// System prompts for each counsellor specialty
const COUNSELLOR_PROMPTS = {
  anxiety: `You are Dr. Tenzin Dorji, a specialist in anxiety disorders with 8 years of experience. Your role is to:
1. Help users understand and manage anxiety symptoms
2. Use evidence-based CBT techniques (cognitive reframing, grounding exercises)
3. Provide calming and practical advice
4. Normalize anxiety while offering actionable strategies
5. Listen actively and validate their concerns
6. Never diagnose, but guide them toward professional help if needed
Your tone is warm, reassuring, and grounded. Keep responses concise (2-3 paragraphs).`,

  depression: `You are Pemba Dema, an expert in depression and mood disorders with a holistic wellness approach. Your role is to:
1. Validate feelings of sadness, hopelessness, or numbness
2. Explore underlying factors (sleep, exercise, social connection, purpose)
3. Suggest gentle, actionable steps to improve mood
4. Encourage professional support for persistent depression
5. Be compassionate and non-judgmental about their struggle
6. Provide resources and coping strategies
Your tone is warm, understanding, and hopeful. Keep responses concise (2-3 paragraphs).`,

  trauma: `You are Kelsang Wangmo, a trauma-informed therapist specializing in PTSD and recovery. Your role is to:
1. Create a safe, non-judgmental space for processing trauma
2. Acknowledge the impact of trauma on their current life
3. Teach grounding and safety techniques
4. Avoid re-traumatization by being careful with content
5. Encourage professional trauma therapy (EMDR, CPT)
6. Validate their journey and celebrate progress
Your tone is gentle, compassionate, and empowering. Keep responses concise (2-3 paragraphs).`,

  grief: `You are Sonam Tshering, a grief counselor with deep experience in loss and bereavement support. Your role is to:
1. Honor and validate their grief without rushing them to "move on"
2. Listen to their memories and feelings about the loss
3. Normalize the grief process (shock, anger, sadness, acceptance)
4. Suggest rituals, journaling, or remembrance activities
5. Connect them with grief support groups or professional counselors
6. Be present and compassionate through their journey
Your tone is gentle, warm, and understanding. Keep responses concise (2-3 paragraphs).`,
};

// Mock counsellor data
const MOCK_COUNSELOURS = [
  {
    id: 1,
    name: 'Dr. Tenzin Dorji',
    specialty: 'anxiety',
    availability: 'Available Now',
    rating: 4.8,
    bio: 'Specialist in anxiety disorders with 8 years of experience. Compassionate and evidence-based approach.',
    avatar: '👨‍⚕️',
  },
  {
    id: 2,
    name: 'Pemba Dema',
    specialty: 'depression',
    availability: 'Available in 30min',
    rating: 4.9,
    bio: 'Expert in depression and mood disorders. Provides holistic wellness guidance.',
    avatar: '👩‍⚕️',
  },
  {
    id: 3,
    name: 'Kelsang Wangmo',
    specialty: 'trauma',
    availability: 'Available Now',
    rating: 4.7,
    bio: 'Trauma-informed therapist with specialization in PTSD and recovery.',
    avatar: '👩‍⚕️',
  },
  {
    id: 4,
    name: 'Sonam Tshering',
    specialty: 'grief',
    availability: 'Available in 1hr',
    rating: 5.0,
    bio: 'Grief counselor with deep experience in loss and bereavement support.',
    avatar: '👨‍⚕️',
  },
];

const SPECIALTIES = ['anxiety', 'depression', 'trauma', 'grief'];

// Messaging component
const MessagingPanel = ({ counsellor, onClose }) => {
  const { user, sessionId } = useAuth() || {};
  const ownerKey = user?.id || sessionId || 'anonymous';
  const conversationKey = `counsellor-${counsellor.id}-${ownerKey}`;

  const greeting = {
    sender: 'counsellor',
    text: `Hello! I'm ${counsellor.name}. How can I support you today?`,
    timestamp: '10:30 AM',
  };

  const [messages, setMessages] = useState([{ id: 1, ...greeting }]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [voiceError, setVoiceError] = useState(null);
  const [loadedHistory, setLoadedHistory] = useState(false);
  const conversationHistoryRef = useRef([
    { role: 'assistant', content: greeting.text },
  ]);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');
  const recordTimerRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Load saved conversation for this counsellor on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/conversation/${conversationKey}`);
        const data = await res.json();
        if (cancelled) return;
        if (data.success && Array.isArray(data.history) && data.history.length) {
          // Rehydrate UI messages
          setMessages(data.history.map((m, i) => ({ ...m, id: i + 1 })));
          // Rebuild Groq history (skip voice-only with no transcript)
          conversationHistoryRef.current = data.history.map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.type === 'voice' ? (m.transcript || '[voice message]') : m.text,
          }));
        }
      } catch (err) {
        console.warn('Could not load counsellor conversation:', err.message || err);
      } finally {
        if (!cancelled) setLoadedHistory(true);
      }
    })();
    return () => { cancelled = true; };
  }, [conversationKey]);

  // Persist messages whenever they change (after initial load)
  useEffect(() => {
    if (!loadedHistory) return;
    // Strip ephemeral fields like blob URLs that won't survive a refresh
    const sanitized = messages.map(m => {
      if (m.type === 'voice') {
        const isBlob = typeof m.audioUrl === 'string' && m.audioUrl.startsWith('blob:');
        return {
          ...m,
          audioUrl: isBlob ? null : m.audioUrl,
          uploading: false,
        };
      }
      return m;
    });
    fetch(`/api/conversation/${conversationKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history: sanitized }),
    }).catch(err => console.warn('Could not save counsellor conversation:', err.message || err));
  }, [messages, loadedHistory, conversationKey]);

  const handleClearConversation = useCallback(async () => {
    if (!window.confirm('Clear this conversation? This cannot be undone.')) return;
    try {
      await fetch(`/api/conversation/${conversationKey}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Clear failed:', err.message || err);
    }
    setMessages([{ id: 1, ...greeting }]);
    conversationHistoryRef.current = [{ role: 'assistant', content: greeting.text }];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationKey]);

  // Clean up media stream + timer on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream?.getTracks().forEach(t => t.stop());
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) { /* noop */ }
      }
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    };
  }, []);

  const getGroqResponse = useCallback(async (userMessage) => {
    const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY || localStorage.getItem('groq_api_key');

    try {
      // Add user message to history
      conversationHistoryRef.current.push({
        role: 'user',
        content: userMessage,
      });

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: COUNSELLOR_PROMPTS[counsellor.specialty] },
            ...conversationHistoryRef.current,
          ],
          temperature: 0.7,
          max_tokens: 512,
          stream: false,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.error?.message || `API Error: ${response.status}`);
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content?.trim();

      if (!reply) {
        throw new Error('No response from API');
      }

      // Add assistant message to history
      conversationHistoryRef.current.push({
        role: 'assistant',
        content: reply,
      });

      return reply;
    } catch (err) {
      console.error('Groq API Error:', err);
      return `I apologize for the technical difficulty. Please try again in a moment. (Error: ${err.message})`;
    }
  }, [counsellor.specialty]);

  const appendUserMessage = useCallback((msg) => {
    setMessages(prev => [...prev, { ...msg, id: prev.length + 1 }]);
  }, []);

  const fetchAndAppendAiReply = useCallback(async (promptText) => {
    setIsLoading(true);
    const aiResponse = await getGroqResponse(promptText);
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      sender: 'counsellor',
      text: aiResponse,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    setIsLoading(false);
  }, [getGroqResponse]);

  const handleSendMessage = useCallback(async () => {
    if (inputValue.trim() && !isLoading) {
      const userText = inputValue.trim();
      appendUserMessage({
        sender: 'user',
        text: userText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      setInputValue('');
      await fetchAndAppendAiReply(userText);
    }
  }, [inputValue, isLoading, appendUserMessage, fetchAndAppendAiReply]);

  const startRecording = useCallback(async () => {
    if (isRecording || isLoading) return;
    setVoiceError(null);
    transcriptRef.current = '';

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: mr.mimeType || 'audio/webm' });
        const localUrl = URL.createObjectURL(blob);
        stream.getTracks().forEach(t => t.stop());

        const transcript = transcriptRef.current.trim();
        const msgId = Date.now();
        appendUserMessage({
          _refId: msgId,
          sender: 'user',
          type: 'voice',
          audioUrl: localUrl,
          uploading: true,
          transcript: transcript || null,
          duration: recordSeconds,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });

        // Upload to Supabase Storage in the background
        const ownerKey = user?.id || sessionId || 'anonymous';
        uploadVoiceMessage(blob, ownerKey).then((result) => {
          setMessages(prev => prev.map(m => {
            if (m._refId !== msgId) return m;
            if (result) {
              return { ...m, audioUrl: result.url, storagePath: result.path, uploading: false };
            }
            return { ...m, uploading: false, uploadFailed: true };
          }));
        });

        if (transcript) {
          await fetchAndAppendAiReply(transcript);
        } else {
          // No transcript captured — surface a soft note from the counsellor
          setMessages(prev => [...prev, {
            id: prev.length + 1,
            sender: 'counsellor',
            text: "I received your voice message but couldn't make out the words. Could you try again, or type what you'd like to share?",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }]);
        }
      };
      mediaRecorderRef.current = mr;
      mr.start();

      // Speech recognition for transcription (best-effort; Chrome/Edge)
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.continuous = true;
        recog.interimResults = false;
        recog.lang = 'en-US';
        recog.onresult = (event) => {
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              transcriptRef.current += event.results[i][0].transcript + ' ';
            }
          }
        };
        recog.onerror = (e) => {
          console.warn('SpeechRecognition error:', e.error);
        };
        recognitionRef.current = recog;
        try { recog.start(); } catch (e) { /* already started */ }
      }

      setRecordSeconds(0);
      recordTimerRef.current = setInterval(() => {
        setRecordSeconds(s => s + 1);
      }, 1000);
      setIsRecording(true);
    } catch (err) {
      console.error('Mic access error:', err);
      setVoiceError(
        err.name === 'NotAllowedError'
          ? 'Microphone permission denied. Enable it in your browser settings to send voice messages.'
          : err.name === 'NotFoundError'
          ? 'No microphone found.'
          : `Mic error: ${err.message}`
      );
    }
  }, [isRecording, isLoading, appendUserMessage, fetchAndAppendAiReply, recordSeconds, user, sessionId]);

  const stopRecording = useCallback(() => {
    if (!isRecording) return;
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) { /* noop */ }
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, [isRecording]);

  const toggleRecording = useCallback(() => {
    if (isRecording) stopRecording();
    else startRecording();
  }, [isRecording, startRecording, stopRecording]);

  const formatRecordTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="messaging-panel-overlay">
      <div className="messaging-panel">
        <div className="messaging-header">
          <h3 className="messaging-title">Chat with {counsellor.name}</h3>
          <div className="messaging-header-actions">
            <button
              className="messaging-clear-btn"
              onClick={handleClearConversation}
              aria-label="Clear conversation"
              title="Clear conversation history"
            >
              <FaTrashCan />
            </button>
            <button className="messaging-close-btn" onClick={onClose} aria-label="Close chat">
              <FaXmark />
            </button>
          </div>
        </div>

        <div className="messages-container">
          {messages.map(msg => (
            <div key={msg.id} className={`message-bubble ${msg.sender}`}>
              {msg.type === 'voice' ? (
                <div className="voice-message">
                  <audio controls src={msg.audioUrl} className="voice-audio" />
                  {msg.transcript && (
                    <div className="voice-transcript">"{msg.transcript}"</div>
                  )}
                  {msg.uploading && (
                    <div className="voice-upload-status">Saving to cloud…</div>
                  )}
                  {msg.uploadFailed && (
                    <div className="voice-upload-status warn">Saved locally only (cloud sync unavailable)</div>
                  )}
                </div>
              ) : (
                <div className="message-text">{msg.text}</div>
              )}
              <div className="message-timestamp">{msg.timestamp}</div>
            </div>
          ))}
          {isLoading && (
            <div className="message-bubble counsellor">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {voiceError && (
          <div className="voice-error-banner">{voiceError}</div>
        )}

        <div className="messaging-input-area">
          {isRecording ? (
            <div className="recording-indicator" aria-live="polite">
              <span className="recording-dot" />
              <span>Recording… {formatRecordTime(recordSeconds)}</span>
            </div>
          ) : (
            <textarea
              className="messaging-input"
              placeholder="Share what's on your mind..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              rows="2"
              disabled={isLoading}
            />
          )}
          <button
            className={`messaging-mic-btn ${isRecording ? 'recording' : ''}`}
            onClick={toggleRecording}
            disabled={isLoading}
            aria-label={isRecording ? 'Stop recording' : 'Record voice message'}
            title={isRecording ? 'Stop and send voice message' : 'Record voice message'}
          >
            {isRecording ? <FaMicrophoneSlash /> : <FaMicrophone />}
          </button>
          <button
            className="messaging-send-btn"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading || isRecording}
            aria-label="Send message"
            title={isLoading ? 'Waiting for response...' : 'Send message'}
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
};

// Voice call modal
const VoiceCallModal = ({ counsellor, onClose }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="modal-overlay">
      <div className="voice-call-modal">
        <button className="modal-close-btn" onClick={onClose} aria-label="End call">
          <FaXmark />
        </button>

        <div className="voice-call-content">
          <div className="counsellor-avatar-container">
            <div className="counsellor-avatar-pulse">{counsellor.avatar}</div>
          </div>
          <h3 className="voice-call-name">{counsellor.name}</h3>
          <div className="voice-call-duration">
            <FaClock className="duration-icon" />
            <span>{formatDuration(callDuration)}</span>
          </div>
        </div>

        <div className="voice-call-controls">
          <button
            className={`control-btn ${isMuted ? 'active-red' : ''}`}
            onClick={() => setIsMuted(!isMuted)}
            aria-label="Toggle microphone"
            title="Mute microphone"
          >
            {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
          </button>
          <button
            className={`control-btn ${isSpeakerOn ? '' : 'inactive'}`}
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            aria-label="Toggle speaker"
            title="Toggle speaker"
          >
            🔊
          </button>
          <button
            className="control-btn end-call-btn"
            onClick={onClose}
            aria-label="End call"
            title="End call"
          >
            ☎️
          </button>
        </div>
      </div>
    </div>
  );
};

// Video call modal
const VideoCallModal = ({ counsellor, onClose }) => {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [cameraError, setCameraError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const callStartTimeRef = useRef(null);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const startCamera = async () => {
      try {
        setIsLoading(true);
        callStartTimeRef.current = Date.now();
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: true,
        });

        localStreamRef.current = stream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Simulate receiving remote video after a short delay
        setTimeout(() => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
          }
          setIsLoading(false);
        }, 1500);

        setCameraError(null);
      } catch (err) {
        console.error('Camera access error:', err);
        setCameraError(
          err.name === 'NotAllowedError'
            ? 'Camera permission denied. Please allow camera access in your browser settings.'
            : err.name === 'NotFoundError'
            ? 'No camera device found.'
            : `Camera error: ${err.message}`
        );
        setIsLoading(false);
      }
    };

    startCamera();

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Call duration timer
  useEffect(() => {
    const timer = setInterval(() => {
      if (callStartTimeRef.current) {
        const elapsed = Math.floor((Date.now() - callStartTimeRef.current) / 1000);
        setCallDuration(elapsed);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCameraToggle = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsCameraOn(!isCameraOn);
    }
  };

  const handleMicToggle = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMicOn(!isMicOn);
    }
  };

  const handleEndCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    onClose();
  };

  // Get counselor avatar emoji for background
  const getCounselorAvatar = () => {
    const avatars = {
      'Dr. Tenzin Dorji': '👨‍⚕️',
      'Pemba Dema': '👩‍⚕️',
      'Kelsang Wangmo': '👩‍⚕️',
      'Sonam Tshering': '👨‍⚕️',
    };
    return avatars[counsellor.name] || '👤';
  };

  return (
    <div className="modal-overlay">
      <div className="video-call-modal">
        <button className="modal-close-btn" onClick={handleEndCall} aria-label="End call">
          <FaXmark />
        </button>

        {cameraError && (
          <div className="camera-error-message">
            <p>{cameraError}</p>
          </div>
        )}

        <div className="video-call-container">
          {/* Remote video */}
          <div className="remote-video">
            {isLoading ? (
              <div className="video-placeholder loading">
                <div className="loading-spinner"></div>
                <span>Connecting...</span>
              </div>
            ) : (
              <>
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="remote-video-element"
                />
                <div className="remote-background">
                  <div className="remote-avatar-bg">{getCounselorAvatar()}</div>
                </div>
                <div className="remote-info">
                  <h4>{counsellor.name}</h4>
                </div>
              </>
            )}
          </div>

          {/* Call duration */}
          <div className="call-duration-badge">
            <FaClock className="duration-icon" />
            <span>{formatTime(callDuration)}</span>
          </div>

          {/* Self view PIP */}
          <div className="self-view-pip">
            {cameraError ? (
              <div className="pip-placeholder error">
                <span>❌ Camera Off</span>
              </div>
            ) : (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="local-video-element"
              />
            )}
          </div>
        </div>

        <div className="video-call-controls">
          <button
            className={`video-control-btn ${!isMicOn ? 'inactive' : ''}`}
            onClick={handleMicToggle}
            aria-label="Toggle microphone"
            title={isMicOn ? 'Mute microphone' : 'Unmute microphone'}
          >
            {isMicOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
          </button>
          <button
            className={`video-control-btn ${!isCameraOn ? 'inactive' : ''}`}
            onClick={handleCameraToggle}
            aria-label="Toggle camera"
            title={isCameraOn ? 'Turn camera off' : 'Turn camera on'}
          >
            {isCameraOn ? <FaCamera /> : '📷'}
          </button>
          <button
            className="video-control-btn end-call-btn"
            onClick={handleEndCall}
            aria-label="End call"
            title="End call"
          >
            ☎️
          </button>
        </div>
      </div>
    </div>
  );
};

// Counsellor card component
const CounsellorCard = ({ counsellor, onMessage, onVoiceCall, onVideoCall }) => {
  return (
    <div className="counsellor-card">
      <div className="card-header">
        <div className="avatar-section">
          <div className="avatar">{counsellor.avatar}</div>
          <div className="availability-indicator" title={counsellor.availability} />
        </div>
        <div className="rating-badge">
          <FaStar className="star-icon" />
          <span>{counsellor.rating}</span>
        </div>
      </div>

      <div className="card-content">
        <h3 className="counsellor-name">{counsellor.name}</h3>
        <p className="counsellor-specialty">{counsellor.specialty.charAt(0).toUpperCase() + counsellor.specialty.slice(1)}</p>
        <p className="counsellor-availability">{counsellor.availability}</p>
        <p className="counsellor-bio">{counsellor.bio}</p>
      </div>

      <div className="card-actions">
        <button
          className="action-btn message-btn"
          onClick={() => onMessage(counsellor)}
          aria-label={`Message ${counsellor.name}`}
          title="Send a message"
        >
          💬 Message
        </button>
        <button
          className="action-btn voice-btn"
          onClick={() => onVoiceCall(counsellor)}
          aria-label={`Call ${counsellor.name}`}
          title="Start voice call"
        >
          <FaPhone /> Call
        </button>
        <button
          className="action-btn video-btn"
          onClick={() => onVideoCall(counsellor)}
          aria-label={`Video call ${counsellor.name}`}
          title="Start video call"
        >
          <FaVideo /> Video
        </button>
      </div>
    </div>
  );
};

// Main CounsellingPage component
export default function CounsellingPage() {
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [activeCounsellorMessage, setActiveCounsellorMessage] = useState(null);
  const [activeCounsellorVoice, setActiveCounsellorVoice] = useState(null);
  const [activeCounsellorVideo, setActiveCounsellorVideo] = useState(null);

  // Filter counsellors by specialty
  const filteredCounsellors = selectedSpecialty
    ? MOCK_COUNSELOURS.filter(c => c.specialty === selectedSpecialty)
    : MOCK_COUNSELOURS;

  // Callback handlers
  const handleMessage = useCallback((counsellor) => {
    setActiveCounsellorMessage(counsellor);
    setActiveCounsellorVoice(null);
    setActiveCounsellorVideo(null);
  }, []);

  const handleVoiceCall = useCallback((counsellor) => {
    setActiveCounsellorVoice(counsellor);
    setActiveCounsellorMessage(null);
    setActiveCounsellorVideo(null);
  }, []);

  const handleVideoCall = useCallback((counsellor) => {
    setActiveCounsellorVideo(counsellor);
    setActiveCounsellorMessage(null);
    setActiveCounsellorVoice(null);
  }, []);

  const closeAllPanels = useCallback(() => {
    setActiveCounsellorMessage(null);
    setActiveCounsellorVoice(null);
    setActiveCounsellorVideo(null);
  }, []);

  return (
    <div className="counselling-page">
      <div className="counselling-container">
        {/* Page header */}
        <div className="counselling-header">
          <div className="tibetan-text">ཞབས་ཏོགས་ལེན་ས།</div>
          <h1 className="page-title">Find Your Counsellor</h1>
          <p className="page-subtitle">Connect with qualified mental health professionals available for support, guidance, and care.</p>
        </div>

        {/* Filter bar */}
        <div className="filter-section">
          <div className="filter-label">Filter by specialty:</div>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${selectedSpecialty === '' ? 'active' : ''}`}
              onClick={() => setSelectedSpecialty('')}
            >
              All
            </button>
            {SPECIALTIES.map(specialty => (
              <button
                key={specialty}
                className={`filter-btn ${selectedSpecialty === specialty ? 'active' : ''}`}
                onClick={() => setSelectedSpecialty(specialty)}
              >
                {specialty.charAt(0).toUpperCase() + specialty.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Counsellors grid */}
        <div className="counsellors-grid">
          {filteredCounsellors.map(counsellor => (
            <CounsellorCard
              key={counsellor.id}
              counsellor={counsellor}
              onMessage={handleMessage}
              onVoiceCall={handleVoiceCall}
              onVideoCall={handleVideoCall}
            />
          ))}
        </div>
      </div>

      {/* Messaging panel (overlay) */}
      {activeCounsellorMessage && (
        <MessagingPanel counsellor={activeCounsellorMessage} onClose={closeAllPanels} />
      )}

      {/* Voice call modal */}
      {activeCounsellorVoice && (
        <VoiceCallModal counsellor={activeCounsellorVoice} onClose={closeAllPanels} />
      )}

      {/* Video call modal */}
      {activeCounsellorVideo && (
        <VideoCallModal counsellor={activeCounsellorVideo} onClose={closeAllPanels} />
      )}
    </div>
  );
}
