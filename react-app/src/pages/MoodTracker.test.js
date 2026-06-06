import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MoodTracker from './MoodTracker';

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: null, sessionId: 'test-session' }),
}));

beforeEach(() => {
  global.fetch = jest.fn()
    .mockResolvedValueOnce({ json: async () => ({ mood: null }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });
});

test('submits an anonymous mood entry', async () => {
  render(<MoodTracker />);
  await userEvent.click(screen.getByText('Great'));
  await userEvent.click(screen.getByText('Save Mood Entry'));

  await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/mood', expect.objectContaining({
    method: 'POST',
  })));
  expect(screen.getByText(/Mood logged successfully/)).toBeInTheDocument();
});
