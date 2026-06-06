import React from 'react';
import { FaLeaf, FaFire, FaMoon, FaHandshake, FaBook, FaHeartPulse } from 'react-icons/fa6';
import './Resources.css';

function Resources() {
  const resources = [
    { icon: FaLeaf, title: 'Meditation & Mindfulness', desc: 'Learn simple mindfulness techniques to calm your mind and reduce anxiety in just 5 minutes.' },
    { icon: FaFire, title: 'Stress Management', desc: 'Practical strategies to identify stress triggers and develop healthy coping mechanisms.' },
    { icon: FaMoon, title: 'Sleep Better', desc: 'Evidence-based tips for improving sleep quality and establishing a healthy sleep routine.' },
    { icon: FaHandshake, title: 'Building Connections', desc: 'Why social connection matters for mental health and how to nurture meaningful relationships.' },
    { icon: FaBook, title: 'Self-Care Basics', desc: 'Simple self-care practices that don\'t require much time or money but can make a big difference.' },
    { icon: FaHeartPulse, title: 'Crisis Resources', desc: 'Emergency hotlines and resources available 24/7 if you\'re in immediate crisis or danger.' },
  ];

  return (
    <section id="resources" className="resources">
      <div className="section-container">
        <h2 className="section-title">Mental Health Resources</h2>
        <div className="resources-grid">
          {resources.map((resource, idx) => {
            const IconComponent = resource.icon;
            return (
            <div key={idx} className="resource-item">
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}><IconComponent /></div>
              <h3>{resource.title}</h3>
              <p>{resource.desc}</p>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Resources;
