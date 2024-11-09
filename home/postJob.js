// Create a new file called post-job.js
document.addEventListener('DOMContentLoaded', function() {
    const jobForm = document.querySelector('.job-form');
    
    jobForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const jobData = {
            title: document.getElementById('jobTitle').value,
            type: document.getElementById('jobType').value,
            location: document.getElementById('location').value,
            salaryMin: document.getElementById('salaryMin').value,
            salaryMax: document.getElementById('salaryMax').value,
            description: document.getElementById('description').value,
            datePosted: new Date().toISOString()
        };

        // Here you would typically:
        // 1. Send this data to your backend API
        // 2. Store it in a database
        // 3. Redirect to the home page or show a success message
        
        console.log('Job Posted:', jobData);
        // For now, we'll just log the data
        alert('Job posted successfully!');
        jobForm.reset();
    });
});