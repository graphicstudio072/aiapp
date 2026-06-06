import fs from 'fs';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

export const parseDocument = async (filePath, originalName) => {
  const ext = originalName.split('.').pop().toLowerCase();
  
  if (!fs.existsSync(filePath)) {
    throw new Error('File does not exist on disk.');
  }

  try {
    switch (ext) {
      case 'txt': {
        const text = fs.readFileSync(filePath, 'utf-8');
        return text || 'The text file is empty.';
      }
      
      case 'pdf': {
        const dataBuffer = fs.readFileSync(filePath);
        const parsed = await pdf(dataBuffer);
        return parsed.text || 'No readable text found in PDF.';
      }
      
      case 'docx': {
        const dataBuffer = fs.readFileSync(filePath);
        const parsed = await mammoth.extractRawText({ buffer: dataBuffer });
        return parsed.value || 'No readable text found in DOCX.';
      }

      case 'png':
      case 'jpg':
      case 'jpeg': {
        // Return a mock OCR result for images since it's a demonstration
        return `[IMAGE OCR RESULT]
File Name: ${originalName}
This file was processed as an image. 
Simulated OCR Text: Detected visual elements, layout contains a header banner, profile elements, and general graphical components.`;
      }

      default:
        throw new Error(`Unsupported file extension: ${ext}`);
    }
  } catch (error) {
    console.error(`Error parsing document (${originalName}):`, error.message);
    throw new Error(`Failed to parse document: ${error.message}`);
  }
};
