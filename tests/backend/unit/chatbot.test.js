const { CRISIS_GUIDANCE, containsCrisisLanguage, getPrompt, getChatResponse } = require('../../../src/services/chatbot');

describe('chatbot safety service', () => {
  test('detects crisis language', () => {
    expect(containsCrisisLanguage('I want to hurt myself')).toBe(true);
    expect(containsCrisisLanguage('I feel anxious today')).toBe(false);
  });

  test('uses a safe fallback prompt for unknown specialties', () => {
    expect(getPrompt('unknown')).toContain('Semzung');
    expect(getPrompt('trauma')).toContain('trauma-informed');
  });

  test('adds crisis guidance when provider response omits it', async () => {
    const fetchImpl = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'I am here with you.' } }] }),
    });

    const reply = await getChatResponse({
      messages: [{ role: 'user', content: 'I want to die' }],
      apiKey: 'test-key',
      fetchImpl,
    });

    expect(reply).toContain(CRISIS_GUIDANCE);
  });

  test('fails safely when no provider key is configured', async () => {
    await expect(getChatResponse({
      messages: [{ role: 'user', content: 'hello' }],
      apiKey: '',
    })).rejects.toMatchObject({ statusCode: 503 });
  });
});
