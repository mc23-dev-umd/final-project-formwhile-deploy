# Spinup
This is the guide for deploying Formwhile to a serverless architecture.
Vercel is recommended.

## Push to Github
Commit & push all files to Github. 

The following files are functional in their current form and should be included in the repository but not modified from their original copies:
- package.json
- package-lock.json
- vercel.json
- .gitignore

## Create Vercel project
Log into the Vercel web portal.

Create a new project. Where it prompts for a Github repo URL, or allows you to select from repos you are a part of, enter the previously created repo.

Await the building process' completion.

## Including environment variables
Either during project creation or afterwards, enter the environment variables for the Supabase URL and the Supabase key. They must be named SUPABASE_URL and SUPABASE_KEY, respectively.