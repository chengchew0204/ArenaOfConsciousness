# Deployment Guide - Arena of Consciousness

## 🚀 Quick Deploy Options

### **Option 1: Vercel + Railway (Recommended - Free)**

**Frontend (Vercel):**
1. Push code to GitHub
2. Connect to Vercel
3. Set environment variable: `NEXT_PUBLIC_SOCKET_URL=https://your-railway-app.railway.app`

**Backend (Railway):**
1. Create new Railway project
2. Connect your GitHub repo
3. Set environment variables:
   - `CLIENT_URL=https://your-vercel-app.vercel.app`
   - `PORT=3001`

### **Option 2: All-in-One (Railway)**

1. Create Railway project
2. Set environment variables:
   - `CLIENT_URL=https://your-app.railway.app`
   - `PORT=3001`
3. Deploy both frontend and backend together

### **Option 3: VPS (DigitalOcean/Render)**

1. Deploy to VPS
2. Set up PM2 for process management
3. Configure nginx reverse proxy
4. Set up SSL certificates

## 🔧 Environment Variables

### **Frontend (.env.local):**
```
NEXT_PUBLIC_SOCKET_URL=https://your-backend-url.com
```

### **Backend (.env):**
```
CLIENT_URL=https://your-frontend-url.com
PORT=3001
```

## 📋 Deployment Checklist

- [ ] HTTPS enabled (required for camera access)
- [ ] Environment variables configured
- [ ] CORS settings updated
- [ ] STUN/TURN servers configured (for production WebRTC)
- [ ] Domain configured
- [ ] SSL certificates installed

## 🌐 Production Considerations

1. **WebRTC**: Add proper STUN/TURN servers for NAT traversal
2. **Scaling**: Consider Redis for session management if needed
3. **Monitoring**: Add logging and error tracking
4. **Security**: Implement rate limiting and DDoS protection

## 💰 Cost Estimates

- **Vercel + Railway**: Free tier available
- **Render**: Free tier available  
- **DigitalOcean**: $5-10/month
- **Heroku**: $7/month minimum

## 🚨 Important Notes

- Camera access requires HTTPS in production
- WebRTC needs proper STUN/TURN servers for production
- Consider bandwidth costs for video streaming
- Monitor server resources during peak usage
