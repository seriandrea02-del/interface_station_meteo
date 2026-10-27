

# 🌦️ Station météo connectée — Raspberry Pi, Home Assistant et API REST

## 1. Présentation du projet

Dans le cadre de l’UE 852.2 « Architectures Embarquées » à l’Université de Lorraine, sous l’encadrement du Professeur Camille Diou, notre groupe a développé un système embarqué permettant d’acquérir, de centraliser et de visualiser des données météorologiques.

Le système repose sur une **Raspberry Pi exécutant Home Assistant OS (HAOS)**. Il centralise les mesures issues de capteurs physiques et les données météorologiques provenant de l’intégration Météo-France. Une interface Web développée en HTML, CSS et JavaScript permet de consulter ces informations depuis un navigateur.

L’objectif est de mettre en pratique les concepts d’architecture embarquée, de communication réseau, d’intégration d’API et de développement d’interfaces Web.

## 2. Objectifs

- Acquérir des données météorologiques à partir de capteurs physiques.
- Centraliser les mesures et les données externes dans Home Assistant.
- Exploiter l’API REST de Home Assistant pour accéder aux valeurs des capteurs.
- Développer une interface Web dynamique pour visualiser les données.
- Comparer les mesures locales aux informations météorologiques de Météo-France.

## 3. Architecture globale

Le système est organisé en trois couches fonctionnelles.

| Couche | Composants | Fonction |
|---|---|---|
| Acquisition | Capteurs physiques et interfaces de communication | Mesure des paramètres environnementaux |
| Traitement et centralisation | Raspberry Pi, Linux et Home Assistant | Intégration et centralisation des données |
| Présentation | HTML, CSS et JavaScript | Affichage des données dans un navigateur |

### Schéma de fonctionnement

```text
┌───────────────────────────────┐
│       Capteurs physiques      │
│ Température, humidité,        │
│ pression, luminosité, vent,   │
│ pluviométrie                  │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│ Raspberry Pi                  │
│ Linux / Home Assistant OS     │
│                               │
│ Centralisation des données    │◄──── API Météo-France
└───────────────┬───────────────┘
                │
                │ API REST / HTTP
                ▼
┌───────────────────────────────┐
│ Interface Web                 │
│ HTML / CSS / JavaScript       │
│                               │
│ Affichage et actualisation    │
│ des données                   │
└───────────────────────────────┘
```

Le Wi-Fi assure la connectivité réseau. Les protocoles physiques utilisés pour les capteurs dépendent du matériel effectivement intégré.

## 4. Matériel et technologies

### Matériel

- **Raspberry Pi :** hébergement de la plateforme Home Assistant.
- **Capteurs météorologiques :**
  - Température ambiante (°C)
  - Humidité relative (%)
  - Pression atmosphérique
  - Luminosité
  - Vent
  - Pluviométrie

### Technologies logicielles

| Technologie | Utilisation |
|---|---|
| Linux / Home Assistant OS | Environnement de la plateforme domotique |
| Home Assistant | Centralisation et supervision des données |
| HTML / CSS | Structure et mise en forme de l’interface |
| JavaScript | Requêtes HTTP et actualisation dynamique des données |
| API REST / HTTP | Accès aux états des entités Home Assistant |
| API Météo-France | Intégration des données météorologiques externes |
| Wi-Fi | Connectivité réseau |

## 5. Choix techniques

Plusieurs combinaisons de technologies ont été étudiées au début du projet.

| Système | Interface / technologie | Communication | Complexité estimée | Choix |
|---|---|---|---|---|
| Linux / Home Assistant | HTML, CSS, JavaScript | Wi-Fi / REST | Modérée | Retenu |
| Linux | Qt / C++ | Bluetooth | Élevée | Non retenu |
| Linux | PHP | Zigbee / Z-Wave | Modérée | Non retenu |
| Linux | Python (script) | I²C / SPI / UART | Faible | Partiel / non retenu comme solution principale |

La solution Home Assistant associée à une interface Web a été retenue pour sa flexibilité, sa cohérence et sa facilité d'intégration dans le temps imparti. JavaScript côté client permet d'interroger directement l'API REST, sans ajouter de serveur intermédiaire dédié.

## 6. Fonctionnement de la partie logicielle

### 6.1. Rôle de Home Assistant

Home Assistant constitue le point central de l’architecture. Il permet :

- D’intégrer les données des capteurs physiques.
- De récupérer les informations météorologiques via l’intégration Météo-France configurée.
- D’exposer les états des capteurs sous forme d’entités.
- De rendre ces états accessibles à travers son API REST.

Chaque capteur est représenté par une entité identifiée par un `entity_id`. Son état courant (`state`) et ses attributs (`attributes`) peuvent être récupérés au format JSON.

### 6.2. Récupération des données via l’API REST

L’interface Web interroge l’API de Home Assistant au moyen de requêtes HTTP asynchrones utilisant la fonction `fetch()` de JavaScript.

Exemple de point d’accès :

```http
GET http://<IP_RASPBERRY>:8123/api/states/<entity_id>
Authorization: Bearer <TOKEN>
```

Le jeton d’accès permet d’authentifier les requêtes auprès de Home Assistant.

Le fonctionnement est le suivant :

1. Le navigateur charge la page Web.
2. JavaScript envoie une requête HTTP GET pour chaque entité à afficher.
3. Home Assistant renvoie les données au format JSON.
4. JavaScript extrait les valeurs utiles et actualise les éléments HTML.
5. Les requêtes sont répétées à intervalles réguliers, par exemple toutes les 30 secondes, sans recharger la page.

### 6.3. Affichage et traitement des données

Le traitement côté JavaScript reste volontairement simple :

- Extraction des valeurs depuis les réponses JSON.
- Formatage des valeurs numériques et ajout des unités.
- Affichage de la date et de l’heure.
- Mise à jour dynamique des éléments de la page.

Cette approche limite la complexité du code et facilite la maintenance de l’interface.

### 6.4. Gestion de la sécurité et de la communication

L’accès à l’API REST nécessite un jeton d’authentification Home Assistant. Celui-ci doit être conservé de manière sécurisée et ne pas être publié dans le dépôt GitHub.

Lorsque la page Web et Home Assistant sont hébergés sur des origines différentes, la politique CORS du navigateur peut bloquer les requêtes. La configuration réseau et les autorisations d’origine doivent alors être adaptées à l’architecture retenue.


## 8. Compétences mobilisées

- Architecture des systèmes embarqués.
- Acquisition de données environnementales.
- Intégration et supervision avec Home Assistant.
- Communication réseau Wi-Fi.
- Utilisation d’API REST et de requêtes HTTP.
- Développement Web avec HTML, CSS et JavaScript.
- Manipulation de données JSON.
- Tests et validation d’une architecture matérielle et logicielle.
- Travail collaboratif et intégration de composants.

## 9. Conclusion

Ce projet met en œuvre une architecture embarquée connectée associant capteurs, Raspberry Pi, Home Assistant et interface Web. L’utilisation de l’API REST permet de rendre les données accessibles à l’interface et de les afficher dynamiquement dans un navigateur.

Cette réalisation constitue une application pratique des principes d’acquisition de données, de communication réseau, de supervision et de développement logiciel dans le domaine des systèmes embarqués.

---

**Contexte académique :** UE 852.2 — Architectures Embarquées, Université de Lorraine.

**Encadrement :** Professeur Camille Diou.

**Domaines :** Systèmes embarqués · IoT · Home Assistant · API REST · HTML/CSS/JavaScript · Acquisition de données
