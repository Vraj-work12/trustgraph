// Detects scam risk patterns in raw text with severity, confidence, evidence

const PATTERNS = [
  {
    type: 'Upfront Payment Request',
    severity: 'Critical',
    keywords: [/pay\s*(rs|inr|₹)/i, /registration\s*fee/i, /security\s*deposit/i, /training\s*fee/i, /interview\s*fee/i, /send\s*money/i, /advance\s*payment/i],
    confidence: 0.95,
  },
  {
    type: 'Free Email Provider',
    severity: 'High',
    keywords: [/@gmail\.com/i, /@yahoo\.com/i, /@hotmail\.com/i, /@outlook\.com/i, /@rediffmail\.com/i],
    confidence: 0.85,
  },
  {
    type: 'Unrealistic Salary Promise',
    severity: 'High',
    keywords: [/earn\s*(rs\.?|inr|₹)?\s*\d+[,\d]*\s*(per\s*day|\/day)/i, /\d+\s*lakh?\s*per\s*month/i, /work\s*from\s*home.{0,30}(earn|salary|income)/i, /no\s*experience.{0,30}(lakh|salary|earn)/i],
    confidence: 0.88,
  },
  {
    type: 'Urgency Pressure',
    severity: 'Medium',
    keywords: [/last\s*(few|chance|opportunity)/i, /limited\s*(seats|slots|positions)/i, /respond\s*(immediately|today|asap|within\s*\d+\s*hour)/i, /offer\s*expires/i, /urgent(ly)?\s*required/i, /immediate\s*joining/i],
    confidence: 0.80,
  },
  {
    type: 'Telegram/WhatsApp Only Recruitment',
    severity: 'High',
    keywords: [/contact\s*(us\s*)?on\s*telegram/i, /whatsapp\s*(only|us|me|at)/i, /message\s*(on|via)\s*(whatsapp|telegram)/i, /t\.me\//i],
    confidence: 0.87,
  },
  {
    type: 'No Official Website',
    severity: 'Medium',
    keywords: [/no\s*official\s*website/i, /visit\s*our\s*website.*?\.tk/i, /\.tk\b/i, /\.xyz\b/i, /\.info\b.*?(job|recruit|hire)/i],
    confidence: 0.75,
  },
  {
    type: 'Vague Job Description',
    severity: 'Medium',
    keywords: [/data\s*entry/i, /copy\s*paste\s*(job|work)/i, /simple\s*(online\s*)?(job|work|task)/i, /part[- ]time\s*(job|work|income)/i, /no\s*(skill|qualification|experience)\s*(required|needed)/i],
    confidence: 0.72,
  },
  {
    type: 'Credential Harvesting',
    severity: 'Critical',
    keywords: [/send\s*(your\s*)?(aadhar|pan\s*card|passport|bank\s*(account|detail))/i, /upload\s*(your\s*)?(id\s*proof|documents)/i, /share\s*(your\s*)?(personal|bank|account)\s*detail/i],
    confidence: 0.93,
  },
  {
    type: 'Impersonation of Known Company',
    severity: 'Critical',
    keywords: [/(tcs|infosys|wipro|amazon|google|microsoft|flipkart|paytm).{0,30}(@gmail|@yahoo|@hotmail)/i],
    confidence: 0.97,
  },
  {
    type: 'Suspicious Domain',
    severity: 'High',
    keywords: [/[a-z]+-jobs?\.(tk|xyz|info|cc|top|pw|click)/i, /recruit[a-z]*\.(tk|xyz|info)/i, /hr[a-z]*@[a-z]+-[a-z]+\.(com|in)/i],
    confidence: 0.82,
  },
  {
    type: 'Too Good To Be True',
    severity: 'High',
    keywords: [/100%\s*(guaranteed|sure|confirm)/i, /guaranteed\s*(job|placement|income)/i, /dream\s*job/i, /life\s*changing\s*(opportunity|income)/i],
    confidence: 0.83,
  },
  {
    type: 'Missing Company Information',
    severity: 'Low',
    keywords: [/no\s*(address|location|office)/i, /contact\s*via\s*(email|whatsapp)\s*only/i],
    confidence: 0.65,
  },
  {
    type: 'Interview Fee Request',
    severity: 'Critical',
    keywords: [/interview\s*(processing\s*)?fee/i, /pay\s*(before|for)\s*interview/i, /interview\s*charge/i],
    confidence: 0.96,
  },
  {
    type: 'Suspicious Wording',
    severity: 'Low',
    keywords: [/kindly\s*(deposit|pay|transfer)/i, /do\s*the\s*needful/i, /revert\s*back/i, /do\s*not\s*ignore/i, /golden\s*opportunity/i],
    confidence: 0.60,
  },
  {
    type: 'Fake Government Job',
    severity: 'Critical',
    keywords: [/(railway|ssc|upsc|bank\s*po|defence|army|navy|airforce).{0,40}(recruitment|vacancy|apply)/i],
    confidence: 0.78,
  },
];

const detectPatterns = (text) => {
  if (!text) return [];

  const detected = [];

  for (const pattern of PATTERNS) {
    const matchedEvidence = [];

    for (const kw of pattern.keywords) {
      const match = text.match(kw);
      if (match) matchedEvidence.push(match[0].trim().substring(0, 120));
    }

    if (matchedEvidence.length > 0) {
      // Boost confidence if multiple keyword hits
      const boostedConfidence = Math.min(
        pattern.confidence + (matchedEvidence.length - 1) * 0.03,
        0.99
      );

      detected.push({
        type:       pattern.type,
        severity:   pattern.severity,
        evidence:   matchedEvidence,
        confidence: Math.round(boostedConfidence * 100),
      });
    }
  }

  // Sort by severity weight
  const severityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  return detected.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
};

export { detectPatterns };
