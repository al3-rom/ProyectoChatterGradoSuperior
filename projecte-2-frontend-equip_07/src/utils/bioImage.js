export function getBioImageUrl(imageInfo, title = "") {

  if (imageInfo) {

    if (typeof imageInfo === "string") {
      if (imageInfo.startsWith("data:")) return imageInfo;
      return `data:image/jpeg;base64,${imageInfo}`;
    }

    let raw = null;

    if (imageInfo.data) {

      if (Array.isArray(imageInfo.data)) raw = imageInfo.data;

      else if (imageInfo.data.data && Array.isArray(imageInfo.data.data)) raw = imageInfo.data.data;

      else if (ArrayBuffer.isView(imageInfo.data) || imageInfo.data instanceof ArrayBuffer) raw = new Uint8Array(imageInfo.data);
 
      else if (imageInfo.data.buffer && imageInfo.data.buffer.data && Array.isArray(imageInfo.data.buffer.data)) raw = imageInfo.data.buffer.data;
    }

    if (!raw) {
      if (imageInfo.data && imageInfo.data.constructor && imageInfo.data.constructor.name === 'Buffer' && imageInfo.data.data) raw = imageInfo.data.data;
      else if (imageInfo.constructor && imageInfo.constructor.name === 'Buffer' && imageInfo.data) raw = imageInfo.data;
    }

    if (raw) {
      const bytes = new Uint8Array(raw);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return `data:image/jpeg;base64,${window.btoa(binary)}`;
    }
  }

  if (!title) title = "?";
  const displayTitle = title.length > 20 ? title.slice(0, 20) + "…" : title;

  const hashToColor = (str, offset = 0) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs((hash + offset) % 360);
    const s = 70; 
    const l = 55; 
    return `hsl(${h}, ${s}%, ${l}%)`;
  };

  const color1 = hashToColor(title, 0);
  const color2 = hashToColor(title, 1000);

  const fontSize = displayTitle.length > 15 ? 20 : 24;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${color1}" />
          <stop offset="100%" stop-color="${color2}" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      <text x="50%" y="50%" 
            font-size="${fontSize}" 
            font-family="Geist, sans-serif" 
            fill="white" 
            dominant-baseline="middle" 
            text-anchor="middle" 
            font-weight="bold"
            style="filter: drop-shadow(1px 1px 3px rgba(0,0,0,0.5));">
        ${displayTitle}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(svg)))}`;
}
