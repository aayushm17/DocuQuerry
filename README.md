# Document Chatbot with AI-Powered Querying

## Project Name: **DocuQuery AI**

### Description
DocuQuery AI is an intelligent document processing and query-response system that allows users to upload scanned PDFs, extract text using Optical Character Recognition (OCR), and ask questions based on the extracted text. The system uses:
- **Tesseract.js** for OCR
- **Google Gemini AI** for text-based Q&A
- **Express.js** for the backend API
- **React.js** for the frontend

This project enables users to interact with their documents dynamically, making information retrieval seamless and efficient.

---

## Features
✅ Upload scanned PDF files
✅ Extract text using OCR (Tesseract.js)
✅ Process PDF images for improved OCR accuracy
✅ Query extracted content using Google Gemini AI
✅ Interactive chat-based document analysis

---

## Tech Stack
### Backend:
- Node.js
- Express.js
- Multer (File Uploads)
- Tesseract.js (OCR)
- Google Gemini AI API
- Poppler (PDF Image Conversion)
- dotenv (Environment Variables)

### Frontend:
- React.js
- Axios (API Requests)
- CSS (Basic Styling)

---

## Installation & Setup
### Prerequisites
- Node.js (v16 or later)
- npm or yarn
- Google Gemini API Key (stored in `.env` as `GEMINI_API_KEY`)

### 1️⃣ Clone the Repository
```sh
git clone <repository-link>
cd <project-folder>
```

### 2️⃣ Backend Setup
```sh
cd backend
npm install
```
Create a `.env` file in the backend directory and add your Google Gemini API key:
```
GEMINI_API_KEY=your_api_key_here
```
Run the backend server:
```sh
node index.js
```

### 3️⃣ Frontend Setup
```sh
cd frontend
npm install
npm start
```

---

## Usage
1️⃣ Upload scanned PDF files via the UI
2️⃣ The backend extracts text using OCR and stores it
3️⃣ Enter a query related to the uploaded documents
4️⃣ Google Gemini AI responds with an answer based on extracted text

---

## API Endpoints
### Upload Documents
**POST** `/upload`
- Uploads scanned PDF files and extracts text using OCR.
- Response: `{ message: "Files uploaded successfully!", uploadedFiles: [fileNames] }`

### Query Documents
**POST** `/chat`
- Accepts a user query and fetches relevant information from extracted text.
- Response: `{ response: "Generated AI response." }`

### Health Check
**GET** `/`
- Simple endpoint to check if the server is running.

---

## Possible Enhancements
🔹 Support for additional document formats (Word, TXT, etc.)
🔹 Improved OCR accuracy with pre-processing techniques
🔹 Multi-language support for document processing
🔹 Secure user authentication & document access

---

## License
This project is open-source and available under the MIT License.

---

## Author
Developed by [Your Name] - Contributions welcome!

