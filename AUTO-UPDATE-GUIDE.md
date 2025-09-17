# DevOpsChat Auto-Update Setup 🚀

Begge userscripts er nå konfigurert for automatisk oppdatering fra GitHub!

## 📥 Installasjon

### Første gang installasjon:
1. Åpne Tampermonkey Dashboard
2. Gå til "Utilities" tab
3. Lim inn URL i "Install from URL" feltet:

**DevOpsChat UI (A):**
```
https://raw.githubusercontent.com/dingemoe/script/main/DevOpsChat-UI-A.user.js
```

**DevOpsChat Agent (B):**
```
https://raw.githubusercontent.com/dingemoe/script/main/DevOpsChat-Agent-B.user.js
```

4. Klikk "Install" og deretter "Install" igjen

## 🔄 Automatisk Oppdatering

### Hvordan det fungerer:
- **@downloadURL**: Brukes ved første installasjon og manuell oppdatering
- **@updateURL**: Brukes av Tampermonkey for å sjekke nye versjoner
- **@version**: Må økes for hver oppdatering (f.eks. 5.1.0 → 5.1.1)

### Oppdateringsintervall:
Tampermonkey sjekker automatisk for oppdateringer:
- **Standard**: Hver 24. time
- **Kan endres**: Tampermonkey Settings → Script Update → Update Interval

### Manuell oppdatering:
1. Åpne Tampermonkey Dashboard
2. Gå til "Installed userscripts"
3. Klikk "Check for userscript updates"

## 📋 Versjonering

### Nåværende versjoner:
- **DevOpsChat UI (A)**: v5.1.0
- **DevOpsChat Agent (B)**: v2.1.0

### Ved oppdateringer:
1. Endre koden
2. **Øk versjonsnummer** i metadata (viktig!)
3. Commit og push til GitHub
4. Tampermonkey oppdager automatisk oppdateringen

### Versjon format:
```
MAJOR.MINOR.PATCH
5.1.0 → 5.1.1 (bugfix)
5.1.1 → 5.2.0 (ny funksjon)
5.2.0 → 6.0.0 (breaking changes)
```

## 🔗 Nyttige lenker

- **GitHub Repo**: https://github.com/dingemoe/script
- **Issues**: https://github.com/dingemoe/script/issues
- **Raw URLs**:
  - UI Script: https://raw.githubusercontent.com/dingemoe/script/main/DevOpsChat-UI-A.user.js
  - Agent Script: https://raw.githubusercontent.com/dingemoe/script/main/DevOpsChat-Agent-B.user.js

## ⚡ Tips

### For utviklere:
- Test alltid scripts lokalt før push
- Bruk beskrivende commit-meldinger
- Dokumenter endringer i version notes

### For brukere:
- Hold Tampermonkey oppdatert
- Sjekk console for feilmeldinger
- Rapporter bugs via GitHub Issues

## 🛠️ Feilsøking

### Script oppdaterer ikke:
1. Sjekk at versjonsnummer er økt
2. Vent 24 timer eller force-oppdater manuelt
3. Sjekk at GitHub raw URL er tilgjengelig

### Installasjon feiler:
1. Kontroller at URL er korrekt
2. Sjekk internetttilkobling
3. Prøv å installere manuelt via copy/paste