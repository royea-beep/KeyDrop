import { NextResponse } from 'next/server'

export async function GET() {
  const start = Date.now()

  return NextResponse.json({
    status: 'ok',
    app: 'keydrop',
    version: process.env.npm_package_version || '1.0.0',
    latency: Date.now() - start,
    timestamp: new Date().toISOString(),
    node: process.version,
  })
}
