// Dashboard Budget CUCLM - Version Corrigée pour nouvelle structure JSON
class BudgetVillesCUCLM {
    constructor(dataUrl = '../budget-cuclm-final-avec-categories.json') {
        this.dataUrl = dataUrl;
        this.data = null;
        this.map = null;
        this.markers = {};
        this.selectedVille = null;
        this.selectedFonction = 'all';
        this.typeAffichage = 'total';
        this.selectedCategorie = 'all';
        this.categories = { recettes: [], depenses: [] };
        
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Initialisation du dashboard...');
            await this.loadData();
            
            // Vérifier que les données sont valides
            if (!this.data || !this.data.villes || !Array.isArray(this.data.villes)) {
                throw new Error('Structure de données invalide');
            }
            
            if (this.data.villes.length === 0) {
                throw new Error('Aucune commune trouvée dans les données');
            }
            
            this.initMap();
            this.initControls();
            this.updateStats();
            console.log(`✅ Dashboard initialisé avec succès - ${this.data.villes.length} communes chargées`);
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation:', error);
            this.showError(`Erreur lors du chargement: ${error.message}`);
        }
    }

    async loadData() {
        try {
            console.log('🔄 Tentative de chargement:', this.dataUrl);
            const response = await fetch(this.dataUrl);
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
            }
            
            const text = await response.text();
            if (!text) {
                throw new Error('Fichier JSON vide');
            }
            
            const rawData = JSON.parse(text);
            console.log('📊 Structure reçue:', Object.keys(rawData));
            
            // Adapter selon la structure reçue
            if (rawData.communes) {
                // Structure: { meta: {...}, communes: {...} }
                console.log('📁 Structure avec "communes" détectée');
                this.data = {
                    villes: this.convertCommunesToVilles(rawData.communes),
                    metadata: rawData.meta || {}
                };
            } else if (rawData.villes) {
                // Structure: { villes: [...], fonctions: [...] }
                console.log('📁 Structure avec "villes" détectée');
                this.data = rawData;
            } else {
                // Essayer de détecter automatiquement
                console.log('📁 Structure inconnue, tentative d\'adaptation...');
                const keys = Object.keys(rawData);
                if (keys.length > 0 && typeof rawData[keys[0]] === 'object' && rawData[keys[0]].latitude) {
                    // Probablement un objet de communes
                    this.data = {
                        villes: this.convertCommunesToVilles(rawData),
                        metadata: {}
                    };
                } else {
                    throw new Error('Structure de données non reconnue');
                }
            }
            
            // Ajouter les fonctions si elles n'existent pas
            if (!this.data.fonctions) {
                this.data.fonctions = this.generateFonctions();
            }
            
            // Charger les catégories si disponibles
            if (rawData.categories) {
                this.categories = rawData.categories;
            }
            
            console.log('✅ Données chargées avec succès - VRAIES VALEURS AVEC CATÉGORIES');
            console.log('📊 Nombre de communes:', this.data.villes.length);
            console.log('📊 Budget total:', this.data.metadata?.budget_total || 'N/A');
            console.log('📊 Catégories recettes:', this.categories.recettes?.length || 0);
            console.log('📊 Catégories dépenses:', this.categories.depenses?.length || 0);
            
        } catch (error) {
            console.error('❌ Erreur lors du chargement des données:', error);
            throw error;
        }
    }

    convertCommunesToVilles(communes) {
        const villes = [];
        
        for (const [nom, commune] of Object.entries(communes)) {
            const ville = {
                nom: commune.nom || nom,
                coordonnees: [commune.latitude || 49.1829, commune.longitude || -0.3707],
                population: commune.population || 1000,
                budget: commune.budget || {
                    total: 0,
                    recettes: 0,
                    depenses: 0
                },
                fonctions: commune.fonctions || {},
                stats: commune.stats || {}
            };
            
            villes.push(ville);
        }
        
        console.log(`🔄 Converties ${villes.length} communes en villes`);
        return villes;
    }

    generateFonctions() {
        return [
            { code: 0, nom: 'Services généraux', total: 0 },
            { code: 1, nom: 'Sécurité et salubrité publiques', total: 0 },
            { code: 2, nom: 'Enseignement - Formation', total: 0 },
            { code: 3, nom: 'Culture', total: 0 },
            { code: 4, nom: 'Sport et jeunesse', total: 0 },
            { code: 5, nom: 'Interventions sociales et santé', total: 0 },
            { code: 6, nom: 'Famille', total: 0 },
            { code: 7, nom: 'Logement', total: 0 },
            { code: 8, nom: 'Aménagement et services urbains', total: 0 },
            { code: 9, nom: 'Action économique', total: 0 }
        ];
    }

    initMap() {
        // Initialiser la carte centrée sur Caen
        this.map = L.map('map').setView([49.1829, -0.3707], 11);

        // Ajouter les tuiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        // Ajouter les marqueurs pour chaque ville
        this.data.villes.forEach(ville => {
            const budget = this.calculateBudgetForDisplay(ville);
            const marker = this.createMarker(ville, budget);
            this.markers[ville.nom] = marker;
        });

        console.log('🗺️ Carte initialisée avec', Object.keys(this.markers).length, 'marqueurs');
    }

    createMarker(ville, budget) {
        // Taille du marqueur basée sur le budget
        const maxBudget = Math.max(...this.data.villes.map(v => this.calculateBudgetForDisplay(v)));
        const size = Math.max(10, (budget / maxBudget) * 30 + 10);
        
        // Coordonnées: [latitude, longitude]
        const coords = ville.coordonnees || [ville.latitude || 49.1829, ville.longitude || -0.3707];
        
        const marker = L.circleMarker(coords, {
            radius: size,
            fillColor: '#3498db',
            color: 'white',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(this.map);

        // Popup simple
        this.updateMarkerPopup(marker, ville);
        
        // Gestionnaire de clic
        marker.on('click', () => {
            this.selectVille(ville);
        });

        return marker;
    }

    updateMarkerPopup(marker, ville) {
        const budget = this.calculateBudgetForDisplay(ville);
        const population = ville.population || 0;
        const popupContent = `
            <div style="text-align: center; font-family: Arial, sans-serif;">
                <h3 style="margin: 0 0 10px 0;">${ville.nom || 'Commune'}</h3>
                <p><strong>Population:</strong> ${population.toLocaleString()}</p>
                <p><strong>Budget:</strong> ${this.formatMoney(budget)}</p>
                <p><strong>Recettes:</strong> ${this.formatMoney(ville.budget?.recettes || 0)}</p>
                <p><strong>Dépenses:</strong> ${this.formatMoney(ville.budget?.depenses || 0)}</p>
            </div>
        `;
        marker.bindPopup(popupContent);
    }

    selectVille(ville) {
        console.log('🏘️ Ville sélectionnée:', ville.nom);
        this.selectedVille = ville;
        this.updateMarkersAppearance();
        this.updateVilleInfo();
    }

    updateMarkersAppearance() {
        Object.entries(this.markers).forEach(([nom, marker]) => {
            if (nom === this.selectedVille?.nom) {
                marker.setStyle({
                    fillColor: '#f39c12',
                    color: '#e67e22',
                    weight: 3
                });
            } else {
                marker.setStyle({
                    fillColor: '#3498db',
                    color: 'white',
                    weight: 2
                });
            }
        });
    }

    initControls() {
        // Remplir le sélecteur de fonctions
        const fonctionSelect = document.getElementById('fonction-select');
        if (fonctionSelect) {
            this.data.fonctions.forEach(fonction => {
                const option = document.createElement('option');
                option.value = fonction.code;
                option.textContent = `${fonction.nom} (${this.formatMoney(fonction.total || 0)})`;
                fonctionSelect.appendChild(option);
            });

            fonctionSelect.addEventListener('change', (e) => {
                this.selectedFonction = e.target.value;
                this.updateMarkersAndCharts();
            });
        }

        // Sélecteur de type d'affichage avec nouvelles options
        const typeSelect = document.getElementById('type-affichage');
        if (typeSelect) {
            typeSelect.addEventListener('change', (e) => {
                this.typeAffichage = e.target.value;
                this.updateMarkersAndCharts();
            });
        }

        // Nouveau sélecteur de catégories
        const categorieSelect = document.getElementById('categorie-select');
        if (categorieSelect) {
            // Ajouter les catégories de recettes
            if (this.categories.recettes && this.categories.recettes.length > 0) {
                const recettesGroup = document.createElement('optgroup');
                recettesGroup.label = 'Recettes';
                this.categories.recettes.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = `recette-${cat}`;
                    option.textContent = cat;
                    recettesGroup.appendChild(option);
                });
                categorieSelect.appendChild(recettesGroup);
            }

            // Ajouter les catégories de dépenses
            if (this.categories.depenses && this.categories.depenses.length > 0) {
                const depensesGroup = document.createElement('optgroup');
                depensesGroup.label = 'Dépenses';
                this.categories.depenses.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = `depense-${cat}`;
                    option.textContent = cat;
                    depensesGroup.appendChild(option);
                });
                categorieSelect.appendChild(depensesGroup);
            }

            categorieSelect.addEventListener('change', (e) => {
                this.selectedCategorie = e.target.value;
                this.updateMarkersAndCharts();
            });
        }
    }

    updateMarkersAndCharts() {
        // Mettre à jour les marqueurs
        this.data.villes.forEach(ville => {
            const budget = this.calculateBudgetForDisplay(ville);
            const marker = this.markers[ville.nom];
            
            // Recalculer la taille
            const maxBudget = Math.max(...this.data.villes.map(v => this.calculateBudgetForDisplay(v)));
            const size = Math.max(10, (budget / maxBudget) * 30 + 10);
            marker.setRadius(size);
            
            // Mettre à jour le popup
            this.updateMarkerPopup(marker, ville);
        });

        if (this.selectedVille) {
            this.updateVilleInfo();
        }
    }

    calculateBudgetForDisplay(ville) {
        // Vérifier que la ville a un budget défini
        if (!ville || !ville.budget) {
            return 0;
        }
        
        const population = ville.population || 1;
        
        // Calculer selon le type d'affichage
        switch (this.typeAffichage) {
            case 'total':
                return ville.budget.total || 0;
                
            case 'depenses':
                return ville.budget.depenses || 0;
                
            case 'recettes':
                return ville.budget.recettes || 0;
                
            case 'delta':
                return ville.budget.delta || ((ville.budget.recettes || 0) - (ville.budget.depenses || 0));
                
            case 'moyenne-par-habitant':
                return (ville.budget.total || 0) / population;
                
            default:
                return ville.budget.total || 0;
        }
    }

    updateStats() {
        // Calculer les statistiques à partir des données réelles
        const totalBudget = this.data.villes.reduce((sum, v) => sum + (v.budget?.total || 0), 0);
        const totalDepenses = this.data.villes.reduce((sum, v) => sum + (v.budget?.depenses || 0), 0);
        const totalCommunes = this.data.villes.length;
        
        // Trouver la commune principale
        const communePrincipale = this.data.villes.reduce((max, v) => 
            (v.budget?.total || 0) > (max.budget?.total || 0) ? v : max, 
            this.data.villes[0] || {}
        );
        
        // Mettre à jour les éléments du DOM
        const budgetElement = document.getElementById('stat-budget');
        const communesElement = document.getElementById('stat-communes');
        const depensesElement = document.getElementById('stat-depenses');
        const principaleElement = document.getElementById('stat-commune-principale');
        
        if (budgetElement) budgetElement.textContent = this.formatMoney(totalBudget);
        if (communesElement) communesElement.textContent = totalCommunes;
        if (depensesElement) depensesElement.textContent = this.formatMoney(totalDepenses);
        if (principaleElement) principaleElement.textContent = communePrincipale.nom || 'N/A';
    }

    updateVilleInfo() {
        const nomElement = document.getElementById('ville-nom');
        const detailsElement = document.getElementById('ville-details');

        if (!this.selectedVille) {
            if (nomElement) nomElement.textContent = 'Sélectionnez une commune';
            if (detailsElement) detailsElement.innerHTML = '<div class="loading">Cliquez sur une commune de la carte pour voir les détails</div>';
            return;
        }

        const ville = this.selectedVille;
        if (nomElement) nomElement.textContent = ville.nom || 'Commune';

        const population = ville.population || 0;
        const budgetTotal = ville.budget?.total || 0;
        const budgetDepenses = ville.budget?.depenses || 0;
        const budgetRecettes = ville.budget?.recettes || 0;
        const budgetParHab = population > 0 ? budgetTotal / population : 0;

        let contenu = `
            <div class="ville-detail">
                <span class="detail-label">Population</span>
                <span class="detail-value">${population.toLocaleString()} hab.</span>
            </div>
            <div class="ville-detail">
                <span class="detail-label">Budget total</span>
                <span class="detail-value">${this.formatMoney(budgetTotal)}</span>
            </div>
            <div class="ville-detail">
                <span class="detail-label">Total dépenses</span>
                <span class="detail-value">${this.formatMoney(budgetDepenses)}</span>
            </div>
            <div class="ville-detail">
                <span class="detail-label">Total recettes</span>
                <span class="detail-value">${this.formatMoney(budgetRecettes)}</span>
            </div>
            <div class="ville-detail">
                <span class="detail-label">Budget / habitant</span>
                <span class="detail-value">${this.formatMoney(budgetParHab)}</span>
            </div>
        `;

        if (detailsElement) detailsElement.innerHTML = contenu;
    }

    formatMoney(amount) {
        // Vérifier si amount est défini et est un nombre
        if (amount === undefined || amount === null || isNaN(amount)) {
            return '0€';
        }
        
        const numAmount = Number(amount);
        if (numAmount >= 1e9) {
            return (numAmount / 1e9).toFixed(1) + 'Md€';
        } else if (numAmount >= 1e6) {
            return (numAmount / 1e6).toFixed(1) + 'M€';
        } else if (numAmount >= 1e3) {
            return (numAmount / 1e3).toFixed(0) + 'k€';
        } else {
            return numAmount.toFixed(0) + '€';
        }
    }

    showError(message) {
        document.body.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column;">
                <h2 style="color: #e74c3c;">❌ Erreur</h2>
                <p>${message}</p>
                <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 20px; border: none; background: #3498db; color: white; border-radius: 5px; cursor: pointer;">
                    Recharger la page
                </button>
            </div>
        `;
    }
}
