import Analysis from '../models/Analysis.js';
import {
  runFullAIAnalysis,
  explainAnalysis,
  detectLanguageAndAnalyze,
} from '../services/aiService.js';

// POST /api/ai/analyze/:analysisId  — run full AI layer on an existing analysis
const runAIAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.analysisId);
    if (!analysis) return res.status(404).json({ message: 'Analysis not found' });
    if (analysis.userId.toString() !== req.userId && req.userRole !== 'admin')
      return res.status(403).json({ message: 'Unauthorized' });

    if (!process.env.GROQ_API_KEY) {
      return res.status(503).json({ message: 'AI service not configured. Add GROQ_API_KEY to environment.' });
    }

    const { language } = req.body;

    const aiResult = await runFullAIAnalysis({
      content:             analysis.content,
      trustScore:          analysis.trustScore,
      trustCategory:       analysis.trustCategory,
      riskLevel:           analysis.riskLevel,
      riskPatterns:        analysis.riskPatterns,
      extractedEntities:   analysis.extractedEntities,
      similarIncidents:    analysis.similarIncidents,
      communityReportCount: analysis.communityReportCount || 0,
      language,
    });

    // Persist AI results back to analysis
    await Analysis.findByIdAndUpdate(analysis._id, { aiAnalysis: aiResult });

    res.status(200).json({ message: 'AI analysis complete', aiAnalysis: aiResult });
  } catch (error) {
    if (error.response?.status === 401 || error.message?.includes('401')) return res.status(503).json({ message: 'Invalid GROQ API key' });
    if (error.response?.status === 429 || error.message?.includes('429') || error.message?.includes('Rate limit')) return res.status(429).json({ message: 'AI rate limit reached. Please wait 20 seconds and retry.' });
    res.status(500).json({ message: 'AI analysis failed', error: error.message });
  }
};

// POST /api/ai/explain/:analysisId  — answer a user question about their analysis
const explainAnalysisResult = async (req, res) => {
  try {
    const { question, language } = req.body;
    if (!question?.trim()) return res.status(400).json({ message: 'Question is required' });

    const analysis = await Analysis.findById(req.params.analysisId);
    if (!analysis) return res.status(404).json({ message: 'Analysis not found' });
    if (analysis.userId.toString() !== req.userId && req.userRole !== 'admin')
      return res.status(403).json({ message: 'Unauthorized' });

    if (!process.env.GROQ_API_KEY) {
      return res.status(503).json({ message: 'AI service not configured. Add GROQ_API_KEY to environment.' });
    }

    const answer = await explainAnalysis({
      question,
      analysisData: analysis.toObject(),
      language: language || 'en',
    });

    res.status(200).json({ question, answer });
  } catch (error) {
    if (error.response?.status === 429) return res.status(429).json({ message: 'AI rate limit reached. Please wait and retry.' });
    res.status(500).json({ message: 'Explanation failed', error: error.message });
  }
};

// POST /api/ai/detect-language  — detect language of content
const detectLanguage = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: 'Content is required' });

    if (!process.env.GROQ_API_KEY) {
      return res.status(200).json({ detectedLanguage: 'en', languageName: 'English' });
    }

    const result = await detectLanguageAndAnalyze(content);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Language detection failed', error: error.message });
  }
};

// GET /api/ai/status  — check if AI service is configured
const getAIStatus = async (req, res) => {
  res.status(200).json({
    configured: !!process.env.GROQ_API_KEY,
    model:      'llama-3.1-8b-instant',
    provider:   'Groq',
    modules:    ['Entity Extraction', 'Risk Pattern Detection', 'Trust Signals', 'Investigation Report', 'Explainability', 'Multilingual', 'Community Matching', 'Graph Enrichment'],
  });
};

export { runAIAnalysis, explainAnalysisResult, detectLanguage, getAIStatus };
