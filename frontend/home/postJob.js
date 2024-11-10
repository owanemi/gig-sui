// post-job.js
document.addEventListener('DOMContentLoaded', function() {
    const jobForm = document.querySelector('.job-form');
    
    jobForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const jobData = {
            title: document.getElementById('jobTitle').value,
            type: document.getElementById('jobType').value,
            location: document.getElementById('location').value,
            salaryMin: parseInt(document.getElementById('salaryMin').value),
            salaryMax: parseInt(document.getElementById('salaryMax').value),
            description: document.getElementById('description').value
        };

        try {
            const response = await fetch('http://localhost:3000/api/jobs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jobData)
            });

            if (response.ok) {
                alert('Job posted successfully!');
                jobForm.reset();
                window.location.href = '/home.html';
            } else {
                throw new Error('Failed to post job');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to post job. Please try again.');
        }
    });
});