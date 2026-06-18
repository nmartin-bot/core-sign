'use client'

import { useRef, useState, useEffect } from 'react'
import SignatureCanvas from 'react-signature-canvas'

interface Contract {
  id: string
  title: string
  content: Record<string, any>
  status: string
  clients: { name: string; email: string } | null
}

interface Props {
  contract: Contract
  token: string
  contractHtml: string
}

export default function SignaturePage({ contract, token, contractHtml }: Props) {
  const vars = contract.content || {}
  const sigRef = useRef<SignatureCanvas>(null)
  const sigContainerRef = useRef<HTMLDivElement>(null)
  const [canvasWidth, setCanvasWidth] = useState(600)
  const [fullName, setFullName] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [signing, setSigning] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const update = () => {
      if (sigContainerRef.current) {
        setCanvasWidth(sigContainerRef.current.offsetWidth)
      }
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const clearSig = () => sigRef.current?.clear()

  const handleSign = async () => {
    if (!fullName.trim()) { setError('Veuillez entrer votre nom complet.'); return }
    if (sigRef.current?.isEmpty()) { setError('Veuillez signer dans la zone de signature.'); return }
    if (!accepted) { setError('Veuillez accepter les termes du contrat.'); return }

    setSigning(true)
    setError('')

    try {
      const signatureBase64 = sigRef.current!.toDataURL('image/png')

      const res = await fetch('/api/finalize-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          contractId: contract.id,
          signerName: fullName.trim(),
          signatureBase64,
          userAgent: navigator.userAgent,
        }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erreur serveur')
      setDone(true)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSigning(false)
    }
  }

  if (done) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: '48px 40px', maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 28 }}>
            ✓
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Contrat signé !</h2>
          <p style={{ color: '#666', lineHeight: 1.6, marginBottom: 0 }}>
            Merci {fullName}. Vous allez recevoir le contrat signé par email dans quelques instants.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '20px 12px 60px' }}>

        {/* Info contrat */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', marginBottom: 20, border: '1px solid #e5e5e5' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Contrat</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 2 }}>{vars.project_name || contract.title}</div>
          <div style={{ fontSize: 13, color: '#666' }}>
            {vars.contract_reference && <span style={{ marginRight: 16 }}>{vars.contract_reference}</span>}
            {vars.contract_date && <span>{vars.contract_date}</span>}
          </div>
        </div>

        {/* Aperçu du contrat */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e5e5', overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid #f0f0f0', fontSize: 12, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Document à signer
          </div>
          <div style={{ padding: 20, maxHeight: 600, overflowY: 'auto' }}
            dangerouslySetInnerHTML={{ __html: contractHtml }}
          />
        </div>

        {/* Zone de signature */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e5e5', overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Signature</div>

            {/* Nom complet */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: '#444' }}>
                Votre nom complet
              </label>
              <input
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder={vars.client_representative || 'Prénom Nom'}
                style={{
                  width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0',
                  borderRadius: 8, fontSize: 15, outline: 'none',
                  fontFamily: 'inherit',
                }}
                onFocus={e => e.target.style.borderColor = '#6366f1'}
                onBlur={e => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>

            {/* Canvas signature */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#444' }}>
                  Signez ici
                </label>
                <button
                  onClick={clearSig}
                  style={{ fontSize: 12, color: '#999', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px' }}
                >
                  Effacer
                </button>
              </div>
              <div ref={sigContainerRef} style={{ border: '1px solid #e0e0e0', borderRadius: 8, overflow: 'hidden', background: '#fafafa' }}>
                <SignatureCanvas
                  ref={sigRef}
                  penColor="#1a1a1a"
                  canvasProps={{ width: canvasWidth, height: 140, style: { width: '100%', height: 140, display: 'block' } }}
                  backgroundColor="rgba(0,0,0,0)"
                />
              </div>
              <p style={{ fontSize: 11, color: '#bbb', marginTop: 6 }}>Signez avec votre souris ou votre doigt</p>
            </div>

            {/* Checkbox */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginBottom: 4 }}>
              <input
                type="checkbox"
                checked={accepted}
                onChange={e => setAccepted(e.target.checked)}
                style={{ marginTop: 2, accentColor: '#6366f1', width: 16, height: 16, flexShrink: 0 }}
              />
              <span style={{ fontSize: 13, color: '#555', lineHeight: 1.5 }}>
                J'ai lu et j'accepte les termes du contrat. Je confirme que ma signature électronique a valeur juridique.
              </span>
            </label>
          </div>

          <div style={{ padding: '16px 20px' }}>
            {error && (
              <div style={{ marginBottom: 12, padding: '10px 14px', background: '#fef2f2', borderRadius: 8, fontSize: 13, color: '#dc2626' }}>
                {error}
              </div>
            )}
            <button
              onClick={handleSign}
              disabled={signing}
              style={{
                width: '100%', padding: '13px', background: signing ? '#a5b4fc' : '#6366f1',
                color: '#fff', border: 'none', borderRadius: 10,
                fontSize: 15, fontWeight: 600, cursor: signing ? 'default' : 'pointer',
                transition: 'background 150ms',
              }}
            >
              {signing ? 'Signature en cours…' : 'Signer le contrat →'}
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#bbb' }}>
          Untitled SAS — contact@untitled-studio.com — 8 rue des Dominicains, 54000 Nancy
        </p>
      </div>
    </div>
  )
}
