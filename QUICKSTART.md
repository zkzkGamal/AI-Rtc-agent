# Quick Start Guide

Get AI-RTC-Agent running in 5 minutes!

## 📋 Requirements

- Python 3.10+ (for server)
- Node.js 18+ (for client)
- Git

## ⚡ Quick Setup

### Step 1: Clone Repository
```bash
git clone https://github.com/your-repo/AI-RTC-Agent.git
cd AI-RTC-Agent
```

### Step 2: Start Server (Terminal 1)
```bash
cd server
pip install -r requirements.txt
python main.py
```

**Expected output:**
```
[INFO] aiortc.rtcpeerconnection: RTCPeerConnection created
[INFO] main: Server running on http://0.0.0.0:8080
```

### Step 3: Start Client (Terminal 2)
```bash
cd client
npm install
npm run dev
```

**Expected output:**
```
VITE v5.4.2  ready in XXX ms

➜  Local:   http://localhost:5173/
```

### Step 4: Open in Browser

Open **two browser tabs**:
- Tab 1: `http://localhost:5173`
- Tab 2: `http://localhost:5173`

### Step 5: Test Connection

1. **Tab 1:**
   - Click "Start Recording"
   - Grant microphone permission
   - Wait for "WebRTC connected"

2. **Tab 2:**
   - Click "Start Recording"
   - Grant microphone permission
   - Wait for "WebRTC connected"

3. **Speak normally:**
   - Say something in one tab
   - You should hear it in the other tab
   - Check `server/utterances/` for recorded WAV files

4. **Stop:**
   - Click "Stop" on both tabs

## 🎉 Success!

If you see:
- ✅ Status: "WebRTC connected, streaming audio..."
- ✅ Audio playing on both sides
- ✅ WAV files in `server/utterances/`

**You're all set!**

## 🔧 Common Issues

| Issue | Solution |
|-------|----------|
| "Address already in use" | Change port in `server/main.py` |
| CORS error | Server might not be running; check http://0.0.0.0:8080 |
| No microphone prompt | Refresh page; check browser microphone permissions |
| No audio heard | Check if audio is muted; verify WebRTC status |
| No WAV files created | Check `server/utterances/` permissions; increase silence_threshold |

## 📚 Next Steps

- Read [Main README](README.md) for detailed documentation
- Check [Server README](server/README.md) for configuration options
- Check [Client README](client/README.md) for customization
- Explore [Contributing Guidelines](CONTRIBUTING.md) to contribute

## 💡 Tips

1. **Use Incognito/Private Mode** for cleaner microphone permissions
2. **Same Room Name** – Both clients must use the same room
3. **Monitor Logs** – Server logs show connection state and audio processing
4. **Test on Same Network** – For best results, use same WiFi/LAN

## 🚀 Production Deployment

For production setup, see:
- [Server README - Production](server/README.md#-production-deployment)
- [Client README - Production](client/README.md#-production-build)

---

**Need help?** Create an [issue](https://github.com/your-repo/issues) on GitHub
