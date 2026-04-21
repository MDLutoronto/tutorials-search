## Search Syntax

### Search Box

| Goal | Syntax | Example |
|------|--------|---------|
| Keyword search | Type words (matches ALL terms across title, description, series, technique, tool, type, data format) | `python` |
| Multi-word search | Separate words with spaces | `linear regression` |
| Exclude a word | Prefix with `-` | `-python` |
| Exclude a phrase | Prefix with `-` and wrap in quotes | `-"bits and bytes"` |

### URL Parameters

| Goal | Parameter | Example |
|------|-----------|---------|
| Keyword search | `query=` | `?query=python` |
| Filter by facet | `type=`, `technique=`, `tool=`, `series=`, `dataFormat=` | `?type=Video` |
| Filter by multiple facets | Repeat or combine params (AND logic) | `?type=Video&tool=Python` |
| Exclude a facet value | `not_type=`, `not_technique=`, `not_tool=`, `not_series=`, `not_dataFormat=` | `?not_series=Bits and Bytes` |
| Sort results | `sort=title` or `sort=date` | `?sort=date` |
| Change page size | `perPage=` (options: 12, 24, 48, 100) | `?perPage=24` |

### Combining Both

URL parameters and the search box can be used together. For example, to show all Videos excluding the Bits and Bytes series:

```text
?type=Video&not_series=Bits and Bytes
```

Or equivalently, using the search box with `?type=Video` active and typing `-"bits and bytes"`.
