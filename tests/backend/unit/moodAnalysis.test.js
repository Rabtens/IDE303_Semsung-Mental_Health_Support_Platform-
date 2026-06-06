const { getMoodKey, getTodayDate, getWeeklyAnalysis, getMonthlyAnalysis } = require('../../../src/services/moodAnalysis');

describe('mood analysis', () => {
  const now = new Date('2026-06-06T12:00:00.000Z');

  test('selects a registered user key before a session key', () => {
    expect(getMoodKey('user-1', 'session-1')).toBe('user-1');
    expect(getMoodKey(null, 'session-1')).toBe('session-1');
    expect(getMoodKey()).toBeNull();
  });

  test('formats the current date', () => {
    expect(getTodayDate(now)).toBe('2026-06-06');
  });

  test('calculates a weekly average and daily breakdown', () => {
    const result = getWeeklyAnalysis([
      { date: '2026-06-05', mood_score: 2 },
      { date: '2026-06-06', mood_score: 4 },
    ], now);

    expect(result.average_mood).toBe(3);
    expect(result.total_entries).toBe(2);
    expect(result.daily_moods).toHaveLength(7);
  });

  test('calculates monthly streak and insight', () => {
    const result = getMonthlyAnalysis([
      { date: '2026-06-04', mood_score: 4 },
      { date: '2026-06-05', mood_score: 4 },
      { date: '2026-06-06', mood_score: 5 },
    ], now);

    expect(result.current_streak).toBe(3);
    expect(result.monthly_average).toBe(4.3);
    expect(result.insight).toContain('great month');
  });
});
