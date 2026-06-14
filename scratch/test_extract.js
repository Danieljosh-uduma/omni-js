function extractTopLevelTag(source, tagName) {
  const openRegex = new RegExp('<' + tagName + '(?:\\s[^>]*)?>', 'i');
  const closeRegex = new RegExp('</' + tagName + '>', 'i');
  
  let searchIndex = 0;
  while (true) {
    const slice = source.slice(searchIndex);
    const openMatch = slice.match(openRegex);
    if (!openMatch) break;
    
    const startPos = searchIndex + openMatch.index;
    const contentStart = startPos + openMatch[0].length;
    
    const closeMatch = source.slice(contentStart).match(closeRegex);
    if (!closeMatch) break;
    
    const contentEnd = contentStart + closeMatch.index;
    const endPos = contentEnd + closeMatch[0].length;
    
    const preceding = source.substring(0, startPos);
    // Ignore self-closing tags and comments in open tag counts
    const openTags = (preceding.replace(/<[^>]*\/>/g, '').replace(/<!--[\s\S]*?-->/g, '').match(/<[a-zA-Z0-9:-]+/g) || []).length;
    const closeTags = (preceding.match(/<\/[a-zA-Z0-9:-]+/g) || []).length;
    
    if (openTags === closeTags) {
      return {
        full: source.substring(startPos, endPos),
        content: source.substring(contentStart, contentEnd)
      };
    }
    
    searchIndex = contentStart;
  }
  return null;
}

const source = '<Stack><script>console.log(\'inline\');</script></Stack>\n<script>console.log(\'main\');</script>';
console.log('Result:', extractTopLevelTag(source, 'script'));
