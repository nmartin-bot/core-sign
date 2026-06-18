export interface ContractVariables {
  client_name: string
  client_representative: string
  client_title: string
  client_siret: string
  client_address: string
  client_email: string
  amount_deposit: string
  amount_balance: string
  amount_subscription: string
  delay_milestone_1: string
  delay_delivery: string
  project_name: string
  project_description: string
  features: string[]
  exclusions: string[]
  contract_date: string
  contract_reference: string
  jurisdiction: string
}

export function renderContractTemplate(v: Partial<ContractVariables>): string {
  const features = (v.features || []).map(f => `<li>${f}</li>`).join('')
  const exclusions = (v.exclusions || []).map(e => `<li>${e}</li>`).join('')

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif; font-size: 14px; line-height: 1.7; color: #1a1a1a; background: #fff; padding: 24px 20px; max-width: 680px; margin: 0 auto; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; padding-bottom: 16px; border-bottom: 2px solid #1a1a1a; flex-wrap: wrap; gap: 8px; }
  .logo { font-size: 20px; font-weight: 700; letter-spacing: -0.5px; }
  .logo span { color: #6366f1; }
  .ref { text-align: right; font-size: 12px; color: #666; }
  .ref strong { display: block; font-size: 14px; color: #1a1a1a; margin-bottom: 2px; }
  h1 { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
  .subtitle { font-size: 14px; color: #666; margin-bottom: 28px; }
  .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; background: #f9f9f9; border-radius: 10px; padding: 16px; }
  @media (max-width: 480px) { .parties { grid-template-columns: 1fr; } }
  .party-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #999; margin-bottom: 6px; }
  .party-name { font-size: 15px; font-weight: 700; margin-bottom: 4px; }
  .party-detail { font-size: 13px; color: #555; line-height: 1.6; }
  h2 { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; margin-top: 24px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #e0e0e0; color: #444; }
  p { margin-bottom: 10px; color: #333; font-size: 14px; }
  ul { padding-left: 20px; margin-bottom: 12px; }
  ul li { margin-bottom: 5px; font-size: 14px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 14px; }
  th { background: #1a1a1a; color: #fff; padding: 10px 12px; text-align: left; font-size: 12px; }
  td { padding: 10px 12px; border-bottom: 1px solid #eee; }
  tr:last-child td { font-weight: 700; background: #f5f5f5; border-bottom: none; }
  .amount { text-align: right; }
</style>
</head>
<body>
  <div class="header">
    <div class="logo">UN<span>TI</span>TLED</div>
    <div class="ref"><strong>${v.contract_reference || ''}</strong>${v.contract_date || ''}</div>
  </div>
  <h1>Contrat de prestation</h1>
  <div class="subtitle">${v.project_name || ''}</div>
  <div class="parties">
    <div>
      <div class="party-title">Prestataire</div>
      <div class="party-name">Untitled SAS</div>
      <div class="party-detail">8 rue des Dominicains, 54000 Nancy<br>contact@untitled-hr.com</div>
    </div>
    <div>
      <div class="party-title">Client</div>
      <div class="party-name">${v.client_name || ''}</div>
      <div class="party-detail">${v.client_address || ''}<br>SIRET : ${v.client_siret || ''}<br>${v.client_email || ''}</div>
    </div>
  </div>
  <h2>Objet de la prestation</h2>
  <p>${v.project_description || ''}</p>
  <h2>Périmètre fonctionnel</h2>
  <ul>${features}</ul>
  ${exclusions ? `<p><strong>Exclusions :</strong></p><ul>${exclusions}</ul>` : ''}
  <h2>Conditions financières</h2>
  <table>
    <thead><tr><th>Élément</th><th>Montant HT</th><th>Échéance</th></tr></thead>
    <tbody>
      <tr><td>Acompte</td><td class="amount">${v.amount_deposit || ''}</td><td>À la signature</td></tr>
      <tr><td>Solde</td><td class="amount">${v.amount_balance || ''}</td><td>À la livraison</td></tr>
      ${v.amount_subscription ? `<tr><td>Maintenance</td><td class="amount">${v.amount_subscription}</td><td>Mensuelle</td></tr>` : ''}
    </tbody>
  </table>
  <h2>Planning</h2>
  <p><strong>Livrable 1 :</strong> ${v.delay_milestone_1 || ''}</p>
  <p><strong>Livraison finale :</strong> ${v.delay_delivery || ''}</p>
  <h2>Conditions générales</h2>
  <p>Le prestataire s'engage à réaliser les travaux avec le soin requis. Tribunal compétent : ${v.jurisdiction || 'Nancy'}.</p>
</body>
</html>`
}
