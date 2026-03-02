const ORG_NAME = 'Syntiox';
const GRID = document.getElementById('projectGrid');
const THEME_BTN = document.getElementById('themeBtn');
const HTML_TAG = document.documentElement;

// --- Dark/Light Mode Logic ---
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
        icon.className = 'fas fa-sun'; // Dark mode -> Show Sun
    } else {
        icon.className = 'fas fa-moon'; // Light mode -> Show Moon
    }
}

// --- Fetch Projects Logic ---
async function fetchProjects() {
    try {
        // Fetch repos
        const res = await fetch(`https://api.github.com/users/${ORG_NAME}/repos?sort=pushed&per_page=100`);
        
        if (!res.ok) throw new Error('GitHub API Limit or Error');
        
        const repos = await res.json();
        GRID.innerHTML = '';

        // Filter logic: Remove .github and the website itself
        const filteredRepos = repos.filter(repo => 
            repo.name !== '.github' && 
            repo.name !== 'Syntiox.github.io' &&
            repo.visibility === 'public'
        );

        // If no projects found
        if (filteredRepos.length === 0) {
            GRID.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-code-branch"></i>
                    <h3>No Public Projects Yet</h3>
                    <p>Our repositories are currently private or under development.</p>
                    <a href="https://github.com/Syntiox" target="_blank" style="color:var(--primary); margin-top:10px; display:inline-block; text-decoration:none;">Check GitHub Profile directly &rarr;</a>
                </div>
            `;
            return;
        }

        // Render Cards
        const repoCards = await Promise.all(filteredRepos.map(async (repo) => {
            let aboutText = repo.description || "Research & Development in progress.";

            // Try to fetch about.md
            try {
                const aboutRes = await fetch(`https://raw.githubusercontent.com/${ORG_NAME}/${repo.name}/main/about.md`);
                if (aboutRes.ok) {
                    aboutText = await aboutRes.text();
                    // Limit text length
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
                    <a href="${repo.html_url}" target="_blank" class="btn">
                        View Project <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            `;
        }));

        GRID.innerHTML = repoCards.join('');

    } catch (error) {
        console.error(error);
        GRID.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle" style="color:red"></i>
                <h3>System Status: Offline</h3>
                <p>Unable to fetch repositories from GitHub API.</p>
            </div>`;
    }
}

// Security: Prevent HTML injection
function escapeHtml(text) {
    if (!text) return text;
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Start
fetchProjects();
