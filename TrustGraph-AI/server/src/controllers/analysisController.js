import mongoose from 'mongoose';
import Analysis from '../models/Analysis.js';
import { analyzeJobDescription, analyzeEmail, analyzeMessage } from '../services/scamAnalysisService.js';

const createAnalysis = async (req, res) => {
  try {
    const { title, sourcePlatform, content } = req.body;

    let result;
    if      (sourcePlatform === 'job-posting') result = await analyzeJobDescription(content);
    else if (sourcePlatform === 'email')       result = await analyzeEmail(content);
    else                                       result = await analyzeMessage(content);

    const now = new Date();
    const doc = {
      _id:                 new mongoose.Types.ObjectId(),
      userId:              new mongoose.Types.ObjectId(req.userId),
      title:               title || `Analysis ${now.toLocaleDateString()}`,
      sourcePlatform,
      content,
      trustScore:          result.trustScore,
      trustCategory:       result.trustCategory,
      scoreBreakdown:      result.scoreBreakdown  ?? [],
      riskScore:           result.riskScore,
      riskLevel:           result.riskLevel,
      flags:               result.flags            ?? [],
      riskPatterns:        Array.isArray(result.riskPatterns) ? result.riskPatterns : [],
      extractedEntities:   result.extractedEntities ?? {},
      graphConnections:    result.graphConnections  ?? [],
      similarIncidents:    result.similarIncidents  ?? [],
      investigationReport: result.investigationReport ?? {},
      summary:             result.summary,
      recommendedActions:  result.recommendedActions ?? [],
      savedBy:             false,
      createdAt:           now,
      updatedAt:           now,
    };

    // Use native driver insertOne to completely bypass Mongoose schema casting
    await mongoose.connection.collection('analyses').insertOne(doc);

    res.status(201).json({ message: 'Analysis created successfully', analysis: doc });
  } catch (error) {
    res.status(500).json({ message: 'Analysis creation failed', error: error.message });
  }
};

const getAnalyses = async (req, res) => {
  try {
    const analyses = await Analysis.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.status(200).json(analyses);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch analyses', error: error.message });
  }
};

const getAnalysisById = async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);
    if (!analysis) return res.status(404).json({ message: 'Analysis not found' });
    if (analysis.userId.toString() !== req.userId && req.userRole !== 'admin')
      return res.status(403).json({ message: 'Unauthorized' });
    res.status(200).json(analysis);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch analysis', error: error.message });
  }
};

const saveAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findByIdAndUpdate(req.params.id, { savedBy: true }, { new: true });
    if (!analysis) return res.status(404).json({ message: 'Analysis not found' });
    res.status(200).json({ message: 'Analysis saved', analysis });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save analysis', error: error.message });
  }
};

const deleteAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findByIdAndDelete(req.params.id);
    if (!analysis) return res.status(404).json({ message: 'Analysis not found' });
    res.status(200).json({ message: 'Analysis deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete analysis', error: error.message });
  }
};

export { createAnalysis, getAnalyses, getAnalysisById, saveAnalysis, deleteAnalysis };
