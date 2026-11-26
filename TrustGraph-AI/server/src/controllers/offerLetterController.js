import OfferLetter from '../models/OfferLetter.js';
import { analyzeOfferLetter as analyzeOfferLetterService } from '../services/documentAnalysisService.js';

const analyzeOfferLetter = async (req, res) => {
  try {
    const { fileName, fileUrl, companyName, position, salary } = req.body;

    // Get mock analysis
    const analysis = await analyzeOfferLetterService(fileUrl);

    // Create offer letter record
    const offerLetter = new OfferLetter({
      userId: req.userId,
      fileName,
      fileUrl,
      companyName,
      position,
      salary,
      ...analysis,
    });

    await offerLetter.save();

    res.status(201).json({
      message: 'Offer letter analyzed',
      offerLetter,
    });
  } catch (error) {
    res.status(500).json({ message: 'Analysis failed', error: error.message });
  }
};

const getOfferLetters = async (req, res) => {
  try {
    const offerLetters = await OfferLetter.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.status(200).json(offerLetters);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch offer letters', error: error.message });
  }
};

const getOfferLetterById = async (req, res) => {
  try {
    const offerLetter = await OfferLetter.findById(req.params.id);
    if (!offerLetter) {
      return res.status(404).json({ message: 'Offer letter not found' });
    }
    if (offerLetter.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    res.status(200).json(offerLetter);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch offer letter', error: error.message });
  }
};

export { analyzeOfferLetter, getOfferLetters, getOfferLetterById };
