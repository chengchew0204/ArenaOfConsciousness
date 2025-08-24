'use client'

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { v4 as uuidv4 } from 'uuid'

interface StreamState {
  isLive: boolean
  streamerId: string | null
  dominanceTime: number
  viewerCount: number
  recentSeizures: string[]
}

export default function Arena() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [streamState, setStreamState] = useState<StreamState>({
    isLive: false,
    streamerId: null,
    dominanceTime: 0,
    viewerCount: 0,
    recentSeizures: []
  })
  const [isStreaming, setIsStreaming] = useState(false)
  const [userId] = useState(() => uuidv4())
  
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001')
    setSocket(newSocket)

    // Socket event listeners
    newSocket.on('stream-state', (state: StreamState) => {
      setStreamState(state)
    })

    newSocket.on('stream-started', (streamerId: string) => {
      if (streamerId !== userId) {
        setStreamState(prev => ({ ...prev, isLive: true, streamerId }))
      }
    })

    newSocket.on('stream-ended', () => {
      setStreamState(prev => ({ ...prev, isLive: false, streamerId: null }))
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null
      }
    })

    newSocket.on('offer', async (offer: RTCSessionDescriptionInit, streamerId: string) => {
      if (streamerId !== userId) {
        await handleOffer(offer)
      }
    })

    newSocket.on('answer', async (answer: RTCSessionDescriptionInit) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(answer)
      }
    })

    newSocket.on('ice-candidate', async (candidate: RTCIceCandidateInit) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(candidate)
      }
    })

    return () => {
      newSocket.close()
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [userId])

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    })

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice-candidate', event.candidate)
      }
    }

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0]
      }
    }

    return pc
  }

  const handleOffer = async (offer: RTCSessionDescriptionInit) => {
    const pc = createPeerConnection()
    peerConnectionRef.current = pc

    await pc.setRemoteDescription(offer)
    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    if (socket) {
      socket.emit('answer', answer)
    }
  }

  const startStream = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })

      localStreamRef.current = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      // Create peer connection
      const pc = createPeerConnection()
      peerConnectionRef.current = pc

      // Add stream to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream)
      })

      // Create offer
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      // Send offer to server
      if (socket) {
        socket.emit('start-stream', { offer, streamerId: userId })
        setIsStreaming(true)
      }

    } catch (error) {
      console.error('Error starting stream:', error)
      alert('Failed to access camera/microphone. Please allow permissions and try again.')
    }
  }

  const stopStream = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop())
      localStreamRef.current = null
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null
    }

    if (socket) {
      socket.emit('stop-stream', userId)
    }

    setIsStreaming(false)
  }

  const seizeControl = () => {
    if (streamState.isLive && socket) {
      socket.emit('seize-control', userId)
    }
    startStream()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="arena-container">
      {/* Neural Map */}
      <div className="neural-map">
        <div className="connection-count">Consciousness Nodes: {streamState.viewerCount}</div>
        {streamState.recentSeizures.map((seizure, index) => (
          <div key={index} className="seizure-log">
            → {seizure}
          </div>
        ))}
      </div>

      {/* Status Indicator */}
      <div className="status-indicator">
        {streamState.isLive ? (
          <div className="live-indicator">● CONSCIOUSNESS ACTIVE</div>
        ) : (
          <div className="waiting-indicator">○ Awaiting Consciousness</div>
        )}
      </div>

      {/* Main Stream Container */}
      <div className="stream-container">
        {isStreaming ? (
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="stream-video"
          />
        ) : streamState.isLive ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="stream-video"
          />
        ) : (
          <div className="no-stream">
            The arena awaits consciousness...
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="controls">
        {streamState.isLive && !isStreaming && (
          <div className="dominance-counter">
            Dominance: {formatTime(streamState.dominanceTime)}
          </div>
        )}
        
        {isStreaming ? (
          <button className="go-live-btn" onClick={stopStream}>
            End Transmission
          </button>
        ) : (
          <button 
            className="go-live-btn" 
            onClick={streamState.isLive ? seizeControl : startStream}
          >
            {streamState.isLive ? 'SEIZE CONTROL' : 'GO LIVE'}
          </button>
        )}
      </div>
    </div>
  )
}
