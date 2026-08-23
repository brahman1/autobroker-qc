const fs = require('fs');
const files = [
  "D:\\.gemini\\antigravity\\scratch\\autobroker-qc\\apps\\frontend\\src\\pages\\AuctionLivePage.tsx",
  "D:\\.gemini\\antigravity\\scratch\\autobroker-qc\\apps\\frontend\\src\\pages\\DashboardPage.tsx",
  "D:\\.gemini\\antigravity\\scratch\\autobroker-qc\\apps\\frontend\\src\\components\\auctions\\BidForm.tsx",
  "D:\\.gemini\\antigravity\\scratch\\autobroker-qc\\apps\\frontend\\src\\components\\vehicles\\VehicleCard.tsx"
];

for(const file of files) {
  if(!fs.existsSync(file)) continue;
  let text = fs.readFileSync(file, 'utf8');
  // the corrupted chars look like a diamond with a question mark in standard utf8 mismatch
  text = text.replace(//g, 'é'); // mostly it's "é"
  // Let's just fix specific words
  text = text.replace(/Enchrissez/g, 'Enchérissez');
  text = text.replace(/vhicules/g, 'véhicules');
  text = text.replace(/Scuris/g, 'Sécurisé');
  text = text.replace(/Certifie/g, 'Certifiée');
  text = text.replace(/Dposer/g, 'Déposer');
  text = text.replace(/Rcuprer/g, 'Récupérer');
  text = text.replace(/a/g, 'ça');
  text = text.replace(/enchres/g, 'enchères');
  text = text.replace(/Enchres/g, 'Enchères');
  text = text.replace(/rel/g, 'réel');
  text = text.replace(/dtails/g, 'détails');
  text = text.replace(/dpt/g, 'dépôt');
  text = text.replace(/Dpt/g, 'Dépôt');
  text = text.replace(/SURENCHRI/g, 'SURENCHÉRI');
  
  // A global catch-all for remaining replacement chars that were likely 'é'
  text = text.replace(//g, 'é'); 
  fs.writeFileSync(file, text, 'utf8');
}
