// Dashboard Budget CUCLM - Analyse par Ville
// Système interactif avec carte et graphiques dynamiques

class BudgetVillesCUCLM {
    constructor(dataUrl = 'budget-cuclm-villes-data-v2.json') {
        this.dataUrl = dataUrl;
        this.data = null;
        this.map = null;
        this.markers = {};
        this.selectedVille = null;
        this.selectedFonction = 'all';
        this.typeAffichage = 'total';
        
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Initialisation du dashboard...');
            await this.loadData();
            this.initMap();
            this.initControls();
            this.updateStats();
            this.updateCharts();
            console.log('✅ Dashboard initialisé avec succès');
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation:', error);
            this.showError('Erreur lors du chargement des données');
        }
    }

    async loadData() {
        try {
            console.log('🔄 Tentative de chargement:', this.dataUrl);
            const response = await fetch(this.dataUrl);
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
            }
            this.data = await response.json();
            console.log('✅ Données chargées avec succès:', this.data.metadata);
            console.log('📊 Nombre de villes:', this.data.villes.length);
            console.log('📊 Nombre de fonctions:', this.data.fonctions.length);
        } catch (error) {
            console.error('❌ Erreur chargement données:', error);
            console.error('📁 URL tentée:', this.dataUrl);
            
            // Afficher l'erreur à l'utilisateur
            const errorDiv = document.createElement('div');
            errorDiv.innerHTML = `
                <div style="background: #ff6b6b; color: white; padding: 20px; margin: 20px; border-radius: 8px;">
                    <h3>❌ Erreur de chargement</h3>
                    <p><strong>Fichier:</strong> ${this.dataUrl}</p>
                    <p><strong>Erreur:</strong> ${error.message}</p>
                    <p>Vérifiez que le fichier JSON existe et est accessible.</p>
                </div>
            `;
            document.body.appendChild(errorDiv);
            throw error;
        }
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
        
        // Couleur basée sur le type de ville
        const color = '#3498db'; // Couleur par défaut
        
        const marker = L.circleMarker(ville.coordonnees, {
            radius: size,
            fillColor: color,
            color: 'white',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(this.map);

        // Popup avec informations adaptées aux filtres
        this.updateMarkerPopup(marker, ville);
        
        // Gestionnaire de clic
        marker.on('click', () => {
            this.selectVille(ville);
        });

        return marker;
    }

    updateMarkerPopup(marker, ville) {
        const popupContent = this.generatePopupContent(ville);
        marker.bindPopup(popupContent);
    }

    generatePopupContent(ville) {
        const fonctionNom = this.selectedFonction === 'all' ? 
            'Budget total' : 
            this.data.fonctions.find(f => f.code == this.selectedFonction)?.nom || 'Fonction inconnue';
        
        const typeAffichageLabel = this.getTypeAffichageLabel();
        
        let budget, description, details = '';
        
        if (this.selectedFonction === 'all') {
            switch (this.typeAffichage) {
                case 'depenses':
                    budget = ville.total_depenses;
                    description = 'Total des dépenses';
                    break;
                case 'recettes':
                    budget = ville.total_recettes;
                    description = 'Total des recettes';
                    break;
                case 'par-habitant':
                    budget = (ville.total_depenses + ville.total_recettes) / ville.population;
                    description = 'Budget par habitant';
                    details = `<p style="margin: 5px 0;"><strong>Budget total:</strong> ${this.formatMoney(ville.total_depenses + ville.total_recettes)}</p>`;
                    break;
                default:
                    budget = ville.total_depenses + ville.total_recettes;
                    description = 'Budget total';
                    details = `
                        <p style="margin: 5px 0;"><strong>Dépenses:</strong> ${this.formatMoney(ville.total_depenses)}</p>
                        <p style="margin: 5px 0;"><strong>Recettes:</strong> ${this.formatMoney(ville.total_recettes)}</p>
                    `;
            }
        } else {
            const depense = ville.depenses_par_fonction[this.selectedFonction] || 0;
            const recette = ville.recettes_par_fonction[this.selectedFonction] || 0;
            
            switch (this.typeAffichage) {
                case 'depenses':
                    budget = depense;
                    description = `Dépenses - ${fonctionNom}`;
                    break;
                case 'recettes':
                    budget = recette;
                    description = `Recettes - ${fonctionNom}`;
                    break;
                case 'par-habitant':
                    budget = (depense + recette) / ville.population;
                    description = `${fonctionNom} par habitant`;
                    details = `<p style="margin: 5px 0;"><strong>Total fonction:</strong> ${this.formatMoney(depense + recette)}</p>`;
                    break;
                default:
                    budget = depense + recette;
                    description = `Budget ${fonctionNom}`;
                    details = `
                        <p style="margin: 5px 0;"><strong>Dépenses:</strong> ${this.formatMoney(depense)}</p>
                        <p style="margin: 5px 0;"><strong>Recettes:</strong> ${this.formatMoney(recette)}</p>
                    `;
            }
        }

        return `
            <div style="text-align: center; font-family: 'Inter', Arial, sans-serif; min-width: 200px;">
                <h3 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 1.1rem;">${ville.nom}</h3>
                <div style="background: #f8f9fa; padding: 8px; border-radius: 5px; margin: 8px 0;">
                    <p style="margin: 0; font-weight: 600; color: #3498db;">${description}</p>
                    <p style="margin: 5px 0 0 0; font-size: 1.1rem; font-weight: bold; color: #2c3e50;">${this.formatMoney(budget)}</p>
                </div>
                <p style="margin: 5px 0; font-size: 0.9rem;"><strong>Population:</strong> ${ville.population.toLocaleString()}</p>
                ${details}
                ${ville.chef_lieu ? '<p style="color: #e74c3c; font-weight: bold; margin: 5px 0;">🏛️ Chef-lieu</p>' : ''}
                <p style="margin-top: 10px; font-style: italic; font-size: 0.85rem; color: #7f8c8d;">Cliquez pour plus de détails</p>
            </div>
        `;
    }

    selectVille(ville) {
        console.log('🏘️ Ville sélectionnée:', ville.nom);
        
        // Mettre à jour la sélection
        this.selectedVille = ville;
        
        // Mettre à jour l'apparence des marqueurs
        this.updateMarkersAppearance();
        
        // Mettre à jour les informations de la ville
        this.updateVilleInfo();
        
        // Mettre à jour les graphiques
        this.updateCharts();
    }

    updateMarkersAppearance() {
        Object.entries(this.markers).forEach(([nom, marker]) => {
            if (nom === this.selectedVille?.nom) {
                marker.setStyle({
                    fillColor: '#f39c12',
                    color: '#e67e22',
                    weight: 3,
                    fillOpacity: 1
                });
            } else {
                const ville = this.data.villes.find(v => v.nom === nom);
                marker.setStyle({
                    fillColor: ville.chef_lieu ? '#e74c3c' : '#3498db',
                    color: 'white',
                    weight: 2,
                    fillOpacity: 0.8
                });
            }
        });
    }

    initControls() {
        // Remplir le sélecteur de fonctions
        const fonctionSelect = document.getElementById('fonction-select');
        this.data.fonctions.forEach(fonction => {
            const option = document.createElement('option');
            option.value = fonction.code;
            option.textContent = `${fonction.nom} (${this.formatMoney(fonction.montant_total)})`;
            fonctionSelect.appendChild(option);
        });

        // Gestionnaires d'événements
        fonctionSelect.addEventListener('change', (e) => {
            this.selectedFonction = e.target.value;
            this.updateMarkersAndCharts();
        });

        document.getElementById('type-affichage').addEventListener('change', (e) => {
            this.typeAffichage = e.target.value;
            this.updateMarkersAndCharts();
        });
    }

    updateMarkersAndCharts() {
        // Mettre à jour les marqueurs avec les nouveaux calculs
        this.data.villes.forEach(ville => {
            const budget = this.calculateBudgetForDisplay(ville);
            const marker = this.markers[ville.nom];
            
            // Recalculer la taille
            const maxBudget = Math.max(...this.data.villes.map(v => this.calculateBudgetForDisplay(v)));
            const size = Math.max(10, (budget / maxBudget) * 30 + 10);
            marker.setRadius(size);
            
            // Mettre à jour le popup avec les nouvelles informations
            this.updateMarkerPopup(marker, ville);
        });

        this.updateCharts();
        
        // Mettre à jour les informations de la ville si une ville est sélectionnée
        if (this.selectedVille) {
            this.updateVilleInfo();
        }
    }

    calculateBudgetForDisplay(ville) {
        if (this.selectedFonction === 'all') {
            switch (this.typeAffichage) {
                case 'depenses':
                    return ville.total_depenses;
                case 'recettes':
                    return ville.total_recettes;
                case 'par-habitant':
                    return (ville.total_depenses + ville.total_recettes) / ville.population;
                default:
                    return ville.total_depenses + ville.total_recettes;
            }
        } else {
            const depense = ville.depenses_par_fonction[this.selectedFonction] || 0;
            const recette = ville.recettes_par_fonction[this.selectedFonction] || 0;
            
            switch (this.typeAffichage) {
                case 'depenses':
                    return depense;
                case 'recettes':
                    return recette;
                case 'par-habitant':
                    return (depense + recette) / ville.population;
                default:
                    return depense + recette;
            }
        }
    }

    updateStats() {
        document.getElementById('stat-budget').textContent = this.formatMoney(this.data.synthese.budget_total);
        document.getElementById('stat-villes').textContent = this.data.synthese.nombre_villes;
        document.getElementById('stat-population').textContent = this.data.synthese.population_totale.toLocaleString();
        document.getElementById('stat-par-habitant').textContent = this.formatMoney(this.data.synthese.budget_par_habitant);
    }

    updateVilleInfo() {
        const nomElement = document.getElementById('ville-nom');
        const detailsElement = document.getElementById('ville-details');

        if (!this.selectedVille) {
            nomElement.textContent = 'Sélectionnez une ville';
            detailsElement.innerHTML = '<div class="loading">Cliquez sur une ville de la carte pour voir les détails</div>';
            return;
        }

        const ville = this.selectedVille;
        nomElement.textContent = `${ville.nom} ${ville.chef_lieu ? '🏛️' : ''}`;

        // Adapter les informations selon la fonction et l'affichage sélectionnés
        let contenu = `
            <div class="ville-detail">
                <span class="detail-label">Population</span>
                <span class="detail-value">${ville.population.toLocaleString()} hab.</span>
            </div>
        `;

        if (this.selectedFonction === 'all') {
            // Affichage pour toutes les fonctions
            const budgetTotal = ville.total_depenses + ville.total_recettes;
            const budgetParHab = budgetTotal / ville.population;
            
            contenu += `
                <div class="ville-detail">
                    <span class="detail-label">Total dépenses</span>
                    <span class="detail-value">${this.formatMoney(ville.total_depenses)}</span>
                </div>
                <div class="ville-detail">
                    <span class="detail-label">Total recettes</span>
                    <span class="detail-value">${this.formatMoney(ville.total_recettes)}</span>
                </div>
                <div class="ville-detail">
                    <span class="detail-label">Budget total</span>
                    <span class="detail-value">${this.formatMoney(budgetTotal)}</span>
                </div>
                <div class="ville-detail">
                    <span class="detail-label">Budget / habitant</span>
                    <span class="detail-value">${this.formatMoney(budgetParHab)}</span>
                </div>
            `;
        } else {
            // Affichage pour une fonction spécifique
            const fonction = this.data.fonctions.find(f => f.code == this.selectedFonction);
            const depense = ville.depenses_par_fonction[this.selectedFonction] || 0;
            const recette = ville.recettes_par_fonction[this.selectedFonction] || 0;
            const total = depense + recette;
            const parHab = total / ville.population;
            
            contenu += `
                <div class="ville-detail" style="background: #f8f9fa; padding: 0.5rem; border-radius: 5px; margin: 0.5rem 0;">
                    <span class="detail-label" style="color: #2c3e50; font-weight: 600;">Fonction sélectionnée</span>
                    <span class="detail-value" style="color: #3498db;">${fonction?.nom || 'Inconnue'}</span>
                </div>
                <div class="ville-detail">
                    <span class="detail-label">Dépenses fonction</span>
                    <span class="detail-value">${this.formatMoney(depense)}</span>
                </div>
                <div class="ville-detail">
                    <span class="detail-label">Recettes fonction</span>
                    <span class="detail-value">${this.formatMoney(recette)}</span>
                </div>
                <div class="ville-detail">
                    <span class="detail-label">Total fonction</span>
                    <span class="detail-value">${this.formatMoney(total)}</span>
                </div>
                <div class="ville-detail">
                    <span class="detail-label">Par habitant (fonction)</span>
                    <span class="detail-value">${this.formatMoney(parHab)}</span>
                </div>
            `;
        }

        // Ajouter des informations contextuelles selon le type d'affichage
        const typeInfo = this.getTypeAffichageInfo();
        if (typeInfo) {
            contenu += `
                <div class="ville-detail" style="background: #e8f4fd; padding: 0.5rem; border-radius: 5px; margin: 0.5rem 0;">
                    <span class="detail-label" style="color: #2c3e50;">Affichage actuel</span>
                    <span class="detail-value" style="color: #3498db;">${typeInfo}</span>
                </div>
            `;
        }

        contenu += `
            <div class="ville-detail">
                <span class="detail-label">Type</span>
                <span class="detail-value">${ville.chef_lieu ? 'Chef-lieu' : 'Commune'}</span>
            </div>
        `;

        detailsElement.innerHTML = contenu;
    }

    getTypeAffichageInfo() {
        switch (this.typeAffichage) {
            case 'depenses': return 'Dépenses uniquement';
            case 'recettes': return 'Recettes uniquement';
            case 'par-habitant': return 'Montant par habitant';
            case 'total': return 'Budget total (dépenses + recettes)';
            default: return null;
        }
    }

    updateCharts() {
        this.updateChartVilleFonctions();
        this.updateChartComparaisonVilles();
        this.updateChartFonctionDetail();
        this.updateChartDepensesRecettes();
    }

    updateChartVilleFonctions() {
        if (!this.selectedVille) {
            document.getElementById('chart-ville-fonctions').innerHTML = 
                '<div class="loading">Sélectionnez une ville pour voir la répartition par fonction</div>';
            return;
        }

        const ville = this.selectedVille;
        const fonctions = [];
        const depenses = [];
        const recettes = [];

        this.data.fonctions.forEach(fonction => {
            const depense = ville.depenses_par_fonction[fonction.code] || 0;
            const recette = ville.recettes_par_fonction[fonction.code] || 0;
            
            if (depense > 0 || recette > 0) {
                fonctions.push(fonction.nom);
                depenses.push(depense);
                recettes.push(recette);
            }
        });

        const trace1 = {
            x: fonctions,
            y: depenses,
            type: 'bar',
            name: 'Dépenses',
            marker: { color: '#e74c3c' }
        };

        const trace2 = {
            x: fonctions,
            y: recettes,
            type: 'bar',
            name: 'Recettes',
            marker: { color: '#27ae60' }
        };

        const layout = {
            title: `Répartition pour ${ville.nom}`,
            xaxis: { title: 'Fonctions' },
            yaxis: { title: 'Montant (€)' },
            barmode: 'group',
            height: 350
        };

        Plotly.newPlot('chart-ville-fonctions', [trace1, trace2], layout, {responsive: true});
    }

    updateChartComparaisonVilles() {
        const villes = this.data.villes.map(v => v.nom);
        const budgets = this.data.villes.map(v => this.calculateBudgetForDisplay(v));
        
        const trace = {
            x: villes,
            y: budgets,
            type: 'bar',
            marker: { 
                color: budgets,
                colorscale: 'Viridis'
            }
        };

        const layout = {
            title: `Comparaison - ${this.getTypeAffichageLabel()}`,
            xaxis: { title: 'Villes' },
            yaxis: { title: 'Montant (€)' },
            height: 350
        };

        Plotly.newPlot('chart-comparaison-villes', [trace], layout, {responsive: true});
    }

    updateChartFonctionDetail() {
        if (this.selectedFonction === 'all') {
            document.getElementById('chart-fonction-detail').innerHTML = 
                '<div class="loading">Sélectionnez une fonction spécifique pour voir les détails</div>';
            return;
        }

        const fonction = this.data.fonctions.find(f => f.code == this.selectedFonction);
        if (!fonction) return;

        const chapitres = fonction.principaux_chapitres.map(c => c.nom);
        const montants = fonction.principaux_chapitres.map(c => c.montant);

        const trace = {
            labels: chapitres,
            values: montants,
            type: 'pie',
            hole: 0.4
        };

        const layout = {
            title: `Détail: ${fonction.nom}`,
            height: 350
        };

        Plotly.newPlot('chart-fonction-detail', [trace], layout, {responsive: true});
    }

    updateChartDepensesRecettes() {
        const villes = this.data.villes.map(v => v.nom);
        const depenses = this.data.villes.map(v => v.total_depenses);
        const recettes = this.data.villes.map(v => v.total_recettes);

        const trace1 = {
            x: villes,
            y: depenses,
            type: 'scatter',
            mode: 'markers',
            name: 'Dépenses',
            marker: { 
                color: '#e74c3c',
                size: 12
            }
        };

        const trace2 = {
            x: villes,
            y: recettes,
            type: 'scatter',
            mode: 'markers',
            name: 'Recettes',
            marker: { 
                color: '#27ae60',
                size: 12
            }
        };

        const layout = {
            title: 'Dépenses vs Recettes par ville',
            xaxis: { title: 'Villes' },
            yaxis: { title: 'Montant (€)' },
            height: 350
        };

        Plotly.newPlot('chart-depenses-recettes', [trace1, trace2], layout, {responsive: true});
    }

    getTypeAffichageLabel() {
        switch (this.typeAffichage) {
            case 'depenses': return 'Dépenses';
            case 'recettes': return 'Recettes';
            case 'par-habitant': return 'Budget par habitant';
            default: return 'Budget total';
        }
    }

    formatMoney(amount) {
        if (amount >= 1e9) {
            return (amount / 1e9).toFixed(1) + 'Md€';
        } else if (amount >= 1e6) {
            return (amount / 1e6).toFixed(1) + 'M€';
        } else if (amount >= 1e3) {
            return (amount / 1e3).toFixed(0) + 'k€';
        } else {
            return amount.toFixed(0) + '€';
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

// L'initialisation se fait maintenant dans le HTML avec paramètres
