// Initialize data structure
let invoiceData = {
    business: {
        logo: '',
        name: '',
        email: '',
        phone: '',
        website: '',
        address: '',
        taxId: ''
    },
    invoice: {
        number: '',
        date: ''
    },
    billTo: '',
    customFields: [],
    items: [],
    taxRate: 0,
    notes: '',
    terms: '',
    themeColor: '#3457D5'
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Set default date
    document.getElementById('invoiceDate').valueAsDate = new Date();
    
    // Add event listeners
    setupEventListeners();
    
    // Add initial item row
    addItemRow();
    
    // Update preview
    updatePreview();
});

// Setup all event listeners
function setupEventListeners() {
    // Business info
    document.getElementById('logoUpload').addEventListener('change', handleLogoUpload);
    document.getElementById('businessName').addEventListener('input', updatePreview);
    document.getElementById('businessEmail').addEventListener('input', updatePreview);
    document.getElementById('businessPhone').addEventListener('input', updatePreview);
    document.getElementById('businessWebsite').addEventListener('input', updatePreview);
    document.getElementById('businessAddress').addEventListener('input', updatePreview);
    document.getElementById('businessTaxId').addEventListener('input', updatePreview);
    
    // Invoice details
    document.getElementById('invoiceNumber').addEventListener('input', updatePreview);
    document.getElementById('invoiceDate').addEventListener('input', updatePreview);
    document.getElementById('billTo').addEventListener('input', updatePreview);
    
    // Custom fields
    document.getElementById('addCustomField').addEventListener('click', addCustomField);
    
    // Items
    document.getElementById('addItem').addEventListener('click', addItemRow);
    document.getElementById('taxRate').addEventListener('input', updatePreview);
    
    // Notes and terms
    document.getElementById('notes').addEventListener('input', updatePreview);
    document.getElementById('terms').addEventListener('input', updatePreview);
    
    // Theme color
    document.getElementById('themeColor').addEventListener('input', updateThemeColor);
    
    // Actions
    document.getElementById('downloadPDF').addEventListener('click', downloadPDF);
    document.getElementById('downloadPNG').addEventListener('click', downloadPNG);
    document.getElementById('printInvoice').addEventListener('click', printInvoice);
    document.getElementById('saveInvoice').addEventListener('click', saveInvoice);
    document.getElementById('loadInvoice').addEventListener('click', loadInvoice);
}

// Handle logo upload
function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            invoiceData.business.logo = event.target.result;
            updatePreview();
        };
        reader.readAsDataURL(file);
    }
}

// Add custom field
function addCustomField() {
    const container = document.getElementById('customFieldsContainer');
    const fieldId = Date.now();
    
    const fieldDiv = document.createElement('div');
    fieldDiv.className = 'custom-field-item';
    fieldDiv.innerHTML = `
        <input type="text" placeholder="Field Label" class="field-label" data-id="${fieldId}">
        <input type="text" placeholder="Field Value" class="field-value" data-id="${fieldId}">
        <button class="btn-remove" onclick="removeCustomField(${fieldId})">×</button>
    `;
    
    container.appendChild(fieldDiv);
    
    // Add event listeners
    fieldDiv.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', updatePreview);
    });
}

// Remove custom field
function removeCustomField(fieldId) {
    const field = document.querySelector(`.custom-field-item input[data-id="${fieldId}"]`).closest('.custom-field-item');
    field.remove();
    updatePreview();
}

// Add item row
function addItemRow() {
    const container = document.getElementById('itemsContainer');
    const itemId = Date.now();
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'item-row';
    itemDiv.innerHTML = `
        <input type="text" placeholder="Item name" class="item-name" data-id="${itemId}">
        <input type="number" placeholder="Qty" class="item-qty" data-id="${itemId}" min="0" step="1" value="1">
        <input type="number" placeholder="Price" class="item-price" data-id="${itemId}" min="0" step="0.01" value="0">
        <input type="text" class="item-total" data-id="${itemId}" readonly>
        <button class="btn-remove" onclick="removeItem(${itemId})">×</button>
    `;
    
    container.appendChild(itemDiv);
    
    // Add event listeners
    itemDiv.querySelectorAll('input:not(.item-total)').forEach(input => {
        input.addEventListener('input', () => {
            calculateItemTotal(itemId);
            updatePreview();
        });
    });
    
    calculateItemTotal(itemId);
}

// Remove item
function removeItem(itemId) {
    const item = document.querySelector(`.item-row input[data-id="${itemId}"]`).closest('.item-row');
    item.remove();
    updatePreview();
}

// Calculate item total
function calculateItemTotal(itemId) {
    const qty = parseFloat(document.querySelector(`.item-qty[data-id="${itemId}"]`).value) || 0;
    const price = parseFloat(document.querySelector(`.item-price[data-id="${itemId}"]`).value) || 0;
    const total = qty * price;
    
    document.querySelector(`.item-total[data-id="${itemId}"]`).value = total.toFixed(2);
}

// Update theme color
function updateThemeColor() {
    const color = document.getElementById('themeColor').value;
    invoiceData.themeColor = color;
    
    // Update CSS variables
    document.documentElement.style.setProperty('--theme-color', color);
    
    // Update invoice elements
    document.querySelector('.invoice-header').style.borderBottomColor = color;
    document.querySelector('.invoice-title').style.color = color;
    document.querySelector('.items-table thead').style.backgroundColor = color;
    document.querySelectorAll('.section-title').forEach(el => el.style.color = color);
    document.querySelectorAll('.totals-row.total').forEach(el => el.style.borderTopColor = color);
    document.querySelectorAll('.notes-title, .terms-title').forEach(el => el.style.color = color);
}

// Update preview
function updatePreview() {
    // Update business info
    const businessName = document.getElementById('businessName').value;
    const businessEmail = document.getElementById('businessEmail').value;
    const businessPhone = document.getElementById('businessPhone').value;
    const businessWebsite = document.getElementById('businessWebsite').value;
    const businessAddress = document.getElementById('businessAddress').value;
    const businessTaxId = document.getElementById('businessTaxId').value;
    
    document.getElementById('previewBusinessName').textContent = businessName;
    
    let businessDetails = '';
    if (businessEmail) businessDetails += businessEmail + '\n';
    if (businessPhone) businessDetails += businessPhone + '\n';
    if (businessWebsite) businessDetails += businessWebsite + '\n';
    if (businessAddress) businessDetails += businessAddress + '\n';
    if (businessTaxId) businessDetails += 'Tax ID: ' + businessTaxId;
    
    document.getElementById('previewBusinessDetails').textContent = businessDetails;
    
    // Update logo
    const logoPreview = document.getElementById('logoPreview');
    if (invoiceData.business.logo) {
        logoPreview.innerHTML = `<img src="${invoiceData.business.logo}" alt="Logo">`;
    } else {
        logoPreview.innerHTML = '';
    }
    
    // Update invoice details
    document.getElementById('previewInvoiceNumber').textContent = document.getElementById('invoiceNumber').value;
    document.getElementById('previewInvoiceDate').textContent = document.getElementById('invoiceDate').value;
    
    // Update bill to
    document.getElementById('previewBillTo').textContent = document.getElementById('billTo').value;
    
    // Update custom fields
    const customFieldsContainer = document.getElementById('previewCustomFields');
    const customFields = document.querySelectorAll('.custom-field-item');
    
    if (customFields.length > 0) {
        let html = '<div class="invoice-section custom-field-preview"><div class="section-title">Additional Information</div>';
        
        customFields.forEach(field => {
            const label = field.querySelector('.field-label').value;
            const value = field.querySelector('.field-value').value;
            
            if (label || value) {
                html += `<div class="custom-field-row">
                    <span class="custom-field-label">${label}:</span>
                    <span class="custom-field-value">${value}</span>
                </div>`;
            }
        });
        
        html += '</div>';
        customFieldsContainer.innerHTML = html;
    } else {
        customFieldsContainer.innerHTML = '';
    }
    
    // Update items
    const itemsBody = document.getElementById('previewItemsBody');
    const items = document.querySelectorAll('.item-row');
    let html = '';
    let subtotal = 0;
    
    items.forEach(item => {
        const name = item.querySelector('.item-name').value;
        const qty = item.querySelector('.item-qty').value;
        const price = parseFloat(item.querySelector('.item-price').value) || 0;
        const total = parseFloat(item.querySelector('.item-total').value) || 0;
        
        if (name) {
            html += `<tr>
                <td>${name}</td>
                <td>${qty}</td>
                <td>${price.toFixed(2)}</td>
                <td>${total.toFixed(2)}</td>
            </tr>`;
            subtotal += total;
        }
    });
    
    itemsBody.innerHTML = html;
    
    // Update totals
    const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;
    
    document.getElementById('previewSubtotal').textContent = '$' + subtotal.toFixed(2);
    document.getElementById('previewTaxRate').textContent = taxRate.toFixed(2);
    document.getElementById('previewTax').textContent = '$' + tax.toFixed(2);
    document.getElementById('previewTotal').textContent = '$' + total.toFixed(2);
    
    // Show/hide tax row
    if (taxRate > 0) {
        document.getElementById('taxRow').style.display = 'flex';
    } else {
        document.getElementById('taxRow').style.display = 'none';
    }
    
    // Update notes
    const notes = document.getElementById('notes').value;
    const notesSection = document.getElementById('previewNotesSection');
    if (notes) {
        notesSection.innerHTML = `
            <div class="invoice-section notes-section">
                <div class="notes-title">Notes</div>
                <div class="notes-content">${notes}</div>
            </div>
        `;
    } else {
        notesSection.innerHTML = '';
    }
    
    // Update terms
    const terms = document.getElementById('terms').value;
    const termsSection = document.getElementById('previewTermsSection');
    if (terms) {
        termsSection.innerHTML = `
            <div class="invoice-section terms-section">
                <div class="terms-title">Terms & Conditions</div>
                <div class="terms-content">${terms}</div>
            </div>
        `;
    } else {
        termsSection.innerHTML = '';
    }
    
    // Update theme color
    updateThemeColor();
}

// Download as PDF
async function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const element = document.getElementById('invoicePreview');
    
    try {
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 10;
        
        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
        
        const invoiceNumber = document.getElementById('invoiceNumber').value || 'invoice';
        pdf.save(`${invoiceNumber}.pdf`);
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
    }
}

// Download as PNG
async function downloadPNG() {
    const element = document.getElementById('invoicePreview');
    
    try {
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false
        });
        
        canvas.toBlob(function(blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const invoiceNumber = document.getElementById('invoiceNumber').value || 'invoice';
            link.download = `${invoiceNumber}.png`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
        });
    } catch (error) {
        console.error('Error generating PNG:', error);
        alert('Error generating PNG. Please try again.');
    }
}

// Print invoice
function printInvoice() {
    window.print();
}

// Save invoice to memory (not localStorage due to artifact restrictions)
function saveInvoice() {
    // Collect all data
    invoiceData = {
        business: {
            logo: invoiceData.business.logo,
            name: document.getElementById('businessName').value,
            email: document.getElementById('businessEmail').value,
            phone: document.getElementById('businessPhone').value,
            website: document.getElementById('businessWebsite').value,
            address: document.getElementById('businessAddress').value,
            taxId: document.getElementById('businessTaxId').value
        },
        invoice: {
            number: document.getElementById('invoiceNumber').value,
            date: document.getElementById('invoiceDate').value
        },
        billTo: document.getElementById('billTo').value,
        customFields: [],
        items: [],
        taxRate: document.getElementById('taxRate').value,
        notes: document.getElementById('notes').value,
        terms: document.getElementById('terms').value,
        themeColor: document.getElementById('themeColor').value
    };
    
    // Collect custom fields
    document.querySelectorAll('.custom-field-item').forEach(field => {
        invoiceData.customFields.push({
            label: field.querySelector('.field-label').value,
            value: field.querySelector('.field-value').value
        });
    });
    
    // Collect items
    document.querySelectorAll('.item-row').forEach(item => {
        invoiceData.items.push({
            name: item.querySelector('.item-name').value,
            qty: item.querySelector('.item-qty').value,
            price: item.querySelector('.item-price').value
        });
    });
    
    // Save to memory for this session
    alert('Invoice data saved to session memory!');
}

// Load invoice from memory
function loadInvoice() {
    if (!invoiceData.business.name && invoiceData.items.length === 0) {
        alert('No saved invoice data found in this session.');
        return;
    }
    
    // Load business info
    document.getElementById('businessName').value = invoiceData.business.name || '';
    document.getElementById('businessEmail').value = invoiceData.business.email || '';
    document.getElementById('businessPhone').value = invoiceData.business.phone || '';
    document.getElementById('businessWebsite').value = invoiceData.business.website || '';
    document.getElementById('businessAddress').value = invoiceData.business.address || '';
    document.getElementById('businessTaxId').value = invoiceData.business.taxId || '';
    
    // Load invoice details
    document.getElementById('invoiceNumber').value = invoiceData.invoice.number || '';
    document.getElementById('invoiceDate').value = invoiceData.invoice.date || '';
    document.getElementById('billTo').value = invoiceData.billTo || '';
    
    // Load custom fields
    document.getElementById('customFieldsContainer').innerHTML = '';
    invoiceData.customFields.forEach(field => {
        addCustomField();
        const fields = document.querySelectorAll('.custom-field-item');
        const lastField = fields[fields.length - 1];
        lastField.querySelector('.field-label').value = field.label;
        lastField.querySelector('.field-value').value = field.value;
    });
    
    // Load items
    document.getElementById('itemsContainer').innerHTML = '';
    invoiceData.items.forEach(item => {
        addItemRow();
        const items = document.querySelectorAll('.item-row');
        const lastItem = items[items.length - 1];
        lastItem.querySelector('.item-name').value = item.name;
        lastItem.querySelector('.item-qty').value = item.qty;
        lastItem.querySelector('.item-price').value = item.price;
        const itemId = lastItem.querySelector('.item-name').dataset.id;
        calculateItemTotal(itemId);
    });
    
    // Load other fields
    document.getElementById('taxRate').value = invoiceData.taxRate || '';
    document.getElementById('notes').value = invoiceData.notes || '';
    document.getElementById('terms').value = invoiceData.terms || '';
    document.getElementById('themeColor').value = invoiceData.themeColor || '#3457D5';
    
    updatePreview();
    alert('Invoice data loaded successfully!');
}

// Print styles
const style = document.createElement('style');
style.textContent = `
    @media print {
        body * {
            visibility: hidden;
        }
        .invoice-container, .invoice-container * {
            visibility: visible;
        }
        .invoice-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none;
        }
    }
`;
document.head.appendChild(style);