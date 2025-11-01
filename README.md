# Smart Document Formatter

A full-stack application for intelligent document processing and formatting using AI agents. The system consists of a Python FastAPI backend with document processing capabilities and a React TypeScript frontend for user interaction.

## 🚀 Features

- **AI-Powered Document Processing**: Uses Groq API for intelligent document analysis and formatting
- **Template-Based Formatting**: Supports various document templates (Business Proposals, Course Plans, etc.)
- **Real-time Processing**: WebSocket support for live processing updates
- **Admin Dashboard**: Complete analytics and job management system
- **User Authentication**: Secure login/signup system
- **File Upload**: Drag-and-drop document upload interface
- **Document Preview**: Real-time preview of processed documents

## 📁 Project Structure

```
├── smartdoc_formatter_j/          # Python Backend
│   ├── smartdoc_agent/            # Main application code
│   │   ├── api/                   # FastAPI endpoints
│   │   ├── core/                  # AI agents and processing logic
│   │   ├── utils/                 # Utility functions
│   │   └── templates/             # Document templates
│   └── .env                       # Environment variables (create this)
├── agentic-document-scribe/       # React Frontend
│   ├── src/                       # Source code
│   │   ├── components/            # React components
│   │   ├── pages/                 # Page components
│   │   └── contexts/              # React contexts
│   └── package.json               # Frontend dependencies
└── README.md                      # This file
```

## 🛠️ Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn
- Groq API key (get from [Groq Console](https://console.groq.com/))

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Indrajithrnair/Smart-Doc-Formatter.git
   cd Smart-Doc-Formatter
   ```

2. **Set up Python environment**
   ```bash
   cd smartdoc_formatter_j
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r smartdoc_agent/requirements.txt
   ```

4. **Create environment file**
   Create a `.env` file in the `smartdoc_formatter_j` directory:
   ```env
   GROQ_API_KEYS="your_groq_api_key_here"
   SECRET_KEY=your_secret_key_here
   FLASK_APP=app.py
   ```

5. **Run the backend**
   ```bash
   python run_api.py
   ```
   The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd agentic-document-scribe
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   The frontend will be available at `http://localhost:5173`

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `smartdoc_formatter_j` directory with:

- `GROQ_API_KEYS`: Your Groq API key for AI processing
- `SECRET_KEY`: Secret key for JWT token generation
- `FLASK_APP`: Entry point for the Flask application

### API Endpoints

The backend provides several endpoints:

- `POST /api/process-document`: Process uploaded documents
- `GET /api/jobs/{job_id}`: Get job status and results
- `POST /api/auth/login`: User authentication
- `GET /api/admin/analytics`: Admin analytics data
- `WebSocket /ws/{job_id}`: Real-time processing updates

## 📚 Usage

1. **Start both servers** (backend on :8000, frontend on :5173)
2. **Open the frontend** in your browser
3. **Upload a document** using the drag-and-drop interface
4. **Select a template** for formatting
5. **Monitor processing** in real-time
6. **Download the formatted document** when complete

## 🔐 Admin Access

The application includes an admin dashboard with:

- Job management and monitoring
- System analytics and metrics
- User management
- Configuration settings
- Log viewing

Access the admin panel through the frontend interface with admin credentials.

## 🧪 Testing

### Backend Tests
```bash
cd smartdoc_formatter_j
python -m pytest smartdoc_agent/tests/
```

### Frontend Tests
```bash
cd agentic-document-scribe
npm test
```

## 📦 Dependencies

### Backend (Python)
- FastAPI - Web framework
- LangChain - AI agent framework
- Groq - AI model integration
- python-docx - Document processing
- Uvicorn - ASGI server

### Frontend (React)
- React 18 - UI framework
- TypeScript - Type safety
- Tailwind CSS - Styling
- shadcn/ui - UI components
- React Router - Navigation
- React Query - Data fetching

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **Backend won't start**: Check if all Python dependencies are installed and .env file is configured
2. **Frontend build fails**: Ensure Node.js version is 16+ and all npm packages are installed
3. **API connection issues**: Verify backend is running on port 8000 and CORS is configured
4. **Document processing fails**: Check Groq API key is valid and has sufficient credits

### Getting Help

- Check the logs in the backend console
- Use browser developer tools for frontend issues
- Ensure all environment variables are set correctly
- Verify API endpoints are accessible

## 🔗 Links

- [Groq API Documentation](https://console.groq.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)