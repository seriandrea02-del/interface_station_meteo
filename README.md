
# 🌦️ Station météo connectée — ESP32, Raspberry Pi et Home Assistant

## 1. Présentation du projet

Dans le cadre de l’Unité d’Enseignement 852.2 « Architectures Embarquées », dispensée à l’Université de Lorraine et encadrée par le Professeur Camille Diou, notre groupe a réalisé un système embarqué dédié à l’acquisition, à la centralisation et à la visualisation de données météorologiques.

Le système repose sur un **ESP32**, chargé de collecter les mesures issues de capteurs physiques, et une **Raspberry Pi exécutant Home Assistant OS (HAOS)**, utilisée comme plateforme centrale de supervision.

Les mesures locales sont transmises par Wi-Fi vers Home Assistant. Le système intègre également des données météorologiques externes provenant de l’API Météo-France afin de permettre leur comparaison avec les mesures relevées localement.

Une interface Web permet de consulter les informations météorologiques sur le réseau local.

Ce projet constitue une mise en application concrète des concepts d’architecture embarquée, d’acquisition de données, de communication réseau et de développement d’interfaces logicielles.

## 2. Objectifs du projet

L’objectif principal est de concevoir un système embarqué connecté capable de collecter, centraliser et visualiser des données météorologiques locales, tout en permettant leur comparaison avec des données météorologiques externes.

Les objectifs spécifiques sont les suivants :

- Acquérir les données météorologiques à partir de capteurs physiques.
- Transmettre les mesures issues des capteurs grâce à un ESP32.
- Assurer la communication entre les équipements via Wi-Fi.
- Centraliser les données sur une Raspberry Pi exécutant Home Assistant OS.
- Récupérer les données météorologiques externes depuis l’API Météo-France.
- Développer une interface Web pour visualiser les données.
- Comparer les mesures locales aux données météorologiques externes.

## 3. Matériel utilisé

| Composant | Fonction |
|---|---|
| ESP32 | Acquisition des mesures et transmission des données |
| Raspberry Pi | Hébergement de la plateforme de supervision |
| Capteur de température | Mesure de la température ambiante |
| Capteur d’humidité | Mesure de l’humidité de l’air |
| Capteur de pression atmosphérique | Mesure de la pression atmosphérique |
| Capteur de luminosité | Mesure de l’intensité lumineuse |
| Capteur de vent | Acquisition des paramètres liés au vent |
| Capteur de pluviométrie | Mesure des précipitations |

## 4. Technologies utilisées

| Technologie | Rôle |
|---|---|
| Linux / Home Assistant OS (HAOS) | Environnement d’exécution sur la Raspberry Pi |
| Home Assistant | Centralisation et supervision des données |
| HTML | Structure de l’interface Web |
| CSS | Mise en forme de l’interface Web |
| JavaScript | Gestion des interactions et de l’affichage, si utilisé |
| Wi-Fi | Communication sans fil entre les équipements |
| API REST | Échange de données entre les composants compatibles |
| API Météo-France | Récupération des données météorologiques externes |
| Paint | Conception de maquettes graphiques, si utilisé |

## 5. Architecture du système

L’architecture repose sur l’acquisition des mesures, leur transmission, leur centralisation et leur visualisation.

```text
┌──────────────────────────────────┐
│     CAPTEURS MÉTÉOROLOGIQUES     │
│                                  │
│ Température • Humidité           │
│ Pression • Luminosité             │
│ Vent • Pluviométrie               │
└────────────────┬─────────────────┘
                 │
                 ▼
┌──────────────────────────────────┐
│              ESP32               │
│ Acquisition des mesures          │
│ Préparation des données          │
└────────────────┬─────────────────┘
                 │
                 │ Wi-Fi
                 │ API REST*
                 ▼
┌──────────────────────────────────┐
│       Raspberry Pi — HAOS        │
│                                  │
│          Home Assistant          │◄──── API Météo-France
│ Centralisation et supervision    │
└────────────────┬─────────────────┘
                 │
                 ▼
┌──────────────────────────────────┐
│            INTERFACE WEB         │
│                                  │
│          HTML / CSS / JS         │
│ Visualisation des données        │
└──────────────────────────────────┘
```

\* L’API REST est indiquée pour la liaison ESP32–Home Assistant si elle correspond bien au mécanisme utilisé dans votre réalisation.

### Fonctionnement de l’architecture

1. Les capteurs physiques mesurent les paramètres météorologiques locaux.
2. L’ESP32 acquiert les mesures issues des capteurs.
3. Les données sont transmises par Wi-Fi vers la plateforme centrale.
4. Home Assistant centralise les données locales et les informations météorologiques externes intégrées.
5. L’interface Web permet de consulter les mesures et de comparer les données disponibles.

## 6. Étapes de réalisation

### Étape 1 — Analyse des besoins

Identification des paramètres météorologiques à mesurer et définition des fonctionnalités attendues : acquisition, communication, centralisation et visualisation.

### Étape 2 — Acquisition des données

Intégration des capteurs physiques et utilisation de l’ESP32 pour recueillir les mesures de température, d’humidité, de pression, de luminosité, de vent et de pluviométrie.

### Étape 3 — Installation de la plateforme embarquée

Installation de Home Assistant OS sur la Raspberry Pi et configuration de l’environnement de supervision.

### Étape 4 — Mise en place de la communication

Utilisation du réseau Wi-Fi et du mécanisme d’échange configuré pour transmettre les données de l’ESP32 vers la plateforme centrale.

### Étape 5 — Intégration des données externes

Récupération des données météorologiques provenant de l’API Météo-France afin de disposer d’informations de référence pour la comparaison avec les mesures locales.

### Étape 6 — Conception de l’interface Web

Conception de la présentation graphique et mise en place de l’interface de visualisation associée à Home Assistant.

Les technologies HTML et CSS permettent respectivement de structurer et de mettre en forme l’interface Web.

### Étape 7 — Tests et vérification

Vérification de l’acquisition des mesures, de la transmission des données, de leur affichage et de la cohérence des informations disponibles.

## 7. Interface Web et visualisation

L’interface Web permet de consulter les informations météorologiques collectées par la station et celles provenant de Météo-France.

Elle vise à faciliter :

- La lecture des mesures issues des différents capteurs.
- La consultation des données centralisées dans Home Assistant.
- La comparaison des mesures locales avec les informations externes.
- L’accès aux informations depuis un navigateur connecté au réseau local.

La présentation graphique vise à rendre les informations accessibles et faciles à interpréter.

## 8. Communication et échanges de données

La communication du système repose sur le réseau Wi-Fi et des mécanismes d’échange adaptés à l’architecture mise en place.

- **ESP32 :** acquisition des données des capteurs.
- **Wi-Fi :** connectivité sans fil.
- **API REST :** échange de données entre les composants compatibles.
- **Home Assistant :** centralisation et supervision sur la Raspberry Pi.
- **API Météo-France :** fourniture des données météorologiques externes.
- **Interface Web :** affichage des informations météorologiques.

## 9. Comparaison des solutions techniques

Plusieurs approches peuvent être envisagées pour développer un système embarqué connecté.

| Environnement | Technologies | Communication | Complexité estimée | Interface Web |
|---|---|---|---|---|
| Linux / HAOS | HTML, CSS, JavaScript | Wi-Fi / REST | Modérée | Oui |
| Linux | Qt / C++ | Bluetooth | Élevée | Non, par défaut |
| Linux | PHP | Zigbee / Z-Wave | Modérée | Possible |
| Linux | Python (script) | I²C / SPI / UART | Faible à modérée | Non, pour un script seul |

La solution retenue repose sur Home Assistant OS, une Raspberry Pi et un ESP32. Elle permet de réunir l’acquisition des mesures, la communication réseau et la supervision dans une architecture commune.

Ce tableau présente des approches techniques générales. Les protocoles et technologies des solutions alternatives ne sont pas nécessairement utilisés dans ce projet.

## 10. Compétences mobilisées

- Architecture des systèmes embarqués.
- Acquisition de données par capteurs.
- Utilisation d’un microcontrôleur ESP32.
- Intégration d’une Raspberry Pi sous Linux.
- Configuration et exploitation de Home Assistant OS.
- Communication sans fil Wi-Fi.
- Échanges de données via API REST.
- Intégration de données météorologiques externes.
- Conception et développement d’interfaces Web.
- Visualisation et comparaison de données.
- Intégration et validation d’un système matériel et logiciel.

## 11. Conclusion

Ce projet illustre la conception d’une station météo connectée associant acquisition physique, communication réseau, supervision et visualisation de données.

L’association de l’ESP32, de la Raspberry Pi et de Home Assistant permet de centraliser les mesures environnementales et les informations météorologiques externes dans un même système. Cette réalisation constitue une mise en pratique des principes d’architecture embarquée et d’intégration entre matériel et logiciel.

## 12. Contexte académique

- **Formation :** Master — Conception des Systèmes Électroniques et Communicants
- **Établissement :** Université de Lorraine
- **Unité d’enseignement :** UE 852.2 — Architectures Embarquées
- **Encadrement :** Professeur Camille Diou
- **Type de projet :** Projet académique réalisé en groupe

---

**Domaines :** Systèmes embarqués · IoT · Acquisition de données · Communication Wi-Fi · Home Assistant · API REST · Développement Web
