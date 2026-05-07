# 🧠 LiveSysDesign AI Engine

AI-powered architectural analysis and bottleneck detection service.

## 🚀 Responsibilities

- **Insight Generation**: Analyzes simulation data to identify critical paths and bottlenecks.
- **Failure Prediction**: Correlates metrics to predict potential system-wide failures.
- **Optimization Suggestions**: Provides feedback on how to improve system resiliency.

## 🛠️ Tech Stack

- **Framework**: FastAPI (Python)
- **Runtime**: Uvicorn
- **AI/ML**: (Add specific models/libraries here as used)

## 📦 Getting Started

1. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the service**:
   ```bash
   uvicorn main:app --port 6000 --reload
   ```
