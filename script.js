
// ============ Storage ============
const STORAGE_KEY = 'civicfit_complaints';

function getDefaultComplaints() {
    return [
        { id: 'CID-100001', city: 'Nallasopara', category: 'Road Damage', description: 'Deep potholes on Station Road', status: 'resolved', date: '2026-03-15', lat: 19.4123, lng: 72.8225, photo: null },
        { id: 'CID-100002', city: 'Nallasopara', category: 'Water Supply', description: 'No water for 3 days', status: 'in-progress', date: '2026-03-20', lat: 19.4150, lng: 72.8280, photo: null },
        { id: 'CID-100003', city: 'Nallasopara', category: 'Garbage', description: 'Overflowing bins near market', status: 'received', date: '2026-04-01', lat: 19.4098, lng: 72.8190, photo: null },
        { id: 'CID-100004', city: 'Virar', category: 'Street Light', description: 'Dark stretch near railway colony', status: 'in-progress', date: '2026-04-01', lat: 19.4550, lng: 72.8120, photo: null },
        { id: 'CID-100005', city: 'Virar', category: 'Drainage', description: 'Sewage leak on main road', status: 'resolved', date: '2026-03-10', lat: 19.4600, lng: 72.8180, photo: null },
        { id: 'CID-100006', city: 'Vasai', category: 'Park Maintenance', description: 'Broken benches in central park', status: 'resolved', date: '2026-01-25', lat: 19.3578, lng: 72.8194, photo: null },
        { id: 'CID-100007', city: 'Vasai', category: 'Noise Pollution', description: 'Loudspeakers after 10 PM', status: 'received', date: '2026-04-02', lat: 19.3620, lng: 72.8250, photo: null },
        { id: 'CID-100008', city: 'Vasai', category: 'Public Transport', description: 'Irregular bus timings', status: 'resolved', date: '2026-02-18', lat: 19.3545, lng: 72.8120, photo: null },
        { id: 'CID-100009', city: 'Mira Road', category: 'Garbage', description: 'Uncollected waste for a week', status: 'received', date: '2026-04-05', lat: 19.2815, lng: 72.8525, photo: null },
        { id: 'CID-100010', city: 'Bhayandar', category: 'Water Supply', description: 'Low water pressure', status: 'in-progress', date: '2026-04-06', lat: 19.2980, lng: 72.8480, photo: null }
    ];
}

function loadComplaints() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try { return JSON.parse(stored); } catch(e) { return getDefaultComplaints(); }
    }
    const defaults = getDefaultComplaints();
    saveComplaints(defaults);
    return defaults;
}

function saveComplaints(complaints) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
}

let complaints = loadComplaints();

// ============ Helpers ============
function getCityStats(cityName) {
    const cityComplaints = complaints.filter(c => c.city === cityName);
    const total = cityComplaints.length;
    const resolved = cityComplaints.filter(c => c.status === 'resolved').length;
    const pending = total - resolved;
    return { total, resolved, pending };
}

function getTotalStats() {
    const total = complaints.length;
    const resolved = complaints.filter(c => c.status === 'resolved').length;
    const pending = total - resolved;
    return { total, resolved, pending };
}

function getDensityLevel(total) {
    if (total >= 4) return 'high';
    if (total >= 2) return 'medium';
    return 'low';
}

// ============ UI Updates ============
function updateHomepage() {
    const totalStats = getTotalStats();
    setText('totalComplaints', totalStats.total);
    setText('resolvedCount', totalStats.resolved);
    setText('pendingCount', totalStats.pending);

    const cities = ['Nallasopara', 'Virar', 'Vasai', 'Mira Road', 'Bhayandar'];
    const container = document.getElementById('cityCardsContainer');
    if (!container) return;
    container.innerHTML = cities.map(city => {
        const stats = getCityStats(city);
        const density = getDensityLevel(stats.total);
        const badgeClass = density === 'high' ? 'high-density' : density === 'medium' ? 'medium-density' : 'low-density';
        const barClass = `density-bar ${density}`;
        const pct = Math.min(stats.total * 20, 100);
        return `
            <div class="city-card">
                <div class="city-card-header">
                    <h3><i class="fas fa-map-pin"></i> ${city}</h3>
                    <span class="density-badge ${badgeClass}">${density === 'high' ? 'High' : density === 'medium' ? 'Medium' : 'Low'} Density</span>
                </div>
                <div class="density-visual"><div class="${barClass}" style="width:${pct}%"></div></div>
                <div class="city-stats-row">
                    <div><strong>${stats.total}</strong><small>Total</small></div>
                    <div><strong>${stats.resolved}</strong><small>Resolved</small></div>
                    <div><strong>${stats.pending}</strong><small>Pending</small></div>
                </div>
            </div>`;
    }).join('');
}

function updateDashboard() {
    const totalStats = getTotalStats();
    setText('dashTotal', totalStats.total);
    setText('dashResolved', totalStats.resolved);
    setText('dashPending', totalStats.pending);

    const categoryCounts = {};
    complaints.forEach(c => { categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1; });
    const categoryBars = document.getElementById('categoryChart');
    if (categoryBars) {
        const max = Math.max(...Object.values(categoryCounts), 1);
        categoryBars.innerHTML = Object.entries(categoryCounts).map(([cat, count]) => `
            <div class="category-bar-item">
                <span class="category-bar-label">${cat}</span>
                <div class="category-bar-fill" style="width:${(count/max)*100}%"></div>
                <span class="category-bar-count">${count}</span>
            </div>`).join('');
    }

    const riskTagsContainer = document.getElementById('riskTags');
    if (riskTagsContainer) {
        const topCategories = Object.entries(categoryCounts).sort((a,b) => b[1]-a[1]).slice(0,4);
        riskTagsContainer.innerHTML = topCategories.map(([cat, count]) => `<span class="risk-tag">${cat} (${count})</span>`).join('');
    }
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

// ============ Photo handling ============
let selectedPhotoDataUrl = null;

function setupPhotoUpload() {
    const uploadArea = document.getElementById('photoUploadArea');
    const fileInput = document.getElementById('photoInput');
    const placeholder = document.getElementById('uploadPlaceholder');
    const preview = document.getElementById('photoPreview');
    const removeBtn = document.getElementById('removePhotoBtn');

    if (!uploadArea || !fileInput) return;

    uploadArea.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            selectedPhotoDataUrl = event.target.result;
            preview.src = selectedPhotoDataUrl;
            preview.style.display = 'block';
            placeholder.style.display = 'none';
            removeBtn.style.display = 'inline-block';
        };
        reader.readAsDataURL(file);
    });

    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedPhotoDataUrl = null;
        fileInput.value = '';
        preview.style.display = 'none';
        placeholder.style.display = 'block';
        removeBtn.style.display = 'none';
    });
}

// ============ Complaint Form ============
function setupComplaintForm() {
    const form = document.getElementById('complaintForm');
    if (!form) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const city = document.getElementById('city').value;
        const category = document.getElementById('category').value;
        const description = document.getElementById('description').value;

        const coords = {
            'Nallasopara': { lat: 19.410 + Math.random()*0.01, lng: 72.820 + Math.random()*0.01 },
            'Virar': { lat: 19.455 + Math.random()*0.01, lng: 72.810 + Math.random()*0.01 },
            'Vasai': { lat: 19.355 + Math.random()*0.01, lng: 72.815 + Math.random()*0.01 },
            'Mira Road': { lat: 19.2815 + Math.random()*0.01, lng: 72.8525 + Math.random()*0.01 },
            'Bhayandar': { lat: 19.2980 + Math.random()*0.01, lng: 72.8480 + Math.random()*0.01 }
        };
        const { lat, lng } = coords[city];

        const newId = 'CID-' + Math.floor(100000 + Math.random() * 900000);
        const complaint = {
            id: newId,
            city,
            category,
            description,
            status: 'received',
            date: new Date().toISOString().split('T')[0],
            lat,
            lng,
            photo: selectedPhotoDataUrl || null
        };
        complaints.push(complaint);
        saveComplaints(complaints);
        updateHomepage();

        const successDiv = document.getElementById('successMessage');
        successDiv.style.display = 'block';
        successDiv.innerHTML = `<i class="fas fa-check-circle"></i> Complaint filed!<br><strong>ID: ${newId}</strong><br>Use this to track.`;
        form.reset();
        // reset photo
        selectedPhotoDataUrl = null;
        const preview = document.getElementById('photoPreview');
        const placeholder = document.getElementById('uploadPlaceholder');
        const removeBtn = document.getElementById('removePhotoBtn');
        if (preview) preview.style.display = 'none';
        if (placeholder) placeholder.style.display = 'block';
        if (removeBtn) removeBtn.style.display = 'none';
        setTimeout(() => successDiv.style.display = 'none', 8000);
    });
}

// ============ Leaflet Map & Heatmap ============
function ensureMap(complaint) {
    const mapContainer = document.getElementById('mapContainer');
    if (!mapContainer) return;
    mapContainer.innerHTML = '';

    const map = L.map('mapContainer').setView([complaint.lat, complaint.lng], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
    }).addTo(map);

    const cityComplaints = complaints.filter(c => c.city === complaint.city);
    const heatPoints = cityComplaints.map(c => [c.lat, c.lng, c.status === 'resolved' ? 0.4 : 1.0]);
    if (heatPoints.length > 0) {
        L.heatLayer(heatPoints, {
            radius: 30,
            blur: 20,
            maxZoom: 1,
            gradient: { 0.2: 'blue', 0.4: 'cyan', 0.6: 'lime', 0.8: 'yellow', 1.0: 'red' }
        }).addTo(map);
    }

    L.marker([complaint.lat, complaint.lng])
        .addTo(map)
        .bindPopup(`<b>${complaint.id}</b><br>${complaint.category}<br>${complaint.description}`)
        .openPopup();
}

// ============ Tracking ============
function setupTracking() {
    const btn = document.getElementById('trackBtn');
    if (!btn) return;
    btn.addEventListener('click', () => {
        const cid = document.getElementById('trackIdInput').value.trim().toUpperCase();
        const resultDiv = document.getElementById('trackResult');
        const errorDiv = document.getElementById('trackError');
        resultDiv.style.display = 'none';
        errorDiv.style.display = 'none';

        if (!cid) {
            errorDiv.textContent = 'Please enter a Complaint ID.';
            errorDiv.style.display = 'block';
            return;
        }

        const complaint = complaints.find(c => c.id === cid);
        if (!complaint) {
            errorDiv.textContent = 'Complaint not found.';
            errorDiv.style.display = 'block';
            return;
        }

        document.getElementById('complaintDetails').innerHTML = `
            <strong>ID:</strong> ${complaint.id}<br>
            <strong>City:</strong> ${complaint.city}<br>
            <strong>Category:</strong> ${complaint.category}<br>
            <strong>Description:</strong> ${complaint.description}<br>
            <strong>Date:</strong> ${complaint.date}
        `;

        const photoDiv = document.getElementById('complaintPhoto');
        if (complaint.photo) {
            photoDiv.innerHTML = `<img src="${complaint.photo}" alt="Proof" style="max-width:100%; max-height:250px; border-radius:12px; box-shadow:var(--shadow);">`;
        } else {
            photoDiv.innerHTML = '';
        }

        const statusOrder = ['received', 'in-progress', 'resolved'];
        const currentIndex = statusOrder.indexOf(complaint.status);
        const stepsHTML = statusOrder.map((status, idx) => {
            let stepClass = '';
            if (idx < currentIndex) stepClass = 'completed';
            else if (idx === currentIndex) stepClass = 'active';
            const icons = { 'received': '📥', 'in-progress': '🔄', 'resolved': '✅' };
            const labels = { 'received': 'Received', 'in-progress': 'In Progress', 'resolved': 'Resolved' };
            return `<div class="step ${stepClass}"><div class="step-circle">${icons[status]}</div><div class="step-label">${labels[status]}</div></div>`;
        }).join('');
        document.getElementById('progressSteps').innerHTML = stepsHTML;
        document.getElementById('trackNote').textContent = complaint.status === 'resolved' ? 'Resolved!' : 'Processing...';

        resultDiv.style.display = 'block';
        ensureMap(complaint);
    });
}

// ============ Simulate Progress ============
setInterval(() => {
    const pending = complaints.filter(c => c.status === 'received' || c.status === 'in-progress');
    if (pending.length > 0) {
        const random = pending[Math.floor(Math.random() * pending.length)];
        if (random.status === 'received') random.status = 'in-progress';
        else if (random.status === 'in-progress') random.status = 'resolved';
        saveComplaints(complaints);
        updateHomepage();
        updateDashboard();
    }
}, 30000);

// ============ Mobile Nav ============
function setupMobileNav() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => navLinks.classList.toggle('show'));
        navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => navLinks.classList.remove('show')));
    }
}

// ============ FALLBACK JANSEVAAI (NO API KEY) ============
const chatbotMessages = document.getElementById('chatbotMessages');
const chatbotInput = document.getElementById('chatbotInput');
const chatbotSend = document.getElementById('chatbotSend');
const chatbotToggle = document.getElementById('chatbotToggle');
const chatbotWindow = document.getElementById('chatbotWindow');
const chatbotClose = document.getElementById('chatbotClose');

chatbotToggle.addEventListener('click', () => {
    chatbotWindow.style.display = chatbotWindow.style.display === 'none' ? 'flex' : 'none';
});
chatbotClose.addEventListener('click', () => {
    chatbotWindow.style.display = 'none';
});

function addMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);
    msgDiv.textContent = text;
    chatbotMessages.appendChild(msgDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.classList.add('message', 'loading');
    loadingDiv.id = 'loadingMessage';
    loadingDiv.textContent = 'JansevaAI is typing...';
    chatbotMessages.appendChild(loadingDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function removeLoading() {
    const loading = document.getElementById('loadingMessage');
    if (loading) loading.remove();
}

// Simple rule-based fallback
function getFallbackReply(msg) {
    const lower = msg.toLowerCase();
    if (lower.includes('complaint') || lower.includes('file')) {
        return "To file a complaint, go to 'File Complaint' page, select your city, category, describe the issue, and attach a photo if needed. You'll receive a unique Complaint ID.";
    } else if (lower.includes('track') || lower.includes('status')) {
        return "You can track your complaint using the 'Track' page. Just enter your Complaint ID and you'll see the current status, a heatmap, and any uploaded photo.";
    } else if (lower.includes('city') || lower.includes('cities')) {
        return "CivicFit covers five cities: Nallasopara, Virar, Vasai, Mira Road, and Bhayandar.";
    } else if (lower.includes('hello') || lower.includes('hi')) {
        return "Hello! I'm JansevaAI, your civic assistant. How can I help you today?";
    } else {
        return "I'm here to help with civic issues, complaint filing, and tracking. Ask me anything about CivicFit!";
    }
}

// Simulate async response
function sendFallbackReply(userMessage) {
    addMessage(userMessage, 'user');
    chatbotInput.value = '';
    showLoading();
    setTimeout(() => {
        removeLoading();
        const reply = getFallbackReply(userMessage);
        addMessage(reply, 'bot');
    }, 1000);
}

chatbotSend.addEventListener('click', () => {
    const message = chatbotInput.value.trim();
    if (!message) return;
    sendFallbackReply(message);
});

chatbotInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        chatbotSend.click();
    }
});
