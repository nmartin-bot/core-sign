import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { renderContractTemplate } from '@/lib/contract-template'
import SignaturePage from './SignaturePage'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const { data: contract } = await supabaseAdmin
    .from('contracts')
    .select('id, title, content, status, clients(name, email)')
    .eq('signature_token', token)
    .single()

  if (!contract) return notFound()
  if (contract.status === 'signed') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: '48px 40px', maxWidth: 480, textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: 28, marginBottom: 16 }}>✓</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Contrat déjà signé</h2>
          <p style={{ color: '#666' }}>Ce contrat a déjà été signé. Contactez-nous si vous avez une question.</p>
        </div>
      </div>
    )
  }

  const contractHtml = renderContractTemplate((contract as any).content || {})
  return <SignaturePage contract={contract as any} token={token} contractHtml={contractHtml} />
}
