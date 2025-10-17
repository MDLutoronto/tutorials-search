# Updating data
The cards data are stored in the `_data/guides.yml` file. To update the tutorials data, follow these steps:
1. Open the `_data/guides.yml` file in a text editor.
2. Find the tutorial you want to update or add a new tutorial entry.
3. Each tutorial entry can have the following fields:
| Field         | Mandatory | Description                                                                                                    | Type / Format              |
|----------------|------------|----------------------------------------------------------------------------------------------------------------|-----------------------------|
| `id`           | No         | A unique identifier for the tutorial.                                                                         | String                     |
| `title`        | Yes        | The title of the tutorial.                                                                                    | String                     |
| `description`  | No         | A brief description of the tutorial.                                                                          | String                     |
| `url`          | Yes        | The URL of the tutorial.                                                                                      | String (URL)                |
| `technique`    | No         | The technique(s) covered in the tutorial.                                                                     | String or Array of Strings  |
| `tool`         | No         | The tool(s) used in the tutorial.                                                                             | String or Array of Strings  |
| `dataFormat`   | No         | The data format(s) used in the tutorial.                                                                      | String or Array of Strings  |
| `type`         | No         | The type(s) of the tutorial.                                                                                  | String or Array of Strings  |
| `series`       | No         | The series associated with the tutorial. If none is set, then the series field will be blank.                 | String or Array of Strings  |
| `date`         | No         | The publication date of the tutorial.                                                                         | `YYYY-MM-DD`                |


4. Commit the changes to the `guides.yml` file.