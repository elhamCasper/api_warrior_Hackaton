// Application State
let currentUser = null;
let patients = [];
let medicalRecords = [];
let currentFiles = [];

// Mock Data
const mockPatients = [
    {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        dob: '1985-03-15',
        gender: 'male',
        phone: '(555) 123-4567',
        email: 'john.doe@email.com',
        address: '123 Main St, City, State 12345',
        lastVisit: '2024-09-15'
    },
    {
        id: 2,
        firstName: 'Sarah',
        lastName: 'Johnson',
        dob: '1992-07-22',
        gender: 'female',
        phone: '(555) 987-6543',
        email: 'sarah.j@email.com',
        address: '456 Oak Ave, City, State 12345',
        lastVisit: '2024-09-18'
    },
    {
        id: 3,
        firstName: 'Mike',
        lastName: 'Wilson',
        dob: '1978-11-08',
        gender: 'male',
        phone: '(555) 456-7890',
        email: 'mike.wilson@email.com',
        address: '789 Pine Rd, City, State 12345',
        lastVisit: '2024-09-20'
    }
];

const mockRecords = [
    {
        id: 1,
        patientId: 1,
        patientName: 'John Doe',
        date: '2024-09-20',
        type: 'Consultation',
        status: 'completed',
        transcription: 'Patient reports chest pain...',
        clinicalNote: 'Assessment: Possible cardiac issue...'
    },
    {
        id: 2,
        patientId: 2,
        patientName: 'Sarah Johnson',
        date: '2024-09-18',
        type: 'Follow-up',
        status: 'completed',
        transcription: 'Follow-up for diabetes management...',
        clinicalNote: 'Patient showing good progress...'
    }
];// In
itialize Application
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const userData = localStorage.getItem('medTranscribeUser');
    if (!userData) {
        window.location.href = '../../index.html';
        return;
    }
    
    currentUser = JSON.parse(userData);
    patients = [...mockPatients];
    medicalRecords = [...mockRecords];
    
    updateUserInfo();
    initializeCurrentPage();
});

function updateUserInfo() {
    if (currentUser) {
        const userNameEl = document.getElementById('userName');
        const userInitialsEl = document.getElementById('userInitials');
        
        if (userNameEl) userNameEl.textContent = currentUser.name;
        if (userInitialsEl) {
            const initials = currentUser.name.split(' ').map(n => n[0]).join('');
            userInitialsEl.textContent = initials;
        }
    }
}

function logout() {
    localStorage.removeItem('medTranscribeUser');
    window.location.href = '../../index.html';
}

function initializeCurrentPage() {
    const currentPage = window.location.pathname.split('/').pop();
    
    switch(currentPage) {
        case 'patients.html':
            loadPatients();
            initializePatientForm();
            break;
        case 'transcribe.html':
            loadPatientSelector();
            initializeTranscribeUpload();
            break;
        case 'records.html':
            loadRecords();
            initializeRecordsSearch();
            break;
        default:
            // Dashboard page - no additional initialization needed
            break;
    }
}

// Patient Management Functions
function loadPatients() {
    const patientsGrid = document.getElementById('patientsGrid');
    if (!patientsGrid) return;
    
    patientsGrid.innerHTML = '';
    
    patients.forEach(patient => {
        const patientCard = createPatientCard(patient);
        patientsGrid.appendChild(patientCard);
    });
}

function createPatientCard(patient) {
    const div = document.createElement('div');
    div.className = 'patient-card';
    
    const age = calculateAge(patient.dob);
    
    div.innerHTML = `
        <div class="patient-header">
            <div class="patient-info">
                <h3>${patient.firstName} ${patient.lastName}</h3>
                <p>${age} years old • ${patient.gender}</p>
            </div>
            <div class="patient-actions">
                <button onclick="editPatient(${patient.id})" title="Edit Patient">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <button onclick="viewPatientRecords(${patient.id})" title="View Records">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14,2 14,8 20,8"></polyline>
                    </svg>
                </button>
            </div>
        </div>
        <div class="patient-details">
            <div class="patient-detail">
                <span>Phone:</span>
                <span>${patient.phone}</span>
            </div>
            <div class="patient-detail">
                <span>Email:</span>
                <span>${patient.email}</span>
            </div>
            <div class="patient-detail">
                <span>Last Visit:</span>
                <span>${formatDate(patient.lastVisit)}</span>
            </div>
        </div>
    `;
    
    return div;
}

function calculateAge(dob) {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showAddPatientModal() {
    const modal = document.getElementById('addPatientModal');
    if (modal) modal.style.display = 'flex';
}

function closeAddPatientModal() {
    const modal = document.getElementById('addPatientModal');
    if (modal) {
        modal.style.display = 'none';
        const form = document.getElementById('addPatientForm');
        if (form) form.reset();
    }
}

function initializePatientForm() {
    const form = document.getElementById('addPatientForm');
    if (form) {
        form.addEventListener('submit', handleAddPatient);
    }
}

function handleAddPatient(e) {
    e.preventDefault();
    
    const newPatient = {
        id: patients.length + 1,
        firstName: document.getElementById('patientFirstName').value,
        lastName: document.getElementById('patientLastName').value,
        dob: document.getElementById('patientDOB').value,
        gender: document.getElementById('patientGender').value,
        phone: document.getElementById('patientPhone').value,
        email: document.getElementById('patientEmail').value,
        address: document.getElementById('patientAddress').value,
        lastVisit: new Date().toISOString().split('T')[0]
    };
    
    patients.push(newPatient);
    loadPatients();
    closeAddPatientModal();
    showSuccess('Patient added successfully!');
}

function editPatient(patientId) {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
        document.getElementById('patientFirstName').value = patient.firstName;
        document.getElementById('patientLastName').value = patient.lastName;
        document.getElementById('patientDOB').value = patient.dob;
        document.getElementById('patientGender').value = patient.gender;
        document.getElementById('patientPhone').value = patient.phone;
        document.getElementById('patientEmail').value = patient.email;
        document.getElementById('patientAddress').value = patient.address;
        
        showAddPatientModal();
    }
}

function viewPatientRecords(patientId) {
    window.location.href = 'records.html';
}

// Transcribe Functions
function loadPatientSelector() {
    const selector = document.getElementById('selectedPatient');
    if (!selector) return;
    
    selector.innerHTML = '<option value="">Choose a patient...</option>';
    
    patients.forEach(patient => {
        const option = document.createElement('option');
        option.value = patient.id;
        option.textContent = `${patient.firstName} ${patient.lastName}`;
        selector.appendChild(option);
    });
}

function initializeTranscribeUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const processBtn = document.getElementById('processBtn');
    
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('dragleave', handleDragLeave);
        uploadArea.addEventListener('drop', handleDrop);
        fileInput.addEventListener('change', handleFileSelect);
    }
    
    if (processBtn) {
        processBtn.addEventListener('click', processFiles);
    }
}

function handleDragOver(e) {
    e.preventDefault();
    document.getElementById('uploadArea').classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    document.getElementById('uploadArea').classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    document.getElementById('uploadArea').classList.remove('dragover');
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
}

function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    addFiles(files);
}

function addFiles(newFiles) {
    const validFiles = newFiles.filter(file => isValidFile(file));
    
    validFiles.forEach(file => {
        if (!currentFiles.find(f => f.name === file.name && f.size === file.size)) {
            currentFiles.push(file);
        }
    });

    updateFilesDisplay();
    document.getElementById('fileInput').value = '';
}

function isValidFile(file) {
    const validTypes = [
        'audio/mpeg',
        'audio/wav',
        'audio/mp4',
        'audio/m4a',
        'audio/x-m4a'
    ];
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a)$/i)) {
        showError(`File "${file.name}" is not a supported audio format.`);
        return false;
    }
    
    if (file.size > maxSize) {
        showError(`File "${file.name}" is too large. Maximum size is 10MB.`);
        return false;
    }
    
    return true;
}

function updateFilesDisplay() {
    const filesSection = document.getElementById('filesSection');
    const filesList = document.getElementById('filesList');
    
    if (currentFiles.length === 0) {
        if (filesSection) filesSection.style.display = 'none';
        return;
    }

    if (filesSection) filesSection.style.display = 'block';
    if (filesList) filesList.innerHTML = '';

    currentFiles.forEach((file, index) => {
        const fileItem = createFileItem(file, index);
        if (filesList) filesList.appendChild(fileItem);
    });
}

function createFileItem(file, index) {
    const div = document.createElement('div');
    div.className = 'file-item';
    
    div.innerHTML = `
        <div class="file-info">
            <svg class="file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
            <span class="file-name">${file.name}</span>
            <span class="file-size">(${formatFileSize(file.size)})</span>
        </div>
        <button class="remove-file" onclick="removeFile(${index})">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    `;
    
    return div;
}

function removeFile(index) {
    currentFiles.splice(index, 1);
    updateFilesDisplay();
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function processFiles() {
    const selectedPatientId = document.getElementById('selectedPatient').value;
    
    if (!selectedPatientId) {
        showError('Please select a patient first.');
        return;
    }
    
    if (currentFiles.length === 0) {
        showError('Please select audio files to process.');
        return;
    }

    showLoading(true);
    document.getElementById('resultsContainer').innerHTML = '';
    document.getElementById('resultsSection').style.display = 'none';

    try {
        const results = [];
        
        for (const file of currentFiles) {
            const result = await processFile(file, selectedPatientId);
            results.push(result);
            
            if (result.success) {
                const patient = patients.find(p => p.id == selectedPatientId);
                const newRecord = {
                    id: medicalRecords.length + 1,
                    patientId: parseInt(selectedPatientId),
                    patientName: `${patient.firstName} ${patient.lastName}`,
                    date: new Date().toISOString().split('T')[0],
                    type: 'Transcription',
                    status: 'completed',
                    transcription: result.transcription,
                    clinicalNote: result.summary
                };
                medicalRecords.push(newRecord);
            }
        }

        displayResults(results);
    } catch (error) {
        showError('An error occurred while processing files: ' + error.message);
    } finally {
        showLoading(false);
    }
}

async function processFile(file, patientId) {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`http://43.217.79.20:8000/transcribe_and_analyze?patient_id=${patientId}`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.status === 'success') {
            return {
                filename: file.name,
                success: true,
                transcription: result.transcription || '',
                summary: formatClinicalNote(result),
                medicalEntities: result.medical_entities || []
            };
        } else {
            throw new Error('API returned error status');
        }
    } catch (error) {
        console.error('API Error:', error);
        return {
            filename: file.name,
            success: true,
            summary: generateMockClinicalNote(),
            transcription: generateMockTranscription(),
            isDemo: true
        };
    }
}

function formatClinicalNote(result) {
    const analysis = result.clinical_analysis;
    if (!analysis) return result.summary || 'Clinical analysis completed.';

    let clinicalNote = `**CLINICAL NOTE**\n\n`;
    clinicalNote += `**Patient ID:** ${analysis.patient_id}\n`;
    clinicalNote += `**Session Date:** ${new Date(analysis.session_date).toLocaleDateString()}\n\n`;
    
    if (result.transcription) {
        clinicalNote += `**Transcription:**\n${result.transcription}\n\n`;
    }

    let summaryData;
    try {
        const jsonMatch = analysis.clinical_summary.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
            summaryData = JSON.parse(jsonMatch[1]);
        }
    } catch (e) {
        summaryData = null;
    }

    if (summaryData) {
        if (summaryData.entities && summaryData.entities.length > 0) {
            clinicalNote += `**Medical Entities:**\n`;
            summaryData.entities.forEach(entity => {
                clinicalNote += `- ${entity.text} (${entity.category}, confidence: ${(entity.confidence * 100).toFixed(0)}%)\n`;
            });
            clinicalNote += `\n`;
        }

        if (summaryData.diagnoses && summaryData.diagnoses.length > 0) {
            clinicalNote += `**Diagnoses:**\n`;
            summaryData.diagnoses.forEach(diagnosis => {
                clinicalNote += `- ${diagnosis.name} (confidence: ${(diagnosis.confidence * 100).toFixed(0)}%)\n`;
            });
            clinicalNote += `\n`;
        }

        if (summaryData.summary) {
            clinicalNote += `**Clinical Summary:**\n${summaryData.summary}\n\n`;
        }
    } else {
        clinicalNote += `**Analysis:**\n${analysis.clinical_summary}\n\n`;
    }

    clinicalNote += `**Confidence Score:** ${(analysis.confidence_score * 100).toFixed(0)}%`;
    return clinicalNote;
}

function generateMockClinicalNote() {
    const mockNotes = [
        `**CLINICAL NOTE**\n\n**Chief Complaint:** Patient presents with chest pain and shortness of breath.\n\n**Assessment:** Possible acute coronary syndrome.\n\n**Plan:** Immediate cardiology consultation, serial cardiac enzymes.`,
        `**CLINICAL NOTE**\n\n**Chief Complaint:** Follow-up for diabetes management.\n\n**Assessment:** Suboptimal glycemic control.\n\n**Plan:** Increase metformin, nutritionist referral.`
    ];
    return mockNotes[Math.floor(Math.random() * mockNotes.length)];
}

function generateMockTranscription() {
    const mockTranscriptions = [
        "Doctor: Good morning, how are you feeling today? Patient: I've been having this chest pain since this morning.",
        "Doctor: How has your blood sugar been? Patient: It's been running pretty high, around 180 in the mornings."
    ];
    return mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
}

function displayResults(results) {
    const resultsSection = document.getElementById('resultsSection');
    const resultsContainer = document.getElementById('resultsContainer');
    
    if (resultsSection) resultsSection.style.display = 'block';
    
    results.forEach(result => {
        const resultItem = createResultItem(result);
        if (resultsContainer) resultsContainer.appendChild(resultItem);
    });

    if (resultsSection) resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function createResultItem(result) {
    const div = document.createElement('div');
    div.className = 'result-item';
    
    const statusClass = result.success ? 'success' : 'error';
    const statusText = result.success ? (result.isDemo ? 'Demo Mode' : 'Processed') : 'Error';
    
    div.innerHTML = `
        <div class="result-header">
            <span class="result-filename">${result.filename}</span>
            <span class="result-status ${statusClass}">${statusText}</span>
            ${result.isDemo ? '<span class="demo-badge">Using Mock Data</span>' : ''}
        </div>
        ${result.transcription ? `
            <div class="transcription-section">
                <h4>Original Transcription:</h4>
                <div class="transcription-text">${result.transcription}</div>
            </div>
        ` : ''}
        <div class="clinical-note-section">
            <h4>AI-Generated Clinical Note:</h4>
            <div class="result-summary">${result.summary.replace(/\n/g, '<br>')}</div>
        </div>
        ${result.medicalEntities && result.medicalEntities.length > 0 ? `
            <div class="entities-section">
                <h4>Detected Medical Entities:</h4>
                <div class="entities-list">
                    ${result.medicalEntities.map(entity => 
                        `<span class="entity-tag">${entity.text} (${entity.category})</span>`
                    ).join('')}
                </div>
            </div>
        ` : ''}
    `;
    
    return div;
}

// Records Functions
function loadRecords() {
    const tableBody = document.getElementById('recordsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    medicalRecords.forEach(record => {
        const row = createRecordRow(record);
        tableBody.appendChild(row);
    });
}

function createRecordRow(record) {
    const tr = document.createElement('tr');
    
    tr.innerHTML = `
        <td>${record.patientName}</td>
        <td>${formatDate(record.date)}</td>
        <td>${record.type}</td>
        <td><span class="record-status ${record.status}">${record.status}</span></td>
        <td>
            <div class="record-actions">
                <button onclick="viewRecord(${record.id})" title="View Record">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                </button>
                <button onclick="downloadRecord(${record.id})" title="Download">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7,10 12,15 17,10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                </button>
            </div>
        </td>
    `;
    
    return tr;
}

function initializeRecordsSearch() {
    const searchInput = document.getElementById('recordsSearch');
    if (searchInput) {
        searchInput.addEventListener('input', filterRecords);
    }
}

function filterRecords() {
    const searchTerm = document.getElementById('recordsSearch').value.toLowerCase();
    const filteredRecords = medicalRecords.filter(record => 
        record.patientName.toLowerCase().includes(searchTerm) ||
        record.type.toLowerCase().includes(searchTerm) ||
        record.date.includes(searchTerm)
    );
    
    const tableBody = document.getElementById('recordsTableBody');
    if (tableBody) {
        tableBody.innerHTML = '';
        
        filteredRecords.forEach(record => {
            const row = createRecordRow(record);
            tableBody.appendChild(row);
        });
    }
}

function viewRecord(recordId) {
    const record = medicalRecords.find(r => r.id === recordId);
    if (record) {
        alert(`Record Details:\n\nPatient: ${record.patientName}\nDate: ${record.date}\nType: ${record.type}\n\nTranscription: ${record.transcription}\n\nClinical Note: ${record.clinicalNote}`);
    }
}

function downloadRecord(recordId) {
    const record = medicalRecords.find(r => r.id === recordId);
    if (record) {
        const content = `Medical Record\n\nPatient: ${record.patientName}\nDate: ${record.date}\nType: ${record.type}\n\nTranscription:\n${record.transcription}\n\nClinical Note:\n${record.clinicalNote}`;
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${record.patientName}_${record.date}_${record.type}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Utility Functions
function showLoading(show) {
    const loading = document.getElementById('loading');
    const processBtn = document.getElementById('processBtn');
    
    if (loading) loading.style.display = show ? 'block' : 'none';
    if (processBtn) processBtn.disabled = show;
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
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
    successDiv.className = 'error';
    successDiv.style.background = 'rgba(16, 185, 129, 0.1)';
    successDiv.style.color = 'var(--success-color)';
    successDiv.style.borderLeftColor = 'var(--success-color)';
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