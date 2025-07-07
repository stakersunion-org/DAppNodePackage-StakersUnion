#!/usr/bin/env node

const express = require('express')
const path = require('path')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3000

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

    // Get environment variables once at the beginning
    const envVars = await getEnvVars()

    if (!apiEndpoint || !apiSecret) {
      return res.render('index', {
        envVars,
        verificationResult: {
          success: false,
          message: 'API configuration not found',
        },
      })
    }

    // Validate required fields
    const validationErrors = []

    // Check Eligible Address
    if (!envVars.eligibleAddress || envVars.eligibleAddress === 'Not set') {
      validationErrors.push('Eligible Address is required')
    }

    // Check DAppNode Public Key
    if (!envVars.dappnodePublicKey || envVars.dappnodePublicKey === 'Not set') {
      validationErrors.push('DAppNode Public Key is required')
    }

    // Check Has Validators
    if (envVars.hasValidators !== true) {
      validationErrors.push('Has Validators must be true (at least one validator must be running)')
    }

    // If validation fails, return error
    if (validationErrors.length > 0) {
      return res.render('index', {
        envVars,
        verificationResult: {
          success: false,
          message: `Validation failed: ${validationErrors.join(', ')}`,
        },
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
        envVars,
        verificationResult: {
          success: true,
          message: `Verification successful: ${responseData.message || 'Configuration verified'}`,
        },
      })
    } else {
      console.log('❌ Verification failed:', response.status, responseData)
      res.render('index', {
        envVars,
        verificationResult: {
          success: false,
          message: `Verification failed: HTTP ${response.status}: ${
            responseData.error || response.statusText
          }`,
        },
      })
    }
  } catch (error) {
    console.error('🚨 Verification error:', error)
    res.render('index', {
      envVars,
      verificationResult: {
        success: false,
        message: `Verification failed: ${error.message}`,
      },
    })
  }
})

// Helper function to get environment variables
const getEnvVars = async () => {
  let hasValidators = 'Not set'

  // Fetch number of validators from web3signer endpoint if available
  if (process.env.WEB3SIGNER_ENDPOINT) {
    try {
      console.log(`🔎 Checking for validators at ${process.env.WEB3SIGNER_ENDPOINT}...`)
      
      // Create a promise that rejects after 3 seconds
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Request timeout after 3 seconds'))
        }, 3000)
      })
      
      // Create the fetch promise
      const fetchPromise = fetch(`${process.env.WEB3SIGNER_ENDPOINT}/eth/v1/keystores`)
      
      // Race between fetch and timeout
      const response = await Promise.race([fetchPromise, timeoutPromise])
      
      const { data } = await response.json()
      hasValidators = data && data.length > 0
      console.log(`✅ Found ${data.length} validators.`)
    } catch (error) {
      if (error.message === 'Request timeout after 3 seconds') {
        console.error('🚨 Error checking validators: The request timed out.')
      } else {
        console.error('🚨 Error checking validators:', error.message)
      }
    }
  }

  return {
    eligibleAddress: process.env.ELIGIBLE_ADDRESS || 'Not set',
    executionClient: process.env._DAPPNODE_GLOBAL_EXECUTION_CLIENT_MAINNET || 'Not set',
    consensusClient: process.env._DAPPNODE_GLOBAL_CONSENSUS_CLIENT_MAINNET || 'Not set',
    dappnodePublicKey: process.env._DAPPNODE_GLOBAL_PUBKEY || 'Not set',
    hasValidators,
  }
}

// Serve the main HTML page with environment variables
app.get('/', async (req, res) => {
  res.render('index', { envVars: await getEnvVars() })
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
