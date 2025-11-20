# The yaml file
The cards data are stored in the `_data/guides.yml` file. 

Each tutorial entry can have the following fields:
| Field         | Mandatory | Description                                                                                                    | Type / Format              |
|----------------|------------|----------------------------------------------------------------------------------------------------------------|-----------------------------|
| `id`           | No         | A unique identifier for the tutorial.                                                                         | String / Integer                     |
| `title`        | Yes        | The title of the tutorial.                                                                                    | String                     |
| `description`  | No         | A brief description of the tutorial.                                                                          | String                     |
| `url`          | Yes        | The URL of the tutorial.                                                                                      | String (URL)                |
| `technique`    | No         | The technique(s) covered in the tutorial.                                                                     | String or Array of Strings  |
| `tool`         | No         | The tool(s) used in the tutorial.                                                                             | String or Array of Strings  |
| `dataFormat`   | No         | The data format(s) used in the tutorial.                                                                      | String or Array of Strings  |
| `type`         | No         | The type(s) of the tutorial.                                                                                  | String or Array of Strings  |
| `series`       | No         | The series associated with the tutorial. If none is set, then the series field will be blank.                 | String or Array of Strings  |
| `date`         | No         | The publication date of the tutorial. Must be in YYYY-MM-DD format                                                                         | String (YYYY-MM-DD)                |

## String or Array of Strings

For fields that can accept multiple values (i.e., "String or Array of Strings"), you can provide either a single string or an array of strings. For example:

```yaml
technique: "Data Analysis"
```

or
```yaml
technique: 
 - "Data Analysis"
```
If you want to specify multiple values, use an array format like this:
```yaml
technique:
  - "Data Analysis"
  - "Visualization"
```
# Validate the YAML file against the schema
You can validate the `_data/guides.yml` file against the schema defined in `_data/guides_schema.yml` using a YAML schema validation tool or library. The following example will be using [`check-jsonschema`](https://github.com/python-jsonschema/check-jsonschema):

You have to first install `check-jsonschema` if you haven't already:
```bash
pip install check-jsonschema
```
Then run the following command to validate the `_data/guides.yml` file:
```bash
check-jsonschema --schemafile _data/guides_schema.yml _data/guides.yml
```

Alternatively, if you have uv (&uvx) installed, you can use the following command:
```bash
uvx check-jsonschema --schemafile _data/guides_schema.yml _data/guides.yml
```



# Best Practices
Follow these best practices when making updates to the `_data/guides.yml` file:
1. Create a new branch for your changes:
```bash
git checkout -b update-guides
```
2. Make your changes to the `_data/guides.yml` file using the text editor of your choice.
3. Validate the YAML syntax to ensure there are no errors.
4. Commit your changes with a descriptive message, following [conventional commit guidelines](https://www.conventionalcommits.org/en/v1.0.0/#summary):
```bash
git add _data/guides.yml
git commit -m "feat: updated guides.yml with new tutorial on XYZ"
```
5. Push your branch to the remote repository:
```bash
git push origin update-guides
```
6. Create a pull request on Github for review and merging.