import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AuthChoice from './AuthChoice';

const mockSetPublicMode = jest.fn();
const mockSetAnonymousMode = jest.fn();

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ setPublicMode: mockSetPublicMode, setAnonymousMode: mockSetAnonymousMode }),
}));

test('selects public access mode', async () => {
  render(<MemoryRouter><AuthChoice /></MemoryRouter>);
  await userEvent.click(screen.getByText('Continue as Public'));
  expect(mockSetPublicMode).toHaveBeenCalled();
});

test('selects anonymous access mode', async () => {
  render(<MemoryRouter><AuthChoice /></MemoryRouter>);
  await userEvent.click(screen.getByText('Chat Anonymously', { selector: 'button' }));
  expect(mockSetAnonymousMode).toHaveBeenCalled();
});
