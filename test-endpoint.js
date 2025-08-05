// Test endpoint manually
// You can run this in browser console or create a simple test

fetch('/prispevki/my-contributions', {
    credentials: 'include'
})
.then(response => {
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    return response.text();
})
.then(data => {
    console.log('Response data:', data);
    try {
        const json = JSON.parse(data);
        console.log('Parsed JSON:', json);
    } catch (e) {
        console.log('Not JSON, raw response:', data);
    }
})
.catch(err => console.error('Fetch error:', err));
