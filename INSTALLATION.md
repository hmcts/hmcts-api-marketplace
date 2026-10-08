# Installation

How to set up the HMCTS API Marketplace prototype (the GOV.UK Prototype Kit app in
`prototype-kit/`) on your machine. Commands are for macOS with [Homebrew](https://brew.sh/); on
Linux, use your package manager.

Once it's installed, [`RUNNING-LOCALLY.md`](RUNNING-LOCALLY.md) covers day-to-day running, the
export, the checks and troubleshooting.

## 1. Prerequisites

### Tools

| Tool | Version | Check with | Needed for |
|---|---|---|---|
| Git | any recent | `git --version` | Everything |
| Node.js and npm | Node 24, as pinned in [`.nvmrc`](.nvmrc) (`package.json` accepts 20–24) | `node --version` | Everything |
| Google Chrome or Chromium | any recent | — | Only the accessibility and reflow checks in `npm run gates` |
| PostgreSQL | 13 or newer | `psql --version` | Optional: saving data from the Entra flow |

The easiest way to get the right Node version is [nvm](https://github.com/nvm-sh/nvm):

```bash
brew install nvm      # then add the shell set-up lines brew prints
nvm install 24
```

Chrome, if you need it: `brew install --cask google-chrome`.

### Entra External ID (optional)

You only need this to use **Entra sign-in and registration** (`/auth/entra`). The rest of the site,
including the existing email-and-password sign-in, works without it.

Entra has to be configured to trust the local app before it will work. Follow
**[`ENTRA-PREREQUISITES.md`](ENTRA-PREREQUISITES.md)**, or get the values from the team if the
sandbox tenant is already set up. Either way you'll end up with the values for step 4.

## 2. Get the code and install dependencies

```bash
git clone https://github.com/hmcts/hmcts-api-marketplace.git
cd hmcts-api-marketplace
nvm use                          # switches to the Node version in .nvmrc
npm ci                           # export and check tooling
(cd prototype-kit && npm ci)     # the Prototype Kit itself
```

There are two `package.json` files, and both need installing. Use `npm ci`, not `npm install`,
so you get exactly the versions in the lock files.

Neither install downloads a browser (Puppeteer's Chromium download is switched off) or runs package
install scripts (`prototype-kit/.npmrc` sets `ignore-scripts=true`). That's deliberate, not a
failed install.

## 3. Check it runs

```bash
npm run kit
```

Open <http://localhost:3100>. You should see the API Marketplace home page, and
<http://localhost:3100/cy/> should show the Welsh version.

Stop it with **Ctrl+C**. If you don't need Entra, you're done: go to
[`RUNNING-LOCALLY.md`](RUNNING-LOCALLY.md).

## 4. Configure Entra (optional)

### 4.1 Create `prototype-kit/.env`

The Entra settings go in a file called `.env` in the **`prototype-kit/`** folder, not the repo
root. Git ignores this file. **Never commit it, and never paste its contents anywhere.**

```dotenv
# Entra External ID sign-in and registration (see ENTRA-PREREQUISITES.md)
ENTRA_CLIENT_ID=
ENTRA_CLIENT_SECRET=
ENTRA_REDIRECT_URI=http://localhost:3100/auth/callback
ENTRA_AUTHORIZE_ENDPOINT=https://<subdomain>.ciamlogin.com/<tenant-id>/oauth2/v2.0/authorize
ENTRA_TOKEN_ENDPOINT=https://<subdomain>.ciamlogin.com/<tenant-id>/oauth2/v2.0/token

# Registering an application through Microsoft Graph
ONBOARDING_CLIENT_ID=
ONBOARDING_CLIENT_SECRET=

# Optional: local Postgres (step 4.2). Without it, nothing is saved.
# Only uncomment this once Postgres is running - see the warning in 4.2.
# DATABASE_URL=postgresql://localhost:5432/amp_marketplace_prototype

# Optional: real APIM subscription keys. Without these, keys starting "mock_" are issued.
# APIM_CLIENT_ID=
# APIM_CLIENT_SECRET=
```

Put one `KEY=value` on each line, with no spaces around `=` and no quotes. Make sure the file is named
exactly `.env`; some editors quietly save it as `.env.txt`.

If a colleague gave you their `.env`, check `DATABASE_URL` before using it. Theirs will have their
username in it (`postgresql://<their-name>@localhost/...`) and points at a database only they have.

You don't run anything to load this file. The Prototype Kit reads `.env` from its own folder each time
it starts (it uses `dotenv`), so the only step is to restart the Kit after editing it.

### 4.2 Create the database (optional)

Skip this unless you want profiles, applications and subscription keys from the Entra flow to be
saved and listed.

> **Warning:** if `DATABASE_URL` is set but Postgres isn't running, the Kit **crashes** as soon as
> Entra sends you back to `/auth/callback`. Your browser then shows *"localhost refused to connect"*,
> and the Kit's terminal shows `ECONNREFUSED ... 5432`. Either do this step, or leave
> `DATABASE_URL` commented out.

1. **Install and start PostgreSQL.** Homebrew installs it "keg-only", so its commands aren't on your
   `PATH`. The commands below use their full path.

   ```bash
   brew install postgresql@16
   PG="$(brew --prefix postgresql@16)/bin"
   brew services start postgresql@16
   "$PG/pg_isready" -h localhost      # should say "accepting connections"
   ```

   If `pg_isready` says *"no response"*, Homebrew may have skipped creating the data folder. Its log,
   `$(brew --prefix)/var/log/postgresql@16.log`, then says *"could not access directory"*. Create it,
   then restart:

   ```bash
   "$PG/initdb" --locale=C -E UTF-8 -D "$(brew --prefix)/var/postgresql@16"
   brew services restart postgresql@16
   "$PG/pg_isready" -h localhost
   ```

2. **Create the database and its tables**, from the repo root:

   ```bash
   "$PG/createdb" -h localhost amp_marketplace_prototype
   "$PG/psql" -h localhost amp_marketplace_prototype -f prototype-kit/db/schema.sql
   ```

   Re-running `schema.sql` is safe; it only creates tables that don't exist yet.

3. **Point the Kit at it.** In `prototype-kit/.env`:

   ```dotenv
   DATABASE_URL=postgresql://localhost:5432/amp_marketplace_prototype
   ```

   Leave the username out. Homebrew's Postgres makes your Mac username the database owner, and that's
   the user it connects as by default.

4. **Check it**, from the `prototype-kit/` folder. This connects the same way the Kit does:

   ```bash
   node -e "new (require('pg').Pool)({connectionString:'postgresql://localhost:5432/amp_marketplace_prototype'}).query('select count(*) from profiles').then(r=>{console.log('OK, profiles:',r.rows[0].count);process.exit(0)}).catch(e=>{console.error('FAILED:',e.message);process.exit(1)})"
   ```

Postgres keeps running in the background, including after a restart, because `brew services`
manages it. To stop it: `brew services stop postgresql@16`.

### 4.3 Check Entra works

1. Start the Kit again with `npm run kit`, and **leave it running**. When you've signed in, Entra
   sends your browser back to `http://localhost:3100/auth/callback`, so the Kit has to be there to
   answer.
2. Go to <http://localhost:3100/auth/entra>. You should land on the Entra sign-in page.
3. Choose to create an account, complete sign-up, and you'll come back to the prototype signed in.
4. Choose to register an application. You should be shown a new client ID and secret.

If it goes wrong:

| What you see | Cause and fix |
|---|---|
| *"Entra prototype is not configured"* | The Kit didn't pick up `ENTRA_CLIENT_ID`. Check the file is at `prototype-kit/.env`, then restart the Kit. |
| *"localhost refused to connect"* after signing in at Entra | The Kit isn't running. Look at its terminal. If it shows `ECONNREFUSED ... 5432`, it crashed because `DATABASE_URL` is set and Postgres isn't running: see the warning in 4.2. Otherwise, start it again. Your Entra sign-in itself worked. |
| The Kit's terminal says *"For missing modules try running `npm install`"* | Ignore this line. Nodemon prints it after any crash; read the error above it instead. |
| *"State mismatch"* | You started from an old tab, or from `127.0.0.1` instead of `localhost`. Start again at `http://localhost:3100/auth/entra`. |
| An error code starting `AADSTS` | Entra configuration. See the table at the end of [`ENTRA-PREREQUISITES.md`](ENTRA-PREREQUISITES.md#when-something-goes-wrong). |

## Next

[`RUNNING-LOCALLY.md`](RUNNING-LOCALLY.md): running the Kit, exporting the static site, the checks CI
runs, pointing the site at a local backend, and troubleshooting.
