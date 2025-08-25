
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import tesseract from 'tesseract.js';
import sharp from 'sharp';
export async function extractText(fileBase64, fileType) {
    if (!fileBase64 || !fileType) {
        console.error("❌ Missing fileBase64 or fileType");
        return "Invalid input";
    }
    const buffer = Buffer.from(fileBase64, 'base64');
    console.log(buffer);

    if (fileType === 'pdf') {
        try {
            const data = await pdfParse(buffer); // ✅ parse PDF buffer
            if (!data || !data.text) {
                console.error("❌ PDF parsing returned no text");
                return "No text found in PDF";
            }
            console.log(data.text);
            return data.text;
        } catch (err) {
            console.error("❌ PDF parsing failed:", err);
            return "Error parsing PDF";
        }
    }
   else if (fileType === 'image'|| fileType === 'png' || fileType === 'jpg' || fileType === 'jpeg'||fileType==="webp") {
        const processedImage = await sharp(buffer)
          .resize(2000)
          .greyscale()
          .normalize()
          .toBuffer();
        
        const { data: { text } } = await tesseract.recognize(
          processedImage,
          'eng',
        //   { logger: m => console.log(m) }
        );
        // console.error("Extracted text from image:", text);
        return text;
    }

    // You can add more types like txt, png, jpg later
    return "Unsupported file type";
}

