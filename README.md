# 🤖 Système de Correction IA - Google Classroom

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-✓-green.svg)](https://developers.google.com/apps-script)
[![DeepSeek AI](https://img.shields.io/badge/AI-DeepSeek-blue.svg)](https://deepseek.com)

> Solution automatisée de correction de copies avec intelligence artificielle pour Google Classroom

## 📋 Table des matières
- [Aperçu](#-aperçu)
- [Fonctionnalités](#✨-fonctionnalités)
- [Architecture](#🏗️-architecture)
- [Installation](#🚀-installation)
- [Configuration](#⚙️-configuration)
- [Utilisation](#🎯-utilisation)
- [Développement](#👨‍💻-développement)
- [Structure du projet](#📁-structure-du-projet)
- [Contribuer](#🤝-contribuer)
- [FAQ](#❓-faq)
- [License](#📄-license)

## 🎯 Aperçu

**Correction IA Classroom** est une application Google Apps Script qui automatise la correction des devoirs grâce à l'intelligence artificielle (DeepSeek). Conçue pour les enseignants, elle intègre parfaitement Google Classroom, Sheets, et Drive pour offrir une solution complète de gestion des corrections.

### 🎥 Démo rapide
1. Sélectionnez un devoir Classroom
2. Lancez la correction automatique via AI
3. Visualisez les statistiques détaillées
4. Envoyez les feedbacks par email
5. Exportez les résultats en PDF

## ✨ Fonctionnalités

### 🎓 **Intégration Classroom**
- 📚 Liste automatique des cours et devoirs
- 👥 Récupération des soumissions élèves
- 🔗 Connexion directe aux documents Drive

### 🤖 **Correction IA**
- ✅ Correction automatique avec DeepSeek
- 🎯 Multiples templates de correction
- ⚙️ Mode brouillon pour tests
- 📝 Feedback personnalisé et constructif

### 📊 **Analyse & Rapports**
- 📈 Statistiques détaillées (moyenne, médiane, distribution)
- 📊 Graphiques automatiques des notes
- 📋 Tableau de bord interactif
- 📤 Export PDF professionnel

### ✉️ **Communication**
- 📧 Envoi automatisé des feedbacks
- 📨 Templates d'emails personnalisables
- ✅ Suivi des envois
- 🧪 Mode test sécurisé

### ⚡ **Interface Utilisateur**
- 🎛️ Menu intégré à Google Sheets
- 🖥️ Interface de sélection intuitive
- 📱 Tableau de bord centralisé
- ⚙️ Gestion des templates en ligne

## 🏗️ Architecture

```mermaid
graph TD
    A[Google Sheet] --> B[Apps Script]
    B --> C[Google Classroom API]
    B --> D[DeepSeek AI API]
    B --> E[Google Drive API]
    B --> F[Gmail API]
    
    C --> G[Soumissions élèves]
    D --> H[Correction IA]
    E --> I[Documents élèves]
    F --> J[Emails feedback]
    
    H --> K[Résultats Sheets]
    K --> L[Statistiques]
    K --> M[Export PDF]
    K --> N[Emails élèves]