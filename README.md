# Libricore — Full Project Documentation

Comprehensive README for the Libricore library-management project. This file documents development, deployment, persistence of uploads, troubleshooting, and operational runbooks.

---

## Table of contents
- Project Overview
- Features
- Architecture
- Quick start (local)
- Docker & Production (Compose)
- CI / CD (GitHub Actions)
- Uploads persistence & migration
- Backup & restore
- Troubleshooting & FAQ
- Useful commands
- Contributing
- License

---

## Project Overview
Libricore is a small library-management web app. It consists of a Node/Express backend, a MongoDB database, and a Vite + React frontend. The app supports user authentication, book CRUD, member management, borrowings, and image uploads for book covers.

## Features
- User authentication (JWT)
- CRUD for books, members, borrowings
- Upload and serve book cover images
- Dockerized backend, frontend and MongoDB
- CI/CD pipeline that builds Docker images and deploys to EC2

## Architecture
- Frontend (Vite + React) communicates with the backend via `/api/*` endpoints.
- Backend exposes REST endpoints and serves files from `/uploads`.
- MongoDB stores books, members, users and references to uploaded filenames.
- Production Docker Compose mounts a named volume `uploads-volume` to persist uploaded images.

## Quick start (local)
### Backend (dev)
```
cd backend
npm install
cp .env.example .env        # set MONGO_URI (use local mongo or Docker)
npm run dev
```

### Frontend (dev)
```
cd frontend
npm install
cp .env.example .env       # optionally set VITE_API_URL=http://localhost:5000
npm run dev
```

Open `http://localhost:5173` (Vite) or the port shown by the dev server.

## Docker (recommended for staging/prod)
### Build images locally
```
docker compose build
```

### Start services
```
docker compose up -d
```

### Stop services
```
docker compose down
```

> Important: avoid `docker compose down -v` on production — it removes named volumes and deletes uploads.

## CI / CD (GitHub Actions)
- Workflow builds backend + frontend images and pushes them to ECR.
- Deploy step SSHes into the EC2 host, updates `~/app` (git reset or downloads `docker-compose.yml`), ensures a named volume `uploads-volume` exists and migrates any existing `~/app/uploads` into it on first run, then runs `docker-compose pull` and `docker-compose up -d --force-recreate --remove-orphans`.

Secrets required in GitHub Actions:
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` — for ECR login
- `EC2_SSH_KEY` — private key for the deploy user on EC2
- `GITHUB_TOKEN` — used to download compose file if repo not present on host

## Uploads persistence & migration
- Production mounting:
  - Named volume: `uploads-volume` mounted at `/usr/src/app/uploads` in the backend container.
  - Named volumes persist across container recreation. The pipeline will not remove the volume.

### First-time migration (what the pipeline does)
1. If `~/app/uploads` exists on the host and has files, the deploy step copies those files into `uploads-volume`.
2. Subsequent deploys will mount `uploads-volume` into the backend so uploaded images remain available.

### Manual migration (if needed)
If files exist in a running container (writable layer) or in `~/app/uploads`, copy them into the volume:
```
# copy from running container to host temp
docker cp myapp-backend:/usr/src/app/uploads/. ~/tmp_uploads/

# copy host temp to named volume
docker run --rm -v ~/tmp_uploads:/from -v uploads-volume:/to busybox sh -c 'cp -a /from/. /to/ || true'

# recreate backend container (will mount the volume)
docker compose up -d --force-recreate backend
```

## Backup & restore
### Backup volume to tarball (host)
```
docker run --rm -v uploads-volume:/data -v ~/backup:/backup busybox sh -c 'tar czf /backup/uploads-volume.tar.gz -C /data .'
```

### Restore from backup
```
mkdir -p ~/tmp_uploads && tar xzf ~/backup/uploads-volume.tar.gz -C ~/tmp_uploads
docker run --rm -v ~/tmp_uploads:/from -v uploads-volume:/to busybox sh -c 'cp -a /from/. /to/ || true'
```

## Troubleshooting & FAQ
- Q: Images show placeholder or 404 after deploy — why?
  - A: Confirm the file exists in `uploads-volume`:
    `docker run --rm -v uploads-volume:/data busybox ls -la /data`
    If missing, check DB `coverImage` filenames and migrate any host files into the volume.

- Q: Backend crashes with `Missing parameter name at index` error
  - A: Use an Express-compatible route for uploads (regex route is used in `backend/server.js` in this repo).

- Q: Will redeploy delete uploads?
  - A: Not if you use the named volume; redeploys using `docker compose up -d` preserve the named volume. Only `docker volume rm` or `docker compose down -v` removes it.

## Useful commands
- List volume files:
  `docker run --rm -v uploads-volume:/data busybox ls -la /data`
- Show backend logs:
  `docker compose logs backend --tail=200`
- Recreate backend:
  `docker compose up -d --force-recreate backend`

## API summary (common endpoints)
- `POST /api/auth/login` — login, returns token
- `POST /api/books` — create book (multipart/form-data with cover)
- `GET /api/books` — list books
- `GET /uploads/:filename` — book cover static file

## Environment variables
- Backend (`backend/.env`):
  - `PORT` — backend port (default 5000)
  - `MONGO_URI` — MongoDB connection string

- Frontend (`frontend/.env`):
  - `VITE_API_URL` — base URL for API calls

## Contributing
- Fork the repo, create a branch, run tests and open a pull request.

## License
- Add your license here.

--------------------------------------------------------------------------------
### Expanded: EC2 Deployment, CI/CD, Backups, Monitoring & Runbook

The sections below expand the quick notes above into actionable runbook steps tailored for an EC2 host (example IP: 65.0.31.24). Use these as a checklist for production rollout and incident recovery.

EC2 Host preparation (one-time)
1. Provision an EC2 instance (recommended: t3.small or t3.medium depending on load).
2. Attach a public IP and set Security Group rules:
   - TCP 22 (SSH) from CI runner (or limited IP range)
   - TCP 80/443 for HTTP/HTTPS
   - TCP 5000 (if not using reverse proxy) for backend health checks (optional)
3. Install Docker and Docker Compose on the EC2 host:
```powershell
# example (Amazon Linux / Ubuntu variant may differ)
sudo apt update && sudo apt install -y docker.io docker-compose
sudo usermod -aG docker $USER
sudo systemctl enable --now docker
```

4. Create application directory and set ownership:
```bash
sudo mkdir -p /home/ubuntu/app
sudo chown ubuntu:ubuntu /home/ubuntu/app
```

CI/CD (GitHub Actions) deploy script summary
- The workflow builds and pushes images to ECR, then SSHes into the EC2 host and runs a deploy script that:
  - ensures `~/app` exists and is updated (git reset or download compose)
  - creates `uploads-volume` if missing (`docker volume create uploads-volume`)
  - migrates any legacy `~/app/uploads` host folder into the named volume (one-time)
  - performs `docker-compose pull` and `docker-compose up -d --force-recreate --remove-orphans`

Sample deploy script (run on EC2 via SSH)
```bash
set -e
cd ~/app || mkdir -p ~/app && cd ~/app
if [ -d .git ]; then
  git fetch --all --prune
  git reset --hard origin/main
else
  curl -sL -o docker-compose.yml https://raw.githubusercontent.com/<org>/<repo>/main/docker-compose.yml
fi

# ensure volume exists
docker volume inspect uploads-volume >/dev/null 2>&1 || docker volume create uploads-volume

# migrate old host uploads directory into named volume (one-time, non-destructive)
if [ -d ./uploads ] && [ "$(ls -A ./uploads)" ]; then
  docker run --rm -v $(pwd)/uploads:/from -v uploads-volume:/to busybox sh -c 'cp -a /from/. /to/ || true'
fi

# pull images and recreate containers
docker-compose pull || true
docker-compose up -d --force-recreate --remove-orphans
```

Uploads verification (post-deploy)
```
docker run --rm -v uploads-volume:/data busybox ls -la /data
curl -I http://localhost:5000/uploads/<some-file.jpg>
```

Backups (automation & day-to-day)
- Store backups off-host (S3 recommended). For quick on-host backups, tar the named volume:
```
BACKUP_DIR=/home/ubuntu/backups
mkdir -p $BACKUP_DIR
docker run --rm -v uploads-volume:/data -v $BACKUP_DIR:/backup busybox sh -c 'tar czf /backup/uploads-$(date +%F).tar.gz -C /data .'
```

To push a backup to S3 (example using awscli):
```
aws s3 cp $BACKUP_DIR/uploads-$(date +%F).tar.gz s3://my-bucket/libricore/backups/
```

Restoration runbook (fast restore)
1. Stop or pause the backend to avoid inconsistent writes.
2. Copy or extract backup into a temporary folder and copy into the named volume:
```
mkdir -p ~/tmp_restore && tar xzf ~/backups/uploads-YYYY-MM-DD.tar.gz -C ~/tmp_restore
docker run --rm -v ~/tmp_restore:/from -v uploads-volume:/to busybox sh -c 'cp -a /from/. /to/ || true'
```
3. Recreate the backend container: `docker-compose up -d --force-recreate backend`

Monitoring & logs
- For operations, follow logs: `docker compose logs -f backend`
- Add health endpoints to the backend (e.g., `/health`) and configure a monitoring check (CloudWatch, Datadog, Prometheus).

Security checklist
- Rotate `JWT_SECRET` and AWS keys regularly.
- Limit SSH access via Security Group and use bastion host or SSH jump where possible.
- Prefer IAM roles and instance profiles instead of long-lived credentials where feasible.

Rollback / emergency procedure
1. If a release fails, identify last-known-good image tag in ECR.
2. On EC2, pull that tag and run `docker-compose up -d --force-recreate` with the stable tag.
3. If DB migrations were applied and need rollback, restore DB from backup — test restores in a staging environment before restoring production DB.

FAQ / common fixes
- 404 for `/uploads/<file>`: confirm the file exists in `uploads-volume` and that the DB `coverImage` field matches filename. If files are missing, copy them into `uploads-volume` then restart backend.
- `Missing parameter name` Express error: avoid using Express wildcard route patterns that trip path-to-regexp; use a safe regex route such as `app.get(/^\/uploads\/(.*)$/, handler)`.

Next steps I can take for you
- Split this README into `docs/` pages and add a `mkdocs` or `GitHub Pages` site.
- Add an automated backup job and sample GitHub Actions workflow for snapshotting volumes to S3.

