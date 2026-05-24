import { createServer } from 'http'
import { Server } from 'socket.io'
import express from 'express'
import cors from 'cors'

const PORT = process.env.PORT || 3001
const SECRET = process.env.SOCKET_SECRET || 'pos-secret-key'

const app = express()
app.use(cors())
app.use(express.json())

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
})

// Store connected clients count
let connectedClients = 0

io.on('connection', (socket) => {
  connectedClients++
  console.log(`[connect] ${socket.id} (${connectedClients} total)`)

  socket.on('disconnect', () => {
    connectedClients--
    console.log(`[disconnect] ${socket.id} (${connectedClients} total)`)
  })
})

// HTTP endpoint for Laravel to emit events
app.post('/emit', (req, res) => {
  const { event, data, secret } = req.body

  if (secret !== SECRET) {
    return res.status(401).json({ error: 'Invalid secret' })
  }

  if (!event) {
    return res.status(400).json({ error: 'Missing event name' })
  }

  io.emit(event, data || {})
  console.log(`[emit] ${event}`, data)

  res.json({ ok: true, clients: connectedClients })
})

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', clients: connectedClients })
})

httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`)
})
