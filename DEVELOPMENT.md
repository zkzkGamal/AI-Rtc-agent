# Development Setup Instructions

## 📋 Prerequisites

- Python 3.10+
- Node.js 18+
- Git

## 🔧 Backend (Python Server)

### 1. Create Virtual Environment

```bash
cd server
python -m venv venv
```

### 2. Activate Virtual Environment

**On macOS/Linux:**
```bash
source venv/bin/activate
```

**On Windows:**
```bash
venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

### 4. Run Server

```bash
python main.py
```

### 5. Run Tests

```bash
pytest tests/ -v
pytest tests/test_audio_processor.py -v --cov=.
```

### 6. Code Quality

```bash
# Format code
black .

# Check style
flake8 .

# Sort imports
isort .

# Type checking
mypy .
```

## 🎨 Frontend (React Client)

### 1. Install Dependencies

```bash
cd client
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Opens at http://localhost:5173

### 3. Build for Production

```bash
npm run build
```

Output in `dist/`

### 4. Preview Production Build

```bash
npm run preview
```

### 5. Code Quality

```bash
# With ESLint (if configured)
npm run lint

# With Prettier (if configured)
npm run format
```

## 🧪 Testing

### Backend

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_audio_processor.py

# With coverage report
pytest --cov=. --cov-report=html

# Watch mode (auto-run on changes)
pytest-watch
```

### Frontend

```bash
# With Jest (if configured)
npm test

# With coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

## 🔍 Debugging

### Python Server

1. **Using print/logging:**
   ```python
   import logging
   logger = logging.getLogger(__name__)
   logger.debug("Debug message")
   ```

2. **Using debugger:**
   ```python
   import pdb
   pdb.set_trace()  # Breakpoint
   ```

3. **Using VSCode:**
   - Install Python extension
   - Create `.vscode/launch.json`:
     ```json
     {
       "version": "0.2.0",
       "configurations": [
         {
           "name": "Python: Current File",
           "type": "python",
           "request": "launch",
           "program": "${file}",
           "console": "integratedTerminal"
         }
       ]
     }
     ```

### JavaScript Client

1. **Browser DevTools (F12):**
   - Console tab for logs
   - Network tab for requests
   - Sources tab for breakpoints

2. **VSCode Debugger:**
   - Install Debugger for Chrome
   - Set breakpoints
   - Press F5 to start debugging

## 📚 Project Structure for Development

```
AI-RTC-Agent/
├── server/
│   ├── venv/                    # Virtual environment (local)
│   ├── main.py                  # Entry point
│   ├── audio_processor.py       # Audio logic
│   ├── requirements.txt         # Production deps
│   ├── requirements-dev.txt     # Dev deps
│   ├── tests/                   # Test files
│   └── README.md
│
├── client/
│   ├── node_modules/            # Dependencies (local)
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
│
├── README.md                    # Main docs
├── CONTRIBUTING.md              # Contribution guide
└── QUICKSTART.md                # Quick start
```

## 🔄 Development Workflow

### Making Changes

1. Create feature branch:
   ```bash
   git checkout -b feature/my-feature
   ```

2. Make changes in server/client

3. Run tests and quality checks:
   ```bash
   # Server
   cd server
   pytest
   black . && flake8 .
   
   # Client
   cd ../client
   npm test
   npm run lint
   ```

4. Test manually:
   - Start server: `cd server && python main.py`
   - Start client: `cd client && npm run dev`
   - Test in browser

5. Commit:
   ```bash
   git add .
   git commit -m "Add my feature"
   ```

6. Push:
   ```bash
   git push origin feature/my-feature
   ```

7. Open Pull Request on GitHub

## 🚀 Common Commands

```bash
# Backend
cd server
python main.py                           # Run server
pytest tests/                           # Run tests
black . && isort .                      # Format code
pytest --cov=. --cov-report=html       # Coverage report

# Frontend
cd client
npm run dev                              # Dev server
npm run build                            # Production build
npm test                                 # Run tests
npm run lint                             # Check style

# Both
cd ..
git add .
git commit -m "message"
git push origin branch-name
```

## 📝 Git Workflow

```bash
# Update from main
git fetch origin
git rebase origin/main

# Before pushing
git status
git diff
git add .
git commit -m "Clear message"

# Push feature branch
git push origin feature/name

# On GitHub: Create Pull Request
# After review: Merge to main
```

## ✅ Checklist Before Committing

- [ ] Code follows project style guide
- [ ] Tests pass locally
- [ ] No console errors/warnings
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] Commit message is clear

## 💡 Tips

1. **Always use virtual environments** for Python
2. **Use branches** for feature development
3. **Write tests** for new functionality
4. **Format code** before committing
5. **Write clear commit messages**
6. **Test on both server and client** changes
7. **Keep commits atomic** (one feature per commit)

## 🆘 Help

### Python Issues

```bash
# Update pip
pip install --upgrade pip

# Clear cache
pip cache purge

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Node Issues

```bash
# Clear npm cache
npm cache clean --force

# Reinstall modules
rm -rf node_modules package-lock.json
npm install
```

### Git Issues

```bash
# Check status
git status

# View changes
git diff

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard changes
git checkout -- .
```

---

**Happy developing!** 🚀
