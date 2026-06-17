import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { token, contractId, signerName, signatureBase64, userAgent } = await req.json()

    // 1. Vérifier le contrat
    const { data: contract, error: fetchError } = await supabase
      .from('contracts')
      .select('*, clients(name, email)')
      .eq('id', contractId)
      .eq('signature_token', token)
      .single()

    if (fetchError || !contract) {
      return NextResponse.json({ error: 'Contrat introuvable ou lien invalide.' }, { status: 404 })
    }
    if (contract.status === 'signed') {
      return NextResponse.json({ error: 'Ce contrat est déjà signé.' }, { status: 400 })
    }

    // 2. Récupérer l'IP du signataire
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || 'unknown'

    // 3. Mettre à jour le contrat en base
    const signedAt = new Date().toISOString()
    const { error: updateError } = await supabase
      .from('contracts')
      .update({
        status: 'signed',
        signed_at: signedAt,
        client_name: signerName,
        client_ip: ip,
      })
      .eq('id', contractId)

    if (updateError) throw updateError

    // 4. Sauvegarder la signature dans Storage
    const sigBuffer = Buffer.from(signatureBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64')
    await supabase.storage
      .from('contracts')
      .upload(`contracts/${contractId}/signature.png`, sigBuffer, {
        contentType: 'image/png',
        upsert: true,
      })

    // 5. Envoyer email de confirmation via Edge Function
    const vars = (contract as any).content || {}
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      const confirmHtml = `
        <div style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
          <div style="padding:32px 0 20px;border-bottom:1px solid #eee;margin-bottom:28px;">
            <span style="font-size:20px;font-weight:700;">UN<span style="color:#6366f1;">TI</span>TLED</span>
          </div>
          <p style="font-size:16px;margin-bottom:8px;">Contrat signé ✓</p>
          <p style="color:#555;line-height:1.6;">
            Le contrat <strong>${vars.project_name || contract.title}</strong> a été signé par <strong>${signerName}</strong>
            le ${new Date(signedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} à ${new Date(signedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}.
          </p>
          <div style="margin-top:24px;padding:16px;background:#f5f5f5;border-radius:8px;font-size:12px;color:#888;">
            <strong>Horodatage</strong> : ${signedAt}<br/>
            <strong>IP</strong> : ${ip}<br/>
            <strong>Navigateur</strong> : ${userAgent?.slice(0, 80)}
          </div>
          <p style="font-size:13px;color:#999;margin-top:32px;border-top:1px solid #eee;padding-top:20px;">
            Untitled SAS — contact@untitled-studio.com
          </p>
        </div>
      `

      const recipients = ['contact@untitled-studio.com']
      const clientEmail = (contract as any).clients?.email || vars.client_email
      if (clientEmail) recipients.push(clientEmail)

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Untitled Studio <contracts@untitled-studio.com>',
          to: recipients,
          subject: `Contrat signé — ${vars.project_name || contract.title}`,
          html: confirmHtml,
        }),
      })
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
