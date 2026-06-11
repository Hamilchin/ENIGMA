// Zip the dist folder and measure the size
import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(new URL(import.meta.url).pathname)
const distDir = path.resolve(__dirname, '../dist')
const outputFile = path.resolve(__dirname, '../dist.zip')

if (!fs.existsSync(distDir)) {
  console.error('dist directory does not exist')
  process.exit(1)
}

// Remove existing zip file if it exists
if (fs.existsSync(outputFile)) {
  fs.unlinkSync(outputFile)
}

console.log('Zipping dist folder...')

try {
  // Create zip file using system zip command with consistent compression
  // -r = recursive, -9 = maximum compression, -q = quiet
  execSync(`zip -r9q "${outputFile}" dist`, {
    cwd: path.resolve(__dirname, '..'),
  })

  console.log(`Created zip file: ${path.relative(process.cwd(), outputFile)}`)

  // Measure and report size
  const stats = fs.statSync(outputFile)
  const sizeKB = stats.size / 1024
  const maxKB = 13
  const remainingKB = (maxKB - sizeKB).toFixed(2)
  const percentUsed = ((sizeKB / maxKB) * 100).toFixed(2)

  const barLength = 20
  const filledLength = Math.min(
    barLength,
    Math.round((barLength * percentUsed) / 100),
  )
  const bar = '█'.repeat(filledLength) + '-'.repeat(barLength - filledLength)

  console.log('')
  console.log(`Zip file size: ${sizeKB.toFixed(2)} KB`)
  console.log(
    `[${bar}] ${sizeKB.toFixed(
      2,
    )} KB of ${maxKB} KB used (${percentUsed}%) — ${remainingKB} KB remaining`,
  )
} catch (error) {
  console.error('Error creating zip file:', error.message)
  process.exit(1)
}
