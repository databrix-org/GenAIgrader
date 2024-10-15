export function extractPath(content: string, configKey: string): string | null {
    const regex = new RegExp(`${configKey}\\s*=\\s*['"](.*?)['"]`);
    const match = content.match(regex);
    return match ? match[1] : null;
  }