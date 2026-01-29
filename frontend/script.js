const API_URL = 'http://localhost:8000/api/v1';
let currentTab = 'text';
let selectedFile = null;
let currentResult = null;
let toastTimeout = null;

function switchTab(tab) {
    currentTab = tab;
    document.getElementById('tab-text').classList.toggle('active', tab === 'text');
    document.getElementById('tab-file').classList.toggle('active', tab === 'file');
    document.getElementById('content-text').classList.toggle('hidden', tab !== 'text');
    document.getElementById('content-file').classList.toggle('hidden', tab !== 'file');
}

function setupDropzone() {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');
    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });
    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
    });
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });
}

function handleFileSelect(file) {
    const validTypes = ['text/plain', 'application/pdf'];
    const validExtensions = ['.txt', '.pdf'];
    const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    const maxSize = 10 * 1024 * 1024;
    if (!validTypes.includes(file.type) && !hasValidExtension) {
        showToast('error', 'Arquivo inválido', 'Use arquivos .txt ou .pdf');
        return;
    }
    if (file.size > maxSize) {
        showToast('error', 'Arquivo muito grande', 'O arquivo deve ter no máximo 10MB');
        return;
    }
    selectedFile = file;
    document.getElementById('dropzone-content').classList.add('hidden');
    document.getElementById('file-preview').classList.remove('hidden');
    document.getElementById('file-name').textContent = file.name;
    document.getElementById('file-size').textContent = formatFileSize(file.size);
}

function removeFile(event) {
    event.stopPropagation();
    selectedFile = null;
    document.getElementById('file-input').value = '';
    document.getElementById('dropzone-content').classList.remove('hidden');
    document.getElementById('file-preview').classList.add('hidden');
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function setupForm() {
    const form = document.getElementById('email-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (currentTab === 'text') {
            await submitText();
        } else {
            await submitFile();
        }
    });
}

async function submitText() {
    const content = document.getElementById('content').value.trim();
    const subject = document.getElementById('subject').value.trim();
    if (content.length < 10) {
        document.getElementById('content-error').classList.remove('hidden');
        return;
    }
    document.getElementById('content-error').classList.add('hidden');
    showLoading();
    try {
        const response = await fetch(`${API_URL}/classify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: content,
                subject: subject || null
            })
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Erro desconhecido' }));
            throw new Error(errorData.detail || 'Erro na classificação');
        }
        const result = await response.json();
        showResult(result);
        showToast('success', 'Sucesso!', 'Email classificado com sucesso pela IA');
        document.getElementById('content').value = '';
        document.getElementById('subject').value = '';
    } catch (error) {
        showToast('error', 'Erro', error.message || 'Falha ao classificar o email. Verifique sua conexão e tente novamente.');
        hideLoading();
    }
}

async function submitFile() {
    if (!selectedFile) {
        showToast('error', 'Atenção', 'Por favor, selecione um arquivo');
        return;
    }
    const subject = document.getElementById('file-subject').value.trim();
    showLoading();
    try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        if (subject) {
            formData.append('subject', subject);
        }
        const response = await fetch(`${API_URL}/classify/upload`, {
            method: 'POST',
            body: formData
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Erro desconhecido' }));
            throw new Error(errorData.detail || 'Erro no processamento do arquivo');
        }
        const result = await response.json();
        showResult(result);
        showToast('success', 'Sucesso!', 'Arquivo processado com sucesso pela IA');
        removeFile(new Event('click'));
        document.getElementById('file-subject').value = '';
    } catch (error) {
        showToast('error', 'Erro', error.message || 'Falha ao processar o arquivo. Verifique o formato e tente novamente.');
        hideLoading();
    }
}

function showLoading() {
    document.getElementById('empty-state').classList.add('hidden');
    document.getElementById('result-state').classList.add('hidden');
    document.getElementById('loading-state').classList.remove('hidden');
    document.getElementById('reset-btn').classList.add('hidden');
    setSubmitLoading(true);
}

function hideLoading() {
    document.getElementById('loading-state').classList.add('hidden');
    document.getElementById('empty-state').classList.remove('hidden');
    setSubmitLoading(false);
}

function setSubmitLoading(loading) {
    const btn = document.getElementById('submit-btn');
    if (loading) {
        btn.disabled = true;
        btn.innerHTML = `
            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Processando com IA...</span>
        `;
    } else {
        btn.disabled = false;
        btn.innerHTML = `
            <i class="fas fa-magic"></i>
            <span>Classificar com IA</span>
        `;
    }
}

function showResult(result) {
    currentResult = result;
    document.getElementById('loading-state').classList.add('hidden');
    document.getElementById('empty-state').classList.add('hidden');
    document.getElementById('result-state').classList.remove('hidden');
    document.getElementById('reset-btn').classList.remove('hidden');
    setSubmitLoading(false);
    const isProductive = result.category === 'Produtivo';
    const categoryCard = document.getElementById('category-card');
    categoryCard.className = `rounded-3xl p-8 shadow-2xl mb-6 transform hover:scale-[1.02] transition-transform duration-300 ${isProductive ? 'category-productive' : 'category-unproductive'}`;
    const categoryIcon = document.getElementById('category-icon');
    categoryIcon.className = `w-14 h-14 rounded-2xl flex items-center justify-center shadow-md category-icon`;
    categoryIcon.innerHTML = isProductive 
        ? '<i class="fas fa-check-circle text-2xl"></i>' 
        : '<i class="fas fa-times-circle text-2xl"></i>';
    document.getElementById('category-text').textContent = result.category;
    document.getElementById('category-text').className = 'font-bold text-2xl block category-text';
    document.getElementById('category-subtitle').textContent = isProductive ? 'Requer ação imediata' : 'Sem necessidade de ação';
    document.getElementById('category-subtitle').className = 'text-sm mt-0.5';
    const badge = document.getElementById('category-badge');
    badge.className = `px-4 py-2 rounded-full text-xs font-bold shadow-md category-badge`;
    badge.textContent = isProductive ? 'Requer Ação' : 'Sem Ação';
    const confidencePercent = Math.round(result.confidence * 100);
    document.getElementById('confidence-label').className = 'font-semibold confidence-label';
    document.getElementById('confidence-label').textContent = 'Nível de Confiança da IA';
    document.getElementById('confidence-value').className = 'font-bold text-lg confidence-value';
    document.getElementById('confidence-value').textContent = `${confidencePercent}%`;
    const confidenceBar = document.getElementById('confidence-bar');
    confidenceBar.className = 'h-full rounded-full transition-all duration-1000 ease-out shadow-sm confidence-bar';
    setTimeout(() => {
        confidenceBar.style.width = `${confidencePercent}%`;
    }, 100);
    document.getElementById('original-content').textContent = truncateText(result.original_content, 200);
    document.getElementById('suggested-response').textContent = result.suggested_response;
    document.getElementById('processed-at').textContent = `Processado em: ${formatDate(result.processed_at)}`;
}

function resetResult() {
    currentResult = null;
    document.getElementById('result-state').classList.add('hidden');
    document.getElementById('empty-state').classList.remove('hidden');
    document.getElementById('reset-btn').classList.add('hidden');
    document.getElementById('confidence-bar').style.width = '0%';
}

function copyResponse() {
    if (!currentResult) return;
    navigator.clipboard.writeText(currentResult.suggested_response).then(() => {
        showToast('success', 'Copiado!', 'Resposta copiada para a área de transferência');
    }).catch(() => {
        showToast('error', 'Erro', 'Não foi possível copiar o texto');
    });
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

function showToast(type, title, message) {
    const toast = document.getElementById('toast');
    const toastIcon = document.getElementById('toast-icon');
    const toastTitle = document.getElementById('toast-title');
    const toastMessage = document.getElementById('toast-message');
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    if (type === 'success') {
        toastIcon.className = 'w-12 h-12 rounded-xl flex items-center justify-center shadow-md bg-gradient-to-br from-green-100 to-emerald-100';
        toastIcon.innerHTML = '<i class="fas fa-check-circle text-2xl text-green-600"></i>';
    } else {
        toastIcon.className = 'w-12 h-12 rounded-xl flex items-center justify-center shadow-md bg-gradient-to-br from-red-100 to-pink-100';
        toastIcon.innerHTML = '<i class="fas fa-exclamation-circle text-2xl text-red-600"></i>';
    }
    if (toastTimeout) {
        clearTimeout(toastTimeout);
    }
    toast.classList.remove('translate-x-full', 'opacity-0');
    toast.classList.add('translate-x-0', 'opacity-100');
    toastTimeout = setTimeout(() => {
        closeToast();
    }, 4000);
}

function closeToast() {
    const toast = document.getElementById('toast');
    toast.classList.remove('translate-x-0', 'opacity-100');
    toast.classList.add('translate-x-full', 'opacity-0');
    if (toastTimeout) {
        clearTimeout(toastTimeout);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setupDropzone();
    setupForm();
});
