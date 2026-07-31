/**
 * GAMIL - Helper Functions
 */

// Parse email headers from raw email
export function parseEmailHeaders(rawEmail) {
  const headers = {};
  const lines = rawEmail.split('\r\n');
  
  for (const line of lines) {
    if (line === '') break; // Empty line marks end of headers
    
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim().toLowerCase();
      const value = line.slice(colonIndex + 1).trim();
      headers[key] = value;
    }
  }
  
  return headers;
}

// Extract body from raw email (after headers)
export function extractBody(rawEmail) {
  const lines = rawEmail.split('\r\n');
  let bodyStart = false;
  const bodyLines = [];
  
  for (const line of lines) {
    if (line === '') {
      bodyStart = true;
      continue;
    }
    if (bodyStart) {
      bodyLines.push(line);
    }
  }
  
  return bodyLines.join('\r\n');
}

// Get conversation participants as JSON array
export function getParticipants(fromEmail, toEmail) {
  const participants = new Set();
  if (fromEmail) participants.add(fromEmail);
  if (toEmail) participants.add(toEmail);
  return JSON.stringify([...participants]);
}

// Check if email belongs to any of our configured addresses
export function isOurEmail(emailAddress, configuredEmails) {
  const normalized = emailAddress.toLowerCase().trim();
  return configuredEmails.some(e => e.toLowerCase().trim() === normalized);
}
