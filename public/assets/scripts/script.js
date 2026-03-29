function toggleDescription(button) {
    const card = button.closest('.project-card');
    const modal = card.querySelector('.description-modal');
    modal.classList.add('open');
}

function closeModal(modal) {
    modal.classList.remove('open');
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
        
        const sectionsHTML = project.descriptionSections.map(section => `
            <div class="description-section">
                <h4>${section.title}</h4>
                <p>${section.content}</p>
            </div>
        `).join('');
        
        projectEl.innerHTML = `
            <a href="${project.link}" target="_blank" rel="noopener noreferrer" class="project-link-overlay" aria-label="View project ${project.name}">
                <img src="${project.image}" alt="${project.name}">
            </a>
            <h3>${project.name}</h3>
            <div class="tags">${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>
            <div class="card-flex">
                <div class="short-description">${project.shortDescription}</div>
                <div class="btn-group">
                    <button class="btn read-more" onclick="toggleDescription(this)">Read case study</button>
                    <a href="${project.link}" target="_blank" rel="noopener noreferrer" class="btn">View Project</a>
                </div>
            </div>
            <div class="description-modal" onclick="if(event.target === this) closeModal(this)">
                <div class="modal-content">
                    <button class="modal-close" onclick="closeModal(this.closest('.description-modal'))">×</button>
                    <h3>Case study: ${project.name}</h3>
                    ${sectionsHTML}
                </div>
            </div>
        `;
        container.appendChild(projectEl);
    });
}

function setupCasesProgressUnderline() {
    const container = document.getElementById('projects-container');
    const heading = document.querySelector('#projects h2');
    const arrow = heading?.querySelector('.cases-scroll-arrow');

    if (!container || !heading || !arrow) {
        return;
    }

    const updateProgress = () => {
        if (window.matchMedia('(min-width: 1000px)').matches) {
            heading.style.setProperty('--cases-progress', '0%');
            arrow.classList.add('is-hidden');
            arrow.classList.remove('point-left');
            return;
        }

        const maxScroll = container.scrollWidth - container.clientWidth;
        const progress = maxScroll > 0 ? (container.scrollLeft / maxScroll) * 100 : 0;
        const safeProgress = Math.max(0, Math.min(100, progress));
        heading.style.setProperty('--cases-progress', `${safeProgress}%`);

        const hasHorizontalScroll = maxScroll > 1;
        arrow.classList.toggle('is-hidden', !hasHorizontalScroll);

        if (!hasHorizontalScroll) {
            arrow.classList.remove('point-left');
            return;
        }

        const isAtRightEnd = container.scrollLeft >= maxScroll - 1;
        arrow.classList.toggle('point-left', isAtRightEnd);
    };

    container.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    updateProgress();
}

document.addEventListener('DOMContentLoaded', async () => {
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    const sections = document.querySelectorAll('main section');
    const yearEl = document.getElementById('year');
    const techLogos = document.querySelectorAll('#stack .tech-logos img');
    const hamburger = document.getElementById('hamburger');
    const nav = document.querySelector('nav');
    const head = document.querySelector('header');

    if (yearEl) {
        yearEl.textContent = String(new Date().getFullYear());
    }

    function setActiveLink(id) {
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
    }

    function closeMobileMenu() {
        if (!hamburger || !nav || !head) {
            return;
        }

        nav.classList.remove('open');
        hamburger.classList.remove('open');
        head.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
    }

    navLinks.forEach(link => {
        link.addEventListener('click', event => {
            event.preventDefault();
            const targetId = link.getAttribute('href').slice(1);
            const target = document.getElementById(targetId);

            if (target) {
                closeMobileMenu();

                const headerHeight = head ? head.getBoundingClientRect().height : 0;
                const headerOffset = headerHeight + 16;
                const targetTop = target.getBoundingClientRect().top + window.scrollY - headerOffset;

                window.scrollTo({
                    top: Math.max(0, targetTop),
                    behavior: 'smooth'
                });

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

    if (hamburger && nav) {
        hamburger.addEventListener('click', () => {
            const isOpen = nav.classList.toggle('open');
            hamburger.classList.toggle('open', isOpen);
            head.classList.toggle('open', isOpen);
            hamburger.setAttribute('aria-expanded', String(isOpen));
        });
    }

    const techTooltip = document.createElement('div');
    techTooltip.className = 'tech-logo-tooltip';
    techTooltip.setAttribute('role', 'status');
    techTooltip.setAttribute('aria-live', 'polite');
    document.body.appendChild(techTooltip);

    let activeLogo = null;
    let pinnedLogo = null;

    function positionTooltip(logo) {
        if (!logo) {
            return;
        }

        const rect = logo.getBoundingClientRect();
        const tooltipRect = techTooltip.getBoundingClientRect();
        let left = rect.left + window.scrollX + (rect.width - tooltipRect.width) / 2;
        let top = rect.bottom + window.scrollY + 8;

        if (left < window.scrollX + 8) {
            left = window.scrollX + 8;
        }

        if (left + tooltipRect.width > window.scrollX + window.innerWidth - 8) {
            left = window.scrollX + window.innerWidth - tooltipRect.width - 8;
        }

        if (top + tooltipRect.height > window.scrollY + window.innerHeight - 8) {
            top = rect.top + window.scrollY - tooltipRect.height - 8;
        }

        techTooltip.style.left = `${left}px`;
        techTooltip.style.top = `${top}px`;
    }

    function showTooltip(logo, pin = false) {
        const label = logo.dataset.logoTitle || logo.getAttribute('alt') || '';
        if (!label) {
            return;
        }

        activeLogo = logo;
        if (pin) {
            pinnedLogo = logo;
        }

        techTooltip.textContent = label;
        techTooltip.classList.add('visible');
        positionTooltip(logo);
    }

    function hideTooltip(force = false) {
        if (!force && pinnedLogo) {
            return;
        }

        techTooltip.classList.remove('visible');
        techTooltip.textContent = '';
        activeLogo = null;
    }

    techLogos.forEach(logo => {
        const titleText = logo.getAttribute('title') || logo.getAttribute('alt') || '';
        logo.dataset.logoTitle = titleText;
        logo.removeAttribute('title');
        logo.setAttribute('tabindex', '0');

        logo.addEventListener('mouseenter', () => {
            if (window.matchMedia('(hover: hover)').matches) {
                showTooltip(logo, false);
            }
        });

        logo.addEventListener('mouseleave', () => {
            hideTooltip(false);
        });

        logo.addEventListener('focus', () => {
            showTooltip(logo, false);
        });

        logo.addEventListener('blur', () => {
            hideTooltip(false);
        });

        logo.addEventListener('click', () => {
            if (pinnedLogo === logo) {
                pinnedLogo = null;
                hideTooltip(true);
                return;
            }

            pinnedLogo = null;
            showTooltip(logo, true);
        });
    });

    document.addEventListener('click', event => {
        const clickedLogo = event.target.closest('#stack .tech-logos img');
        if (!clickedLogo) {
            pinnedLogo = null;
            hideTooltip(true);
        }
    });

    window.addEventListener('resize', () => {
        if (activeLogo && techTooltip.classList.contains('visible')) {
            positionTooltip(activeLogo);
        }
    });

    window.addEventListener('scroll', () => {
        if (activeLogo && techTooltip.classList.contains('visible')) {
            positionTooltip(activeLogo);
        }
    }, { passive: true });

    try {
        const projects = await fetchProjects();
        renderProjects(projects);
        setupCasesProgressUnderline();
    } catch (error) {
        console.error('Error loading projects:', error);
        if (window.location.protocol === 'file:') {
            showProjectsError('Start a local server to load projects (fetch is blocked on file://).');
            return;
        }

        showProjectsError('Could not load projects right now.');
    }

});
