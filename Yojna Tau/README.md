# Yojna Tau

## About the Project
Yojna Tau is a RAG (Retrieval-Augmented Generation) application designed to provide users in Haryana with easy access to information about government schemes. Through an intuitive chat interface, users can interact with an advanced AI model to learn about various initiatives and programs offered by the Haryana government.

The backend leverages Python to set up the RAG system using a PDF located in the `Backend` folder, while the frontend ensures a seamless user experience for engaging with the AI. The application uses **Llama 3.1-70b** via the **Groq API**, which is hardcoded into the backend code.

Key features of the application include:
- Start a new conversation at any time.
- Toggle between English and Hindi languages seamlessly.
- A streamlined user interface for smooth interaction with the AI.

## Folder Structure
```
Yojna Tau
├── Backend
└── Frontend
```

## Steps to Run the Project on a Local Machine

### Prerequisites
- Ensure **Python** is installed on your machine.
- Ensure **Node.js** and **npm** are installed.

### Backend Setup
1. Navigate to the `Backend` folder:
   ```bash
   cd Backend
   ```
2. (Optional but recommended) Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the backend server:
   ```bash
   python app.py
   ```
5. Wait for the server to start and for RAG to set up. The backend server will be available at:
   ```
   http://127.0.0.1:10000
   ```

### Frontend Setup
1. Navigate to the `Frontend` folder:
   ```bash
   cd ../Frontend
   ```
2. Install Node.js dependencies:
   ```bash
   npm install
   ```
3. Start the frontend server:
   ```bash
   npm start
   ```

### Access the Application
Once both the backend and frontend servers are running, you can access the application in your web browser at:
```
http://localhost:3000
```

## Deployment

### Backend
- The backend has not been deployed yet.

### Frontend
- The frontend is deployed and accessible at:
  ```
  https://yojnatau.vercel.app/
  ```
- For the frontend deployment process, you can refer to the GitHub repository:
  ```
  https://github.com/ParthGanjoo/yojnatau
  ```

### Post-Backend Deployment Instructions
- Once the backend is deployed, update the static backend URL in the `Frontend/app.js` file at **line 15** to point to the deployed backend.
- After this update, the application will be fully functional.

