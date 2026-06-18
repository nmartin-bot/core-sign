export default function Connected() {
  return (
    <div style={{
      fontFamily: 'system-ui, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      margin: 0,
      background: '#f9fafb',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h2 style={{ margin: '0 0 8px', fontSize: 20, color: '#111' }}>Connecté avec succès</h2>
        <p style={{ color: '#6b7280', margin: 0 }}>Vous pouvez fermer cet onglet et retourner dans Core.</p>
      </div>
    </div>
  )
}
