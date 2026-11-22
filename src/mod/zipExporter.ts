import JSZip from 'jszip';
import type { GeneratedModFile, ModConfig } from './types';

export async function exportModAsZip(
  config: ModConfig,
  files: GeneratedModFile[],
  thumbnailUrl?: string
): Promise<{ filename: string; sizeBytes: number; fileCount: number }> {
  const zip = new JSZip();

  for (const file of files) {
    zip.file(file.path, file.content);
  }

  let extraFiles = 0;
  if (thumbnailUrl) {
    try {
      const response = await fetch(thumbnailUrl);
      if (response.ok) {
        const blob = await response.blob();
        zip.file(`${config.folderName}/thumbnail.png`, blob);
        extraFiles = 1;
      }
    } catch {
      // Optional thumbnail failure must not block mod ZIP generation
    }
  }

  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  const filename = `${config.folderName}_${config.preset}.zip`;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 4000);

  return {
    filename,
    sizeBytes: blob.size,
    fileCount: files.length + extraFiles,
  };
}
