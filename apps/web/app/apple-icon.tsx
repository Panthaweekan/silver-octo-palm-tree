import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 108, // Scaled for 180px width (24 * 180/32 is too big, let's just make it fill nicely)
          background: 'white', // iOS icons shouldn't have transparency usually, or black background appears
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
          {/* Background circle adjusted to fill more space if needed, or keep original ratio */}
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
