export const missionText = {
  terminalComplete: (id: string) => `Terminal ${id.toUpperCase()} breached. Door lock released.`,
  captainDown: 'Command unit neutralized. Extraction protocol unlocked.',
  extractionReady: 'All objectives complete. Move to extraction.',
  sectorClear: 'Sector clear. Breach team advances.',
  gameOver: 'Operator signal lost. Restart sector.',
  alertDetected: 'Contact. Emergency lighting active.',
  alertSearching: 'Hostiles searching last known position.',
  hidden: 'Silent approach restored.'
} as const;
