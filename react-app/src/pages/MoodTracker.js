import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaFaceFrownOpen, FaFaceAngry, FaFaceSmile, FaFaceLaughBeam, FaList, FaChartLine, FaCalendar, FaCircleCheck, FaStar, FaLightbulb, FaFire } from 'react-icons/fa6';
import './MoodTracker.css';

// Mood icon mapping component
const MoodIcon = ({ value }) => {
  const iconStyle = { color: '#FFD700', fontSize: '2rem' };
  const icons = {
    1: <FaFaceFrownOpen style={iconStyle} />,
    2: <FaFaceAngry style={iconStyle} />,
    3: <FaFaceSmile style={iconStyle} />,
    4: <FaFaceSmile style={iconStyle} />,
    5: <FaFaceLaughBeam style={iconStyle} />
  };
  return icons[value] || <FaFaceSmile style={iconStyle} />;
};

function MoodTracker() {
  const { user, sessionId } = useAuth();
  const [selectedMood, setSelectedMood] = useState(3);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [todayMood, setTodayMood] = useState(null);
  const [view, setView] = useState('log'); // 'log', 'weekly', 'monthly'
  const [weeklyData, setWeeklyData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);

  const moodOptions = [
    { value: 1, label: 'Terrible' },
    { value: 2, label: 'Bad' },
    { value: 3, label: 'OK' },
    { value: 4, label: 'Good' },
    { value: 5, label: 'Great' }
  ];

  // Check if user already logged mood today
  useEffect(() => {
    if (user || sessionId) {
      fetchTodayMood();
    }
    // Fetch again only when the active identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, sessionId]);

  const fetchTodayMood = async () => {
    try {
      const endpoint = user ? `/api/mood/today?userId=${user.id}` : `/api/mood/today?sessionId=${sessionId}`;
      const res = await fetch(endpoint);
      const data = await res.json();
      if (data.mood) {
        setTodayMood(data.mood);
        setSelectedMood(data.mood.mood_score);
        setNotes(data.mood.notes || '');
      }
    } catch (err) {
      console.error('Error fetching today mood:', err);
    }
  };

  const handleSubmitMood = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        mood_score: selectedMood,
        notes: notes,
        ...(user ? { user_id: user.id } : { session_id: sessionId })
      };

      const res = await fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSubmitted(true);
        setTodayMood({ mood_score: selectedMood, notes });
        setTimeout(() => setSubmitted(false), 3000);
      }
    } catch (err) {
      console.error('Error submitting mood:', err);
    }
  };

  const fetchWeeklyData = async () => {
    try {
      const endpoint = user ? `/api/mood/weekly?userId=${user.id}` : `/api/mood/weekly?sessionId=${sessionId}`;
      const res = await fetch(endpoint);
      const data = await res.json();
      setWeeklyData(data);
    } catch (err) {
      console.error('Error fetching weekly data:', err);
    }
  };

  const fetchMonthlyData = async () => {
    try {
      const endpoint = user ? `/api/mood/monthly?userId=${user.id}` : `/api/mood/monthly?sessionId=${sessionId}`;
      const res = await fetch(endpoint);
      const data = await res.json();
      setMonthlyData(data);
    } catch (err) {
      console.error('Error fetching monthly data:', err);
    }
  };

  const handleViewChange = (newView) => {
    setView(newView);
    if (newView === 'weekly') fetchWeeklyData();
    if (newView === 'monthly') fetchMonthlyData();
  };

  return (
    <div className="mood-tracker-container">
      <div className="mood-tabs">
        <button 
          className={`mood-tab ${view === 'log' ? 'active' : ''}`}
          onClick={() => handleViewChange('log')}
        >
          <FaList /> Log Mood
        </button>
        <button 
          className={`mood-tab ${view === 'weekly' ? 'active' : ''}`}
          onClick={() => handleViewChange('weekly')}
        >
          <FaChartLine /> Weekly
        </button>
        <button 
          className={`mood-tab ${view === 'monthly' ? 'active' : ''}`}
          onClick={() => handleViewChange('monthly')}
        >
          <FaCalendar /> Monthly
        </button>
      </div>

      {view === 'log' && (
        <div className="mood-log-section">
          <h2>How are you feeling today?</h2>
          
          {todayMood && !submitted && (
            <div className="mood-already-logged">
              <FaCircleCheck /> You've already logged your mood today
            </div>
          )}
          
          {submitted && (
            <div className="mood-success">
              <FaStar /> Mood logged successfully! Thank you for checking in.
            </div>
          )}

          <form onSubmit={handleSubmitMood} className="mood-form">
            <div className="mood-emoji-selector">
              {moodOptions.map(option => (
                <div key={option.value} className="mood-emoji-option">
                  <button
                    type="button"
                    className={`mood-emoji-btn ${selectedMood === option.value ? 'selected' : ''}`}
                    onClick={() => setSelectedMood(option.value)}
                  >
                    <span className="emoji"><MoodIcon value={option.value} /></span>
                    <span className="label">{option.label}</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="mood-slider-container">
              <label>Adjust your mood (1-5)</label>
              <input
                type="range"
                min="1"
                max="5"
                value={selectedMood}
                onChange={(e) => setSelectedMood(parseInt(e.target.value))}
                className="mood-slider"
              />
              <span className="slider-value">{selectedMood}/5</span>
            </div>

            <div className="mood-notes">
              <label htmlFor="notes">Add optional notes (What happened today?)</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="E.g., Had a great conversation with a friend, feeling accomplished..."
                rows="4"
              />
            </div>

            <button type="submit" className="mood-submit-btn">
              Save Mood Entry
            </button>
          </form>
        </div>
      )}

      {view === 'weekly' && (
        <div className="mood-analysis-section">
          <h2><FaChartLine /> Weekly Mood Analysis</h2>
          {weeklyData ? (
            <div className="weekly-stats">
              <div className="stat-card">
                <h3>Average Mood</h3>
                <p className="stat-value">{weeklyData.average_mood?.toFixed(1) || '-'}/5</p>
              </div>
              <div className="stat-card">
                <h3>Best Day</h3>
                <p className="stat-value">{weeklyData.best_day}</p>
              </div>
              <div className="stat-card">
                <h3>Worst Day</h3>
                <p className="stat-value">{weeklyData.worst_day}</p>
              </div>
              <div className="stat-card">
                <h3>Total Entries</h3>
                <p className="stat-value">{weeklyData.total_entries}</p>
              </div>

              <div className="weekly-chart">
                <h4>Daily Breakdown</h4>
                <div className="chart-bars">
                  {weeklyData.daily_moods && weeklyData.daily_moods.map((day, idx) => (
                    <div key={idx} className="bar-container">
                      <div className="bar" style={{height: `${(day.mood / 5) * 100}%`}}></div>
                      <span className="day-label">{day.day.substring(0, 3)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p>Loading weekly data...</p>
          )}
        </div>
      )}

      {view === 'monthly' && (
        <div className="mood-analysis-section">
          <h2><FaCalendar /> Monthly Mood Analysis</h2>
          {monthlyData ? (
            <div className="monthly-stats">
              <div className="stat-card">
                <h3>Monthly Average</h3>
                <p className="stat-value">{monthlyData.monthly_average?.toFixed(1) || '-'}/5</p>
              </div>
              <div className="stat-card">
                <h3>Best Week</h3>
                <p className="stat-value">Week {monthlyData.best_week}</p>
              </div>
              <div className="stat-card">
                <h3>Current Streak</h3>
                <p className="stat-value"><FaFire /> {monthlyData.current_streak} days</p>
              </div>
              <div className="stat-card">
                <h3>Total Entries</h3>
                <p className="stat-value">{monthlyData.total_entries}</p>
              </div>

              <div className="insight-box">
                <h4><FaLightbulb /> Monthly Insight</h4>
                <p>{monthlyData.insight || 'Keep tracking your mood to see insights!'}</p>
              </div>

              <div className="weekly-breakdown">
                <h4>Weekly Trends</h4>
                {monthlyData.weekly_averages && monthlyData.weekly_averages.map((week, idx) => (
                  <div key={idx} className="week-bar">
                    <span>Week {idx + 1}</span>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{width: `${(week.average / 5) * 100}%`}}
                      ></div>
                    </div>
                    <span>{week.average.toFixed(1)}/5</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p>Loading monthly data...</p>
          )}
        </div>
      )}
    </div>
  );
}

export default MoodTracker;
