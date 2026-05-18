# Operation
These are the regular maintenance tasks required to operate Formwhile.

## Data APIs
The data APIs access external APIs, retrieve data, store that data, and recall it for use in the app. 

They may fail at certain stages. They have the following behavior pattern:
- Check for data already in the DB.
- If the data in the DB is not too old, return it.
- If the data in the DB is old, call the external API.
- If the external API is unresponsive, use the old data.
- Delete the DB contents, replace with the most recent data from the external API.
- Return the latest data now in the database.

## Updates
Run the following locally to update all packages to max latest version:
```npm update --include=dev```

Commit this change to Github.