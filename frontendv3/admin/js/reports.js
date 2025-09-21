// Reports & Analytics Page Functionality
let selectedTemplate = null;
let currentChart = null;
let reportTemplates = [];

// Mock report templates data
const mockReportTemplates = [
    {
        id: 'patient_demographics',
        name: 'Patient Demographics Report',
        type: 'patient_summary',
        category: 'operational',
        description: 'Summary of patient demographics and age distribution',
        icon: '👥'
    },
    {
        id: 'transcription_volume',
        name: 'Transcription Volume Report',
        type: 'transcription_analytics',
        category: 'operational',
        description: 'Daily/weekly/monthly transcription volume and trends',
        icon: '📊'
    },
    {
        id: 'physician_productivity',
        name: 'Physician Productivity Report',
        type: 'physician_productivity',
        category: 'administrative',
        description: 'Sessions and patients handled by each physician',
        icon: '⚡'
    },
    {
        id: 'quality_metrics',
        name: 'AI Quality Metrics Report',
        type: 'quality_metrics',
        category: 'quality',
        description: 'Confidence scores and review rates for AI-generated content',
        icon: '🎯'
    },
    {
        id: 'system_usage',
        name: 'System Usage Report',
        type: 'system_usage',
        category: 'operational',
        description: 'Overall system usage patterns and peak times',
        icon: '📈'
    },
    {
        id: 'clinical_insights',
        name: 'Clinical Insights Report',
        type: 'clinical_analytics',
        category: 'clinical',
        description: 'Common diagnoses, medical entities, and clinical patterns',
        icon: '🏥'
    }
];

// Initialize reports page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('reports.html')) {
        initializeReportsPage();
    }
});

function initializeReportsPage() {
    console.log('Initializing reports page...');
    
    // Load report templates
    loadReportTemplates();
    
    // Initialize date range selector
    initializeDateRangeSelector();
    
    // Set default date range
    setDefaultDateRange();
    
    console.log('Reports page initialized successfully');
}

function loadReportTemplates() {
    const templatesContainer = document.getElementById('reportTemplates');
    if (!templatesContainer) return;
    
    templatesContainer.innerHTML = '';
    reportTemplates = mockReportTemplates;
    
    reportTemplates.forEach(template => {
        const templateCard = createTemplateCard(template);
        templatesContainer.appendChild(templateCard);
    });
}

function createTemplateCard(template) {
    const card = document.createElement('div');
    card.className = 'template-card';
    card.dataset.templateId = template.id;
    
    card.innerHTML = `
        <div class="template-header">
            <div class="template-icon ${template.category}">
                ${template.icon}
            </div>
            <div>
                <h4 class="template-title">${template.name}</h4>
                <div class="template-category">${template.category}</div>
            </div>
        </div>
        <p class="template-description">${template.description}</p>
    `;
    
    card.addEventListener('click', () => selectTemplate(template));
    
    return card;
}

function selectTemplate(template) {
    // Remove previous selection
    document.querySelectorAll('.template-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Select new template
    const templateCard = document.querySelector(`[data-template-id="${template.id}"]`);
    if (templateCard) {
        templateCard.classList.add('selected');
    }
    
    selectedTemplate = template;
    
    // Enable generate button
    const generateBtn = document.getElementById('generateReportBtn');
    if (generateBtn) {
        generateBtn.disabled = false;
    }
    
    console.log('Selected template:', template.name);
}

function initializeDateRangeSelector() {
    const dateRangeSelect = document.getElementById('dateRange');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    if (dateRangeSelect) {
        dateRangeSelect.addEventListener('change', function() {
            const isCustom = this.value === 'custom';
            
            if (startDateInput) startDateInput.style.display = isCustom ? 'block' : 'none';
            if (endDateInput) endDateInput.style.display = isCustom ? 'block' : 'none';
            
            if (!isCustom) {
                updateDateRange(parseInt(this.value));
            }
        });
    }
    
    // Initialize flatpickr for date inputs
    if (startDateInput) {
        flatpickr(startDateInput, {
            dateFormat: 'Y-m-d',
            maxDate: 'today'
        });
    }
    
    if (endDateInput) {
        flatpickr(endDateInput, {
            dateFormat: 'Y-m-d',
            maxDate: 'today'
        });
    }
}

function setDefaultDateRange() {
    updateDateRange(30); // Default to last 30 days
}

function updateDateRange(days) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    if (startDateInput) startDateInput.value = formatDate(startDate);
    if (endDateInput) endDateInput.value = formatDate(endDate);
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

async function generateReport() {
    if (!selectedTemplate) {
        showError('Please select a report template first.');
        return;
    }
    
    const parameters = getReportParameters();
    
    showLoading(true);
    hideResults();
    
    try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const reportData = await fetchReportData(selectedTemplate, parameters);
        displayReportResults(reportData);
        
        showSuccess(`${selectedTemplate.name} generated successfully!`);
    } catch (error) {
        showError('Failed to generate report: ' + error.message);
        console.error('Report generation error:', error);
    } finally {
        showLoading(false);
    }
}

function getReportParameters() {
    const dateRange = document.getElementById('dateRange').value;
    const physicianFilter = document.getElementById('physicianFilter').value;
    
    let startDate, endDate;
    
    if (dateRange === 'custom') {
        startDate = document.getElementById('startDate').value;
        endDate = document.getElementById('endDate').value;
    } else {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - parseInt(dateRange));
        startDate = formatDate(start);
        endDate = formatDate(end);
    }
    
    return {
        startDate,
        endDate,
        physicianFilter,
        dateRange
    };
}

async function fetchReportData(template, parameters) {
    // Mock API call - replace with actual API endpoint
    console.log('Fetching report data for:', template.name, parameters);
    
    // Generate mock data based on template type
    switch (template.id) {
        case 'patient_demographics':
            return generatePatientDemographicsData(parameters);
        case 'transcription_volume':
            return generateTranscriptionVolumeData(parameters);
        case 'physician_productivity':
            return generatePhysicianProductivityData(parameters);
        case 'quality_metrics':
            return generateQualityMetricsData(parameters);
        case 'system_usage':
            return generateSystemUsageData(parameters);
        case 'clinical_insights':
            return generateClinicalInsightsData(parameters);
        default:
            throw new Error('Unknown report template');
    }
}

function generatePatientDemographicsData(parameters) {
    return {
        title: 'Patient Demographics Report',
        summary: {
            totalPatients: 1247,
            newPatients: 89,
            averageAge: 42.3,
            genderDistribution: { male: 52, female: 46, other: 2 }
        },
        chartData: {
            type: 'doughnut',
            data: {
                labels: ['Male', 'Female', 'Other'],
                datasets: [{
                    data: [648, 574, 25],
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b']
                }]
            }
        },
        tableData: [
            { ageGroup: '0-18', count: 156, percentage: '12.5%' },
            { ageGroup: '19-35', count: 324, percentage: '26.0%' },
            { ageGroup: '36-50', count: 398, percentage: '31.9%' },
            { ageGroup: '51-65', count: 289, percentage: '23.2%' },
            { ageGroup: '65+', count: 80, percentage: '6.4%' }
        ]
    };
}

function generateTranscriptionVolumeData(parameters) {
    const days = parseInt(parameters.dateRange) || 30;
    const labels = [];
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        data.push(Math.floor(Math.random() * 50) + 10);
    }
    
    return {
        title: 'Transcription Volume Report',
        summary: {
            totalSessions: data.reduce((a, b) => a + b, 0),
            averageDaily: Math.round(data.reduce((a, b) => a + b, 0) / days),
            peakDay: Math.max(...data),
            totalHours: Math.round(data.reduce((a, b) => a + b, 0) * 0.75)
        },
        chartData: {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Daily Sessions',
                    data: data,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            }
        },
        tableData: labels.map((label, index) => ({
            date: label,
            sessions: data[index],
            avgDuration: `${Math.floor(Math.random() * 30) + 15} min`,
            status: 'Completed'
        }))
    };
}

function generatePhysicianProductivityData(parameters) {
    const physicians = ['Dr. Smith', 'Dr. Johnson', 'Dr. Williams', 'Dr. Brown', 'Dr. Davis'];
    const sessions = physicians.map(() => Math.floor(Math.random() * 100) + 20);
    const patients = physicians.map(() => Math.floor(Math.random() * 80) + 15);
    
    return {
        title: 'Physician Productivity Report',
        summary: {
            totalPhysicians: physicians.length,
            totalSessions: sessions.reduce((a, b) => a + b, 0),
            averageSessionsPerPhysician: Math.round(sessions.reduce((a, b) => a + b, 0) / physicians.length),
            mostActivePhysician: physicians[sessions.indexOf(Math.max(...sessions))]
        },
        chartData: {
            type: 'bar',
            data: {
                labels: physicians,
                datasets: [{
                    label: 'Total Sessions',
                    data: sessions,
                    backgroundColor: '#3b82f6'
                }, {
                    label: 'Unique Patients',
                    data: patients,
                    backgroundColor: '#10b981'
                }]
            }
        },
        tableData: physicians.map((physician, index) => ({
            physician: physician,
            sessions: sessions[index],
            patients: patients[index],
            avgSessionTime: `${Math.floor(Math.random() * 20) + 25} min`,
            efficiency: `${Math.floor(Math.random() * 20) + 80}%`
        }))
    };
}

function generateQualityMetricsData(parameters) {
    const days = parseInt(parameters.dateRange) || 30;
    const labels = [];
    const confidenceData = [];
    const reviewData = [];
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        confidenceData.push((Math.random() * 0.3 + 0.7).toFixed(3)); // 0.7-1.0
        reviewData.push(Math.floor(Math.random() * 40) + 60); // 60-100%
    }
    
    return {
        title: 'AI Quality Metrics Report',
        summary: {
            averageConfidence: (confidenceData.reduce((a, b) => parseFloat(a) + parseFloat(b), 0) / days).toFixed(3),
            reviewRate: Math.round(reviewData.reduce((a, b) => a + b, 0) / days),
            totalNotes: Math.floor(Math.random() * 500) + 200,
            highConfidenceNotes: Math.floor(Math.random() * 400) + 150
        },
        chartData: {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'AI Confidence Score',
                    data: confidenceData,
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    yAxisID: 'y'
                }, {
                    label: 'Review Rate (%)',
                    data: reviewData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    yAxisID: 'y1'
                }]
            }
        },
        tableData: labels.slice(-7).map((label, index) => ({
            date: label,
            confidence: confidenceData[confidenceData.length - 7 + index],
            reviewRate: `${reviewData[reviewData.length - 7 + index]}%`,
            notes: Math.floor(Math.random() * 20) + 5,
            issues: Math.floor(Math.random() * 3)
        }))
    };
}

function generateSystemUsageData(parameters) {
    const hours = Array.from({length: 24}, (_, i) => i);
    const usage = hours.map(() => Math.floor(Math.random() * 100));
    
    return {
        title: 'System Usage Report',
        summary: {
            peakHour: `${hours[usage.indexOf(Math.max(...usage))]}:00`,
            totalRequests: usage.reduce((a, b) => a + b, 0) * 10,
            averageResponseTime: `${Math.floor(Math.random() * 500) + 200}ms`,
            uptime: '99.8%'
        },
        chartData: {
            type: 'bar',
            data: {
                labels: hours.map(h => `${h}:00`),
                datasets: [{
                    label: 'Usage Count',
                    data: usage,
                    backgroundColor: '#f59e0b'
                }]
            }
        },
        tableData: [
            { metric: 'Total API Calls', value: '12,847', change: '+5.2%' },
            { metric: 'Average Response Time', value: '245ms', change: '-12.3%' },
            { metric: 'Error Rate', value: '0.2%', change: '-0.1%' },
            { metric: 'Active Users', value: '89', change: '+8.1%' },
            { metric: 'Storage Used', value: '2.4 GB', change: '+15.2%' }
        ]
    };
}

function generateClinicalInsightsData(parameters) {
    const conditions = ['Hypertension', 'Diabetes', 'Anxiety', 'Depression', 'Asthma'];
    const counts = conditions.map(() => Math.floor(Math.random() * 100) + 20);
    
    return {
        title: 'Clinical Insights Report',
        summary: {
            totalDiagnoses: counts.reduce((a, b) => a + b, 0),
            mostCommon: conditions[counts.indexOf(Math.max(...counts))],
            uniqueConditions: 47,
            averageConfidence: '0.847'
        },
        chartData: {
            type: 'horizontalBar',
            data: {
                labels: conditions,
                datasets: [{
                    label: 'Frequency',
                    data: counts,
                    backgroundColor: '#10b981'
                }]
            }
        },
        tableData: conditions.map((condition, index) => ({
            condition: condition,
            frequency: counts[index],
            confidence: (Math.random() * 0.3 + 0.7).toFixed(3),
            trend: Math.random() > 0.5 ? '↗️' : '↘️'
        }))
    };
}

function displayReportResults(reportData) {
    const resultsSection = document.getElementById('reportResults');
    const resultsTitle = document.getElementById('resultsTitle');
    const reportStats = document.getElementById('reportStats');
    const dataTableContainer = document.getElementById('dataTableContainer');
    
    if (resultsTitle) {
        resultsTitle.textContent = reportData.title;
    }
    
    // Display summary stats
    if (reportStats && reportData.summary) {
        reportStats.innerHTML = '';
        Object.entries(reportData.summary).forEach(([key, value]) => {
            const statCard = document.createElement('div');
            statCard.className = 'stat-card';
            statCard.innerHTML = `
                <div class="stat-value">${value}</div>
                <div class="stat-label">${formatStatLabel(key)}</div>
            `;
            reportStats.appendChild(statCard);
        });
    }
    
    // Display chart
    if (reportData.chartData) {
        displayChart(reportData.chartData);
    }
    
    // Display data table
    if (dataTableContainer && reportData.tableData) {
        displayDataTable(reportData.tableData, dataTableContainer);
    }
    
    if (resultsSection) {
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function formatStatLabel(key) {
    return key.replace(/([A-Z])/g, ' $1')
              .replace(/^./, str => str.toUpperCase())
              .trim();
}

function displayChart(chartConfig) {
    const canvas = document.getElementById('reportChart');
    if (!canvas) return;
    
    // Destroy existing chart
    if (currentChart) {
        currentChart.destroy();
    }
    
    const ctx = canvas.getContext('2d');
    
    const config = {
        type: chartConfig.type,
        data: chartConfig.data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: chartConfig.type === 'doughnut' ? {} : {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            }
        }
    };
    
    // Add second y-axis for quality metrics
    if (selectedTemplate && selectedTemplate.id === 'quality_metrics') {
        config.options.scales.y1 = {
            type: 'linear',
            display: true,
            position: 'right',
            grid: {
                drawOnChartArea: false,
            },
        };
    }
    
    currentChart = new Chart(ctx, config);
}

function displayDataTable(data, container) {
    if (!data || data.length === 0) {
        container.innerHTML = '<p>No data available</p>';
        return;
    }
    
    const headers = Object.keys(data[0]);
    
    const table = document.createElement('table');
    table.className = 'data-table';
    
    // Create header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = formatStatLabel(header);
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create body
    const tbody = document.createElement('tbody');
    data.forEach(row => {
        const tr = document.createElement('tr');
        headers.forEach(header => {
            const td = document.createElement('td');
            td.textContent = row[header];
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    
    container.innerHTML = '';
    container.appendChild(table);
}

function exportReport(format) {
    if (!selectedTemplate) {
        showError('No report to export');
        return;
    }
    
    const filename = `${selectedTemplate.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.${format}`;
    
    // Mock export functionality
    showSuccess(`Report exported as ${filename}`);
    
    // In a real implementation, you would:
    // 1. Send the report data to a backend service
    // 2. Generate the file in the requested format
    // 3. Return a download link or trigger a download
}

function showLoading(show) {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const generateBtn = document.getElementById('generateReportBtn');
    
    if (loadingSpinner) loadingSpinner.style.display = show ? 'flex' : 'none';
    if (generateBtn) generateBtn.disabled = show;
}

function hideResults() {
    const resultsSection = document.getElementById('reportResults');
    if (resultsSection) resultsSection.style.display = 'none';
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.style.cssText = `
        background: rgba(239, 68, 68, 0.1);
        color: #dc2626;
        border: 1px solid rgba(239, 68, 68, 0.2);
        border-left: 4px solid #dc2626;
        padding: 12px 16px;
        border-radius: 8px;
        margin-bottom: 16px;
        font-size: 14px;
    `;
    errorDiv.textContent = message;
    
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.insertBefore(errorDiv, mainContent.firstChild);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success';
    successDiv.style.cssText = `
        background: rgba(16, 185, 129, 0.1);
        color: #059669;
        border: 1px solid rgba(16, 185, 129, 0.2);
        border-left: 4px solid #059669;
        padding: 12px 16px;
        border-radius: 8px;
        margin-bottom: 16px;
        font-size: 14px;
    `;
    successDiv.textContent = message;
    
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.insertBefore(successDiv, mainContent.firstChild);
        
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 3000);
    }
}