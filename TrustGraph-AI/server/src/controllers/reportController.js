import CommunityReport from '../models/CommunityReport.js';

const createReport = async (req, res) => {
  try {
    const { reportType, title, description, recruiterName, companyName, email, phone, riskCategory } = req.body;

    const report = new CommunityReport({
      userId: req.userId,
      reportType,
      title,
      description,
      recruiterName,
      companyName,
      email,
      phone,
      riskCategory,
    });

    await report.save();

    res.status(201).json({
      message: 'Report submitted successfully',
      report,
    });
  } catch (error) {
    res.status(500).json({ message: 'Report submission failed', error: error.message });
  }
};

const getReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, reportType, status } = req.query;
    
    const query = {};
    if (reportType) query.reportType = reportType;
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    
    const reports = await CommunityReport.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'name email');

    const total = await CommunityReport.countDocuments(query);

    res.status(200).json({
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reports', error: error.message });
  }
};

const getReportById = async (req, res) => {
  try {
    const report = await CommunityReport.findById(req.params.id).populate('userId', 'name email');
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch report', error: error.message });
  }
};

const getUserReports = async (req, res) => {
  try {
    const reports = await CommunityReport.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user reports', error: error.message });
  }
};

const verifyReport = async (req, res) => {
  try {
    const report = await CommunityReport.findByIdAndUpdate(
      req.params.id,
      {
        $inc: { verificationCount: 1 },
        $addToSet: { verifiedBy: req.userId },
      },
      { new: true }
    );
    res.status(200).json({ message: 'Report verified', report });
  } catch (error) {
    res.status(500).json({ message: 'Failed to verify report', error: error.message });
  }
};

export { createReport, getReports, getReportById, getUserReports, verifyReport };
