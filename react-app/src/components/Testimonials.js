import React from 'react';
import { FaStar } from 'react-icons/fa6';
import './Testimonials.css';

function Testimonials() {
  const testimonials = [
    {
      text: 'Semzung helped me work through my anxiety at 2am when I couldn\'t sleep. The voice feature is amazing.',
      author: 'Sarah M.',
    },
    {
      text: 'Finally a space where I feel heard and not judged. The grounding exercises really helped me calm down.',
      author: 'James K.',
    },
    {
      text: 'I use Semzung daily. It\'s like having a therapist in my pocket. Highly recommend!',
      author: 'Emma L.',
    },
  ];

  const StarRating = () => (
    <div className="stars" style={{ display: 'flex', gap: '4px', color: '#FFD700' }}>
      {[...Array(5)].map((_, i) => <FaStar key={i} size={16} />)}
    </div>
  );

  return (
    <section className="testimonials">
      <div className="section-container">
        <h2 className="section-title">What Users Are Saying</h2>
        <div className="testimonials-grid">
          {testimonials.map((testimonial, idx) => (
            <div key={idx} className="testimonial-card">
              <StarRating />
              <p className="testimonial-text">"{testimonial.text}"</p>
              <p className="testimonial-author">— {testimonial.author}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
