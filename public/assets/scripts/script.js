function toggleDescription(button) {
    const fullDescription = button.previousElementSibling.querySelector('.full-description');
    const dots = button.previousElementSibling.querySelector('.dots');
    if (dots.style.display === 'none') {
        dots.style.display = 'inline';
        button.innerHTML = 'Read more';
        fullDescription.style.display = 'none';
    } else {
        dots.style.display = 'none';
        button.innerHTML = 'Read less';
        fullDescription.style.display = 'inline';
    }
}

async function fetchProjects() {
    const response = await fetch('./assets/data/projects.json');
    if (!response.ok) {
        throw new Error(`Could not load projects.json (${response.status})`);
    }

    const data = await response.json();
    return data.projects ?? [];
}

function renderProjects(projects) {
    const container = document.getElementById('projects-container');

    projects.forEach(project => {
        const projectEl = document.createElement('article');
        projectEl.className = 'project-card';
        projectEl.innerHTML = `
            <img src="${project.image}" alt="${project.name}">
            <div class="project-header">
                <h3>${project.name}</h3>
                <small class="status">${project.status}</small>
            </div>
            <div class="project-description">
                <p>${project.description.substring(0, 100)}<span class="dots">...</span><span class="full-description">${project.description.substring(100)}</span></p>
                <button class="btn read-more" id="toggle-description" onclick="toggleDescription(this)">Read More</button>
            </div>
            <div class="tags">${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>
            <a href="${project.link}" target="_blank" rel="noopener noreferrer" class="btn">View Project</a>
        `;
        container.appendChild(projectEl);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    const sections = document.querySelectorAll('main section');
    const yearEl = document.getElementById('year');

    if (yearEl) {
        yearEl.textContent = String(new Date().getFullYear());
    }

    function setActiveLink(id) {
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', event => {
            event.preventDefault();
            const targetId = link.getAttribute('href').slice(1);
            const target = document.getElementById(targetId);

            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                history.replaceState(null, '', `#${targetId}`);
                setActiveLink(targetId);
            }
        });
    });

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveLink(entry.target.id);
                }
            });
        }, { threshold: 0.6 });

        sections.forEach(section => observer.observe(section));
    }

    const initialId = (window.location.hash || '#hero').slice(1);
    setActiveLink(initialId);

    try {
        const projects = await fetchProjects();
        renderProjects(projects);
    } catch (error) {
        console.error('Error loading projects:', error);
        if (window.location.protocol === 'file:') {
            showProjectsError('Start a local server to load projects (fetch is blocked on file://).');
            return;
        }

        showProjectsError('Could not load projects right now.');
    }

});
