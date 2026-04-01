export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#0a0a0a',
      color: '#22c55e',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 48, margin: 0 }}>sjaj.hr</h1>
        <p style={{ color: '#888', marginTop: 16 }}>Oporavak u tijeku...</p>
      </div>
    </div>
  )
}
