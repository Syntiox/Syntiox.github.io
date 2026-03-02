const ORG_NAME = 'Syntiox';
const GRID = document.getElementById('projectGrid');
const THEME_BTN = document.getElementById('themeBtn');
const HTML_TAG = document.documentElement;

// Theme Logic
const savedTheme = localStorage.getItem('theme') || 'dark';
HTML_TAG.setAttribute('data-theme', savedTheme);

THEME_BTN.addEventListener('click', () => {
    const currentTheme = HTML_TAG.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    HTML_TAG.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// Fetch Logic
async function fetchProjects() {
    try {
        const res = await fetch(`https://api.github.com/users/${ORG_NAME}/repos?sort=pushed&per_page=100`);
        if (!res.ok) throw new Error('API Error');
        const repos = await res.json();

        GRID.innerHTML = '';

        const filteredRepos = repos.filter(repo => 
            repo.name !== '.github' && 
            repo.name !== 'Syntiox.github.io' &&
            repo.visibility === 'public'
        );

        if (filteredRepos.length === 0) {
            GRID.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-code-branch" style="font-size: 3rem; margin-bottom: 20px;"></i>
                    <h3>No Public Projects Yet</h3>
                    <p>Our repositories are currently private or under development.</p>
                </div>
            `;
            return;
        }

        // Render Cards logic here... (If projects exist)

    } catch (error) {
        GRID.innerHTML = `<div class="empty-state"><p>System Status: No public repositories available right now.</p></div>`;
    }
}

fetchProjects();
