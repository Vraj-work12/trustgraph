import { trustyChat, getProactiveSuggestion } from '../services/trustyService.js';

const chat = async (req, res) => {
  try {
    const { message, history, analysisId, context } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: 'Message is required' });

    const { response, intent } = await trustyChat({
      userId:    req.userId,
      message:   message.trim(),
      history:   history || [],
      analysisId,
      context,
    });

    res.status(200).json({ response, intent });
  } catch (error) {
    if (error.message === 'RATE_LIMIT')
      return res.status(429).json({ message: 'Trusty is thinking... please wait a moment and try again.' });
    if (!process.env.GROQ_API_KEY)
      return res.status(503).json({ message: 'AI service not configured.' });
    res.status(500).json({ message: 'Trusty encountered an error.', error: error.message });
  }
};

const proactiveSuggestion = async (req, res) => {
  try {
    const { page, analysisId } = req.query;
    const suggestion = await getProactiveSuggestion({ userId: req.userId, analysisId, page });
    res.status(200).json({ suggestion });
  } catch {
    res.status(200).json({ suggestion: null });
  }
};

export { chat, proactiveSuggestion };
