
export const copyToClipboard = (text) => {
    if (!navigator.clipboard) {
      // Fallback for unsupported browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed"; // Prevent scrolling to the bottom
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand("copy");
        console.log("Fallback: Text copied to clipboard!");
      } catch (err) {
        console.error("Fallback: Unable to copy text", err);
      } finally {
        document.body.removeChild(textArea);
      }
      return;
    }
  
    // Use clipboard API if available
    navigator.clipboard.writeText(text).then(() => {
      console.log("Text copied to clipboard!");
    }).catch((err) => {
      console.error("Failed to copy text to clipboard", err);
    });
  };