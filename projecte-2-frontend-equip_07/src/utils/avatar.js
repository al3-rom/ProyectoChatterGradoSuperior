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

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
    <rect width="100" height="100" fill="#6c2bd9"/>
    <text x="50" y="55" font-size="40" text-anchor="middle" fill="white" font-family="Arial" dy=".35em">${initials}</text>
  </svg>`;

  // Opción 2: base64 seguro para Unicode
  const svgBase64 = window.btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${svgBase64}`;
}
