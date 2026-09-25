const normalize = (s = "") =>
  s.toLocaleLowerCase("tr-TR")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i");

export function isSupervisionAnnouncement(body = "") {
  const t = normalize(body);
  return t.includes("gozetmen") &&
         t.includes("seans") &&
         t.includes("isim") &&
         (t.includes("soy isim") || t.includes("soyisim"));
}

export function extractSessionTimes(body = "") {
  const matches = [...body.matchAll(/(?<!\d)([01]?\d|2[0-3])[.:]([0-5]\d)(?!\d)/g)]
    .map(m => `${m[1].padStart(2, "0")}.${m[2]}`);
  return [...new Set(matches)].slice(0, 2);
}

export function buildReply(fullName, times) {
  if (times.length >= 2) return `${fullName} - ${times[0]} ve ${times[1]} seansları`;
  return `${fullName} - Her iki seans`;
}
