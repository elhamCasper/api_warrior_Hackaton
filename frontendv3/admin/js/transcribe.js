// Transcribe & Analyze Page Functionality
let currentFiles = [];
let medicalRecords = [];

// Mock patient data for Select2 AJAX
const mockPatientData = [
    { id: 1, text: 'John Doe - DOB: 1985-03-15' },
    { id: 2, text: 'Sarah Johnson - DOB: 1992-07-22' },
    { id: 3, text: 'Mike Wilson - DOB: 1978-11-08' },
    { id: 4, text: 'Emily Davis - DOB: 1990-12-03' },
    { id: 5, text: 'Robert Brown - DOB: 1975-08-17' },
    { id: 6, text: 'Lisa Garcia - DOB: 1988-05-29' },
    { id: 7, text: 'David Martinez - DOB: 1982-11-14' },
    { id: 8, text: 'Jennifer Lee - DOB: 1995-04-08' },
    { id: 9, text: 'Michael Taylor - DOB: 1979-09-22' },
    { id: 10, text: 'Amanda White - DOB: 1987-01-11' }
];

// Initialize transcribe page when DOM is loaded
$(document).ready(function() {
    // Check if we're on the transcribe page
    if (window.location.pathname.includes('transcribe.html')) {
        initializeTranscribePage();
    }
});

function initializeTranscribePage() {
    console.log('Initializing transcribe page...');
    
    // Initialize Select2 for patient selection with AJAX
    $('#selectedPatient').select2({
        placeholder: 'Search and select a patient...',
        allowClear: true,
        width: '100%',
        ajax: {
            delay: 250,
            transport: function(params, success, failure) {
                // Simulate AJAX call with dummy data
                const searchTerm = params.data.term ? params.data.term.toLowerCase() : '';
                const filteredData = mockPatientData.filter(patient => 
                    patient.text.toLowerCase().includes(searchTerm)
                );
                
                // Simulate network delay
                setTimeout(() => {
                    success({
                        results: filteredData.slice(0, 10) // Limit to 10 results
                    });
                }, 300);
            },
            processResults: function(data) {
                return {
                    results: data.results
                };
            }
        },
        minimumInputLength: 0,
        templateResult: formatPatientResult,
        templateSelection: formatPatientSelection
    });

    // Initialize file upload functionality
    initializeFileUpload();
    
    // Initialize process button
    const processBtn = document.getElementById('processBtn');
    if (processBtn) {
        processBtn.addEventListener('click', processFiles);
    }
    
    console.log('Transcribe page initialized successfully');
}

function formatPatientResult(patient) {
    if (patient.loading) {
        return patient.text;
    }
    
    const parts = patient.text.split(' - ');
    const name = parts[0];
    const dob = parts[1];
    
    return $(`
        <div class="patient-option">
            <div class="patient-name">${name}</div>
            <div class="patient-dob">${dob}</div>
        </div>
    `);
}

function formatPatientSelection(patient) {
    return patient.text || patient.id;
}

function initializeFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('dragleave', handleDragLeave);
        uploadArea.addEventListener('drop', handleDrop);
        fileInput.addEventListener('change', handleFileSelect);
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
    const selectedPatientId = $('#selectedPatient').val();
    
    if (!selectedPatientId) {
        showError('Please select a patient first.');
        return;
    }
    
    if (currentFiles.length === 0) {
        showError('Please select audio files to process.');
        return;
    }

    showLoading(true);
    const resultsContainer = document.getElementById('resultsContainer');
    const resultsSection = document.getElementById('resultsSection');
    
    if (resultsContainer) resultsContainer.innerHTML = '';
    if (resultsSection) resultsSection.style.display = 'none';

    try {
        const results = [];
        
        for (const file of currentFiles) {
            const result = await processFile(file, selectedPatientId);
            results.push(result);
            
            // Add to medical records if successful
            if (result.success) {
                const selectedPatientText = $('#selectedPatient').select2('data')[0]?.text || '';
                const patientName = selectedPatientText.split(' - ')[0] || 'Unknown Patient';
                
                const newRecord = {
                    id: medicalRecords.length + 1,
                    patientId: selectedPatientId,
                    patientName: patientName,
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
        showSuccess(`Successfully processed ${results.length} audio file(s) for ${$('#selectedPatient').select2('data')[0]?.text.split(' - ')[0] || 'selected patient'}`);
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
                medicalEntities: result.medical_entities || [],
                clinicalAnalysis: result.clinical_analysis || {},
                rawResponse: result
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
    const mockClinicalNotes = [
        `**CLINICAL NOTE**\n\n**Chief Complaint:** Patient presents with chest pain and shortness of breath.\n\n**History of Present Illness:** 45-year-old male reports onset of chest pain 2 hours ago, described as sharp and radiating to left arm. Associated with mild dyspnea and diaphoresis.\n\n**Assessment:** Possible acute coronary syndrome. EKG shows ST elevation in leads II, III, aVF.\n\n**Plan:** \n- Immediate cardiology consultation\n- Serial cardiac enzymes\n- Continuous cardiac monitoring\n- Aspirin 325mg administered`,
        
        `**CLINICAL NOTE**\n\n**Chief Complaint:** Follow-up for diabetes management.\n\n**History:** 62-year-old female with Type 2 diabetes mellitus, last HbA1c 8.2%. Reports good medication compliance but difficulty with dietary restrictions.\n\n**Physical Exam:** Vital signs stable. No acute distress. Feet examination shows no signs of neuropathy or ulceration.\n\n**Assessment:** Suboptimal glycemic control.\n\n**Plan:**\n- Increase metformin to 1000mg BID\n- Referral to nutritionist\n- Follow-up in 3 months with repeat HbA1c`,
        
        `**CLINICAL NOTE**\n\n**Chief Complaint:** Annual physical examination.\n\n**History:** 35-year-old healthy female for routine check-up. No current complaints. Family history significant for hypertension and breast cancer.\n\n**Physical Exam:** Normal vital signs. Physical examination unremarkable.\n\n**Assessment:** Healthy adult female.\n\n**Plan:**\n- Continue current lifestyle\n- Mammogram screening due to family history\n- Routine labs including lipid panel\n- Return in 1 year for follow-up`
    ];
    
    return mockClinicalNotes[Math.floor(Math.random() * mockClinicalNotes.length)];
}

function generateMockTranscription() {
    const mockTranscriptions = [
        "Doctor: Good morning, how are you feeling today? Patient: I've been having this chest pain since this morning, it's really sharp and goes down my left arm. Doctor: When did this start exactly? Patient: About two hours ago, I was just sitting at my desk and it came on suddenly. Doctor: Are you having any trouble breathing? Patient: Yes, a little bit, and I'm sweating more than usual.",
        
        "Doctor: How has your blood sugar been since our last visit? Patient: Well, I've been checking it like you said, but it's still running pretty high, usually around 180 in the mornings. Doctor: Are you taking your metformin regularly? Patient: Yes, every day with breakfast. But I have to admit, I've been struggling with the diet changes. Doctor: That's understandable, dietary changes can be challenging.",
        
        "Doctor: This is your annual check-up, any concerns or questions? Patient: Not really, I feel pretty good overall. Just wanted to make sure everything looks normal. Doctor: That's great to hear. Any family history I should know about? Patient: My mom had breast cancer when she was 50, and my dad has high blood pressure. Doctor: Okay, we'll keep that in mind for screening recommendations."
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
        <div class="result-actions">
            <button class="btn btn-secondary" onclick="saveToRecords('${result.filename}', \`${result.transcription}\`, \`${result.summary}\`)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17,21 17,13 7,13 7,21"></polyline>
                    <polyline points="7,3 7,8 15,8"></polyline>
                </svg>
                Save to Records
            </button>
            <button class="btn btn-primary" onclick="downloadResult('${result.filename}', \`${result.transcription}\`, \`${result.summary}\`)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7,10 12,15 17,10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download
            </button>
        </div>
    `;
    
    return div;
}

function saveToRecords(filename, transcription, summary) {
    const selectedPatientId = $('#selectedPatient').val();
    const selectedPatientText = $('#selectedPatient').select2('data')[0]?.text || '';
    const patientName = selectedPatientText.split(' - ')[0] || 'Unknown Patient';
    
    const newRecord = {
        id: medicalRecords.length + 1,
        patientId: selectedPatientId,
        patientName: patientName,
        date: new Date().toISOString().split('T')[0],
        type: 'Transcription',
        status: 'completed',
        transcription: transcription,
        clinicalNote: summary
    };
    
    medicalRecords.push(newRecord);
    showSuccess('Clinical note saved to medical records successfully!');
}

function downloadResult(filename, transcription, summary) {
    const selectedPatientText = $('#selectedPatient').select2('data')[0]?.text || '';
    const patientName = selectedPatientText.split(' - ')[0] || 'Unknown Patient';
    
    const content = `MedTranscribe Clinical Note\n\nPatient: ${patientName}\nDate: ${new Date().toLocaleDateString()}\nAudio File: ${filename}\n\nTranscription:\n${transcription}\n\nClinical Note:\n${summary}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${patientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}_${filename.replace(/\.[^/.]+$/, "")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    const processBtn = document.getElementById('processBtn');
    
    if (loading) loading.style.display = show ? 'block' : 'none';
    if (processBtn) processBtn.disabled = show;
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