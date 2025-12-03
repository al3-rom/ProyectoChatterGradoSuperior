export function getAvatarUrl(userInfo) {
  if (!userInfo) return null;

  // Si hay avatar en buffer (ej: MongoDB: { data: [...], type: 'Buffer' })
  if (userInfo.avatar && userInfo.avatar.data) {
    const bufferToBase64 = (bufferFromDb) => {
      const bytes = new Uint8Array(bufferFromDb.data); // asumimos siempre .data
      let binary = "";
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return window.btoa(binary);
    };

    const base64String = bufferToBase64(userInfo.avatar);
    return `data:image/jpeg;base64,${base64String}`;
  }

  // Si no hay avatar -> SVG con iniciales
  const initials = `${userInfo.nom?.[0] || ""}${userInfo.cognoms?.[0] || ""}`.toUpperCase();
  // Create a gradient and pick stable colors based on the user's name (like bioImage)
  const nameForColor = `${userInfo.nom || ""} ${userInfo.cognoms || ""}`.trim() || initials || "?";

  const hashString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
      hash = hash | 0;
    }
    return Math.abs(hash);
  };

  const hashToColor = (str, offset = 0) => {
    const hash = hashString(str) + offset;
    const h = Math.abs(hash % 360);
    const s = 70;
    const l = 50;
    return `hsl(${h}, ${s}%, ${l}%)`;
  };

  const color1 = hashToColor(nameForColor, 0);
  const color2 = hashToColor(nameForColor, 1000);
  const gradId = `g${hashString(nameForColor)}`;

  const fontSize = initials.length > 2 ? 28 : 40;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${color1}" />
          <stop offset="100%" stop-color="${color2}" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="16" ry="16" fill="url(#${gradId})" />
      <text x="50" y="52" font-size="${fontSize}" text-anchor="middle" fill="white" font-family="Geist, sans-serif" dy=".35em" font-weight="700">${initials || "?"}</text>
    </svg>`;

  // Safe base64 for Unicode SVG
  const svgBase64 = window.btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${svgBase64}`;
}
