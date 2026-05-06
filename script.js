// ============ STORAGE ============
const STORAGE_KEY = 'civicfit_complaints';
const LANG_KEY = 'civicfit_lang';

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
function saveComplaints(c) { localStorage.setItem(STORAGE_KEY, JSON.stringify(c)); }
let complaints = loadComplaints();

// ============ HELPERS ============
function getCityStats(city) {
    const filtered = complaints.filter(c => c.city === city);
    const total = filtered.length;
    const resolved = filtered.filter(c => c.status === 'resolved').length;
    return { total, resolved, pending: total - resolved };
}
function getTotalStats() {
    const total = complaints.length;
    const resolved = complaints.filter(c => c.status === 'resolved').length;
    return { total, resolved, pending: total - resolved };
}
function getDensityLevel(total) { return total >= 4 ? 'high' : total >= 2 ? 'medium' : 'low'; }
function setText(id, text) { const el = document.getElementById(id); if (el) el.textContent = text; }

// ============ LANGUAGE ============
const translations = {
    en: {
        nav_home: "Home", nav_complaint: "File Complaint", nav_track: "Track", nav_dashboard: "Dashboard",
        hero_badge: "Official Public Grievance Portal",
        hero_title: "Make Your City <span class='gradient-text'>CivicFit</span>",
        hero_subtitle: "Report issues in <strong>Nallasopara, Virar, Vasai, Mira Road & Bhayandar</strong> and track them in real‑time.",
        hero_btn_complaint: "File a Complaint", hero_btn_dashboard: "Live Dashboard",
        stat_total: "Total", stat_resolved: "Resolved", stat_pending: "Pending",
        how_title: "How CivicFit Works", how_subtitle: "4 simple steps to a better city",
        step1_title: "1. File Complaint", step1_desc: "Submit with photo proof & get a unique Complaint ID.",
        step2_title: "2. Track Progress", step2_desc: "See your complaint status & real‑time heatmap.",
        step3_title: "3. Govt Action", step3_desc: "Authorities resolve issues efficiently.",
        step4_title: "4. Resolution", step4_desc: "City becomes CivicFit!",
        cities_title: "Coverage Areas", cities_subtitle: "Complaint density for all 5 cities",
        legend_high: "High", legend_medium: "Medium", legend_low: "Low",
        footer_text: "© 2026 <strong>CivicFit</strong> — Making Cities Fit for Citizens",
        complaint_title: "File a Complaint", complaint_subtitle: "Report an issue in any of our 5 cities",
        form_city: "Select City", form_category: "Issue Category", form_description: "Description", form_photo: "Proof Photo",
        choose_city: "Choose City", choose_category: "Select Category",
        upload_text: "Click or tap to take a photo",
        submit_btn: "Submit Complaint",
        track_title: "Track Your Complaint", track_subtitle: "Enter your Complaint ID to see status, photo & live heatmap",
        track_btn: "Track",
        live_update: "Live updating every 10 seconds",
        dash_title: "Live Civic Dashboard", dash_total: "Total", dash_resolved: "Resolved", dash_pending: "Pending",
        dash_categories: "Complaints by Category", dash_risk: "Risk Categories"
    },
    hi: {
        nav_home: "होम", nav_complaint: "शिकायत दर्ज करें", nav_track: "ट्रैक करें", nav_dashboard: "डैशबोर्ड",
        hero_badge: "आधिकारिक जन शिकायत पोर्टल",
        hero_title: "अपने शहर को <span class='gradient-text'>सिविकफिट</span> बनाएं",
        hero_subtitle: "<strong>नालासोपारा, विरार, वसई, मीरा रोड और भायंदर</strong> में समस्याओं की रिपोर्ट करें और रीयल-टाइम ट्रैक करें।",
        hero_btn_complaint: "शिकायत दर्ज करें", hero_btn_dashboard: "लाइव डैशबोर्ड",
        stat_total: "कुल", stat_resolved: "हल", stat_pending: "लंबित",
        how_title: "सिविकफिट कैसे काम करता है", how_subtitle: "बेहतर शहर के लिए 4 सरल कदम",
        step1_title: "1. शिकायत दर्ज", step1_desc: "फोटो सबूत के साथ सबमिट करें और विशिष्ट शिकायत आईडी प्राप्त करें।",
        step2_title: "2. प्रगति ट्रैक करें", step2_desc: "अपनी शिकायत की स्थिति और हीटमैप देखें।",
        step3_title: "3. सरकारी कार्रवाई", step3_desc: "अधिकारी तेज़ी से समस्या का समाधान करते हैं।",
        step4_title: "4. समाधान", step4_desc: "शहर बनता है सिविकफिट!",
        cities_title: "कवरेज क्षेत्र", cities_subtitle: "सभी 5 शहरों के लिए शिकायत घनत्व",
        legend_high: "उच्च", legend_medium: "मध्यम", legend_low: "कम",
        footer_text: "© 2026 <strong>सिविकफिट</strong> — शहरों को नागरिकों के लिए फिट बनाना",
        complaint_title: "शिकायत दर्ज करें", complaint_subtitle: "हमारे 5 शहरों में से किसी में समस्या रिपोर्ट करें",
        form_city: "शहर चुनें", form_category: "समस्या श्रेणी", form_description: "विवरण", form_photo: "प्रूफ फोटो",
        choose_city: "शहर चुनें", choose_category: "श्रेणी चुनें",
        upload_text: "फोटो लेने के लिए क्लिक करें",
        submit_btn: "शिकायत सबमिट करें",
        track_title: "अपनी शिकायत ट्रैक करें", track_subtitle: "स्थिति, फोटो और लाइव हीटमैप देखने के लिए शिकायत आईडी दर्ज करें",
        track_btn: "ट्रैक करें",
        live_update: "हर 10 सेकंड में लाइव अपडेट",
        dash_title: "लाइव सिविक डैशबोर्ड", dash_total: "कुल", dash_resolved: "हल", dash_pending: "लंबित",
        dash_categories: "श्रेणी-वार शिकायतें", dash_risk: "जोखिम श्रेणियां"
    },
    mr: {
        nav_home: "होम", nav_complaint: "तक्रार नोंदवा", nav_track: "ट्रॅक करा", nav_dashboard: "डॅशबोर्ड",
        hero_badge: "अधिकृत सार्वजनिक तक्रार पोर्टल",
        hero_title: "तुमचं शहर <span class='gradient-text'>सिविकफिट</span> करा",
        hero_subtitle: "<strong>नालासोपारा, विरार, वसई, मीरा रोड आणि भायंदर</strong> मधील समस्या नोंदवा आणि रिअल-टाइम ट्रॅक करा.",
        hero_btn_complaint: "तक्रार नोंदवा", hero_btn_dashboard: "लाइव्ह डॅशबोर्ड",
        stat_total: "एकूण", stat_resolved: "सोडवलेल्या", stat_pending: "प्रलंबित",
        how_title: "सिविकफिट कसे काम करते", how_subtitle: "उत्तम शहरासाठी 4 सोप्या पायऱ्या",
        step1_title: "1. तक्रार नोंदवा", step1_desc: "फोटो पुराव्यासह सबमिट करा आणि विशिष्ट तक्रार आयडी मिळवा.",
        step2_title: "2. प्रगती ट्रॅक करा", step2_desc: "तुमच्या तक्रारीची स्थिती आणि हीटमॅप पहा.",
        step3_title: "3. शासकीय कारवाई", step3_desc: "अधिकारी समस्या जलद सोडवतात.",
        step4_title: "4. समाधान", step4_desc: "शहर बनते सिविकफिट!",
        cities_title: "कव्हरेज क्षेत्र", cities_subtitle: "सर्व 5 शहरांसाठी तक्रार घनता",
        legend_high: "उच्च", legend_medium: "मध्यम", legend_low: "कमी",
        footer_text: "© 2026 <strong>सिविकफिट</strong> — शहरांना नागरिकांसाठी फिट बनवणे",
        complaint_title: "तक्रार नोंदवा", complaint_subtitle: "आमच्या 5 शहरांपैकी कोणत्याही शहरात समस्या नोंदवा",
        form_city: "शहर निवडा", form_category: "समस्या श्रेणी", form_description: "वर्णन", form_photo: "पुरावा फोटो",
        choose_city: "शहर निवडा", choose_category: "श्रेणी निवडा",
        upload_text: "फोटो घेण्यासाठी क्लिक करा",
        submit_btn: "तक्रार सबमिट करा",
        track_title: "तुमची तक्रार ट्रॅक करा", track_subtitle: "स्थिती, फोटो आणि लाइव्ह हीटमॅप पाहण्यासाठी तक्रार आयडी प्रविष्ट करा",
        track_btn: "ट्रॅक करा",
        live_update: "दर 10 सेकंदांनी लाइव्ह अपडेट",
        dash_title: "लाइव्ह सिविक डॅशबोर्ड", dash_total: "एकूण", dash_resolved: "सोडवलेल्या", dash_pending: "प्रलंबित",
        dash_categories: "श्रेणीनुसार तक्रारी", dash_risk: "जोखीम श्रेणी"
    }
};

let currentLang = localStorage.getItem(LANG_KEY) || 'en';

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        let translated = translations[currentLang]?.[key];
        if (translated) {
            if (translated.includes('<span') || translated.includes('<strong')) {
                el.innerHTML = translated;
            } else {
                el.textContent = translated;
            }
        }
    });
    // Update placeholder for chatbot
    const chatbotInput = document.getElementById('chatbotInput');
    if (chatbotInput) {
        if (currentLang === 'hi') chatbotInput.placeholder = "कुछ भी पूछो...";
        else if (currentLang === 'mr') chatbotInput.placeholder = "काहीही विचारा...";
        else chatbotInput.placeholder = "Ask me anything...";
    }
    document.querySelectorAll('#languageSelect').forEach(sel => { sel.value = currentLang; });
}

// ============ UI UPDATES ============
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
        const densityText = density === 'high' ? translations[currentLang].legend_high : density === 'medium' ? translations[currentLang].legend_medium : translations[currentLang].legend_low;
        const badgeClass = density === 'high' ? 'high-density' : density === 'medium' ? 'medium-density' : 'low-density';
        const barClass = `density-bar ${density}`;
        const pct = Math.min(stats.total * 20, 100);
        return `
            <div class="city-card">
                <div class="city-card-header">
                    <h3><i class="fas fa-map-pin"></i> ${city}</h3>
                    <span class="density-badge ${badgeClass}">${densityText} Density</span>
                </div>
                <div class="density-visual"><div class="${barClass}" style="width:${pct}%"></div></div>
                <div class="city-stats-row">
                    <div><strong>${stats.total}</strong><small>${translations[currentLang].stat_total}</small></div>
                    <div><strong>${stats.resolved}</strong><small>${translations[currentLang].stat_resolved}</small></div>
                    <div><strong>${stats.pending}</strong><small>${translations[currentLang].stat_pending}</small></div>
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

// ============ PHOTO UPLOAD (CAMERA) ============
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

// ============ COMPLAINT FORM ============
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
            id: newId, city, category, description, status: 'received',
            date: new Date().toISOString().split('T')[0], lat, lng,
            photo: selectedPhotoDataUrl || null
        };
        complaints.push(complaint);
        saveComplaints(complaints);
        updateHomepage();

        const successDiv = document.getElementById('successMessage');
        successDiv.style.display = 'block';
        successDiv.innerHTML = `<i class="fas fa-check-circle"></i> Complaint filed!<br><strong>ID: ${newId}</strong><br>Use this to track.`;
        form.reset();
        selectedPhotoDataUrl = null;
        document.getElementById('photoPreview').style.display = 'none';
        document.getElementById('uploadPlaceholder').style.display = 'block';
        document.getElementById('removePhotoBtn').style.display = 'none';
        setTimeout(() => successDiv.style.display = 'none', 8000);
    });
}

// ============ REAL‑TIME HEATMAP ============
let liveMapInterval = null;

function ensureMap(complaint) {
    const mapContainer = document.getElementById('mapContainer');
    if (!mapContainer) return;
    mapContainer.innerHTML = '';

    const map = L.map('mapContainer').setView([complaint.lat, complaint.lng], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19
    }).addTo(map);

    const cityComplaints = complaints.filter(c => c.city === complaint.city);
    const heatPoints = cityComplaints.map(c => [c.lat, c.lng, c.status === 'resolved' ? 0.4 : 1.0]);
    const heatLayer = heatPoints.length > 0 ? L.heatLayer(heatPoints, {
        radius: 30, blur: 20, maxZoom: 1,
        gradient: { 0.2: 'blue', 0.4: 'cyan', 0.6: 'lime', 0.8: 'yellow', 1.0: 'red' }
    }).addTo(map) : null;

    L.marker([complaint.lat, complaint.lng]).addTo(map)
        .bindPopup(`<b>${complaint.id}</b><br>${complaint.category}<br>${complaint.description}`).openPopup();

    if (liveMapInterval) clearInterval(liveMapInterval);
    liveMapInterval = setInterval(() => {
        const updated = complaints.filter(c => c.city === complaint.city);
        const newPoints = updated.map(c => [c.lat, c.lng, c.status === 'resolved' ? 0.4 : 1.0]);
        if (heatLayer) heatLayer.setLatLngs(newPoints);
    }, 10000);
}

// ============ TRACKING ============
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
            errorDiv.textContent = translations[currentLang].track_error_empty || 'Please enter a Complaint ID.';
            errorDiv.style.display = 'block';
            return;
        }

        const complaint = complaints.find(c => c.id === cid);
        if (!complaint) {
            errorDiv.textContent = translations[currentLang].track_error_notfound || 'Complaint not found.';
            errorDiv.style.display = 'block';
            return;
        }

        document.getElementById('complaintDetails').innerHTML = `
            <strong>ID:</strong> ${complaint.id}<br>
            <strong>${translations[currentLang].form_city}:</strong> ${complaint.city}<br>
            <strong>${currentLang === 'hi' ? 'श्रेणी' : currentLang === 'mr' ? 'श्रेणी' : 'Category'}:</strong> ${complaint.category}<br>
            <strong>${currentLang === 'hi' ? 'विवरण' : currentLang === 'mr' ? 'वर्णन' : 'Description'}:</strong> ${complaint.description}<br>
            <strong>${currentLang === 'hi' ? 'तारीख' : currentLang === 'mr' ? 'दिनांक' : 'Date'}:</strong> ${complaint.date}
        `;

        const photoDiv = document.getElementById('complaintPhoto');
        if (complaint.photo) {
            photoDiv.innerHTML = `<img src="${complaint.photo}" alt="Proof" style="max-width:100%; max-height:250px; border-radius:12px;">`;
        } else photoDiv.innerHTML = '';

        const statusOrder = ['received', 'in-progress', 'resolved'];
        const currentIndex = statusOrder.indexOf(complaint.status);
        const labels = {
            en: { 'received': 'Received', 'in-progress': 'In Progress', 'resolved': 'Resolved' },
            hi: { 'received': 'प्राप्त', 'in-progress': 'प्रगति में', 'resolved': 'हल' },
            mr: { 'received': 'प्राप्त', 'in-progress': 'प्रगतीत', 'resolved': 'सोडवले' }
        };
        const stepsHTML = statusOrder.map((status, idx) => {
            let stepClass = '';
            if (idx < currentIndex) stepClass = 'completed';
            else if (idx === currentIndex) stepClass = 'active';
            return `<div class="step ${stepClass}"><div class="step-circle">${status === 'received' ? '📥' : status === 'in-progress' ? '🔄' : '✅'}</div><div class="step-label">${labels[currentLang][status]}</div></div>`;
        }).join('');
        document.getElementById('progressSteps').innerHTML = stepsHTML;
        document.getElementById('trackNote').textContent = complaint.status === 'resolved' ? (currentLang === 'hi' ? 'हल हो गया!' : currentLang === 'mr' ? 'सोडवले!' : 'Resolved!') : (currentLang === 'hi' ? 'प्रक्रिया जारी...' : currentLang === 'mr' ? 'प्रक्रिया सुरू...' : 'Processing...');

        resultDiv.style.display = 'block';
        ensureMap(complaint);
    });
}

// ============ CHATBOT (SIMPLE) ============
function setupChatbot() {
    const chatbotMessages = document.getElementById('chatbotMessages');
    const chatbotInput = document.getElementById('chatbotInput');
    const chatbotSend = document.getElementById('chatbotSend');
    const chatbotToggle = document.getElementById('chatbotToggle');
    const chatbotWindow = document.getElementById('chatbotWindow');
    const chatbotClose = document.getElementById('chatbotClose');
    if (!chatbotToggle) return;

    chatbotToggle.addEventListener('click', () => {
        chatbotWindow.style.display = chatbotWindow.style.display === 'none' ? 'flex' : 'none';
    });
    chatbotClose.addEventListener('click', () => chatbotWindow.style.display = 'none');

    function addMsg(text, sender) {
        const div = document.createElement('div');
        div.className = 'message ' + sender;
        div.textContent = text;
        chatbotMessages.appendChild(div);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    function getReply(msg) {
        const lower = msg.toLowerCase();
        if (lower.includes('hello') || lower.includes('hi')) return "Hello! I'm JansevaAI. How can I help you with CivicFit?";
        if (lower.includes('complaint') || lower.includes('file')) return "Go to 'File Complaint', select city, describe issue and attach a photo. You'll get a unique Complaint ID.";
        if (lower.includes('track') || lower.includes('status')) return "Go to 'Track', enter your Complaint ID to see live status, photo, and heatmap.";
        if (lower.includes('city') || lower.includes('cities')) return "We cover Nallasopara, Virar, Vasai, Mira Road and Bhayandar.";
        return "I'm JansevaAI, here to answer CivicFit website related questions only.";
    }

    chatbotSend.addEventListener('click', () => {
        const msg = chatbotInput.value.trim();
        if (!msg) return;
        addMsg(msg, 'user');
        chatbotInput.value = '';
        addMsg(getReply(msg), 'bot');
    });

    chatbotInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') chatbotSend.click(); });
}

// ============ MOBILE NAV ============
function setupMobileNav() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => navLinks.classList.toggle('show'));
        navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => navLinks.classList.remove('show')));
    }
}

// ============ INIT ============
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('#languageSelect').forEach(select => {
        select.addEventListener('change', (e) => {
            currentLang = e.target.value;
            localStorage.setItem(LANG_KEY, currentLang);
            applyTranslations();
            updateHomepage();
            updateDashboard();
        });
    });
    applyTranslations();
    setupPhotoUpload();
    updateHomepage();
    setupComplaintForm();
    setupTracking();
    updateDashboard();
    setupMobileNav();
    setupChatbot();
});
