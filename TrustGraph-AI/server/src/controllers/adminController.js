import User from '../models/User.js';
import CommunityReport from '../models/CommunityReport.js';
import Analysis from '../models/Analysis.js';
import Recruiter from '../models/Recruiter.js';
import Company from '../models/Company.js';

const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalReports = await CommunityReport.countDocuments();
    const totalAnalyses = await Analysis.countDocuments();
    const flaggedRecruiters = await Recruiter.countDocuments({ verificationStatus: { $in: ['Suspicious', 'High Risk'] } });

    res.status(200).json({
      totalUsers,
      totalReports,
      totalAnalyses,
      flaggedRecruiters,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    const query = search ? { name: { $regex: search, $options: 'i' } } : {};
    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

const getReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = status ? { status } : {};
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

const updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const report = await CommunityReport.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.status(200).json({ message: 'Report status updated', report });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update report', error: error.message });
  }
};

const getRecruiters = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const recruiters = await Recruiter.find()
      .sort({ communityReportCount: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Recruiter.countDocuments();

    res.status(200).json({
      recruiters,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch recruiters', error: error.message });
  }
};

const getCompanies = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = search ? { name: { $regex: search, $options: 'i' } } : {};
    const skip = (page - 1) * limit;

    const companies = await Company.find(query)
      .sort({ reportCount: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Company.countDocuments(query);

    res.status(200).json({
      companies,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch companies', error: error.message });
  }
};

export { getAdminStats, getUsers, getReports, updateReportStatus, getRecruiters, getCompanies };
