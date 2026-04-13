# 📘 Dokumentacja aplikacji – E-Konfident

## 1. Opis aplikacji

Aplikacja służy do składania anonimowych lub personalnych donosów do różnych służb typu straż miejska, policja, kas itp.

---

## 2. Funkcjonalności

* Wyświetlanie listy departamentów
* Prezentacja ikon jako obrazów (PNG)
* Stylizowane karty UI
* Możliwość wyboru departamentu (np. kliknięcie)

---

## 3. Struktura danych

Departamenty są przechowywane w tablicy obiektów:

```js
const departments = [
  { id: 'police', name: 'Policja', icon: '/policja.png', color: '#0066FF' },
  { id: 'city-guard', name: 'Straż Miejska', icon: '/strazmiejska.png', color: '#00D4FF' },
  { id: 'border-guard', name: 'Straż Graniczna', icon: '/strazgraniczna.png', color: '#00B8D4' },
  { id: 'kas', name: 'Krajowa Administracja Skarbowa', icon: '/kas.png', color: '#0099CC' },
  { id: 'infotech', name: 'Infotech School', icon: '/infotech.png', color: '#00C4B4' }
]
```

### Opis pól:

* `id` – unikalny identyfikator
* `name` – nazwa wyświetlana
* `icon` – ścieżka do obrazu
* `color` – kolor przypisany do karty

---

## 4. Renderowanie (React)

Komponent renderujący listę:

```jsx
{departments.map((dept) => (
  <div key={dept.id} className="card">
    <img src={dept.icon} alt={dept.name} className="icon" />
    <h3>{dept.name}</h3>
  </div>
))}
```

---

## 5. Stylowanie (CSS)

```css
.card {
  padding: 20px;
  border-radius: 16px;
  background: linear-gradient(145deg, #0f2a3d, #17445c);
  text-align: center;
}

.icon {
  width: 64px;
  height: 64px;
  object-fit: contain;
  margin-bottom: 10px;
}
```

---

## 6. Struktura plików

```
project/
 ├── public/
 │    ├── policja.png
 │    ├── strazmiejska.png
 │    ├── strazgraniczna.png
 │    ├── kas.png
 │    └── infotech.png
 ├── src/
 │    ├── App.jsx
 │    └── styles.css
```

---

## 7. Wymagania

* Node.js (jeśli React)
* Przeglądarka internetowa

---

## 8. Możliwe rozszerzenia

* Obsługa kliknięcia i routing
* Animacje hover
* Responsywność (mobile)
* Pobieranie danych z API

---

## 9. Najczęstsze błędy

### ❌ Wyświetla się nazwa pliku zamiast obrazka

✔ Użyj `<img src={...} />` zamiast `{dept.icon}`

### ❌ Obraz się nie ładuje

✔ Sprawdź ścieżkę (`/public` lub import)
