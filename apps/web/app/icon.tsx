import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 24,
          background: 'transparent',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: '100%' }}
        >
          <circle cx="50" cy="50" r="45" fill="rgba(139, 92, 246, 0.2)" stroke="#8b5cf6" strokeWidth="4" />
          <path
            d="M30 65C30 65 40 35 50 35C60 35 70 65 70 65"
            stroke="#8b5cf6"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="50" cy="35" r="8" fill="#8b5cf6" />
          <path
            d="M25 50H75"
            stroke="rgba(139, 92, 246, 0.6)"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  )
}
