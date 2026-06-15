import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { step, code, password } = body

    const serverCode = process.env.GATE_ENTRY_CODE || '193728'
    const serverPass = process.env.GATE_PASSCODE || '000000'

    if (step === 'code') {
      if (code === serverCode) {
        return NextResponse.json({ success: true })
      }
      return NextResponse.json({ success: false, error: 'Incorrect entry code' })
    }

    if (step === 'pass') {
      if (password === serverPass) {
        return NextResponse.json({ success: true })
      }
      return NextResponse.json({ success: false, error: 'Incorrect passcode' })
    }

    return NextResponse.json({ success: false, error: 'Invalid verification step' }, { status: 400 })
  } catch (error) {
    console.error('Server Authentication Gate Error:', error)
    return NextResponse.json({ success: false, error: 'Internal authentication server error' }, { status: 500 })
  }
}
