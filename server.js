const { createServer } = require('http')
const { Server } = require('socket.io')

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})

// Global state
let currentStream = {
  isLive: false,
  streamerId: null,
  startTime: null,
  dominanceTime: 0
}

let connectedUsers = new Map()
let recentSeizures = []

// Update dominance time every second
setInterval(() => {
  if (currentStream.isLive && currentStream.startTime) {
    currentStream.dominanceTime = Math.floor((Date.now() - currentStream.startTime) / 1000)
    broadcastStreamState()
  }
}, 1000)

function broadcastStreamState() {
  io.emit('stream-state', {
    isLive: currentStream.isLive,
    streamerId: currentStream.streamerId,
    dominanceTime: currentStream.dominanceTime,
    viewerCount: connectedUsers.size,
    recentSeizures: recentSeizures.slice(-5) // Keep only last 5 seizures
  })
}

function addSeizureLog(message) {
  recentSeizures.push(`${new Date().toLocaleTimeString()}: ${message}`)
  if (recentSeizures.length > 10) {
    recentSeizures = recentSeizures.slice(-10)
  }
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)
  connectedUsers.set(socket.id, { joinTime: Date.now() })
  
  // Send current state to new user
  socket.emit('stream-state', {
    isLive: currentStream.isLive,
    streamerId: currentStream.streamerId,
    dominanceTime: currentStream.dominanceTime,
    viewerCount: connectedUsers.size,
    recentSeizures: recentSeizures.slice(-5)
  })

  socket.on('start-stream', ({ offer, streamerId }) => {
    console.log('Stream started by:', streamerId)
    
    // If there's already a stream, this is a seizure
    if (currentStream.isLive) {
      addSeizureLog(`Consciousness seized by new entity (${currentStream.dominanceTime}s survived)`)
      // Notify current streamer that they've been replaced
      io.emit('stream-ended')
    } else {
      addSeizureLog('New consciousness emerged')
    }

    // Update current stream
    currentStream = {
      isLive: true,
      streamerId,
      startTime: Date.now(),
      dominanceTime: 0
    }

    // Broadcast the new stream to all clients except the streamer
    socket.broadcast.emit('offer', offer, streamerId)
    socket.broadcast.emit('stream-started', streamerId)
    
    broadcastStreamState()
  })

  socket.on('stop-stream', (streamerId) => {
    if (currentStream.streamerId === streamerId) {
      console.log('Stream ended by:', streamerId)
      addSeizureLog(`Consciousness voluntarily ended (${currentStream.dominanceTime}s survived)`)
      
      currentStream = {
        isLive: false,
        streamerId: null,
        startTime: null,
        dominanceTime: 0
      }

      io.emit('stream-ended')
      broadcastStreamState()
    }
  })

  socket.on('seize-control', (streamerId) => {
    if (currentStream.isLive) {
      console.log('Control seized by:', streamerId)
      addSeizureLog(`Control seized! Previous consciousness lasted ${currentStream.dominanceTime}s`)
      
      // End current stream
      io.emit('stream-ended')
      
      // Reset state - the new stream will be started with start-stream event
      currentStream = {
        isLive: false,
        streamerId: null,
        startTime: null,
        dominanceTime: 0
      }
    }
  })

  socket.on('answer', (answer) => {
    // Forward answer to the current streamer
    if (currentStream.streamerId) {
      const streamerSocket = [...connectedUsers.entries()]
        .find(([id, user]) => user.streamerId === currentStream.streamerId)
      
      if (streamerSocket) {
        io.to(streamerSocket[0]).emit('answer', answer)
      }
    }
  })

  socket.on('ice-candidate', (candidate) => {
    // Forward ICE candidate to all other clients
    socket.broadcast.emit('ice-candidate', candidate)
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
    
    // If the disconnected user was streaming, end the stream
    const user = connectedUsers.get(socket.id)
    if (user && currentStream.streamerId === user.streamerId) {
      addSeizureLog(`Consciousness disconnected (${currentStream.dominanceTime}s survived)`)
      currentStream = {
        isLive: false,
        streamerId: null,
        startTime: null,
        dominanceTime: 0
      }
      io.emit('stream-ended')
    }

    connectedUsers.delete(socket.id)
    broadcastStreamState()
  })
})

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`Arena of Consciousness server running on port ${PORT}`)
  console.log('The arena awaits...')
})
