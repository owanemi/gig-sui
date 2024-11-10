// Add this to your home.html as a new file: home.js
document.addEventListener('DOMContentLoaded', async function() {
    const jobCardsContainer = document.querySelector('.job-cards-container');

    async function fetchJobs() {
        try {
            const response = await fetch('http://localhost:3000/api/jobs');
            const jobs = await response.json();
            
            jobCardsContainer.innerHTML = ''; // Clear existing cards
            
            jobs.forEach(job => {
                const jobCard = `
                    <div class="job-card">
                        <div class="job-title">${job.title}</div>
                        <div class="job-details">
                            <div class="job-type">${job.type}</div>
                            <div class="job-location">${job.location}</div>
                        </div>
                        <div class="job-description">
                            ${job.description}
                        </div>
                        <div class="job-footer">
                            <div class="salary">$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}</div>
                            <button class="apply-btn">Apply Now</button>
                        </div>
                    </div>
                `;
                jobCardsContainer.insertAdjacentHTML('beforeend', jobCard);
            });
        } catch (error) {
            console.error('Error fetching jobs:', error);
            jobCardsContainer.innerHTML = '<p>Error loading jobs. Please try again later.</p>';
        }
    }

    fetchJobs();
});