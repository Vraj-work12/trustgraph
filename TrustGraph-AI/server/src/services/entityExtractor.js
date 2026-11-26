// Extracts structured entities from raw text content

const EMAIL_RE    = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const PHONE_RE    = /(?:\+91[\s\-]?)?[6-9]\d{9}|(?:\+\d{1,3}[\s\-]?)?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{4}/g;
const URL_RE      = /https?:\/\/[^\s]+/g;
const DOMAIN_RE   = /(?:@|(?:https?:\/\/))([a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/g;
const SALARY_RE   = /(?:rs\.?|inr|₹|lpa|lakh|per\s+month|\/month|salary|ctc|stipend)[^\n.]{0,60}/gi;
const PAYMENT_RE  = /(?:pay|deposit|fee|registration|training|security|advance|transfer|send money|google pay|phonepay|upi|neft)[^\n.]{0,80}/gi;

const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com','yahoo.com','hotmail.com','outlook.com','rediffmail.com',
  'ymail.com','aol.com','live.com','icloud.com','protonmail.com',
]);

const extractDomain = (email) => email?.split('@')[1]?.toLowerCase() || null;

const isFreeEmail = (email) => FREE_EMAIL_DOMAINS.has(extractDomain(email));

const extractEntities = (text) => {
  if (!text) return {};

  const emails    = [...new Set(text.match(EMAIL_RE)  || [])];
  const phones    = [...new Set(text.match(PHONE_RE)  || [])];
  const urls      = [...new Set(text.match(URL_RE)    || [])];
  const salaryMentions   = text.match(SALARY_RE)  || [];
  const paymentMentions  = text.match(PAYMENT_RE) || [];

  // Extract domains from emails + urls
  const domains = [...new Set([
    ...emails.map(extractDomain).filter(Boolean),
    ...[...text.matchAll(DOMAIN_RE)].map(m => m[1].toLowerCase()),
  ])];

  // Company name heuristic: "at <Company>" or "from <Company>" patterns
  const companyMatches = text.match(/(?:at|from|by|company[:\s]+|employer[:\s]+)\s+([A-Z][a-zA-Z\s&.]{2,30})/g) || [];
  const companies = [...new Set(companyMatches.map(m => m.replace(/^(?:at|from|by|company[:\s]+|employer[:\s]+)\s+/i, '').trim()))];

  // Recruiter name heuristic: "I am <Name>" / "my name is <Name>" / "regards, <Name>"
  const nameMatches = text.match(/(?:i am|my name is|regards,?|sincerely,?|from,?)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/g) || [];
  const recruiterNames = [...new Set(nameMatches.map(m => m.replace(/^(?:i am|my name is|regards,?|sincerely,?|from,?)\s+/i, '').trim()))];

  const freeEmailsFound = emails.filter(isFreeEmail);

  return {
    emails,
    phones,
    urls,
    domains,
    companies,
    recruiterNames,
    salaryMentions:  salaryMentions.map(s => s.trim()),
    paymentMentions: paymentMentions.map(s => s.trim()),
    freeEmailsFound,
    hasFreeEmail:    freeEmailsFound.length > 0,
    hasPaymentKeyword: paymentMentions.length > 0,
    hasUrl:          urls.length > 0,
  };
};

export { extractEntities, extractDomain, isFreeEmail, FREE_EMAIL_DOMAINS };
