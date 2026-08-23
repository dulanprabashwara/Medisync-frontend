export function formatDoctorName(name: string): string {
  if (!name) return "Dr.";
  
  // Remove existing prefixes if they exist to avoid duplication
  // Case insensitive match for "Dr.", "Dr ", "Doctor " at the start
  let cleaned = name.trim();
  const prefixRegex = /^(?:Dr\.?|Doctor)\s+/i;
  
  while (prefixRegex.test(cleaned)) {
    cleaned = cleaned.replace(prefixRegex, "");
  }
  
  return `Dr. ${cleaned}`;
}
