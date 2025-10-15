# Map and Data Library JTD Theme
This is a customized version of the [Just the Docs](https://just-the-docs.com) theme for the [Map and Data Library](https://mdl.library.utoronto.ca) at the [University of Toronto Libraries](https://www.library.utoronto.ca).

# Using the template
This repository is a [GitHub template repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template) that you can use to create your own documentation site using the [Just the Docs](https://just-the-docs.com) theme.

To create a new site using this template, click the green "Use this template" button above. This will create a new repository in your GitHub account with the contents of this repository.

# Using as a remote theme
You can use this repository as a remote theme, powered by the [jekyll-remote-theme plugin](https://github.com/benbalter/jekyll-remote-theme). 

To do so, add the following two lines to your site's `_config.yml` file:
```yaml
remote_theme: "MDLutoronto/jtd-theme"

plugins:
    - ... (if you have other plugins)
    - jekyll-remote-theme
```
Also, you need to install the `jekyll-remote-theme` (version 0.4.3) gem by adding this line to your `Gemfile`:
```ruby
gem "jekyll-remote-theme", "~> 0.4.3"
```

# Configuration options
## Site options
You can set the following options in your site's `_config.yml` file to customize site-wide information:

### Workshop series name (optional)
- workshop_series_name: Set this to the name of your workshop series to have it displayed in that page. For example:
```yaml
workshop_series_name: "NAME OF YOUR WORKSHOP SERIES"
```
This will display `This workshop is part of the {{NAME OF YOUR WORKSHOP SERIES}}` in the footer of each page.

### License (optional)
By default, the theme displays a Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0) license icon in the footer of each page, linking to the [CC BY-NC-SA 4.0 license](https://creativecommons.org/licenses/by-nc-sa/4.0/).

You can set the following options to display license information in the footer of the site that applies to all pages:

- license_name: Set this to the name of the license. For example:
```yaml
license_name: "CC BY 4.0"
```
- license_url: Set this to the URL of the license. For example:
```yaml
license_url: "https://creativecommons.org/licenses/by-nc-sa/4.0/"
```
- license_image_url: Set this to the URL of the license image you want to display. For example:
```yaml
license_image_url: "https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/by-nc-sa.svg"
```
<a target="_blank" rel="noopener noreferrer" href="https://creativecommons.org/licenses/by-nc-sa/4.0/"><img src="https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/by-nc-sa.svg" alt="Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International icon" style="height:2em;"></a>

## Page options
You can set the following options in the front matter of your pages to customize the footer information:

### Dates
- created_date: Set this to the date the page was created. For example:
```yaml
created_date: 2025-10-06
```
- last_modified_date: Set this to the date the page was last modified. For example:
```yaml
last_modified_date: 2025-10-07
```
This will display `Content created: October 06, 2025 | Last updated: October 07, 2025` in the footer of the page.

If only one of these options is set, only that information will be displayed.

### Staff information
- staff_name: Set this to the name of the staff member who created the page. For example:
```yaml
staff_name: Ken Lui
```
- staff_link: Set this to the URL of the staff member's profile or website. For example:
```yaml
staff_link: https://library.utoronto.ca/staff/ken-lui
```
This will display `Tutorial created by Ken Lui` in the footer of the page, with `Ken Lui` being a link to the specified URL. If no link is provided, the name will be displayed as plain text.

### Student staff information (optional)
- student_name: Set this to the name of the student staff member who created the page. For example:
```yaml
student_name: Jane Doe
```
- student_link: Set this to the URL of the student staff member's profile or website. For example:
```yaml
student_link: https://library.utoronto.ca/staff/jane-doe
```
This will display `Tutorial created by Jane Doe` in the footer of the page, with `Jane Doe` being a link to the specified URL. If no link is provided, the name will be displayed as plain text.

# Development
## Testing the theme locally
To test the theme locally, you need to have [Ruby](https://www.ruby-lang.org/en/documentation/installation/) and [Bundler](https://bundler.io) installed.
1. Clone the repository:
```bash
git clone https://github.com/MDLutoronto/jtd-theme.git
```
2. Navigate to the repository directory:
```bash
cd jtd-theme
```
3. Install the dependencies and serve the site with live reload:
```bash
bundle install && bundle exec jekyll serve --livereload
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