function dateString(date) {
  return date.toISOString().split('T')[0];
}

function getTodayDate(now = new Date()) {
  return dateString(now);
}

function getMoodKey(userId, sessionId) {
  return userId || sessionId || null;
}

function getWeeklyAnalysis(moodEntries, now = new Date()) {
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const weekMoods = moodEntries.filter((mood) => {
    const moodDate = new Date(mood.date);
    return moodDate >= sevenDaysAgo && moodDate <= now;
  });

  if (weekMoods.length === 0) {
    return {
      average_mood: 0,
      best_day: '-',
      worst_day: '-',
      total_entries: 0,
      daily_moods: [],
    };
  }

  const average = weekMoods.reduce((sum, mood) => sum + mood.mood_score, 0) / weekMoods.length;
  const bestDay = weekMoods.reduce((best, mood) => mood.mood_score > best.mood_score ? mood : best);
  const worstDay = weekMoods.reduce((worst, mood) => mood.mood_score < worst.mood_score ? mood : worst);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dailyMoods = [];

  for (let daysAgo = 6; daysAgo >= 0; daysAgo -= 1) {
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    const mood = weekMoods.find((entry) => entry.date === dateString(date));
    dailyMoods.push({ day: dayNames[date.getDay()], mood: mood?.mood_score || 0 });
  }

  return {
    average_mood: Number(average.toFixed(1)),
    best_day: new Date(bestDay.date).toLocaleDateString('en-US', { weekday: 'short' }),
    worst_day: new Date(worstDay.date).toLocaleDateString('en-US', { weekday: 'short' }),
    total_entries: weekMoods.length,
    daily_moods: dailyMoods,
  };
}

function getMonthlyAnalysis(moodEntries, now = new Date()) {
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

  const monthMoods = moodEntries.filter((mood) => {
    const moodDate = new Date(mood.date);
    return moodDate >= thirtyDaysAgo && moodDate <= now;
  });

  if (monthMoods.length === 0) {
    return {
      monthly_average: 0,
      best_week: '-',
      current_streak: 0,
      total_entries: 0,
      insight: 'Start logging your mood daily to see monthly insights!',
      weekly_averages: [],
    };
  }

  const monthlyAverage = monthMoods.reduce((sum, mood) => sum + mood.mood_score, 0) / monthMoods.length;
  const weeklyAverages = [];

  for (let week = 0; week < 4; week += 1) {
    const weekStart = new Date(thirtyDaysAgo);
    weekStart.setDate(weekStart.getDate() + week * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const weekMoods = monthMoods.filter((mood) => {
      const moodDate = new Date(mood.date);
      return moodDate >= weekStart && moodDate <= weekEnd;
    });

    if (weekMoods.length > 0) {
      const average = weekMoods.reduce((sum, mood) => sum + mood.mood_score, 0) / weekMoods.length;
      weeklyAverages.push({ week: week + 1, average: Number(average.toFixed(1)) });
    }
  }

  let currentStreak = 0;
  const sortedMoods = [...monthMoods].sort((a, b) => new Date(b.date) - new Date(a.date));
  for (let index = 0; index < sortedMoods.length; index += 1) {
    const expectedDate = new Date(now);
    expectedDate.setDate(expectedDate.getDate() - index);
    if (sortedMoods[index].date !== dateString(expectedDate)) break;
    currentStreak += 1;
  }

  let insight = 'Reach out to someone you trust. You do not have to go through this alone.';
  if (monthlyAverage >= 4) insight = 'You are having a great month. Keep up this positive momentum.';
  else if (monthlyAverage >= 3) insight = 'Your mood is stable this month. That is good consistency.';
  else if (monthlyAverage >= 2) insight = 'You are going through some challenges. Remember to practice self-care.';

  return {
    monthly_average: Number(monthlyAverage.toFixed(1)),
    best_week: weeklyAverages.length ? Math.max(...weeklyAverages.map((week) => week.average)) : '-',
    current_streak: currentStreak,
    total_entries: monthMoods.length,
    insight,
    weekly_averages: weeklyAverages,
  };
}

module.exports = { getMoodKey, getTodayDate, getWeeklyAnalysis, getMonthlyAnalysis };
