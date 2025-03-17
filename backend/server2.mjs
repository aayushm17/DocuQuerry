import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { fileURLToPath } from 'url';
import fs from 'fs';

import Tesseract from 'tesseract.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import poppler from "pdf-poppler";
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

const upload = multer({ dest: 'uploads/' });
let extractedTexts = {};

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};

const convertPDFToImages = async (filePath, outputDir) => {
    try {
        const opts = {
            format: 'png',
            out_dir: outputDir,
            out_prefix: path.basename(filePath, path.extname(filePath)),
            page: null
        };
        await poppler.convert(filePath, opts);
        return fs.readdirSync(outputDir).map(file => path.join(outputDir, file));
    } catch (error) {
        console.error("Error converting PDF to images:", error);
        return [];
    }
};
const preprocessImage = (imagePath) => {
    const img = cv.imread(imagePath);
    let gray = img.bgrToGray();
    gray = gray.gaussianBlur(new cv.Size(5, 5), 0);
    gray = gray.adaptiveThreshold(255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 11, 2);
    cv.imwrite(imagePath, gray);
};


const extractTextFromScannedPDF = async (dataBuffer, fileName) => {
    try {
        const uploadDir = path.join(__dirname, "uploads");
        const outputDir = path.join(__dirname, "temp_images");
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

        const tempFilePath = path.join(uploadDir, fileName);
        fs.writeFileSync(tempFilePath, dataBuffer);

        console.log(`📜 Converting scanned PDF: ${fileName} to images...`);
        const images = await convertPDFToImages(tempFilePath, outputDir);

        if (images.length === 0) throw new Error("No images generated from PDF.");

        console.log(`🔠 Performing OCR on ${fileName}...`);
        let extractedText = "";

        for (const image of images) {
            const { data: { text } } = await Tesseract.recognize(image, "eng", {
                tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
                psm: 6,  // Fully automatic page segmentation
                oem: 1,  // LSTM neural network mode
            });
            extractedText += text + "\n";
        }

        fs.unlinkSync(tempFilePath);
        console.log(`📄 Extracted Text from ${fileName}:\n${extractedText}`);
        return extractedText.trim();
    } catch (error) {
        console.error("Error extracting text from scanned PDF:", error);
        return null;
    }
};


app.post('/upload', upload.array('files', 15), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) return res.status(400).json({ message: "No files uploaded." });
        
        let uploadedFiles = [];
        for (const file of req.files) {
            const dataBuffer = fs.readFileSync(file.path);
            const extractedText = await extractTextFromScannedPDF(dataBuffer, file.originalname);
            if (extractedText) {
                extractedTexts[file.originalname] = extractedText;
                uploadedFiles.push(file.originalname);
            }
            fs.unlinkSync(file.path);
        }

        res.json({ message: "Files uploaded successfully!", uploadedFiles });
    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ message: "Error processing the files." });
    }
});

app.post('/chat', async (req, res) => {
    const { query, fileNames } = req.body;
    if (!fileNames || fileNames.length === 0) return res.status(400).json({ message: "No files provided for querying." });

    let combinedText = fileNames.map(fileName => extractedTexts[fileName] ? `\n\n--- From ${fileName} ---\n\n${extractedTexts[fileName]}` : '').join('');
    if (!combinedText) return res.status(404).json({ message: "No relevant documents found." });

    try {
        const chatSession = model.startChat({ generationConfig, history: [] });
        const result = await chatSession.sendMessage(`Based on the following documents, answer the question:\n\n${combinedText}\n\nUser Question: ${query}`);
        res.json({ response: result.response.text() });
    } catch (error) {
        console.error("🚨 AI Error:", error);
        res.status(500).json({ response: "Error generating response from AI." });
    }
});

app.get('/', (req, res) => {
    res.json({ message: 'Hello World' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
