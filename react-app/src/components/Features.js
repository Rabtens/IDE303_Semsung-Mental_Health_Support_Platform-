import React from 'react';
import { FaComments, FaBullseye, FaLock, FaMicrophone, FaFloppyDisk, FaHeartPulse } from 'react-icons/fa6';
import './Features.css';

function Features() {
  const features = [
    { icon: FaComments, title: '24/7 Support', desc: 'Chat anytime, anywhere. Our AI companion is always available to listen and provide thoughtful guidance.' },
    { icon: FaBullseye, title: 'Evidence-Based Techniques', desc: 'Powered by CBT, mindfulness, and grounding exercises to help you manage stress and anxiety.' },
    { icon: FaLock, title: 'Private & Safe', desc: 'Your conversations are confidential. We prioritize your privacy and emotional safety above all.' },
    { icon: FaMicrophone, title: 'Voice Assistant', desc: 'Listen to guidance read aloud. Perfect for times when reading isn\'t ideal.' },
    { icon: FaFloppyDisk, title: 'Persistent Conversations', desc: 'Your chat history is saved, so you can pick up where you left off anytime.' },
    { icon: FaHeartPulse, title: 'Crisis Support', desc: 'We detect crisis keywords and provide immediate crisis hotline information when needed.' },
  ];

  return (
    <section id="features" className="features">
      <div className="section-container">
        <h2 className="section-title">Why Choose Semzung?</h2>
        <div className="features-grid">
          {features.map((feature, idx) => {
            const IconComponent = feature.icon;
            return (
            <div key={idx} className="feature-card">
              <div className="feature-icon"><IconComponent /></div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Features;
