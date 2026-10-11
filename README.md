# DuhTron Desktop

L'app per computer di [duhtron.com](https://duhtron.com): una finestra tutta sua, l'icona nel menu, le scorciatoie di sistema. La chat è quella del portale, sempre aggiornata.

## Come si pubblicano gli installer

1. Spingi il codice su GitHub.
2. Crea un tag di versione e spingilo:
   ```
   git tag v1.0.1
   git push origin v1.0.1
   ```
3. GitHub costruisce da solo i tre installer (5-10 minuti) e li mette in **Releases**:
   - `DuhTron-1.0.1-Windows.exe`
   - `DuhTron-1.0.1-Mac.dmg`
   - `DuhTron-1.0.1-Linux.AppImage` e `.deb`
4. I link da mettere sul sito puntano sempre all'ultima versione:
   - https://github.com/danilofaillii/duhtron-desktop/releases/latest/download/DuhTron-1.0.1-Windows.exe
   - oppure alla pagina: https://github.com/danilofaillii/duhtron-desktop/releases/latest

## Avvisi di sicurezza

Gli installer non sono firmati (la firma costa: ~100 $/anno Apple, 200-400 €/anno per Windows):
- **Windows**: SmartScreen avvisa → "Ulteriori informazioni" → "Esegui comunque".
- **Mac**: al primo avvio → clic destro sull'app → "Apri" → "Apri".
- **Linux**: nessun avviso. L'AppImage va reso eseguibile (`chmod +x`).

## Nuove versioni

L'app mostra sempre il sito aggiornato: non serve pubblicare una nuova release per i contenuti.
Una nuova release serve solo se cambi l'app stessa (icona, finestra, menu): aggiorna `version` in `package.json`, poi tag e push.

## Per provarla in locale

```
npm install
npm start
```
