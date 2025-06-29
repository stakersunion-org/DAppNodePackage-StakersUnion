#!/usr/bin/env node

require('dotenv').config()

console.log('🚀 Stakers Union DAppNode verification service starting...')
console.log('✅ DAppNode package is running successfully!')
console.log('📊 Service status: ACTIVE')
console.log('🔗 Ready to verify DAppNode operations')

// Log all available environment variables
console.log('🔍 Available environment variables:')
console.log(process.env)

// Keep the service running
setInterval(() => {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] Stakers Union DAppNode service is healthy and running`)
}, 30000) // Log every 30 seconds

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...')
  process.exit(0)
})
