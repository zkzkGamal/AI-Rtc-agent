# Contributing to AI-RTC-Agent

Thank you for your interest in contributing! This guide explains how to contribute to the project.

## 📋 Before You Start

- Read the main [README.md](README.md)
- Review [Server README](server/README.md) and [Client README](client/README.md)
- Check existing [Issues](https://github.com/your-repo/issues)
- Set up development environment (see below)

## 🛠️ Development Setup

### 1. Fork and Clone

```bash
git clone https://github.com/your-username/AI-RTC-Agent.git
cd AI-RTC-Agent
```

### 2. Setup Server

```bash
cd server
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### 3. Setup Client

```bash
cd client
npm install
```

## 🔄 Workflow

1. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write clean, documented code
   - Follow existing code style
   - Add comments for complex logic

3. **Test Your Changes**
   - Run server: `cd server && python main.py`
   - Run client: `cd client && npm run dev`
   - Test in browser with 2+ tabs

4. **Commit & Push**
   ```bash
   git add .
   git commit -m "Add descriptive commit message"
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request**
   - Open PR on GitHub
   - Describe changes clearly
   - Link any related issues

## 📝 Code Style

### Python (Server)

- Follow [PEP 8](https://pep8.org/) guidelines
- Use type hints where possible
- Add docstrings for classes and functions

```python
async def process_audio(self, pcm_bytes: bytes, sample_rate: int) -> None:
    """
    Process incoming audio frames.
    
    Args:
        pcm_bytes: Raw 16-bit PCM audio data
        sample_rate: Sample rate in Hz
    """
    pass
```

### JavaScript (Client)

- Use ES6+ features
- Follow React best practices
- Use meaningful variable names

```javascript
const [status, setStatus] = useState("ready");
const [audioStream, setAudioStream] = useState(null);

const handleStartClick = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    setAudioStream(stream);
  } catch (error) {
    console.error("Microphone access denied:", error);
  }
};
```

## 🐛 Bug Reports

Include:
- What happened (describe the bug)
- What you expected
- Steps to reproduce
- Environment (OS, Python version, browser)
- Error logs/screenshots

**Example:**
```
Title: Audio not saving when server on Windows

Description:
When I start the server on Windows 10 and record audio,
no WAV files are created.

Steps:
1. python main.py (on Windows)
2. Connect client and start recording
3. Check server/utterances/ directory

Expected: WAV files should be saved
Actual: Directory remains empty

Logs:
[INFO] Audio track started, listening...
[ERROR] [session_id] Permission denied: utterances/session_id
```

## 💡 Feature Requests

Describe:
- What feature you want
- Why it would be useful
- Example use case

**Example:**
```
Title: Add audio playback visualization

Description:
Add a waveform or volume meter visualization while recording
so users can see audio levels in real-time.

Use case:
Users want to verify microphone is working and see
their speech being detected.
```

## ✅ Testing

### Server Tests

```bash
cd server
python -m pytest tests/ -v
python -m pytest tests/test_audio_processor.py -v
```

### Manual Testing

1. **Basic Connection:**
   - Start server
   - Connect one client
   - Verify connection status

2. **Audio Flow:**
   - Two clients, same room
   - Both record simultaneously
   - Check audio files created

3. **Error Handling:**
   - Close connection unexpectedly
   - Disable microphone mid-call
   - Disconnect network

4. **Cross-Browser:**
   - Test on Chrome, Firefox, Safari
   - Test on desktop and mobile
   - Test on different networks

## 📚 Documentation

When contributing code:
1. Add inline comments for complex logic
2. Update README if changing behavior
3. Document new configuration options
4. Add examples for new features

**Example:**
```python
async def add_frame(self, pcm_bytes: bytes, sample_rate: int) -> None:
    """
    Add audio frame to processing queue.
    
    This method is called for every frame received from WebRTC.
    Frames are downsampled to 16kHz for VAD processing.
    
    Args:
        pcm_bytes: Raw 16-bit mono PCM audio data
        sample_rate: Original sample rate (typically 48000)
        
    Example:
        >>> await session.add_frame(pcm_data, 48000)
    """
```

## 🚀 Large Changes

For significant changes:
1. Create an issue first to discuss
2. Get feedback from maintainers
3. Create a detailed PR description
4. Be prepared for code review

## 📋 PR Checklist

Before submitting:
- [ ] Code follows project style
- [ ] Tests pass locally
- [ ] No console errors/warnings
- [ ] Documentation updated
- [ ] Commit messages are clear
- [ ] Feature works as intended

## 🎯 Priority Areas

We especially need help with:
1. **Audio Quality** – Better downsampling, compression
2. **UI/UX** – Visual improvements, accessibility
3. **Testing** – Unit tests, integration tests
4. **Documentation** – Examples, guides, tutorials
5. **Performance** – Optimization, benchmarking
6. **Deployment** – Docker, cloud platform guides

## 🙏 Thank You!

Your contributions make this project better. Questions? Create an issue or reach out!

---

**Happy contributing!** 🚀
