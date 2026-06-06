const CRISIS_GUIDANCE = 'If you are in immediate danger, call your local emergency number. In the US or Canada, call or text 988.';

const crisisKeywords = [
  'suicide',
  'kill myself',
  'end my life',
  'self harm',
  'self-harm',
  'hurt myself',
  "don't want to live",
  'want to die',
];

const prompts = {
  general: `You are Semzung, a compassionate mental health support companion from Bhutan. Listen actively, validate emotions, offer concise evidence-based coping strategies, never diagnose, and encourage professional support when appropriate. If self-harm or suicide is mentioned, include immediate crisis guidance. Keep responses to 2-4 short paragraphs.`,
  anxiety: 'You are an anxiety support counsellor. Use grounding and CBT-informed techniques, remain reassuring, never diagnose, and encourage professional support when appropriate.',
  depression: 'You are a depression support counsellor. Validate feelings, suggest gentle actionable steps, never diagnose, and encourage professional support when appropriate.',
  trauma: 'You are a trauma-informed support counsellor. Prioritize safety and grounding, avoid re-traumatization, never diagnose, and encourage professional trauma therapy.',
  grief: 'You are a grief support counsellor. Honor the loss, never rush grief, suggest healthy remembrance practices, and encourage professional support when appropriate.',
};

function containsCrisisLanguage(text = '') {
  const normalized = text.toLowerCase();
  return crisisKeywords.some((keyword) => normalized.includes(keyword));
}

function getPrompt(specialty = 'general') {
  return prompts[specialty] || prompts.general;
}

async function getChatResponse({ messages, specialty, apiKey, fetchImpl = fetch }) {
  if (!apiKey) {
    const error = new Error('Chat service is not configured');
    error.statusCode = 503;
    throw error;
  }

  const response = await fetchImpl('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: getPrompt(specialty) }, ...messages],
      temperature: 0.7,
      max_tokens: 512,
      stream: false,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.error?.message || `Chat provider returned ${response.status}`);
    error.statusCode = 502;
    throw error;
  }

  const reply = data.choices?.[0]?.message?.content?.trim();
  if (!reply) {
    const error = new Error('Chat provider returned an empty response');
    error.statusCode = 502;
    throw error;
  }

  const latestUserMessage = [...messages].reverse().find((message) => message.role === 'user')?.content;
  return containsCrisisLanguage(latestUserMessage) && !reply.includes('988')
    ? `${reply}\n\n${CRISIS_GUIDANCE}`
    : reply;
}

module.exports = { CRISIS_GUIDANCE, containsCrisisLanguage, getPrompt, getChatResponse };
