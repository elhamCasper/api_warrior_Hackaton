// Smooth scrolling functions
function scrollToDemo() {
    document.getElementById('demo').scrollIntoView({ behavior: 'smooth' });
}

function scrollToUpload() {
    document.getElementById('upload').scrollIntoView({ behavior: 'smooth' });
}

// Login Modal Functions
function showLoginModal() {
    document.getElementById('loginModal').style.display = 'flex';
}

function hideLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

function showRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (email && password) {
        // Store user info in localStorage
        const userData = {
            name: 'Dr. Smith',
            email: email,
            specialty: 'Internal Medicine'
        };
        localStorage.setItem('medTranscribeUser', JSON.stringify(userData));
        
        // Redirect to dashboard
        window.location.href = 'admin/ui/dashboard.html';
    }
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const specialty = document.getElementById('regSpecialty').value;
    const password = document.getElementById('regPassword').value;
    
    if (name && email && specialty && password) {
        // Store user info in localStorage
        const userData = {
            name: name,
            email: email,
            specialty: specialty
        };
        localStorage.setItem('medTranscribeUser', JSON.stringify(userData));
        
        // Redirect to dashboard
        window.location.href = 'admin/ui/dashboard.html';
    }
}

class MedTranscribe {
    constructor() {
        this.files = [];
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.filesSection = document.getElementById('filesSection');
        this.filesList = document.getElementById('filesList');
        this.processBtn = document.getElementById('processBtn');
        this.resultsSection = document.getElementById('resultsSection');
        this.resultsContainer = document.getElementById('resultsContainer');
        this.loading = document.getElementById('loading');
    }

    bindEvents() {
        if (!this.uploadArea || !this.fileInput) return;
        
        // Upload area events
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        this.uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
        this.uploadArea.addEventListener('drop', this.handleDrop.bind(this));

        // File input change
        this.fileInput.addEventListener('change', this.handleFileSelect.bind(this));

        // Process button
        if (this.processBtn) {
            this.processBtn.addEventListener('click', this.processFiles.bind(this));
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        this.uploadArea.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files);
        this.addFiles(files);
    }

    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        this.addFiles(files);
    }

    addFiles(newFiles) {
        const validFiles = newFiles.filter(file => this.isValidFile(file));
        
        validFiles.forEach(file => {
            if (!this.files.find(f => f.name === file.name && f.size === file.size)) {
                this.files.push(file);
            }
        });

        this.updateFilesDisplay();
        this.fileInput.value = '';
    }

    isValidFile(file) {
        const validTypes = [
            'audio/mpeg',
            'audio/wav',
            'audio/mp4',
            'audio/m4a',
            'audio/x-m4a'
        ];
        
        const maxSize = 10 * 1024 * 1024; // 10MB
        
        if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a)$/i)) {
            this.showError(`File "${file.name}" is not a supported audio format.`);
            return false;
        }
        
        if (file.size > maxSize) {
            this.showError(`File "${file.name}" is too large. Maximum size is 10MB.`);
            return false;
        }
        
        return true;
    }

    updateFilesDisplay() {
        if (this.files.length === 0) {
            if (this.filesSection) this.filesSection.style.display = 'none';
            return;
        }

        if (this.filesSection) this.filesSection.style.display = 'block';
        if (this.filesList) this.filesList.innerHTML = '';

        this.files.forEach((file, index) => {
            const fileItem = this.createFileItem(file, index);
            if (this.filesList) this.filesList.appendChild(fileItem);
        });
    }

    createFileItem(file, index) {
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
                <span class="file-size">(${this.formatFileSize(file.size)})</span>
            </div>
            <button class="remove-file" onclick="medTranscribe.removeFile(${index})">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;
        
        return div;
    }

    removeFile(index) {
        this.files.splice(index, 1);
        this.updateFilesDisplay();
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async processFiles() {
        if (this.files.length === 0) return;

        this.showLoading(true);
        if (this.resultsContainer) this.resultsContainer.innerHTML = '';
        if (this.resultsSection) this.resultsSection.style.display = 'none';

        try {
            const results = [];
            
            for (const file of this.files) {
                const result = await this.processFile(file);
                results.push(result);
            }

            this.displayResults(results);
        } catch (error) {
            this.showError('An error occurred while processing files: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    async processFile(file) {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const patientId = 'patient_demo_' + Math.random().toString(36).substring(2, 9);
            
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
                    summary: this.formatClinicalNote(result),
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
                summary: this.generateMockClinicalNote(),
                transcription: this.generateMockTranscription(),
                isDemo: true
            };
        }
    }

    formatClinicalNote(result) {
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

    generateMockClinicalNote() {
        const mockClinicalNotes = [
            `**CLINICAL NOTE**\n\n**Chief Complaint:** Patient presents with chest pain and shortness of breath.\n\n**History of Present Illness:** 45-year-old male reports onset of chest pain 2 hours ago, described as sharp and radiating to left arm. Associated with mild dyspnea and diaphoresis.\n\n**Assessment:** Possible acute coronary syndrome. EKG shows ST elevation in leads II, III, aVF.\n\n**Plan:** \n- Immediate cardiology consultation\n- Serial cardiac enzymes\n- Continuous cardiac monitoring\n- Aspirin 325mg administered`,
            
            `**CLINICAL NOTE**\n\n**Chief Complaint:** Follow-up for diabetes management.\n\n**History:** 62-year-old female with Type 2 diabetes mellitus, last HbA1c 8.2%. Reports good medication compliance but difficulty with dietary restrictions.\n\n**Physical Exam:** Vital signs stable. No acute distress. Feet examination shows no signs of neuropathy or ulceration.\n\n**Assessment:** Suboptimal glycemic control.\n\n**Plan:**\n- Increase metformin to 1000mg BID\n- Referral to nutritionist\n- Follow-up in 3 months with repeat HbA1c`,
            
            `**CLINICAL NOTE**\n\n**Chief Complaint:** Annual physical examination.\n\n**History:** 35-year-old healthy female for routine check-up. No current complaints. Family history significant for hypertension and breast cancer.\n\n**Physical Exam:** Normal vital signs. Physical examination unremarkable.\n\n**Assessment:** Healthy adult female.\n\n**Plan:**\n- Continue current lifestyle\n- Mammogram screening due to family history\n- Routine labs including lipid panel\n- Return in 1 year for follow-up`
        ];
        
        return mockClinicalNotes[Math.floor(Math.random() * mockClinicalNotes.length)];
    }

    generateMockTranscription() {
        const mockTranscriptions = [
            "Doctor: Good morning, how are you feeling today? Patient: I've been having this chest pain since this morning, it's really sharp and goes down my left arm. Doctor: When did this start exactly? Patient: About two hours ago, I was just sitting at my desk and it came on suddenly.",
            
            "Doctor: How has your blood sugar been since our last visit? Patient: Well, I've been checking it like you said, but it's still running pretty high, usually around 180 in the mornings. Doctor: Are you taking your metformin regularly? Patient: Yes, every day with breakfast.",
            
            "Doctor: This is your annual check-up, any concerns or questions? Patient: Not really, I feel pretty good overall. Just wanted to make sure everything looks normal. Doctor: That's great to hear. Any family history I should know about? Patient: My mom had breast cancer when she was 50."
        ];
        
        return mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
    }

    displayResults(results) {
        if (this.resultsSection) this.resultsSection.style.display = 'block';
        
        results.forEach(result => {
            const resultItem = this.createResultItem(result);
            if (this.resultsContainer) this.resultsContainer.appendChild(resultItem);
        });

        if (this.resultsSection) this.resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    createResultItem(result) {
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

    showLoading(show) {
        if (this.loading) this.loading.style.display = show ? 'block' : 'none';
        if (this.processBtn) this.processBtn.disabled = show;
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = message;
        
        const container = document.querySelector('.upload-section-main .container');
        if (container) {
            container.insertBefore(errorDiv, container.firstChild);
            
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.parentNode.removeChild(errorDiv);
                }
            }, 5000);
        }
    }
}

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize landing page functionality
    const medTranscribe = new MedTranscribe();
    
    // Initialize login/register forms
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
});