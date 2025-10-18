# Map & Data Library tutorials search portal
This repository is the codebase for a javascript based website that serves as a search interface for the [Map & Data Library Tutorials](https://mdlutoronto.github.io/tutorials-search/). 

It is built using [Jekyll](https://jekyllrb.com/) and hosted on [GitHub Pages](https://pages.github.com/).

# Updating tutorials data
See the [instructions for updating the tutorials data](/docs/update-data/README.md).

# Development
## Site structure
- The main layout file is located at `_layouts/minimal_search.html`.
- The tutorials data is stored in the `_data/guides.yml` file.
- The site configuration is in the `_config.yml` file.

## Testing the site locally
To test the site locally, you need to have [Ruby](https://www.ruby-lang.org/en/documentation/installation/) and [Bundler](https://bundler.io) installed.
1. Clone the repository:
```bash
git clone https://github.com/MDLutoronto/tutorials-search.git
```
2. Navigate to the repository directory:
```bash
cd tutorials-search
```
3. Install the dependencies and serve the site with live reload:
```bash
bundle install && bundle exec jekyll serve --livereload --port 4000
```
4. Open your web browser and go to `http://localhost:4000` to view the site.

## Deployment bug fix
If the deployment keeps looping the following messages:
```bash
...
Current status: deployment_queued
Getting Pages deployment status...
...
```
### Unpublishing and republishing the site
A way to fix is is to go to the repository's **Settings** > **Pages**, unpublish the site by clicking the **Unpublish site** button, then republish it by clicking the **Save** button.

### Changing the source temporarily
Another way to fix it is to try the following steps:
1. Cancel the current deployment if it's still in progress.
2. Go to the repository's **Settings** > **Pages**. Find the `Source` under the **Build and deployment** section, change it to `Deploy from a branch`
3. Wait for a few seconds, then change it back to `GitHub Actions`.
4. Retrigger the deployment by pushing a new commit, or re-running the workflow under the **Actions** > **Deploy Jekyll site to Pages**.