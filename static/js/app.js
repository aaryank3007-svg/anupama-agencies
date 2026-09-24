// Anupama Agencies - Core Client JS

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile navigation menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('app-sidebar');
    const sidebarBackdrop = document.getElementById('sidebar-backdrop');

    if (mobileMenuBtn && sidebar) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('-translate-x-full');
            if (sidebarBackdrop) sidebarBackdrop.classList.toggle('hidden');
        });
    }

    if (sidebarBackdrop && sidebar) {
        sidebarBackdrop.addEventListener('click', () => {
            sidebar.classList.add('-translate-x-full');
            sidebarBackdrop.classList.add('hidden');
        });
    }

    // 2. Auto-dismiss alerts after 5 seconds
    const alerts = document.querySelectorAll('.auto-dismiss-alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.style.opacity = '0';
            alert.style.transition = 'opacity 0.5s ease';
            setTimeout(() => alert.remove(), 500);
        }, 5000);
    });
});

// 3. Attendance: "Mark All Present" helper
function markAllAttendance(statusValue = 'Present') {
    const radioInputs = document.querySelectorAll(`input[type="radio"][value="${statusValue}"]`);
    radioInputs.forEach(radio => {
        radio.checked = true;
        // Trigger change event if listeners exist
        radio.dispatchEvent(new Event('change'));
    });
}

// 4. Modal management helpers
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

// 5. Image Preview Modal (for fuel receipts / worker photos)
function previewImage(imageSrc, caption = 'Receipt Preview') {
    const previewModal = document.getElementById('image-preview-modal');
    const previewImg = document.getElementById('modal-preview-img');
    const previewCaption = document.getElementById('modal-preview-caption');

    if (previewModal && previewImg) {
        previewImg.src = imageSrc;
        if (previewCaption) previewCaption.textContent = caption;
        previewModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

// 6. Salary Settlement Calculator dynamically updates net payout
function recalculatePayout(workerId) {
    const grossEl = document.getElementById(`gross_${workerId}`);
    const deductionEl = document.getElementById(`deduction_${workerId}`);
    const bonusEl = document.getElementById(`bonus_${workerId}`);
    const netEl = document.getElementById(`net_${workerId}`);

    if (!grossEl || !deductionEl || !bonusEl || !netEl) return;

    const gross = parseFloat(grossEl.dataset.value || 0);
    const deduction = parseFloat(deductionEl.value || 0);
    const bonus = parseFloat(bonusEl.value || 0);

    const net = Math.max(0, (gross - deduction) + bonus);
    netEl.textContent = '₹' + net.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
