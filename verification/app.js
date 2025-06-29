#!/usr/bin/env node

const express = require('express')
const path = require('path')
const fetch = require('node-fetch')
require('dotenv').config()

const app = express()
const PORT = 80

// Middleware to parse JSON bodies
app.use(express.json())

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

// API endpoint to get configuration (API_ENDPOINT and API_SECRET)
app.get('/api/config', (req, res) => {
  const config = {
    API_ENDPOINT: process.env.API_ENDPOINT || '',
    API_SECRET: process.env.API_SECRET || '',
  }
  res.json(config)
})

// Proxy endpoint to handle verification requests and avoid CORS issues
app.post('/api/verify', async (req, res) => {
  try {
    const { fields, timestamp } = req.body
    const apiEndpoint = process.env.API_ENDPOINT
    const apiSecret = process.env.API_SECRET

    if (!apiEndpoint || !apiSecret) {
      return res.status(400).json({ error: 'API configuration not found' })
    }

    console.log('🔍 Proxying verification request to:', apiEndpoint)
    
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiSecret}`,
      },
      body: JSON.stringify({
        fields,
        timestamp,
      }),
    })

    const responseData = await response.json()

    if (response.ok) {
      console.log('✅ Verification successful')
      res.json(responseData)
    } else {
      console.log('❌ Verification failed:', response.status, responseData)
      res.status(response.status).json(responseData)
    }
  } catch (error) {
    console.error('🚨 Verification error:', error)
    res.status(500).json({ error: error.message })
  }
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
  console.log(`✅ Web UI available at http://stakersunion.stakersunion.public.dappnode/`)
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
