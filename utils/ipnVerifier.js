const crypto = require("crypto");
const allowedIps = []; // Optionally preload or fetch from Paykassa’s IP list

// Basic IP whitelist check (optional)
function isIpAllowed(ip) {
  if (!allowedIps || allowedIps.length === 0) return true;
  return allowedIps.includes(ip);
}

// Optionally verify signature / hash / private secret
function verifyIpnRequest(req) {
  // Example: you may want to check that the request comes from allowed IPs
  const ip = req.ip || req.connection.remoteAddress;
  if (!isIpAllowed(ip)) {
    console.warn("IP not allowed for IPN:", ip);
    return false;
  }

  // Optionally you verify a hash, signature, or “private_hash” etc
  // If Paykassa sends a secret or uses a signature, do it here.
  // For now, accept it if private_hash exists.
  if (!req.body.private_hash) {
    return false;
  }
  return true;
}

module.exports = {
  verifyIpnRequest,
};
