<p align="center">
  <img src="https://h2svision.github.io/publicAssets/TechSprint_email_Banner.png" alt="Tech Sprint GDG SSTC 2026 Banner" width="100%">
</p>

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Dancing+Script&weight=700&size=45&duration=2500&pause=500&color=22C55E&center=true&vCenter=true&width=600&repeat=false&lines=CareNest:+Smart+Health+Set+for+You" alt="CareNest Title">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white" alt="Gemini">
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase">
  <img src="https://img.shields.io/badge/Google%20Cloud-Run-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white" alt="Google Cloud">
  <img src="https://img.shields.io/badge/Google%20ML%20Kit-FBBC04?style=for-the-badge&logo=google&logoColor=white" alt="ML Kit">
</p>

---

### 🌿 The Vision
<p align="left">
  <img src="https://readme-typing-svg.herokuapp.com?font=Dancing+Script&size=30&color=1B5E20&width=300&lines=Why+CareNest%3F" alt="Subtitle">
</p>

We built CareNest because we believe technology should feel like a **warm hug**, not a cold machine. In the rush of student life at **SSTC**, we saw our community struggling to manage the health of their loved ones back home. 
<br>&nbsp;&nbsp;CareNest is a wellness-tech platform designed to help doctors, patients, and caregivers manage health information, medical history, and medicine tracking in one place.

> *"We aren't just tracking pills; we're protecting peace of mind."*

---

### 🚀 Core Features
<p align="left">
  <img src="https://readme-typing-svg.herokuapp.com?font=Dancing+Script&size=30&color=1B5E20&width=400&lines=What's+Inside%3F" alt="Subtitle">
</p>

<p align="left">
  <font color="00843D"><b>📸 AI Prescription Scanner</b></font><br>
  Eliminate manual errors using <b>Gemini 1.5 Flash</b> to parse handwritten prescriptions into structured digital schedules in seconds.
</p>

<p align="left">
  <font color="00843D"><b>🛡️ Role-Based Care Circle</b></font><br>
  Customized interfaces for <b>Doctors, Guardians, and Patients</b>. Securely managed via Firebase to keep family health data synchronized.
</p>

<p align="left">
  <font color="00843D"><b>🧠 Dynamic Inventory System</b></font><br>
  Real-time "Pills Remaining" tracker that triggers <b>Soft Yellow</b> alerts the moment your stock hits a critical threshold.
</p>

<p align="left">
  <font color="#00843D"><b>📄 Digital Health Passport</b></font><br>
  Generate a professional, emergency-ready PDF of medication history to ensure seamless transitions between different healthcare providers.
</p>

---

### 📊 Usage Example
```bash
# Analyze a handwritten prescription image via Gemini 1.5 Flash
curl [https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$](https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$){GOOGLE_API_KEY} \
    -H 'Content-Type: application/json' \
    -d '{
      "contents": [{
        "parts":[
          {"text": "Extract medicine name, dose, and frequency as JSON."},
          {"inline_data": { "mime_type":"image/png", "data": "'$(base64 -w0 prescription.png)'" }}
        ]
      }]
    }
```
---

   
| Variable | Description | Required | Default / Source |
| :--- | :--- | :---: | :--- |
| `GOOGLE_API_KEY` | API Key for **Gemini 1.5 Flash** (Vision & Parsing) | Yes | [Google AI Studio](https://aistudio.google.com/) |
| `FIREBASE_API_KEY` | Web SDK key for Auth and Firestore | Linked | [Firebase Settings](https://console.firebase.google.com/) |
| `FIREBASE_PROJECT_ID` | Unique identifier for your Firebase project | Yes | Project Settings |
| `STORAGE_BUCKET` | URL for storing prescription images | Yes | `<project-id>.appspot.com` |
| `LOW_STOCK_ALERT` | Threshold count to trigger refill notification | Integer | `inventory <= threshold` |

### 🛠 Prerequisites

Make sure you have installed:

- Node.js and npm
- Firebase CLI
- clone of this project

---

## 🧠 Installation

```bash
git clone https://github.com/jinishabose/CareNest.git
cd CareNest
npm install
```
---
  <p align="center">
  <b>Developed by Team Bytestuffed Bread</b><br>
  <i>Tech Sprint • GDG SSTC 2026</i><br>
  <font color="#00843D"><b>✨ Made for the Community</b></font>
</p>
