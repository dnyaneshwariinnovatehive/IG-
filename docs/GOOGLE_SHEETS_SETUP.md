# Google Sheets & Drive Setup Guide

This guide walks through the complete configuration of Google Sheets as the InnovateGuide v2 database and Google Drive as the file storage backend. Complete all steps in order before starting the server.

---

## Part 1 — Google Cloud Project

### 1.1 Open the Google Cloud Console

Navigate to [https://console.cloud.google.com](https://console.cloud.google.com). Sign in with a Google account that you control (ideally a dedicated account for the application, not a personal account).

### 1.2 Create a New Project

**What you see:** The top bar shows your current project name next to the Google Cloud logo.

1. Click the project name dropdown.
2. In the dialog that opens, click **New Project** (top-right).
3. Fill in:
   - **Project name**: `innovateguide` (or any name you prefer)
   - **Location**: leave as "No organization" unless you are inside a Google Workspace org
4. Click **Create**.
5. Wait for the notification (bell icon) confirming "Project created".
6. Click the project dropdown again and select your newly created project to make it active.

---

## Part 2 — Enable APIs

You need to enable two APIs: Google Sheets API and Google Drive API.

### 2.1 Open the API Library

In the left navigation menu, click **APIs & Services** → **Library**.

### 2.2 Enable Google Sheets API

1. In the search bar, type `Google Sheets API`.
2. Click the result that says **Google Sheets API** (published by Google).
3. On the API detail page, click the blue **Enable** button.
4. Wait for the page to reload showing "API enabled".

### 2.3 Enable Google Drive API

1. Click **Back to library** or the breadcrumb.
2. Search for `Google Drive API`.
3. Click **Google Drive API** (published by Google).
4. Click **Enable**.

---

## Part 3 — Service Account

A service account is a non-human Google identity that the application uses to authenticate with Google APIs. It is the bridge between your Node.js server and Google's services.

### 3.1 Open Credentials

In the left menu, click **APIs & Services** → **Credentials**.

### 3.2 Create a Service Account

1. Click **+ Create Credentials** at the top.
2. Select **Service account** from the dropdown.
3. Fill in the form:
   - **Service account name**: `innovateguide` (display name only)
   - **Service account ID**: auto-populates as `innovateguide` (this becomes part of the email)
   - **Description**: `InnovateGuide v2 API access` (optional)
4. Click **Create and Continue**.
5. On the "Grant this service account access to project" step, skip it (click **Continue**).
6. On the "Grant users access to this service account" step, skip it (click **Done**).

You will see the service account listed on the Credentials page.

### 3.3 Download the JSON Key File

**Important:** This key file grants access to your Google resources. Treat it like a password.

1. In the Credentials list, click on the service account email to open its details.
2. Click the **Keys** tab.
3. Click **Add Key** → **Create new key**.
4. Select **JSON** as the key type.
5. Click **Create**.
6. A JSON file downloads automatically to your computer. Save it somewhere secure.

### 3.4 Locate the Required Values in the JSON File

Open the downloaded JSON file in a text editor. It looks like this:

```json
{
  "type": "service_account",
  "project_id": "innovateguide",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN RSA PRIVATE KEY-----\nMIIE...\n-----END RSA PRIVATE KEY-----\n",
  "client_email": "innovateguide@innovateguide.iam.gserviceaccount.com",
  "client_id": "123456789",
  ...
}
```

You need two values:

| JSON field | What it maps to |
|---|---|
| `client_email` | `GOOGLE_SERVICE_ACCOUNT_EMAIL` in `.env` |
| `private_key` | `GOOGLE_PRIVATE_KEY` in `.env` |

#### How to paste the private key into .env

The `private_key` value contains literal `\n` character sequences representing newlines. When pasting it into `.env`:

- Keep all the `\n` sequences exactly as they appear — do NOT convert them to actual newlines.
- Wrap the entire value in double quotes.

Correct format in `.env`:

```env
GOOGLE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIE...(many characters)...\n-----END RSA PRIVATE KEY-----\n"
```

The server's config module handles converting `\n` back to real newlines at runtime:
```js
process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
```

---

## Part 4 — Google Spreadsheet (Database)

### 4.1 Create the Spreadsheet

1. Go to [https://sheets.google.com](https://sheets.google.com).
2. Click **Blank spreadsheet** to create a new one.
3. Click "Untitled spreadsheet" at the top left and rename it to `InnovateGuide v2`.

### 4.2 Get the Spreadsheet ID

Look at your browser's address bar. The URL looks like:

```
https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/edit
```

The string between `/d/` and `/edit` is the Spreadsheet ID:

```
1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms
```

Copy this ID and set it as `GOOGLE_SHEETS_SPREADSHEET_ID` in `.env`.

### 4.3 Share the Spreadsheet with the Service Account

The server authenticates as the service account, so the spreadsheet must be shared with it.

1. In the spreadsheet, click the **Share** button (top-right, blue).
2. In the "Add people and groups" field, paste the service account email from `.env` (e.g., `innovateguide@innovateguide.iam.gserviceaccount.com`).
3. Set the role to **Editor** (the server needs to write, update and delete rows).
4. Uncheck "Notify people" — the service account cannot receive emails.
5. Click **Share**.

You will see a "Can't notify people" dialog — click **Share anyway**.

### 4.4 Create the Required Sheet Tabs

By default a new spreadsheet has one tab called "Sheet1". You need six tabs.

For each tab listed below:
- If the tab does not exist, click the **+** button at the bottom left of the screen.
- Double-click the new tab name and rename it exactly as shown.

Required tabs (names are case-sensitive):

1. `Users`
2. `Projects`
3. `Categories`
4. `CustomRequests`
5. `Analytics`
6. `Settings`

You can delete or rename the default "Sheet1" tab once you have added all six.

### 4.5 Add Headers to Each Tab

Select each tab and type the headers into row 1. Each header goes in a separate column. Do not add a header row that says "Row 1" — just the values.

#### Users Tab

Click the `Users` tab. Type these values starting from cell A1:

```
A1: id
B1: email
C1: name
D1: role
E1: createdAt
F1: lastLogin
```

#### Projects Tab

Click the `Projects` tab. Type these values starting from cell A1:

```
A1:  id
B1:  title
C1:  description
D1:  price
E1:  domain
F1:  difficulty
G1:  type
H1:  technologies
I1:  screenshots
J1:  videoUrl
K1:  githubUrl
L1:  status
M1:  createdAt
N1:  views
O1:  downloads
P1:  rating
Q1:  reviewCount
R1:  isTrending
S1:  isNew
T1:  isFeatured
U1:  isTopSelling
V1:  tags
W1:  creatorId
X1:  creatorName
Y1:  creatorEmail
Z1:  zipFileId
```

Notes on data formats:
- `technologies`, `screenshots`, `tags` — stored as comma-separated values (e.g., `React,Node.js,MongoDB`)
- `isTrending`, `isNew`, `isFeatured`, `isTopSelling` — stored as the string `"true"` or `"false"`
- `status` — valid values: `pending`, `approved`, `rejected`, `published`
- `type` — valid values: `admin` (added by admin), `student` (submitted by student)
- `difficulty` — valid values: `Beginner`, `Intermediate`, `Advanced`

#### Categories Tab

Click the `Categories` tab. Type these values starting from cell A1:

```
A1: id
B1: name
C1: slug
D1: description
E1: icon
F1: projectCount
G1: isActive
```

#### CustomRequests Tab

Click the `CustomRequests` tab. Type these values starting from cell A1:

```
A1:  id
B1:  name
C1:  email
D1:  phone
E1:  projectType
F1:  budget
G1:  timeline
H1:  technologies
I1:  description
J1:  additionalInfo
K1:  status
L1:  createdAt
```

Notes on data formats:
- `technologies` — comma-separated (e.g., `Python,Django,PostgreSQL`)
- `status` — valid values: `new`, `in-progress`, `completed`, `cancelled`
- `budget` — stored as a plain string (e.g., `5000-10000`)

#### Analytics Tab

Click the `Analytics` tab. Type these values starting from cell A1:

```
A1: id
B1: event
C1: projectId
D1: userId
E1: timestamp
F1: metadata
```

#### Settings Tab

Click the `Settings` tab. Type these values starting from cell A1:

```
A1: key
B1: value
C1: updatedAt
```

### 4.6 Freeze the Header Row (Optional but Recommended)

For each tab, freeze row 1 so it stays visible while scrolling:

1. Select row 1 (click the row number "1" on the left).
2. In the menu, click **View** → **Freeze** → **1 row**.

---

## Part 5 — Google Drive (File Storage)

### 5.1 Create the Storage Folders

1. Go to [https://drive.google.com](https://drive.google.com).
2. Click **+ New** → **New folder**.
3. Name the folder `InnovateGuide — Projects`. Click **Create**.
4. Click **+ New** → **New folder** again.
5. Name the second folder `InnovateGuide — Screenshots`. Click **Create**.

### 5.2 Share Folders with the Service Account

Repeat for both folders:

1. Right-click the folder → **Share**.
2. Paste the service account email.
3. Set role to **Editor**.
4. Uncheck "Notify people".
5. Click **Share**.

### 5.3 Get Folder IDs

Click on the **InnovateGuide — Projects** folder to open it. Look at the browser URL:

```
https://drive.google.com/drive/folders/1a2B3c4D5e6F7g8H9i0J
```

The last segment of the path is the folder ID: `1a2B3c4D5e6F7g8H9i0J`

Copy it and set it as `GOOGLE_DRIVE_FOLDER_ID` in `.env`.

Repeat for the **InnovateGuide — Screenshots** folder and copy its ID to `GOOGLE_DRIVE_SCREENSHOTS_FOLDER_ID`.

### 5.4 File Upload Behaviour

When a project ZIP is uploaded through the admin panel:

1. The server receives the file in memory via Multer.
2. The file is passed to `DriveService.uploadFile()` in `server/services/googleDrive.js`.
3. The file is uploaded to the Projects Drive folder using the service account credentials.
4. Google Drive returns a `fileId`.
5. The `fileId` is stored in the `zipFileId` column of the Projects sheet.
6. When a user downloads a project, the server constructs the download URL:
   `https://drive.google.com/uc?export=download&id=<zipFileId>`

Screenshots follow the same flow but are uploaded to the Screenshots folder and their `fileId` values are stored comma-separated in the `screenshots` column.

---

## Part 6 — Verify the Setup

After completing all steps above and filling in `.env`, start the server and verify connectivity:

```bash
# Start the server
node server/index.js

# In a separate terminal, test the health endpoint
curl http://localhost:5000/health
# Expected: {"status":"ok","timestamp":"...","version":"2.0.0"}

# Test the projects endpoint (should return mock data or real data from Sheets)
curl http://localhost:5000/api/v1/projects
```

If you see projects returned (either mock or from your spreadsheet), the setup is working.

### Common Setup Mistakes

| Symptom | Likely Cause | Fix |
|---|---|---|
| `SheetsService.getRows error: The caller does not have permission` | Spreadsheet not shared with service account | Share the sheet with the service account email as Editor |
| `SheetsService.getRows error: Requested entity was not found` | Wrong Spreadsheet ID in `.env` | Re-copy the ID from the URL |
| `Error: error:0906D06C` or private key errors | Malformed private key in `.env` | Ensure `\n` sequences are preserved and the value is in double quotes |
| `DriveService: Google Drive not configured` | Missing email or private key | Check that both `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_PRIVATE_KEY` are set |
| Files upload but download fails | Drive folder not shared with service account | Share both Drive folders with the service account as Editor |
| API returns mock data instead of real data | Sheets API not returning rows | Check that headers exist in row 1 and the sheet has data from row 2 onwards |
