export function chatImg(chatImg) {

    if (!chatImg) return null;

    if (chatImg) {
        const bufferToBase64 = (bufferFromDb) => {
        const bytes = new Uint8Array(bufferFromDb.data);
        let binary = "";
        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
        };

        const base64String = bufferToBase64(chatImg);
        return `data:image/jpeg;base64,${base64String}`;
    }

    
}