from pathlib import Path

import httpx
import yaml

GITHUB_API_URL = "https://api.github.com"


def list_repos(org: str) -> dict:
    """List all public repositories in a GitHub organization.

    Args:
        org (str): The GitHub organization name.

    Returns:
        dict: A dictionary containing the list of repositories with their details. Empty dict if an error occurs.

    """
    url = GITHUB_API_URL + f"/orgs/{org}/repos"
    try:
        response = httpx.get(url)
        response.raise_for_status()
        return response.json()
    except httpx.HTTPError as e:
        print(f"Error fetching repositories for organization {org}: {e}")
        return {}


# Read the YAML
def read_yaml(yaml_file: Path) -> dict:
    """Read a YAML file and return its contents as a dictionary.

    Args:
        yaml_file (Path): The path to the YAML file.

    Returns:
        dict: The contents of the YAML file as a dictionary.

    """
    with Path(yaml_file).open("r", encoding="utf-8") as f:
        return yaml.safe_load(f)


# Filter those with topics 'just-the-docs'
def filter_repos_by_topic(repos: dict, topic: str) -> list:
    """Filter repositories by a specific topic.

    Args:
        repos (dict): A dictionary containing the list of repositories from the GitHub API.
        topic (str): The topic to filter repositories by.

    Returns:
        list: A list of repositories that have the specified topic.

    """
    filtered_repos = []
    for repo in repos:
        if repo.get("topics") and topic in repo.get("topics"):
            filtered_repos.append(repo)
    return filtered_repos


# Read the _config.yml file from each repo and print the title


def get_repo_title(repo_list: list[dict]) -> list:
    """Get the title from the _config.yml file in the repository.

    Args:
        repo_list (list[dict]): A list of dictionaries containing the repository details from the GitHub API.

    Returns:
        list: A list of repositories with their titles added from the _config.yml file.


    """
    repo_with_config_data = []

    for repo in repo_list:
        if not repo.get("full_name"):
            continue
        config_yml_url = f"https://raw.githubusercontent.com/{repo.get('full_name', '')}/main/_config.yml"
        try:
            response = httpx.get(config_yml_url)
            response.raise_for_status()
            config_data = yaml.safe_load(response.text)
            title = config_data.get("title", None)
            repo["title"] = title
            description = config_data.get("description", None)
            if (
                repo.get("description") is None and description is not None
            ):  # Only update if GitHub description is None from the _config.yml
                repo["description"] = description
            repo_with_config_data.append(repo)
        except httpx.HTTPError as e:
            print(
                f"Error fetching _config.yml for repository {repo.get('full_name', '')}: {e}"
            )
            continue

    return repo_with_config_data


# TODO: Get the last updated date from the repo commits on main branch

# TODO: Only append if no existing record, or update last commit date date only for existing record


if __name__ == "__main__":
    mdl_repo_list = list_repos("mdlutoronto")
    mdl_jtd_repos = filter_repos_by_topic(mdl_repo_list, "just-the-docs")
