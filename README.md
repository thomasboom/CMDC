# CMDC

A web application that uses AI (Google Gemini) to analyze and determine if shell commands are safe to execute.

## Features

- Input any shell command for analysis
- AI-powered explanation of what the command does
- Safety assessment (Safe, Potentially Dangerous, Extremely Dangerous)
- Detailed risk analysis
- Recommendations for safe execution
- Choice between fast (lite) model for quick results or normal model for more accuracy
- Clean output display after analysis
- Uses the Gemini 2.5 Flash models

## Prerequisites

- Node.js (v16 or higher)
- A Google Gemini API key (get one from [Google AI Studio](https://aistudio.google.com/))

## Setup Instructions

1. Clone or download this repository:
   ```bash
   git clone <repository-url>
   cd command-safety-checker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Edit `.env` and replace `your_api_key_here` with your actual Gemini API key

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Usage

1. Select the model type (Fast & Less Accurate or Normal & More Accurate)
2. Input the command you want to analyze in the large text box
3. Click "Analyze Command"
4. Review the AI's explanation and safety assessment
5. Follow the recommendations before executing the command
6. Click "New Analysis" to run another check

## Security Note

- Your API key is stored in the environment and accessed securely through the Vite build system
- Always exercise caution before executing unfamiliar commands, even after AI analysis
- The AI analysis is not foolproof and should be used as a supplementary safety measure

## Technologies Used

- React (v18) with TypeScript
- Google Generative AI SDK
- Bootstrap for UI styling
- Vite as the build tool
- Uses the efficient Gemini 2.5 Flash model for quick analysis