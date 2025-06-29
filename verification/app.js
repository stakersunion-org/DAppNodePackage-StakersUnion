#!/usr/bin/env node

const express = require('express')
const path = require('path')
require('dotenv').config()

const app = express()
const PORT = 3000

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')))

// API endpoint to get environment variables
app.get('/api/env', (req, res) => {
  const envVars = {
    ELIGIBLE_ADDRESS: process.env.ELIGIBLE_ADDRESS || 'Not set',
    _DAPPNODE_GLOBAL_EXECUTION_CLIENT_MAINNET:
      process.env._DAPPNODE_GLOBAL_EXECUTION_CLIENT_MAINNET || 'Not set',
    _DAPPNODE_GLOBAL_CONSENSUS_CLIENT_MAINNET:
      process.env._DAPPNODE_GLOBAL_CONSENSUS_CLIENT_MAINNET || 'Not set',
  }
  res.json(envVars)
})

// Serve the main HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Stakers Union DAppNode verification service starting...')
  console.log(`✅ Web UI available at http://localhost:${PORT}`)
  console.log('📊 Service status: ACTIVE')
  console.log('🔗 Ready to verify DAppNode operations')
})

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...')
  process.exit(0)
})
