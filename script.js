// Gravel Calculator - Main JavaScript

// Global state
let currentShape = 'rectangular';
let calculationHistory = [];

// Unit conversion factors (to feet)
const unitConversions = {
    ft: 1,
    m: 3.28084,
    in: 0.0833333,
    yd: 3,
    cm: 0.0328084,
    mm: 0.00328084,
    sqft: 1,
    sqm: 10.7639,
    sqyd: 9
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeShapeSelector();
    initializeDepthPresets();
    initializeCalculator();
    initializeActionButtons();
    loadCalculationHistory();
});

// Shape selector functionality
function initializeShapeSelector() {
    const shapeButtons = document.querySelectorAll('.shape-btn');
    
    shapeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            shapeButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get selected shape
            currentShape = this.getAttribute('data-shape');
            
            // Hide all forms
            document.querySelectorAll('.shape-form').forEach(form => {
                form.classList.remove('active');
            });
            
            // Show selected form
            document.getElementById(`${currentShape}-form`).classList.add('active');
        });
    });
}

// Depth preset buttons
function initializeDepthPresets() {
    const presetButtons = document.querySelectorAll('.preset-btn');
    const depthInput = document.getElementById('depth');
    const depthUnit = document.getElementById('depth-unit');
    
    presetButtons.forEach(button => {
        button.addEventListener('click', function() {
            const depth = this.getAttribute('data-depth');
            depthInput.value = depth;
            depthUnit.value = 'in';
            
            // Visual feedback
            presetButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Main calculator functionality
function initializeCalculator() {
    const calculateBtn = document.getElementById('calculate-btn');
    
    calculateBtn.addEventListener('click', function() {
        calculateGravel();
    });
    
    // Allow Enter key to trigger calculation
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                calculateGravel();
            }
        });
    });
}

// Main calculation function
function calculateGravel() {
    try {
        let areaInSquareFeet;
        
        // Calculate area based on shape
        switch(currentShape) {
            case 'rectangular':
                areaInSquareFeet = calculateRectangularArea();
                break;
            case 'circular':
                areaInSquareFeet = calculateCircularArea();
                break;
            case 'triangular':
                areaInSquareFeet = calculateTriangularArea();
                break;
            case 'irregular':
                areaInSquareFeet = calculateIrregularArea();
                break;
            default:
                throw new Error('Invalid shape selected');
        }
        
        // Get depth in feet
        const depth = parseFloat(document.getElementById('depth').value);
        const depthUnit = document.getElementById('depth-unit').value;
        const depthInFeet = depth * unitConversions[depthUnit];
        
        // Calculate volume in cubic feet
        const volumeCubicFeet = areaInSquareFeet * depthInFeet;
        
        // Convert to cubic yards
        const volumeCubicYards = volumeCubicFeet / 27;
        
        // Convert to cubic meters
        const volumeCubicMeters = volumeCubicFeet * 0.0283168;
        
        // Get gravel density and calculate weight
        const density = parseFloat(document.getElementById('gravel-type').value);
        const weightTons = volumeCubicYards * density;
        const weightPounds = weightTons * 2000;
        const weightKg = weightTons * 907.185;
        
        // Calculate cost if price is provided
        const price = parseFloat(document.getElementById('price').value) || 0;
        const totalCost = price > 0 ? weightTons * price : 0;
        
        // Display results
        displayResults({
            volumeCubicYards,
            volumeCubicFeet,
            volumeCubicMeters,
            weightTons,
            weightPounds,
            weightKg,
            areaInSquareFeet,
            totalCost,
            depthInFeet,
            density
        });
        
        // Save to history
        saveCalculation({
            shape: currentShape,
            volume: volumeCubicYards,
            weight: weightTons,
            cost: totalCost,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        alert('Please fill in all required fields with valid numbers.');
        console.error(error);
    }
}

// Calculate rectangular area
function calculateRectangularArea() {
    const length = parseFloat(document.getElementById('length').value);
    const lengthUnit = document.getElementById('length-unit').value;
    const width = parseFloat(document.getElementById('width').value);
    const widthUnit = document.getElementById('width-unit').value;
    
    if (isNaN(length) || isNaN(width)) {
        throw new Error('Invalid dimensions');
    }
    
    const lengthInFeet = length * unitConversions[lengthUnit];
    const widthInFeet = width * unitConversions[widthUnit];
    
    return lengthInFeet * widthInFeet;
}

// Calculate circular area
function calculateCircularArea() {
    const diameter = parseFloat(document.getElementById('diameter').value);
    const diameterUnit = document.getElementById('diameter-unit').value;
    
    if (isNaN(diameter)) {
        throw new Error('Invalid diameter');
    }
    
    const diameterInFeet = diameter * unitConversions[diameterUnit];
    const radius = diameterInFeet / 2;
    
    return Math.PI * radius * radius;
}

// Calculate triangular area
function calculateTriangularArea() {
    const base = parseFloat(document.getElementById('base').value);
    const baseUnit = document.getElementById('base-unit').value;
    const height = parseFloat(document.getElementById('height').value);
    const heightUnit = document.getElementById('height-unit').value;
    
    if (isNaN(base) || isNaN(height)) {
        throw new Error('Invalid dimensions');
    }
    
    const baseInFeet = base * unitConversions[baseUnit];
    const heightInFeet = height * unitConversions[heightUnit];
    
    return (baseInFeet * heightInFeet) / 2;
}

// Calculate irregular area
function calculateIrregularArea() {
    const area = parseFloat(document.getElementById('area').value);
    const areaUnit = document.getElementById('area-unit').value;
    
    if (isNaN(area)) {
        throw new Error('Invalid area');
    }
    
    return area * unitConversions[areaUnit];
}

// Display calculation results
function displayResults(results) {
    // Show results section
    const resultsSection = document.getElementById('results');
    resultsSection.classList.remove('hidden');
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Volume result
    document.getElementById('volume-result').innerHTML = `
        <div>${results.volumeCubicYards.toFixed(2)} yd³</div>
        <div style="font-size: 1rem; color: #6b7280; margin-top: 0.5rem;">
            ${results.volumeCubicFeet.toFixed(2)} ft³ | ${results.volumeCubicMeters.toFixed(2)} m³
        </div>
    `;
    
    // Weight result
    document.getElementById('weight-result').innerHTML = `
        <div>${results.weightTons.toFixed(2)} tons</div>
        <div style="font-size: 1rem; color: #6b7280; margin-top: 0.5rem;">
            ${results.weightPounds.toFixed(0)} lbs | ${results.weightKg.toFixed(0)} kg
        </div>
    `;
    
    // Area result
    document.getElementById('area-result').innerHTML = `
        <div>${results.areaInSquareFeet.toFixed(2)} ft²</div>
        <div style="font-size: 1rem; color: #6b7280; margin-top: 0.5rem;">
            ${(results.areaInSquareFeet / 10.7639).toFixed(2)} m²
        </div>
    `;
    
    // Cost result
    if (results.totalCost > 0) {
        document.getElementById('cost-result').innerHTML = `
            <div>$${results.totalCost.toFixed(2)}</div>
            <div style="font-size: 1rem; color: #6b7280; margin-top: 0.5rem;">
                $${(results.totalCost / results.weightTons).toFixed(2)} per ton
            </div>
        `;
    } else {
        document.getElementById('cost-result').innerHTML = `
            <div style="font-size: 1.25rem; color: #6b7280;">-</div>
            <div style="font-size: 0.875rem; color: #9ca3af; margin-top: 0.5rem;">
                Enter price to calculate
            </div>
        `;
    }
    
    // Alternative measurements
    const alternativeMeasurements = document.getElementById('alternative-measurements');
    alternativeMeasurements.innerHTML = `
        <li><strong>Bags (50 lb):</strong> ${Math.ceil(results.weightPounds / 50)} bags needed</li>
        <li><strong>Bags (40 lb):</strong> ${Math.ceil(results.weightPounds / 40)} bags needed</li>
        <li><strong>Dump Truck Loads (10 yd³):</strong> ${(results.volumeCubicYards / 10).toFixed(2)} loads</li>
        <li><strong>Wheelbarrows (3 ft³):</strong> ${Math.ceil(results.volumeCubicFeet / 3)} trips</li>
        <li><strong>Coverage at ${(results.depthInFeet * 12).toFixed(1)}" depth:</strong> ${results.areaInSquareFeet.toFixed(2)} ft²</li>
    `;
    
    // Pro tip based on calculation
    const proTip = generateProTip(results);
    document.getElementById('pro-tip').textContent = proTip;
}

// Generate contextual pro tip
function generateProTip(results) {
    const tips = [];
    
    if (results.depthInFeet < 0.25) {
        tips.push("Consider increasing depth to at least 3 inches for better coverage and weed control.");
    }
    
    if (results.weightTons > 10) {
        tips.push("For large orders over 10 tons, contact suppliers for bulk discounts and delivery options.");
    }
    
    if (results.volumeCubicYards < 1) {
        tips.push("For small projects under 1 cubic yard, bagged gravel from home improvement stores may be more convenient.");
    }
    
    if (results.depthInFeet > 0.5) {
        tips.push("For deep installations, consider using a base layer of larger crushed stone topped with decorative gravel.");
    }
    
    tips.push("Always order 5-10% extra material to account for settling, waste, and future touch-ups.");
    
    return tips[Math.floor(Math.random() * tips.length)];
}

// Action buttons functionality
function initializeActionButtons() {
    // Save button
    document.getElementById('save-btn').addEventListener('click', function() {
        const results = document.getElementById('results');
        if (!results.classList.contains('hidden')) {
            alert('Calculation saved to browser history!');
            // In a real application, this would save to localStorage or a database
        }
    });
    
    // Print button
    document.getElementById('print-btn').addEventListener('click', function() {
        window.print();
    });
    
    // Share button
    document.getElementById('share-btn').addEventListener('click', function() {
        const url = window.location.href;
        
        if (navigator.share) {
            navigator.share({
                title: 'Gravel Calculator Results',
                text: 'Check out my gravel calculation results!',
                url: url
            }).catch(err => console.log('Error sharing:', err));
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(url).then(() => {
                alert('Link copied to clipboard!');
            }).catch(err => {
                console.log('Error copying to clipboard:', err);
            });
        }
    });
}

// Save calculation to history
function saveCalculation(calculation) {
    calculationHistory.push(calculation);
    
    // Save to localStorage
    try {
        localStorage.setItem('gravelCalculatorHistory', JSON.stringify(calculationHistory));
    } catch (e) {
        console.log('Could not save to localStorage:', e);
    }
}

// Load calculation history
function loadCalculationHistory() {
    try {
        const history = localStorage.getItem('gravelCalculatorHistory');
        if (history) {
            calculationHistory = JSON.parse(history);
        }
    } catch (e) {
        console.log('Could not load from localStorage:', e);
    }
}

// Auto-save form data
function autoSaveFormData() {
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('change', function() {
            try {
                const formData = {};
                inputs.forEach(inp => {
                    if (inp.id) {
                        formData[inp.id] = inp.value;
                    }
                });
                localStorage.setItem('gravelCalculatorFormData', JSON.stringify(formData));
            } catch (e) {
                console.log('Could not save form data:', e);
            }
        });
    });
}

// Load saved form data
function loadFormData() {
    try {
        const formData = localStorage.getItem('gravelCalculatorFormData');
        if (formData) {
            const data = JSON.parse(formData);
            Object.keys(data).forEach(key => {
                const input = document.getElementById(key);
                if (input) {
                    input.value = data[key];
                }
            });
        }
    } catch (e) {
        console.log('Could not load form data:', e);
    }
}

// Initialize auto-save
document.addEventListener('DOMContentLoaded', function() {
    autoSaveFormData();
    loadFormData();
});

// Service worker registration for PWA (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Uncomment to enable PWA functionality
        // navigator.serviceWorker.register('/sw.js').then(function(registration) {
        //     console.log('ServiceWorker registration successful');
        // }, function(err) {
        //     console.log('ServiceWorker registration failed: ', err);
        // });
    });
}

// Analytics helper (for Google AdSense integration)
function trackCalculation(eventName, eventData) {
    // Google Analytics event tracking
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventData);
    }
    
    // Can also integrate with other analytics platforms
    console.log('Event tracked:', eventName, eventData);
}

// Add calculation tracking
document.addEventListener('DOMContentLoaded', function() {
    const calculateBtn = document.getElementById('calculate-btn');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', function() {
            trackCalculation('calculator_used', {
                shape: currentShape,
                event_category: 'engagement',
                event_label: 'gravel_calculation'
            });
        });
    }
});

