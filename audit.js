const fs = require('fs');
const path = require('path');
const routes = [
  '/', '/login', '/register', '/forgot-password', '/update-password',
  '/onboarding', '/account-deleted', '/account-restricted',
  '/admin/analytics', '/admin/audit', '/admin/audit-logs', '/admin/dashboard', '/admin/profile', '/admin/users', '/admin/users/[userId]',
  '/doctor/appointments', '/doctor/availability', '/doctor/consultations/[consultationId]', '/doctor/dashboard', '/doctor/prescriptions', '/doctor/prescriptions/[prescriptionId]',
  '/patient/appointments', '/patient/consultations/[consultationId]', '/patient/dashboard', '/patient/doctors', '/patient/doctors/[doctorId]', '/patient/prescriptions', '/patient/prescriptions/[prescriptionId]', '/patient/profile',
  '/pharmacist/dashboard', '/pharmacist/dispensing-history', '/pharmacist/profile', '/pharmacist/scan'
];

let out = '';
routes.forEach(r => {
  const p = path.join('d:/MediSync/frontend/src/app', r === '/' ? 'page.tsx' : r + '/page.tsx');
  try {
    const c = fs.readFileSync(p, 'utf8');
    out += 'ROUTE: ' + r + '\n';
    
    // Extracted headers
    const headers = [];
    const headerRegex = /<(h[1-6]|PortalHeading)[^>]*>(.*?)<\/(h[1-6]|PortalHeading)>/gs;
    let m;
    while ((m = headerRegex.exec(c)) !== null) {
      headers.push(m[2].replace(/<[^>]+>/g, '').trim());
    }
    
    // Find title/description for PortalHeading which uses props
    const portalRegex = /<PortalHeading[^>]*title=["']([^"']+)["'][^>]*>/g;
    while ((m = portalRegex.exec(c)) !== null) {
      headers.push(m[1]);
    }
    
    out += 'HEADERS: ' + headers.join(' | ') + '\n';
    
    // Buttons
    const buttons = [];
    const btnRegex = /<button[^>]*>(.*?)<\/button>/gs;
    while ((m = btnRegex.exec(c)) !== null) {
      buttons.push(m[1].replace(/<[^>]+>/g, '').trim());
    }
    out += 'BUTTONS: ' + buttons.join(' | ') + '\n';
    
    // Links
    const links = [];
    const linkRegex = /<Link[^>]*href=[{`"']([^`"'}]+)[`"'}][^>]*>(.*?)<\/Link>/gs;
    while ((m = linkRegex.exec(c)) !== null) {
      links.push(m[2].replace(/<[^>]+>/g, '').trim() + ' (' + m[1] + ')');
    }
    out += 'LINKS: ' + links.join(' | ') + '\n';
    
    const components = [];
    const compRegex = /<([A-Z][a-zA-Z0-9]+)/g;
    while ((m = compRegex.exec(c)) !== null) {
      components.push(m[1]);
    }
    out += 'COMPONENTS: ' + [...new Set(components)].join(', ') + '\n\n';
    
  } catch(e) { out += 'ROUTE: ' + r + '\nERROR: ' + e.message + '\n\n'; }
});
fs.writeFileSync('d:/MediSync/frontend/audit.txt', out);
