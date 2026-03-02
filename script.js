const ORG_NAME = 'Syntiox';
const GRID = document.getElementById('projectGrid');
const THEME_BTN = document.getElementById('themeBtn');
const HTML_TAG = document.documentElement;

// --- Theme Logic ---
const savedTheme = localStorage.getItem('theme') || 'dark';
HTML_TAG.setAttribute('data-theme', savedTheme);
updateIcon(savedTheme);

THEME_BTN.addEventListener('click', () => {
    const currentTheme = HTML_TAG.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    HTML_TAG.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateIcon(newTheme);
});

function updateIcon(theme) {
    const icon = THEME_BTN.querySelector('i');
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

// --- Fetch Projects Logic (No changes here, simple & clean) ---
// --- Fetch Projects Logic (Auto-Update Fix) ---
async function fetchProjects() {
    try {
        // TRICK: Add a unique timestamp to the URL so browser never caches it
        const timestamp = new Date().getTime();
        
        const res = await fetch(`https://api.github.com/users/${ORG_NAME}/repos?sort=pushed&per_page=100&t=${timestamp}`);
        
        if (!res.ok) throw new Error('API Limit or Error');
        
        const repos = await res.json();
        GRID.innerHTML = '';

        const filteredRepos = repos.filter(repo => 
            repo.name !== '.github' && 
            repo.name !== 'Syntiox.github.io' &&
            repo.visibility === 'public'
        );

        if (filteredRepos.length === 0) {
            // (Empty state code... no change here)
            GRID.innerHTML = `... code for empty state ...`; 
            return;
        }

        const repoCards = await Promise.all(filteredRepos.map(async (repo) => {
            let aboutText = repo.description || "Research & Development in progress.";

            try {
                // TRICK: Add timestamp here too for about.md
                const uniqueTime = new Date().getTime();
                const aboutRes = await fetch(`https://raw.githubusercontent.com/${ORG_NAME}/${repo.name}/main/about.md?t=${uniqueTime}`);
                
                if (aboutRes.ok) {
                    aboutText = await aboutRes.text();
                    if(aboutText.length > 200) aboutText = aboutText.substring(0, 200) + "...";
                }
            } catch (e) {}

            return `
                <div class="card">
                    <div>
                        <div class="card-header">
                            <div class="project-name">${repo.name}</div>
                            <div class="repo-stats">
                                <i class="fas fa-star" style="color:#eab308"></i> ${repo.stargazers_count}
                            </div>
                        </div>
                        <div class="description">${escapeHtml(aboutText)}</div>
                    </div>
                    <a href="${repo.html_url}" target="_blank" class="card-action-btn">
                        View Project <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            `;
        }));

        GRID.innerHTML = repoCards.join('');

    } catch (error) {
        GRID.innerHTML = `<div class="empty-state"><h3>System Status: No public repositories available.</h3></div>`;
    }
}

function escapeHtml(text) {
    if (!text) return text;
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Start
fetchProjects();
