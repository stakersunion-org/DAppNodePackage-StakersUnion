#!/usr/bin/env node

const express = require('express')
const path = require('path')
const fetch = require('node-fetch')
require('dotenv').config()

const app = express()
const PORT = 80

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }))

// Set EJS as the view engine
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// Serve static files from public directory (for avatar.png and other assets)
app.use(express.static(path.join(__dirname, 'public')))

// POST endpoint to handle verification requests
app.post('/verify', async (req, res) => {
  try {
    const { timestamp, ...fields } = req.body
    const apiEndpoint = process.env.API_ENDPOINT
    const apiSecret = process.env.API_SECRET

    if (!apiEndpoint || !apiSecret) {
      return res.render('index', { 
        envVars: getEnvVars(),
        verificationResult: {
          success: false,
          message: 'API configuration not found'
        }
      })
    }

    console.log('🔍 Sending verification request to:', apiEndpoint)

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiSecret}`,
      },
      body: JSON.stringify({
        fields,
        timestamp,
      }),
    })

    const responseData = await response.json()

    if (response.ok) {
      console.log('✅ Verification successful')
      res.render('index', { 
        envVars: getEnvVars(),
        verificationResult: {
          success: true,
          message: `Verification successful: ${responseData.message || 'Configuration verified'}`
        }
      })
    } else {
      console.log('❌ Verification failed:', response.status, responseData)
      res.render('index', { 
        envVars: getEnvVars(),
        verificationResult: {
          success: false,
          message: `Verification failed: HTTP ${response.status}: ${responseData.error || response.statusText}`
        }
      })
    }
  } catch (error) {
    console.error('🚨 Verification error:', error)
    res.render('index', { 
      envVars: getEnvVars(),
      verificationResult: {
        success: false,
        message: `Verification failed: ${error.message}`
      }
    })
  }
})

// Helper function to get environment variables
function getEnvVars() {
  return {
    ELIGIBLE_ADDRESS: process.env.ELIGIBLE_ADDRESS || 'Not set',
    _DAPPNODE_GLOBAL_EXECUTION_CLIENT_MAINNET:
      process.env._DAPPNODE_GLOBAL_EXECUTION_CLIENT_MAINNET || 'Not set',
    _DAPPNODE_GLOBAL_CONSENSUS_CLIENT_MAINNET:
      process.env._DAPPNODE_GLOBAL_CONSENSUS_CLIENT_MAINNET || 'Not set',
    _DAPPNODE_GLOBAL_PUBKEY: process.env._DAPPNODE_GLOBAL_PUBKEY || 'Not set',
  }
}

// Serve the main HTML page with environment variables
app.get('/', (req, res) => {
  res.render('index', { envVars: getEnvVars() })
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
