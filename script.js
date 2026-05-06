// ========== GLOBAL VARIABLES ==========
let videoStream = null;
let map, heatLayer, locationMap, locationMarker;
let complaints = [];

// ========== LOAD DATA FROM LOCALSTORAGE ==========
function loadComplaints() {
    const stored = localStorage.getItem('civicfit_complaints');
    complaints = stored ? JSON.parse(stored) : [];
    return complaints;
}

function saveComplaints() {
    localStorage.setItem('civicfit_complaints', JSON.stringify(complaints));
}

// ========== GENERATE 4-DIGIT CID ==========
function generateCID() {
    return Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit e.g., 4832
}

// ========== COMPLAINT PAGE SPECIFIC ==========
if (document.getElementById('complaintForm')) {
    // Camera logic
    const video = document.getElementById('liveCamera');
    const startBtn = document.getElementById('startCameraBtn');
    const captureBtn = document.getElementById('capturePhotoBtn');
    const previewArea = document.getElementById('photoPreviewArea');
    const capturedImg = document.getElementById('capturedPhotoImg');
    const removeBtn = document.getElementById('removeCapturedBtn');
    const photoDataInput = document.getElementById('photoData64');

    async function initCamera() {
        if (videoStream) videoStream.getTracks().forEach(track => track.stop());
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoStream = stream;
            video.srcObject = stream;
            await video.play();
            captureBtn.disabled = false;
            startBtn.disabled = true;
            startBtn.textContent = '✅ Camera Active';
        } catch (err) {
            alert("Camera access denied. Please allow permissions.");
            captureBtn.disabled = true;
        }
    }

    function capturePhoto() {
        if (!video.videoWidth) return alert("Start camera first");
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        const data = canvas.toDataURL('image/jpeg', 0.8);
        capturedImg.src = data;
        photoDataInput.value = data;
        previewArea.style.display = 'block';
    }

    function removePhoto() {
        photoDataInput.value = '';
        previewArea.style.display = 'none';
        capturedImg.src = '';
    }

    startBtn.addEventListener('click', initCamera);
    captureBtn.addEventListener('click', capturePhoto);
    removeBtn.addEventListener('click', removePhoto);

    // Map for location picking
    function initLocationMap(lat = 19.0760, lng = 72.8777) {
        if (locationMap) locationMap.remove();
        locationMap = L.map('locationMap').setView([lat, lng], 13);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(locationMap);
        locationMarker = L.marker([lat, lng], { draggable: true }).addTo(locationMap);
        locationMarker.on('dragend', function () {
            const pos = locationMarker.getLatLng();
            document.getElementById('complaintLat').value = pos.lat;
            document.getElementById('complaintLng').value = pos.lng;
            document.getElementById('locationStatus').innerHTML = `📍 Location set: ${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`;
        });
        locationMap.on('click', function (e) {
            locationMarker.setLatLng(e.latlng);
            document.getElementById('complaintLat').value = e.latlng.lat;
            document.getElementById('complaintLng').value = e.latlng.lng;
            document.getElementById('locationStatus').innerHTML = `📍 Location set: ${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`;
        });
    }

    function getGPSLocation() {
        if (!navigator.geolocation) return alert("GPS not supported");
        navigator.geolocation.getCurrentPosition(pos => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            locationMap.setView([lat, lng], 16);
            locationMarker.setLatLng([lat, lng]);
            document.getElementById('complaintLat').value = lat;
            document.getElementById('complaintLng').value = lng;
            document.getElementById('locationStatus').innerHTML = `📍 GPS location: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        }, err => alert("GPS error: " + err.message));
    }

    initLocationMap();
    document.getElementById('getGpsLocation').addEventListener('click', getGPSLocation);

    // Form submit
    const form = document.getElementById('complaintForm');
    const successDiv = document.getElementById('successMessage');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const city = document.getElementById('city').value;
        const category = document.getElementById('category').value;
        const description = document.getElementById('description').value.trim();
        const photo = photoDataInput.value;
        const lat = document.getElementById('complaintLat').value;
        const lng = document.getElementById('complaintLng').value;

        if (!city || !category || !description) return alert("Fill all fields");
        if (!photo) return alert("Capture a photo first");
        if (!lat || !lng) return alert("Select location on map or use GPS");

        const cid = generateCID();
        const newComplaint = {
            cid: cid,
            city: city,
            category: category,
            description: description,
            photo: photo,
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            status: "Pending",
            timestamp: new Date().toISOString()
        };

        let all = loadComplaints();
        all.unshift(newComplaint);
        localStorage.setItem('civicfit_complaints', JSON.stringify(all));

        // Trigger storage event for other tabs
        window.dispatchEvent(new StorageEvent('storage', { key: 'civicfit_complaints', newValue: JSON.stringify(all) }));

        successDiv.style.display = 'block';
        successDiv.innerHTML = `<i class="fas fa-check-circle"></i> Complaint filed!<br><strong>Your 4‑digit CID: ${cid}</strong><br>Use this ID on Track page.`;
        form.reset();
        removePhoto();
        document.getElementById('complaintLat').value = '';
        document.getElementById('complaintLng').value = '';
        document.getElementById('locationStatus').innerHTML = '📍 Click on map or use GPS';
        if (locationMarker) locationMarker.setLatLng([19.0760, 72.8777]);
        locationMap.setView([19.0760, 72.8777], 13);
        setTimeout(() => successDiv.style.display = 'none', 5000);
    });
}

// ========== TRACK PAGE (Heatmap + List + Search) ==========
if (document.getElementById('heatmap')) {
    let mapHeat;
    let heatLayer;
    let currentComplaints = [];

    function initHeatmap() {
        if (mapHeat) return;
        mapHeat = L.map('heatmap').setView([19.0760, 72.8777], 11);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(mapHeat);
    }

    function updateHeatmap(complaintsData) {
        initHeatmap();
        const points = [];
        complaintsData.forEach(c => {
            if (c.lat && c.lng) {
                let weight = 1.0; // Pending
                if (c.status === 'In Progress') weight = 0.6;
                if (c.status === 'Resolved') weight = 0.2;
                points.push([c.lat, c.lng, weight]);
            }
        });
        if (heatLayer) mapHeat.removeLayer(heatLayer);
        heatLayer = L.heatLayer(points, { radius: 30, blur: 20, maxZoom: 15, minOpacity: 0.5 });
        heatLayer.addTo(mapHeat);
    }

    function renderComplaintList(complaintsArray) {
        const container = document.getElementById('complaintList');
        if (!complaintsArray.length) {
            container.innerHTML = '<p>No complaints yet. Go file one!</p>';
            return;
        }
        let html = '';
        complaintsArray.forEach((c, idx) => {
            let statusColor = c.status === 'Pending' ? '#ff9800' : (c.status === 'In Progress' ? '#17a2b8' : '#28a745');
            html += `
                <div class="complaint-card" data-idx="${idx}">
                    <strong><i class="fas fa-tag"></i> ${c.category}</strong><br>
                    <span class="cid">🆔 ${c.cid}</span><br>
                    <small>${c.description.substring(0, 80)}${c.description.length > 80 ? '...' : ''}</small><br>
                    <small>📍 ${c.lat?.toFixed(5) || '?'}, ${c.lng?.toFixed(5) || '?'}</small><br>
                    <small>🏙️ ${c.city} | 📅 ${new Date(c.timestamp).toLocaleString()}</small><br>
                    <select class="status-select" data-cid="${c.cid}" style="background:${statusColor}20">
                        <option ${c.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option ${c.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option ${c.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                    </select>
                    <button class="delete-complaint" data-cid="${c.cid}"><i class="fas fa-trash"></i> Delete</button>
                    ${c.photo ? `<br><img src="${c.photo}" width="50" style="border-radius:8px; margin-top:5px;">` : ''}
                </div>
            `;
        });
        container.innerHTML = html;

        // Status change events
        document.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const cid = select.getAttribute('data-cid');
                const newStatus = select.value;
                let all = loadComplaints();
                const complaint = all.find(c => c.cid === cid);
                if (complaint) {
                    complaint.status = newStatus;
                    saveComplaints();
                    window.dispatchEvent(new StorageEvent('storage', { key: 'civicfit_complaints', newValue: JSON.stringify(all) }));
                    loadTrackData();
                }
            });
        });
        // Delete events
        document.querySelectorAll('.delete-complaint').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cid = btn.getAttribute('data-cid');
                let all = loadComplaints();
                all = all.filter(c => c.cid !== cid);
                saveComplaints();
                window.dispatchEvent(new StorageEvent('storage', { key: 'civicfit_complaints', newValue: JSON.stringify(all) }));
                loadTrackData();
            });
        });
    }

    function loadTrackData(searchCID = '') {
        let all = loadComplaints();
        if (searchCID) {
            all = all.filter(c => c.cid.includes(searchCID));
        }
        currentComplaints = all;
        renderComplaintList(all);
        updateHeatmap(all);
    }

    // Search functionality
    const searchInput = document.getElementById('searchCID');
    const searchBtn = document.getElementById('searchBtn');
    const resetBtn = document.getElementById('resetSearch');

    searchBtn.addEventListener('click', () => {
        const cid = searchInput.value.trim();
        loadTrackData(cid);
    });
    resetBtn.addEventListener('click', () => {
        searchInput.value = '';
        loadTrackData('');
    });

    loadTrackData('');

    // Real-time cross-tab update
    window.addEventListener('storage', (e) => {
        if (e.key === 'civicfit_complaints') {
            loadTrackData(searchInput.value.trim());
        }
    });
}

// ========== DASHBOARD CHARTS ==========
if (document.getElementById('statusChart')) {
    let statusChart, cityChart, categoryChart;

    function updateDashboard() {
        const complaints = loadComplaints();
        const total = complaints.length;
        const pending = complaints.filter(c => c.status === 'Pending').length;
        const inProgress = complaints.filter(c => c.status === 'In Progress').length;
        const resolved = complaints.filter(c => c.status === 'Resolved').length;

        document.getElementById('totalComplaints').innerText = total;
        document.getElementById('pendingCount').innerText = pending;
        document.getElementById('progressCount').innerText = inProgress;
        document.getElementById('resolvedCount').innerText = resolved;

        // Status chart
        const statusCtx = document.getElementById('statusChart').getContext('2d');
        if (statusChart) statusChart.destroy();
        statusChart = new Chart(statusCtx, {
            type: 'doughnut',
            data: {
                labels: ['Pending', 'In Progress', 'Resolved'],
                datasets: [{
                    data: [pending, inProgress, resolved],
                    backgroundColor: ['#ff9800', '#17a2b8', '#28a745']
                }]
            }
        });

        // City chart
        const cityCounts = {};
        complaints.forEach(c => { cityCounts[c.city] = (cityCounts[c.city] || 0) + 1; });
        const cityCtx = document.getElementById('cityChart').getContext('2d');
        if (cityChart) cityChart.destroy();
        cityChart = new Chart(cityCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(cityCounts),
                datasets: [{
                    label: 'Complaints per City',
                    data: Object.values(cityCounts),
                    backgroundColor: '#2c3e66'
                }]
            }
        });

        // Category chart
        const catCounts = {};
        complaints.forEach(c => { catCounts[c.category] = (catCounts[c.category] || 0) + 1; });
        const catCtx = document.getElementById('categoryChart').getContext('2d');
        if (categoryChart) categoryChart.destroy();
        categoryChart = new Chart(catCtx, {
            type: 'pie',
            data: {
                labels: Object.keys(catCounts),
                datasets: [{
                    data: Object.values(catCounts),
                    backgroundColor: ['#e63946', '#2c3e66', '#ffb347', '#28a745', '#17a2b8', '#6c757d']
                }]
            }
        });
    }

    updateDashboard();
    window.addEventListener('storage', () => updateDashboard());
}

// ========== NAVBAR HAMBURGER (if needed) ==========
// Not implemented here because desktop-first but can be added easily.
