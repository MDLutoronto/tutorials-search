---
title: Rendering Tables from CSV
layout: page
nav_order: 2
description: How to render tables from CSV files in Jekyll
last_modified_date: 2025-10-14
parent: Home
---
# Table of Contents
{: .no_toc }
1. Table of Contents
{:toc}

# Data from CSV 

You can create tables from CSV files stored in the `_data` folder of your Jekyll site.

## Prerequisites

First, create a CSV file in the `_data` folder. For example, create `_data/data.csv` with your tabular data.

## Basic Usage

To render a table from your CSV file:

Assign the CSV data to a variable:

```liquid
{% raw %}{% assign csv_data = site.data.csv_data %}{% endraw %}
```

Create the table structure:

```liquid
{% raw %}<table>
  <thead>
    <tr>
      {% for header in csv_data.first %}
        <th>{{ header[0] }}</th>
      {% endfor %}
    </tr>
  </thead>
  <tbody>
    {% for row in csv_data %}
      <tr>
        {% for cell in row %}
          <td>{{ cell[1] }}</td>
        {% endfor %}
      </tr>
    {% endfor %}
  </tbody>
</table>{% endraw %}
```

## Example Output

{% assign csv_data = site.data.csv_data %}
<table>
  <thead>
    <tr>
      {% for header in csv_data.first %}
        <th>{{ header[0] }}</th>
      {% endfor %}
    </tr>
  </thead>
  <tbody>
    {% for row in csv_data %}
      <tr>
        {% for cell in row %}
          <td>{{ cell[1] }}</td>
        {% endfor %}
      </tr>
    {% endfor %}
  </tbody>
</table>

## Using Multiple CSV Files

To use a different CSV file (e.g., `_data/another_data.csv`), simply change the file name in the assign statement:

```liquid
{% raw %}{% assign another_data = site.data.another_data %}

<table>
  <thead>
    <tr>
      {% for header in another_data.first %}
        <th>{{ header[0] }}</th>
      {% endfor %}
    </tr>
  </thead>
  <tbody>
    {% for row in another_data %}
      <tr>
        {% for cell in row %}
          <td>{{ cell[1] }}</td>
        {% endfor %}
      </tr>
    {% endfor %}
  </tbody>
</table>{% endraw %}
```

### Output from another_data.csv

{% assign another_data = site.data.another_data %}
<table>
  <thead>
    <tr>
      {% for header in another_data.first %}
        <th>{{ header[0] }}</th>
      {% endfor %}
    </tr>
  </thead>
  <tbody>
    {% for row in another_data %}
      <tr>
        {% for cell in row %}
          <td>{{ cell[1] }}</td>
        {% endfor %}
      </tr>
    {% endfor %}
  </tbody>
</table>

## Table with no header
If your CSV file does not have a header row, you can skip the header section in the table:

```liquid
{% raw %}<table>
  <tbody>
    {% for row in csv_data %}
      <tr>
        {% for cell in row %}
          <td>{{ cell[1] }}</td>
        {% endfor %}
      </tr>
    {% endfor %}
  </tbody>
</table>{% endraw %}
```
### Output from no_header_data.csv

{% assign no_header_data = site.data.csv_data %}
<table>
  <tbody>
    {% for row in no_header_data %}
      <tr>
        {% for cell in row %}
          <td>{{ cell[1] }}</td>
        {% endfor %}
      </tr>
    {% endfor %}
  </tbody>
</table>