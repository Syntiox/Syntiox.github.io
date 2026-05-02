// --- Navigation Menu ---
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const navItems = document.querySelectorAll('.nav-links a');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('toggle');
});

navItems.forEach(item => {
    item.addEventListener('click', () => {
        navLinks.classList.remove('active');
        hamburger.classList.remove('toggle');
    });
});

// Update year
document.getElementById('year').textContent = new Date().getFullYear();

// --- Scroll Reveal Animation ---
let revealElements = document.querySelectorAll('.reveal');

const revealOnScroll = () => {
    const windowHeight = window.innerHeight;
    const revealPoint = 100;

    revealElements.forEach(el => {
        const revealTop = el.getBoundingClientRect().top;
        if (revealTop < windowHeight - revealPoint) {
            el.classList.add('active');
        }
    });
};

window.addEventListener('scroll', revealOnScroll);
revealOnScroll(); // Trigger on load

// --- Navbar Background Change on Scroll ---
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.borderBottom = '1px solid #e8eaed';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.9)';
        navbar.style.borderBottom = '1px solid transparent';
    }
});

// --- Interactive Neural / Tentacle Swarm ---
const canvas = document.getElementById('hero-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let tentacles = [];
const numTentacles = window.innerWidth < 768 ? 60 : 120;
const segments = 30;

let mouse = { x: 0, y: 0 };
let targetMouse = { x: 0, y: 0 };

window.addEventListener('mousemove', (e) => {
    targetMouse.x = e.clientX;
    targetMouse.y = e.clientY;
});
window.addEventListener('touchmove', (e) => {
    targetMouse.x = e.touches[0].clientX;
    targetMouse.y = e.touches[0].clientY;
});

function resizeCanvas() {
    width = canvas.width = document.documentElement.clientWidth || window.innerWidth;
    height = canvas.height = window.innerHeight;
    mouse.x = width / 2;
    mouse.y = height / 2;
    targetMouse.x = width / 2;
    targetMouse.y = height / 2;
    initTentacles();
}

function initTentacles() {
    tentacles = [];
    for (let i = 0; i < numTentacles; i++) {
        let pts = [];
        for (let j = 0; j < segments; j++) {
            pts.push({ x: width/2, y: height/2 });
        }
        tentacles.push({
            pts: pts,
            // Evenly distribute around a circle initially
            angle: (i / numTentacles) * Math.PI * 2,
            radius: 60 + Math.random() * 250,
            speed: 0.015 + Math.random() * 0.02,
            length: 3 + Math.random() * 7,
            thickness: 1 + Math.random() * 2,
            colorOffset: Math.random()
        });
    }
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function render() {
    ctx.clearRect(0, 0, width, height);

    // Smooth easing for mouse target
    mouse.x += (targetMouse.x - mouse.x) * 0.05;
    mouse.y += (targetMouse.y - mouse.y) * 0.05;
    
    let time = Date.now() * 0.001;

    tentacles.forEach((t, index) => {
        // Head orbits the mouse smoothly, reacting to time
        let currentAngle = t.angle + time * t.speed * (index % 2 === 0 ? 1 : -1); 
        let orbitRadius = t.radius + Math.sin(time * 1.5 + index) * 40; // breathing effect
        
        let headX = mouse.x + Math.cos(currentAngle) * orbitRadius;
        let headY = mouse.y + Math.sin(currentAngle) * orbitRadius;
        
        // Easing for head
        t.pts[0].x += (headX - t.pts[0].x) * 0.15;
        t.pts[0].y += (headY - t.pts[0].y) * 0.15;
        
        // Inverse Kinematics for trailing segments
        for (let i = 1; i < segments; i++) {
            let dx = t.pts[i-1].x - t.pts[i].x;
            let dy = t.pts[i-1].y - t.pts[i].y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > t.length) {
                let ratio = t.length / dist;
                t.pts[i].x = t.pts[i-1].x - dx * ratio;
                t.pts[i].y = t.pts[i-1].y - dy * ratio;
            }
        }
        
        // Draw the tentacle path
        ctx.beginPath();
        ctx.moveTo(t.pts[0].x, t.pts[0].y);
        for(let i = 1; i < segments; i++) {
            ctx.lineTo(t.pts[i].x, t.pts[i].y);
        }
        
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        
        // Elegant fading colors using Google Blue accents
        const alpha = Math.max(0.1, 0.6 - (t.radius / 300));
        
        if (t.colorOffset > 0.6) {
            ctx.strokeStyle = `rgba(11, 87, 208, ${alpha})`; // secondary darker blue
        } else if (t.colorOffset > 0.3) {
            ctx.strokeStyle = `rgba(26, 115, 232, ${alpha})`; // primary blue
        } else {
            ctx.strokeStyle = `rgba(168, 199, 250, ${alpha})`; // very light blue accent
        }
        
        ctx.lineWidth = t.thickness;
        ctx.stroke();
    });
    
    requestAnimationFrame(render);
}

render();

// --- Inject Dynamic Data (Projects & Gallery) ---
document.addEventListener('DOMContentLoaded', () => {
    // Utility to parse marquees
    function initMarquee(containerId, htmlContentArray, isAutoScroll = true) {
        const marquee = document.getElementById(containerId);
        if (!marquee) return;
        
        const track = document.createElement('div');
        track.className = 'marquee-track';
        
        let cardsHTML = htmlContentArray.join('');
        // Append multiple times for robust seamless loop
        track.innerHTML = cardsHTML + cardsHTML + cardsHTML + cardsHTML;
        marquee.appendChild(track);

        // Drag and Auto-Scroll Logic
        let isDown = false;
        let startX;
        let scrollLeft;
        let isHovered = false;
        let isDragging = false;

        marquee.addEventListener('mousedown', (e) => {
            isDown = true;
            isDragging = false; 
            startX = e.pageX - marquee.offsetLeft;
            scrollLeft = marquee.scrollLeft;
        });
        marquee.addEventListener('mouseleave', () => { isDown = false; isHovered = false; });
        marquee.addEventListener('mouseenter', () => { isHovered = true; });
        marquee.addEventListener('mouseup', () => { isDown = false; });
        marquee.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            isDragging = true;
            const x = e.pageX - marquee.offsetLeft;
            const walk = (x - startX) * 2;
            marquee.scrollLeft = scrollLeft - walk;
        });
        
        // Prevent clicking links inside items while dragging
        marquee.addEventListener('click', (e) => {
            if (isDragging) {
                e.preventDefault();
                e.stopPropagation();
            }
        });

        // Touch support for dragging
        marquee.addEventListener('touchstart', (e) => { 
            isDown = true; 
            isHovered = true; 
            isDragging = false;
            startX = e.touches[0].pageX - marquee.offsetLeft;
            scrollLeft = marquee.scrollLeft;
        }, {passive: true});
        marquee.addEventListener('touchend', () => { isDown = false; isHovered = false; });
        marquee.addEventListener('touchmove', (e) => {
            if (!isDown) return;
            isDragging = true;
            const x = e.touches[0].pageX - marquee.offsetLeft;
            const walk = (x - startX) * 2;
            marquee.scrollLeft = scrollLeft - walk;
        }, {passive: true});

        if (isAutoScroll) {
            let scrollSpeed = 1;
            function autoScroll() {
                if (!isDown && !isHovered) {
                    marquee.scrollLeft += scrollSpeed;
                    if (marquee.scrollLeft >= track.scrollWidth / 2) {
                        marquee.scrollLeft = 0;
                    }
                }
                requestAnimationFrame(autoScroll);
            }
            autoScroll();
        }
    }

    // 1. Render Projects (Infinite scrolling left-to-right)
    if (typeof syntioxData !== 'undefined' && syntioxData.projects) {
        const projectHTMLArray = syntioxData.projects.map((project) => {
            const techTags = project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('');
            const logoContent = project.logoImg ? `<img src="${project.logoImg}" alt="${project.name} Logo" style="width: 100%; height: 100%; object-fit: cover; border-radius: 14px; pointer-events: none;">` : project.logo;
            return `
                <div class="project-card">
                    <div class="project-header">
                        <div class="project-logo">${logoContent}</div>
                        <h3 class="project-title">${project.name}</h3>
                    </div>
                    <p class="project-desc">${project.description}</p>
                    <div class="tech-stack">${techTags}</div>
                    <a href="${project.link}" class="project-link" draggable="false">View Documentation &rarr;</a>
                </div>
            `;
        });
        initMarquee('project-marquee', projectHTMLArray);
    }

    // 2. Render Gallery Grid
    const galleryGrid = document.getElementById('gallery-grid');
    if (galleryGrid && typeof syntioxData !== 'undefined') {
        const galleryHTML = syntioxData.gallery.map((item, index) => `
            <div class="gallery-item reveal" style="transition-delay: ${index * 0.1}s">
                <img src="${item.image}" alt="${item.title}" loading="lazy">
                <div class="gallery-overlay">
                    <h4 class="gallery-title">${item.title}</h4>
                </div>
            </div>
        `).join('');
        
        galleryGrid.innerHTML = galleryHTML;
    }

    // 3. Render Team Marquee
    if (typeof syntioxData !== 'undefined' && syntioxData.team) {
        const teamHTMLArray = syntioxData.team.map((member) => `
            <a href="${member.link || '#'}" target="_blank" class="team-card" draggable="false">
                <div class="team-img-wrapper" style="pointer-events: none;">
                    <img src="${member.image}" alt="${member.name}" class="team-img" loading="lazy">
                </div>
                <div class="team-info" style="pointer-events: none;">
                    <h3 class="team-name">${member.name}</h3>
                    <p class="team-role">${member.role}</p>
                </div>
            </a>
        `);
        initMarquee('team-marquee', teamHTMLArray, false);
    }

    // Re-trigger reveal animation for newly injected items
    revealElements = document.querySelectorAll('.reveal');
    revealOnScroll();
});
