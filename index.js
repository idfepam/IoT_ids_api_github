const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;
const GITHUB_API_URL = 'https://api.github.com';

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true })); // Дозволяє парсити дані форми.
app.use(express.json());

// Маршрут для відображення головної сторінки з формою
app.get('/', (req, res) => {
    res.render('form');
});

app.post('/search', (req, res) => {
    const { username } = req.body;
    res.redirect(`/repos/${username}`);
});

app.get('/repos/:username', async (req, res) => {
    const { username } = req.params;
    try {
        const response = await axios.get(`${GITHUB_API_URL}/users/${username}/repos`);
        res.render('index', { username, repos: response.data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch repositories' });
    }
});

app.get('/repos/:username/:repo', async (req, res) => {
    const { username, repo } = req.params;
    try {
        const repoResponse = await axios.get(`${GITHUB_API_URL}/repos/${username}/${repo}`);
        const commitsResponse = await axios.get(`${GITHUB_API_URL}/repos/${username}/${repo}/commits`);
        const languagesResponse = await axios.get(`${GITHUB_API_URL}/repos/${username}/${repo}/languages`);

        const repoData = {
            name: repoResponse.data.name,
            description: repoResponse.data.description,
            url: repoResponse.data.html_url,
            created_at: repoResponse.data.created_at,
            updated_at: repoResponse.data.updated_at,
            languages: Object.keys(languagesResponse.data).join(', '), 
            commits: commitsResponse.data.map(commit => ({
                date: commit.commit.author.date,
                hash: commit.sha,
                message: commit.commit.message
            }))
        };

        res.render('repo', { repo: repoData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch repository details or commits' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
