const blockchainApp = {
    apiUrl: 'http://localhost:8080',
    autoRefreshInterval: null,

    init() {
        this.loadBlockchain();
        this.startAutoRefresh();
    },

    handleFileSelect(input) {
        const file = input.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            this.showAlert('File is too large! Max 2MB.', 'error');
            input.value = '';
            return;
        }

        const reader = new FileReader();
        
        document.getElementById('fileStatus').style.display = 'block';
        document.getElementById('fileName').textContent = file.name;
        document.getElementById('fileSize').textContent = (file.size / 1024).toFixed(2) + ' KB';

        reader.onload = function(e) {
            const base64String = e.target.result.split(',')[1];
            document.getElementById('type').value = `FILE:${file.name}|${base64String}`;
            this.showAlert('File converted to data payload', 'success');
        }.bind(this);

        reader.readAsDataURL(file);
    },

    async loadBlockchain() {
        try {
            const response = await fetch(`${this.apiUrl}/chain`);
            if (!response.ok) return;

            const data = await response.json();
            if (!Array.isArray(data)) return;

            this.displayBlockchain(data);
            this.updateStats(data);
        } catch (error) {
            console.error('Connection error:', error);
        }
    },

    displayBlockchain(chain) {
        const container = document.getElementById('blockchain');

        if (!chain || chain.length === 0) {
            container.innerHTML = '<div class="loading">Chain is empty</div>';
            return;
        }

        container.innerHTML = chain.map(block => {
            const lastTx = block.Data && block.Data.length > 0 ? block.Data[block.Data.length - 1] : null;
            const blockDataStr = JSON.stringify(block).replace(/'/g, "&apos;");

            let payloadDisplay = lastTx ? (lastTx.type || lastTx.Type) : '';
            let isFile = false;
            let fileName = '';

            if (payloadDisplay && payloadDisplay.startsWith('FILE:')) {
                isFile = true;
                fileName = payloadDisplay.split('|')[0].replace('FILE:', '');
                payloadDisplay = '📄 File Attached';
            } else if (payloadDisplay && payloadDisplay.length > 25) {
                payloadDisplay = payloadDisplay.substring(0, 25) + '...';
            }

            return `
                <div class="block" onclick='blockchainApp.showBlockDetails(${blockDataStr})'>
                    <div class="block-header">
                        <div class="block-id">Block #${block.Id}</div>
                        <div class="block-hash">${block.Hash ? block.Hash.substring(0, 12) + '...' : 'N/A'}</div>
                    </div>
                    <div class="block-info">
                        <div class="info-row">
                            <span class="info-label">Time:</span>
                            <span>${new Date(block.Time).toLocaleTimeString()}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Records:</span>
                            <span>${block.Data?.length || 0}</span>
                        </div>
                    </div>
                    ${lastTx ? `
                        <div class="transaction">
                            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                                <span style="color:#8b949e">By: ${this.formatAddress(Object.values(lastTx.from || lastTx.From)[0])}</span>
                                <span class="badge ${isFile ? 'badge-success' : 'badge-info'}">
                                    ${isFile ? '📄' : 'TXT'}
                                </span>
                            </div>
                            <div style="color:#c9d1d9; font-size: 11px; word-break: break-word;">
                                ${isFile ? fileName : payloadDisplay}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    },

    formatAddress(address) {
        if (!address) return 'N/A';
        const addr = String(address);
        if (addr.length <= 12) return addr;
        return `${addr.substring(0, 6)}...`;
    },

    updateStats(chain) {
        const totalBlocks = chain.length;
        const totalTransactions = chain.reduce((sum, block) => sum + (block.Data?.length || 0), 0);
        document.getElementById('blockCount').textContent = totalBlocks;
        document.getElementById('txCount').textContent = totalTransactions;
    },

    async addTransaction(event) {
        const fromInput = document.getElementById('from');
        const typeInput = document.getElementById('type');
        const fileInput = document.getElementById('fileInput');

        const from = fromInput.value.trim();
        const type = typeInput.value.trim();

        if (!from) {
            this.showAlert('Please enter Author/Sender ID', 'error');
            return;
        }

        const transaction = {
            from: from,
            type: type, 
            timestamp: new Date().toISOString()
        };

        const button = event.target;
        const originalText = button.innerText;
        
        button.innerText = 'Processing...';
        button.disabled = true;

        try {
            const response = await fetch(`${this.apiUrl}/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(transaction)
            });

            if (response.status === 409) {
                this.showAlert('Chain integrity check failed!', 'error');
            } else if (response.ok) {
                this.showAlert('Record added successfully', 'success');
                fromInput.value = '';
                typeInput.value = '';
                fileInput.value = '';
                document.getElementById('fileStatus').style.display = 'none';
                await this.loadBlockchain();
            } else {
                this.showAlert('Server error', 'error');
            }
        } catch (error) {
            this.showAlert('Connection failed', 'error');
        } finally {
            button.innerText = originalText;
            button.disabled = false;
        }
    },

    showBlockDetails(block) {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modalBody');

        const txList = block.Data && block.Data.length > 0 
            ? block.Data.map((tx, idx) => {
                const fromVal = Object.values(tx.from || tx.From)[0] || 'Unknown';
                let typeVal = tx.type || tx.Type || 'N/A';
                
                let displayType = typeVal;
                let isFile = false;
                if (typeVal.startsWith('FILE:')) {
                    isFile = true;
                    const parts = typeVal.split('|');
                    displayType = parts[0].replace('FILE:', '');
                } else if (typeVal.length > 50) {
                    displayType = typeVal.substring(0, 50) + '...';
                }

                return `
                    <div class="transaction" style="margin-top:10px;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                            <strong>Record #${idx + 1}</strong>
                            <span class="badge ${isFile ? 'badge-success' : 'badge-info'}">
                                ${isFile ? '📄 File' : 'Text'}
                            </span>
                        </div>
                        <div class="info-row"><span class="info-label">Author:</span> <span>${fromVal}</span></div>
                        
                        ${isFile 
                            ? `<div style="font-size:12px; color:#8b949e; margin:5px 0;">Filename: ${displayType}</div>` 
                            : `<div class="info-row"><span class="info-label">Content:</span> <span style="word-break:break-all;">${typeVal}</span></div>`
                        }
                        
                        <div class="info-row"><span class="info-label">Time:</span> <span>${new Date(tx.Timestamp).toLocaleString()}</span></div>
                    </div>
                `;
            }).join('') 
            : '<div style="color:#8b949e; text-align:center; padding:20px;">No records</div>';

        modalBody.innerHTML = `
            <div style="background:#0d1117; padding:15px; border-radius:6px; border:1px solid #30363d; margin-bottom:20px;">
                <div class="info-row"><span class="info-label">Block ID:</span> <span style="color:#fff">#${block.Id}</span></div>
                <div class="info-row" style="flex-direction:column; gap:5px; margin-top:10px;">
                    <span class="info-label">Hash:</span>
                    <code style="background:#161b22; padding:5px; border-radius:4px; word-break:break-all; font-size:12px;">${block.Hash}</code>
                </div>
            </div>
            <h4 style="margin-bottom:10px; color:#fff;">Records in Block</h4>
            ${txList}
        `;

        modal.style.display = 'flex';
    },

    closeModal() {
        document.getElementById('modal').style.display = 'none';
    },

    showAlert(message, type) {
        const existing = document.querySelector('.alert');
        if (existing) existing.remove();

        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;
        document.body.appendChild(alertDiv);

        setTimeout(() => {
            alertDiv.style.opacity = '0';
            setTimeout(() => alertDiv.remove(), 300);
        }, 3000);
    },

    startAutoRefresh() {
        if (this.autoRefreshInterval) clearInterval(this.autoRefreshInterval);
        this.autoRefreshInterval = setInterval(() => this.loadBlockchain(), 5000);
    },
    
    stopAutoRefresh() {
        if (this.autoRefreshInterval) clearInterval(this.autoRefreshInterval);
    }
};

document.addEventListener('DOMContentLoaded', () => blockchainApp.init());
window.onclick = function(event) {
    if (event.target.id === 'modal') blockchainApp.closeModal();
};